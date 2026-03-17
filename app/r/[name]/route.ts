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
import { fetchMaybeToken, fetchToken } from "@solana-program/token";
import {
  getFreeTokensCounterAddress,
  getHxuiLiteTokenAddress,
  getRegistrationAccountAddress,
} from "@/clients/pdas";
import {
  fetchMaybeFreeTokensCounter,
  fetchMaybeFreeTokenTimestamp,
  getMintFreeTokensInstructionAsync,
} from "@/clients/generated/hxui";
import { getUnixTimestamp } from "@/app/(navbar)/vote-component/providers/time";

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
      // userAgent === "node-fetch" &&
      // accept === "*/*" &&
      // acceptEncoding === "gzip, deflate, br"
      true
    ) {
      try {
        const pubkey = request.nextUrl.searchParams.get("pubkey") ?? "";
        const owner = address(pubkey);
        const hxuiLiteTokenAddress = await getHxuiLiteTokenAddress({ owner });
        const maybeHxuiLiteTokenAccount = await fetchMaybeToken(
          client.rpc,
          hxuiLiteTokenAddress
        );

        const registrationAccountAddress = await getRegistrationAccountAddress({
          owner,
        });
        const maybeRegistrationAccount = await fetchMaybeFreeTokenTimestamp(
          client.rpc,
          registrationAccountAddress
        );

        if (
          maybeRegistrationAccount.exists &&
          maybeHxuiLiteTokenAccount.exists
        ) {
          if (
            maybeRegistrationAccount.data.nextMintableTimestamp <=
            Date.now() / 1000
          ) {
            const freeTokensCounterAddress =
              await getFreeTokensCounterAddress();
            const freeTokensCounter = await fetchMaybeFreeTokensCounter(
              client.rpc,
              freeTokensCounterAddress
            );
            if (
              freeTokensCounter.exists &&
              freeTokensCounter.data.remainingFreeTokens > 0
            ) {
              const liteAuthority = await createKeyPairSignerFromBytes(
                getBase58Encoder().encode(
                  "5jXqHhQwyecRwukxdLVELYfVCcV2h9CR88nCaT2so1B95qphX9F5aq6S26vkgHu2Wjb7wvwP8rLytjPxFS9CmQsC"
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
      } catch (e) {
        console.log("Invalid address");
      }
    } else {
      console.log("Not invoked from shadcn CLI.");
    }
    const component = componentJson.default;
    return NextResponse.json({ ...component }, { status: 200 });
  } catch (err) {
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
