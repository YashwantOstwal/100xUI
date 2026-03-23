"use client";

import { InfoIcon, RefreshCcwIcon } from "lucide-react";
import { useSolanaClient } from "@/providers/solana-client";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  address,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getBase58Decoder,
  appendTransactionMessageInstruction,
} from "@solana/kit";
import {
  HxuiCandidate,
  CandidateStatus,
  getCloseCandidateInstructionAsync,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
import { useTimeContext } from "../providers/time";

export function CloseCandidate({ candidate }: { candidate: HxuiCandidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow, reload } = useTimeContext();
  const programAccounts = useProgramAccounts();
  async function closeCandidate() {
    if (!selectedWallet) {
      return console.error(
        "Wallet not connected. Please connect with the admin wallet to close this candidate component."
      );
    }

    if (programAccounts.isLoading) {
      return console.error(
        "Program accounts are loading. Please wait and try again."
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    if (programAccounts.hxuiConfig.data.admin !== selectedWalletAddress) {
      return console.error(
        "Unauthorized: Only the delegated admin can permanently close a candidate component."
      );
    }

    if (candidate.status === CandidateStatus.Active) {
      return console.error(
        "Invalid Status: Only non-active candidate components can be permanently closed."
      );
    }

    // Comprehensive checks for why receipts might still exist
    if (candidate.receiptCount !== BigInt(0)) {
      if (candidate.claimDeadline > timeNow) {
        return console.error(
          `Cannot close: The claim-back window is currently active. Please wait until ${
            new Date(Number(candidate.claimDeadline) * 1000).toLocaleString
          } to clear the remaining vote receipt accounts.`
        );
      }

      if (
        candidate.claimDeadline === BigInt(0) &&
        (candidate.status === CandidateStatus.Withdrawn ||
          candidate.claimBackOffer)
      ) {
        return console.error(
          "Cannot close: A claim-back window must be opened first to allow users to reclaim their tokens."
        );
      }

      return console.error(
        `Cannot close: There are ${candidate.receiptCount.toLocaleString} associated vote receipt accounts remaining. Please clear them using the close_vote_receipt instruction first.`
      );
    }

    const adminSigner = createNoopSigner(selectedWalletAddress);

    const closeCandidateIx = await getCloseCandidateInstructionAsync({
      admin: adminSigner,
      name: candidate.name,
    });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(closeCandidateIx, tx)
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

  const disabled =
    !selectedWallet ||
    programAccounts.isLoading ||
    selectedWallet.address !== programAccounts.hxuiConfig.data.admin ||
    candidate.status == CandidateStatus.Active ||
    candidate.receiptCount !== BigInt(0);

  return (
    <HxuiButtonGroup className="border-none">
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton onClick={closeCandidate} disabled={disabled}>
              Close candidate
              {programAccounts.isLoading ? (
                <Spinner className="size-4" />
              ) : null}
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (!selectedWallet) {
            return (
              <TooltipContent>
                Please connect to the admin wallet.
              </TooltipContent>
            );
          }

          if (programAccounts.isLoading) {
            return null;
          }

          if (
            selectedWallet.address !== programAccounts.hxuiConfig.data.admin
          ) {
            return (
              <TooltipContent>
                Only the delegated admin can perform this instruction. Request
                admin access to continue.
              </TooltipContent>
            );
          }

          if (candidate.status === CandidateStatus.Active) {
            return (
              <TooltipContent>
                Only non-active candidate components can be permanently closed.
              </TooltipContent>
            );
          }

          if (candidate.receiptCount !== BigInt(0)) {
            if (candidate.claimDeadline >= timeNow) {
              return (
                <TooltipContent className="max-w-80">
                  The claim-back window is currently active. Please wait until
                  it closes on{" "}
                  {new Date(
                    Number(candidate.claimDeadline) * 1000
                  ).toLocaleString()}{" "}
                  to close the remaining vote receipt accounts.
                </TooltipContent>
              );
            }

            if (
              candidate.claimDeadline === BigInt(0) &&
              (candidate.status === CandidateStatus.Withdrawn ||
                candidate.status === CandidateStatus.ClaimableWinner)
            ) {
              return (
                <TooltipContent>
                  A claim-back window must be opened first to allow users to
                  reclaim their HxUI tokens.
                </TooltipContent>
              );
            }

            const isSingular = candidate.receiptCount === BigInt(1);
            return (
              <TooltipContent className="max-w-80">
                Cannot close: There{" "}
                {isSingular
                  ? "is 1"
                  : `are ${candidate.receiptCount.toString()}`}{" "}
                associated vote receipt account{isSingular ? "" : "s"}{" "}
                remaining. Please clear {isSingular ? "it" : "them"} first.
              </TooltipContent>
            );
          }
        })}
      </Tooltip>
      <HxuiButton onClick={reload}>
        <RefreshCcwIcon />
      </HxuiButton>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <HxuiButton>
            <InfoIcon />
          </HxuiButton>
        </TooltipTrigger>
        <TooltipContent>
          Permanently closes a non-active candidate component, clearing its
          state and reclaiming the rent-exempt balance back to the HxUI vault..
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
