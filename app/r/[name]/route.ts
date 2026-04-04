import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/client";
import {
  address,
  appendTransactionMessageInstruction,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createTransactionMessage,
  getBase58Encoder,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { fetchMaybeToken } from "@solana-program/token";
import {
  getFreeMintCounterAddress,
  getHxuiLiteTokenAddress,
  getFreeMintTrackerAddress,
} from "@/clients/pdas";
import {
  fetchMaybeHxuiFreeMintCounter,
  fetchMaybeFreeMintTracker,
  getMintFreeTokensInstructionAsync,
} from "@/clients/generated/hxui";

const client = createClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const accept = headersList.get("accept");
  const acceptEncoding = headersList.get("accept-encoding");

  const { name } = await params;
  try {
    const componentJson = await import(`../../../public/c/${name}`);
    if (
      // simple checks to limit the minting from browser, it does not completely prevent it but its fine.
      userAgent === "node-fetch" &&
      accept === "*/*" &&
      acceptEncoding === "gzip, deflate, br"
    ) {
      try {
        const pubkey = request.nextUrl.searchParams.get("pubkey") ?? "";
        const owner = address(pubkey);
        const hxuiLiteTokenAddress = await getHxuiLiteTokenAddress({ owner });
        const maybeHxuiLiteTokenAccount = await fetchMaybeToken(
          client.rpc,
          hxuiLiteTokenAddress
        );

        const registrationAccountAddress = await getFreeMintTrackerAddress({
          owner,
        });
        const maybeRegistrationAccount = await fetchMaybeFreeMintTracker(
          client.rpc,
          registrationAccountAddress
        );

        if (
          maybeRegistrationAccount.exists &&
          maybeHxuiLiteTokenAccount.exists
        ) {
          if (
            maybeRegistrationAccount.data.nextMintTimestamp <=
            Date.now() / 1000
          ) {
            const freeTokensCounterAddress = await getFreeMintCounterAddress();
            const freeTokensCounter = await fetchMaybeHxuiFreeMintCounter(
              client.rpc,
              freeTokensCounterAddress
            );
            if (
              freeTokensCounter.exists &&
              freeTokensCounter.data.remainingFreeMints > 0
            ) {
              // Todo: load it from .env
              const liteAuthority = await createKeyPairSignerFromBytes(
                getBase58Encoder().encode(
                  "4z6NqwRWFbm34vcjbu4NDQJUqW9B14uJp4Az8CoHFY3mofH5Xwa9Ke79oSxz6a4L61At8xisivaPgGBkHdrei9Jm"
                )
              );
              const mintFreeTokenIx = await getMintFreeTokensInstructionAsync({
                owner,
                liteAuthority,
              });

              const { value: latestBlockhash } = await client.rpc
                .getLatestBlockhash()
                .send();
              const txMessage = pipe(
                createTransactionMessage({ version: 0 }),
                (tx) => setTransactionMessageFeePayerSigner(liteAuthority, tx),
                (tx) =>
                  setTransactionMessageLifetimeUsingBlockhash(
                    latestBlockhash,
                    tx
                  ),
                (tx) => appendTransactionMessageInstruction(mintFreeTokenIx, tx)
              );

              const signedTxMessage =
                await signTransactionMessageWithSigners(txMessage);

              const signature = getSignatureFromTransaction(signedTxMessage);

              assertIsSendableTransaction(signedTxMessage);
              assertIsTransactionWithBlockhashLifetime(signedTxMessage);
              await client.sendAndConfirmTransaction(signedTxMessage, {
                commitment: "confirmed",
              });
              console.log(signature);
            } else {
              console.log("Max tokens minted this epoch");
            }
          } else {
            console.log("Rate limit exceeded");
          }
        } else {
          console.log(
            "Either of token account or registration account does not exist"
          );
        }
      } catch (err) {
        console.log(err);
        console.log("Invalid address");
        // supress the error.
      }
    } else {
      console.log("Not invoked from shadcn CLI.");
    }
    const component = componentJson.default;
    return NextResponse.json({ ...component }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: null,
      },
      // https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/registry/errors.ts
      // Shadcn uses 404 to flag component not found.
      { status: 404 }
    );
  }
}
