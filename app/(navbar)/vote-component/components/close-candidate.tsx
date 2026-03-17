"use client";

import { InfoIcon, RefreshCcwIcon } from "lucide-react";
import { useSolanaClient } from "@/providers/solana-client";
import Button from "../../../../components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Address,
  address,
  appendTransactionMessageInstructions,
  Base58EncodedBytes,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getProgramDerivedAddress,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
  getBase58Decoder,
  StringifiedNumber,
  getBase64Encoder,
  appendTransactionMessageInstruction,
} from "@solana/kit";
import {
  Candidate,
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

export function CloseCandidate({ candidate }: { candidate: Candidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  async function closeCandidate() {
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
      return console.error("only admin can create candidate");

    if (candidate.candidateStatus === CandidateStatus.Active) {
      return console.error("Only non active candidates can be closed.");
    }

    if (candidate.totalReceipts !== BigInt(0)) {
      return console.error("");
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

    try {
      const { signature } = await signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });
      console.log(getBase58Decoder().decode(signature));
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  }

  const disabled =
    !selectedWallet ||
    programAccounts.isLoading ||
    selectedWallet.address !== programAccounts.hxuiConfig.data.admin ||
    candidate.candidateStatus == CandidateStatus.Active ||
    candidate.totalReceipts !== BigInt(0);

  return (
    <HxuiButtonGroup className="border-none">
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton onClick={closeCandidate} disabled={disabled}>
              Close candidate.
              {programAccounts.isLoading ? (
                <Spinner className="size-4" />
              ) : null}
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

          if (candidate.candidateStatus == CandidateStatus.Active) {
            return (
              <TooltipContent>
                Only non active candidates can be closed.
              </TooltipContent>
            );
          }
          if (candidate.totalReceipts !== BigInt(0)) {
            return (
              <TooltipContent>
                This candidate has non zero receipts.
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
        <TooltipContent>Close candidate.</TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
