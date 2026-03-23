"use client";
import { useSolanaClient } from "@/providers/solana-client";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "../../../../components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
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
  getWithdrawCandidateInstructionAsync,
} from "@/clients/generated/hxui";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InfoIcon } from "lucide-react";
import { run } from "@/utils";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
export function WithdrawCandidate({ candidate }: { candidate: HxuiCandidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  async function withdrawCandidate() {
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
      return console.error("only admin can invoke this instruction.");
    const adminSigner = createNoopSigner(selectedWalletAddress);

    if (candidate.status == CandidateStatus.Withdrawn) {
      return console.error("This component has already been withdrawn.");
    }
    if (candidate.status != CandidateStatus.Active) {
      return console.error("only active component can be withdrawn");
    }

    const withdrawCandidateIx = await getWithdrawCandidateInstructionAsync({
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
      (tx) => appendTransactionMessageInstruction(withdrawCandidateIx, tx)
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
    candidate.status == CandidateStatus.Withdrawn ||
    candidate.status !== CandidateStatus.Active;
  return (
    <AlertDialog>
      <HxuiButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <AlertDialogTrigger asChild disabled={disabled}>
                <HxuiButton>
                  Withdraw candidate
                  {programAccounts.isLoading ? (
                    <Spinner className="size-4" />
                  ) : null}
                </HxuiButton>
              </AlertDialogTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (!selectedWallet) {
              return (
                <TooltipContent>
                  Please connect your wallet to verify delegated admin
                  privileges.
                </TooltipContent>
              );
            }

            if (programAccounts.isLoading) {
              return null;
            }

            if (
              selectedWallet.address != programAccounts.hxuiConfig.data.admin
            ) {
              return (
                <TooltipContent>
                  This instruction can only be invoked by the delegated admin.
                </TooltipContent>
              );
            }

            if (candidate.status == CandidateStatus.Withdrawn) {
              return (
                <TooltipContent>
                  This component has already been withdrawn.
                </TooltipContent>
              );
            }

            if (candidate.status !== CandidateStatus.Active) {
              return (
                <TooltipContent>
                  Only an active candidate component can be withdrawn.
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
            Removes an active candidate component due to insufficient user
            traction or technical limitations in building. The admin must
            subsequently open a claim-back window for users to reclaim spent
            HxUI tokens.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw candidate?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes an active candidate component. If withdrawing due to
            low traction, consider enabling the &quot;Claim back if winner&quot;
            offer instead to create voting pressure. Otherwise, you must open a
            claim-back window for HxUI token recovery after confirming this
            withdrawal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full!">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={withdrawCandidate}
            variant="destructive"
            className="rounded-full!"
          >
            Withdraw
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
