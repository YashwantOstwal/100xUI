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
import { getHxuiConfigAddress } from "@/clients/pdas";
import {
  Candidate,
  CandidateStatus,
  fetchConfig,
  getWithdrawCandidateInstructionAsync,
} from "@/clients/generated/hxui";
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
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InfoIcon } from "lucide-react";
import { run } from "@/utils";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";
export function WithdrawCandidate({ candidate }: { candidate: Candidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  async function withdrawCandidate() {
    if (!selectedWallet)
      return console.error("Please connect to wallet to invoke this ixn.");
    const hxuiConfigAddress = await getHxuiConfigAddress();
    const hxuiConfigAccount = await fetchConfig(client.rpc, hxuiConfigAddress);
    const selectedWalletAddress = address(selectedWallet.address);
    if (selectedWalletAddress !== hxuiConfigAccount.data.admin)
      return console.error("only admin can invoke this instruction");
    const adminSigner = createNoopSigner(selectedWalletAddress);

    if (candidate.candidateStatus != CandidateStatus.Active) {
      return console.error("only active candidate can be withdrawn");
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

    try {
      const { signature } = await signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });
      console.log(getBase58Decoder().decode(signature));
    } catch (err) {
      console.log(err);
    }
  }
  const disabled =
    !selectedWallet ||
    programAccounts.isLoading ||
    selectedWallet.address !== programAccounts.hxuiConfig.data.admin ||
    candidate.candidateStatus == CandidateStatus.Withdrawn ||
    candidate.candidateStatus !== CandidateStatus.Active;
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
                <TooltipContent>Please connect to admin wallet.</TooltipContent>
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
                  Only admin can perform this action.
                </TooltipContent>
              );
            }

            if (candidate.candidateStatus == CandidateStatus.Withdrawn) {
              return (
                <TooltipContent>
                  This candidate has already been withdrawn.
                </TooltipContent>
              );
            }

            if (candidate.candidateStatus !== CandidateStatus.Active) {
              return (
                <TooltipContent>
                  Only active candidate can be withdrawn.
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
          <TooltipContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim,
            facere.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Withdraw candidate?</AlertDialogTitle>
          <AlertDialogDescription>
            This withdraw the candidate from the poll and have the tokens spent
            by users to be claimed back
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
