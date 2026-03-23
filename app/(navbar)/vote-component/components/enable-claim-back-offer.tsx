"use client";

import { InfoIcon } from "lucide-react";
import { useSolanaClient } from "@/providers/solana-client";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getBase58Decoder,
} from "@solana/kit";

import {
  HxuiCandidate,
  CandidateStatus,
  getEnableClaimBackOfferInstructionAsync,
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

export function EnableClaimBackOfferToggle({
  candidate,
}: {
  candidate: HxuiCandidate;
}) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  async function enableClaimBackOfferToggle() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (programAccounts.isLoading)
      return console.error(
        "program accounts are loading. please wait and try again"
      );
    const selectedWalletAddress = address(selectedWallet.address);
    if (programAccounts.hxuiConfig.data.admin !== selectedWalletAddress)
      return console.error("only admin can invoke this instruction");

    if (candidate.claimBackOffer) {
      return console.error(
        "The 'Claim back if winner' offer is already enabled and cannot be reverted."
      );
    }

    if (candidate.status !== CandidateStatus.Active) {
      return console.error(
        "The 'Claim back if winner' offer can only be applied to active candidate components."
      );
    }
    const adminSigner = createNoopSigner(selectedWalletAddress);
    const availClaimBackOfferIx = await getEnableClaimBackOfferInstructionAsync(
      {
        name: candidate.name,
        admin: adminSigner,
      }
    );

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(availClaimBackOfferIx, tx)
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
    <HxuiButtonGroup className="border-none">
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton
              onClick={enableClaimBackOfferToggle}
              disabled={
                !selectedWallet ||
                programAccounts.isLoading ||
                programAccounts.hxuiConfig.data.admin !==
                  selectedWallet.address ||
                candidate.claimBackOffer ||
                candidate.status != CandidateStatus.Active
              }
            >
              Enable claim-back offer
              {programAccounts.isLoading && <Spinner className="size-4" />}
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (!selectedWallet) {
            return (
              <TooltipContent>Please connect to admin wallet.</TooltipContent>
            );
          }

          if (programAccounts.isLoading) {
            return null;
          }

          if (selectedWallet.address != programAccounts.hxuiConfig.data.admin) {
            return (
              <TooltipContent>
                Only admin can perform this action.
              </TooltipContent>
            );
          }

          if (candidate.claimBackOffer) {
            return (
              <TooltipContent>
                The &quot;Claim back if winner&quot; offer is already enabled
                and cannot be reverted.
              </TooltipContent>
            );
          }

          if (candidate.status !== CandidateStatus.Active) {
            return (
              <TooltipContent>
                The &quot;Claim back if winner&quot; offer can only be applied
                to active candidate components.
              </TooltipContent>
            );
          }
        })}
      </Tooltip>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <HxuiButton>
            <InfoIcon />
          </HxuiButton>
        </TooltipTrigger>
        <TooltipContent className="max-w-100">
          Enables the &quot;Claim back if winner&quot; incentive, allowing
          voters to reclaim 50% of their HxUI tokens if the candidate is drawn
          as winner. This action is permanent and provides an alternative to
          withdrawing candidates with low traction.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
