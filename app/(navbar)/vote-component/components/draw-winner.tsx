"use client";

import { CodeCard } from "@/components/www/code-card";

import { InfoIcon, RefreshCcwIcon } from "lucide-react";
import { useSolanaClient } from "@/providers/solana-client";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  address,
  appendTransactionMessageInstruction,
  Base58EncodedBytes,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getBase58Decoder,
  AccountMeta,
} from "@solana/kit";
import {
  HXUI_CANDIDATE_DISCRIMINATOR,
  getDrawWinnerInstructionAsync,
  HXUI_PROGRAM_ADDRESS,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import { getAccountMetaFactory } from "@/clients/generated/hxui/shared";
import {
  HxuiButtonGroup,
  HxuiButton,
} from "@/components/www/file-explorer/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { getUnixTimestamp, useTimeContext } from "../providers/time";
import { useCanDrawWinnerContext } from "../providers/can-draw-winner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
import { useProgramAccounts } from "../providers/program-accounts";

import { toast } from "sonner";

export function DrawWinner() {
  const programAccounts = useProgramAccounts();
  const { timeNow } = useTimeContext();
  const { canDrawWinner } = useCanDrawWinnerContext();

  return (
    <div className="flex items-center justify-center py-2">
      <CodeCard className="bg-secondary mb-2 flex w-full items-center justify-between rounded-full pl-3">
        <h2 className="ml-2.5 text-base">
          {run(() => {
            if (programAccounts.isLoading) {
              return <Spinner />;
            }

            if (programAccounts.hxuiDropTime.data.isWinnerDrawn) {
              return "Current cycle complete. Set a new drop time.";
            }

            if (timeNow <= programAccounts.hxuiDropTime.data.dropTimestamp) {
              const seconds = Number(
                programAccounts.hxuiDropTime.data.dropTimestamp
              );
              const date = new Date(seconds * 1000);
              return (
                <>
                  Winner selection unlocks after{" "}
                  <span className="text-muted-foreground">
                    {date.toLocaleString()}
                  </span>
                </>
              );
            }
            if (!canDrawWinner) {
              return "Waiting for a candidate to reach 10 votes to draw a winner.";
            }
            return "Draw winner now";
          })}
        </h2>

        <DrawWinnerButton />
      </CodeCard>
    </div>
  );
}

export function DrawWinnerButton() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  const { timeNow, reload } = useTimeContext();
  const { canDrawWinner } = useCanDrawWinnerContext();
  const programAccounts = useProgramAccounts();

  async function drawWinner() {
    if (!selectedWallet)
      return console.error("Please connect to wallet to invoke this ixn.");

    if (programAccounts.isLoading)
      return console.error(
        "Program accounts are still loading. Please wait and try again."
      );
    else if (programAccounts.hxuiDropTime.data.isWinnerDrawn)
      return console.error(
        "Winner for current cycle is already drawn. Set a new drop time."
      );
    else if (
      programAccounts.hxuiDropTime.data.dropTimestamp >= getUnixTimestamp()
    ) {
      return console.error(
        "Winner cannot be drawn wait until the drop time has passed to draw the winner."
      );
    }
    if (!canDrawWinner) {
      return console.error(
        "No active candidate with minimum votes to be drawn as winner."
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const activeCandidates = await client.rpc
      .getProgramAccounts(HXUI_PROGRAM_ADDRESS, {
        encoding: "base64",
        commitment: "confirmed",
        filters: [
          {
            memcmp: {
              encoding: "base58",
              offset: BigInt(0),
              bytes: getBase58Decoder().decode(
                HXUI_CANDIDATE_DISCRIMINATOR
              ) as Base58EncodedBytes,
            },
          },
          {
            memcmp: {
              encoding: "base58",
              offset: BigInt(12),
              bytes: getBase58Decoder().decode(
                new Uint8Array([0]) // 0 is Active, 1 is Withdrawn, 2 is Winner and 3 is Claimable winner.
              ) as Base58EncodedBytes,
            },
          },
        ],
      })
      .send();

    const getAccountMeta = getAccountMetaFactory(
      HXUI_PROGRAM_ADDRESS,
      "programId"
    );
    // const remainingAccounts = activeCandidates
    //   .filter((activeCandidate) => {
    //     const base64Data = activeCandidate.account.data[0];
    //     const dataBytes = getBase64Encoder().encode(base64Data);
    //     const decodedCandidateData = getCandidateCodec().decode(dataBytes);
    //     return decodedCandidateData.status === CandidateStatus.Active;
    //   })
    //   .map((eachActiveCandidate) =>
    //     getAccountMeta({
    //       value: address(eachActiveCandidate.pubkey),
    //       isWritable: true,
    //     })
    //   ) as AccountMeta<string>[];
    const remainingAccounts = activeCandidates.map((eachActiveCandidate) =>
      getAccountMeta({
        value: address(eachActiveCandidate.pubkey),
        isWritable: true,
      })
    ) as AccountMeta<string>[];
    const drawWinnerIx = await getDrawWinnerInstructionAsync({});
    drawWinnerIx.accounts.push(
      // @ts-expect-error passing active candidate for picking winner among them.
      ...remainingAccounts
    );

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(drawWinnerIx, tx)
    );

    const compiledAndEncodedTx = pipe(
      compileTransaction(txMessage),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    toast.promise(
      signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      }),
      {
        loading: "Pending...",
        success: ({ signature }) => {
          return (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className=""
              href={`https://explorer.solana.com/tx/${getBase58Decoder().decode(signature)}?cluster=devnet`}
            >
              <div className="flex items-center gap-1 text-nowrap">
                Transaction confirmed. View on
                <SolanaExplorerFull className="w-30" />
              </div>
            </a>
          );
        },
        error: (err) => {
          console.error(err);
          if (err?.message?.includes("rejected"))
            return "Transaction rejected.";
          return "Transaction failed to execute. Check the logs.";
        },
      }
    );
  }
  return (
    <HxuiButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton
              disabled={
                !selectedWallet ||
                !canDrawWinner ||
                programAccounts.isLoading ||
                programAccounts.hxuiDropTime.data.isWinnerDrawn ||
                programAccounts.hxuiDropTime.data.dropTimestamp >= timeNow
              }
              onClick={drawWinner}
            >
              Draw winner
              {programAccounts.isLoading && <Spinner className="size-4" />}
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (!selectedWallet) {
            return (
              <TooltipContent>Please connect a Solana wallet.</TooltipContent>
            );
          }

          if (programAccounts.isLoading) {
            return null;
          }

          if (programAccounts.hxuiDropTime.data.isWinnerDrawn) {
            return (
              <TooltipContent className="max-w-80">
                A winner has already been drawn and a new drop time must be
                created to begin the next cycle.
              </TooltipContent>
            );
          }

          if (programAccounts.hxuiDropTime.data.dropTimestamp >= timeNow) {
            return (
              <TooltipContent className="max-w-80">
                No winner can be selected before the drop time. Please wait
                until this milestone has passed.
              </TooltipContent>
            );
          }

          if (!canDrawWinner) {
            return (
              <TooltipContent className="max-w-80">
                There are currently no active candidate components that meet the
                minimum vote requirement to be drawn as a winner.
              </TooltipContent>
            );
          }
        })}
      </Tooltip>
      <HxuiButton onClick={reload}>
        <RefreshCcwIcon />
      </HxuiButton>
      <Tooltip>
        <TooltipTrigger asChild>
          <HxuiButton>
            <InfoIcon />
          </HxuiButton>
        </TooltipTrigger>
        <TooltipContent className="max-w-80">
          Selects the winning candidate component based on the highest votes
          meeting the minimum requirement. This can be invoked by anyone after
          the drop time passes, completing the current cycle.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
