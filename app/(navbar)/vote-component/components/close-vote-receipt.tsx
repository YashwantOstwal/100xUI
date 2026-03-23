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
  appendTransactionMessageInstructions,
  Base58EncodedBytes,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getTransactionEncoder,
  Instruction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getBase58Decoder,
  getU32Encoder,
} from "@solana/kit";
import {
  HxuiCandidate,
  CandidateStatus,
  getCloseVoteReceiptInstructionAsync,
  HXUI_PROGRAM_ADDRESS,
  VOTE_RECEIPT_DISCRIMINATOR,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";
import { useTimeContext } from "../providers/time";
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";

export function ClearReceipts({ candidate }: { candidate: HxuiCandidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  const { timeNow, reload } = useTimeContext();
  async function clearReceipts() {
    if (!selectedWallet) {
      return console.error(
        "Wallet not connected. Please connect with the admin wallet to clear vote receipt accounts."
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
        "Unauthorized: Only the delegated admin can clear vote receipt accounts."
      );
    }

    if (candidate.status === CandidateStatus.Active) {
      return console.error(
        "Invalid Status: Vote receipt accounts can only be cleared for non-active candidate components."
      );
    }

    if (candidate.receiptCount === BigInt(0)) {
      return console.error(
        "Action aborted: There are no vote receipt accounts remaining to clear."
      );
    }

    if (
      (candidate.status === CandidateStatus.ClaimableWinner ||
        candidate.status === CandidateStatus.Withdrawn) &&
      (candidate.claimDeadline === BigInt(0) ||
        timeNow < candidate.claimDeadline)
    ) {
      return console.error(
        "Cannot clear receipts: For withdrawn candidates or winners with offers, the claim-back window must be opened and subsequently closed first."
      );
    }
    const adminSigner = createNoopSigner(selectedWalletAddress);

    const allVoteReceipts = await client.rpc
      .getProgramAccounts(HXUI_PROGRAM_ADDRESS, {
        encoding: "base64",
        commitment: "confirmed",
        filters: [
          {
            memcmp: {
              encoding: "base58",
              offset: BigInt(0),
              bytes: getBase58Decoder().decode(
                VOTE_RECEIPT_DISCRIMINATOR
              ) as Base58EncodedBytes,
            },
          },
          {
            memcmp: {
              encoding: "base58",
              offset: BigInt(8),
              bytes: getBase58Decoder().decode(
                getU32Encoder().encode(candidate.id)
              ) as Base58EncodedBytes,
            },
          },
        ],
      })
      .send();
    const ixs: Instruction[] = [];
    for (let i = 0; i < Math.min(13, allVoteReceipts.length); i++) {
      const clearReceiptIx = await getCloseVoteReceiptInstructionAsync({
        admin: adminSigner,
        voteReceipt: allVoteReceipts[i].pubkey,
        name: candidate.name,
      });
      ixs.push(clearReceiptIx);
    }
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions(ixs, tx)
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
    candidate.receiptCount === BigInt(0) ||
    ((candidate.status === CandidateStatus.ClaimableWinner ||
      candidate.status === CandidateStatus.Withdrawn) &&
      (candidate.claimDeadline === BigInt(0) ||
        timeNow < candidate.claimDeadline));
  return (
    <HxuiButtonGroup className="border-none">
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton onClick={clearReceipts} disabled={disabled}>
              Clear receipts
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

          if (selectedWallet.address != programAccounts.hxuiConfig.data.admin) {
            return (
              <TooltipContent>
                Only the delegated admin can perform this instruction. Request
                the admin access now.
              </TooltipContent>
            );
          }

          if (candidate.status == CandidateStatus.Active) {
            return (
              <TooltipContent>
                Vote receipt accounts can only be cleared for non-active
                candidate components.
              </TooltipContent>
            );
          }
          if (candidate.receiptCount === BigInt(0)) {
            return (
              <TooltipContent>
                There are no vote receipt accounts remaining to clear for this
                candidate.
              </TooltipContent>
            );
          }

          if (
            (candidate.status === CandidateStatus.ClaimableWinner ||
              candidate.status === CandidateStatus.Withdrawn) &&
            (candidate.claimDeadline === BigInt(0) ||
              timeNow < candidate.claimDeadline)
          ) {
            return (
              <TooltipContent>
                Cannot clear receipts: The claim-back window must be opened and
                subsequently closed first.
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
          Clears vote receipt accounts associated with this candidate and
          reclaims their rent-exempt balance to the HxUI vault.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
