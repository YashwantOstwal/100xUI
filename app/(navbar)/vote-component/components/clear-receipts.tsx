"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldGroup,
  FieldDescription,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import { format } from "date-fns";

import {
  CalendarIcon,
  ChevronDownIcon,
  InfoIcon,
  LoaderIcon,
  RefreshCcwIcon,
} from "lucide-react";
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
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  Base58EncodedBytes,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getProgramDerivedAddress,
  getTransactionEncoder,
  Instruction,
  isSolanaError,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
  getBase58Decoder,
  StringifiedNumber,
  getU32Encoder,
  getBase64Encoder,
} from "@solana/kit";
import { getHxuiConfigAddress, getHxuiPollAddress } from "@/clients/pdas";
import { Calendar } from "@/components/ui/calendar";

import {
  fetchMaybeToken,
  getCreateAssociatedTokenInstructionAsync,
} from "@solana-program/token";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button as ShadcnButton } from "@/components/ui/button";
import {
  Candidate,
  CandidateStatus,
  fetchConfig,
  fetchPoll,
  getClearReceiptInstructionAsync,
  getCreateCandidateInstructionAsync,
  getCreatePollInstructionAsync,
  getOpenClaimableWindowInstructionAsync,
  getPollCodec,
  getSetClaimBackOfferInstructionAsync,
  HXUI_PROGRAM_ADDRESS,
  isHxuiError,
  VOTE_RECEIPT_DISCRIMINATOR,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import { Input } from "@/components/ui/input";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";
import { useTimeContext } from "../providers/time";

export function ClearReceipts({ candidate }: { candidate: Candidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  const { timeNow, reload } = useTimeContext();
  async function clearReceipts() {
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
      return console.error(
        "Receipts can only be cleared for non active candidates."
      );
    }
    if (candidate.totalReceipts === BigInt(0)) {
      return;
    }

    if (
      (candidate.candidateStatus === CandidateStatus.ClaimableWinner ||
        candidate.candidateStatus === CandidateStatus.Withdrawn) &&
      (candidate.claimWindow === BigInt(0) || timeNow < candidate.claimWindow)
    ) {
      return;
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
      const clearReceiptIx = await getClearReceiptInstructionAsync({
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
    candidate.totalReceipts === BigInt(0) ||
    ((candidate.candidateStatus === CandidateStatus.ClaimableWinner ||
      candidate.candidateStatus === CandidateStatus.Withdrawn) &&
      (candidate.claimWindow === BigInt(0) || timeNow < candidate.claimWindow));
  return (
    <HxuiButtonGroup className="border-none">
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton onClick={clearReceipts} disabled={disabled}>
              Clear receipts.
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
                Receipts can only be cleared for non active candidates.
              </TooltipContent>
            );
          }
          if (candidate.totalReceipts === BigInt(0)) {
            return <TooltipContent>No receipts to clear.</TooltipContent>;
          }

          if (
            (candidate.candidateStatus === CandidateStatus.ClaimableWinner ||
              candidate.candidateStatus === CandidateStatus.Withdrawn) &&
            (candidate.claimWindow === BigInt(0) ||
              timeNow < candidate.claimWindow)
          ) {
            return (
              <TooltipContent>
                The candidate is either claimable winner or withdrawn and the
                withdraw is not opened and closed.
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
        <TooltipContent>Clear receipts.</TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
