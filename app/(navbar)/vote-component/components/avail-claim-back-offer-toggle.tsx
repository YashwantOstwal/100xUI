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
  getCreateCandidateInstructionAsync,
  getCreatePollInstructionAsync,
  getOpenClaimableWindowInstructionAsync,
  getPollCodec,
  getSetClaimBackOfferInstructionAsync,
  isHxuiError,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import { Input } from "@/components/ui/input";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";

export function AvailClaimBackOfferToggle({
  candidate,
}: {
  candidate: Candidate;
}) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  async function availClaimBackOfferToggle() {
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

    const adminSigner = createNoopSigner(selectedWalletAddress);
    const availClaimBackOfferIx = await getSetClaimBackOfferInstructionAsync({
      name: candidate.name,
      admin: adminSigner,
    });

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
  return (
    <HxuiButtonGroup className="border-none">
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton
              onClick={availClaimBackOfferToggle}
              disabled={
                !selectedWallet ||
                programAccounts.isLoading ||
                programAccounts.hxuiConfig.data.admin !==
                  selectedWallet.address ||
                candidate.claimableIfWinner ||
                candidate.candidateStatus != CandidateStatus.Active
              }
            >
              Avail claim back offer
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

          if (candidate.claimableIfWinner) {
            return (
              <TooltipContent>
                Already availed with this offer, it cannot be reveresed.
              </TooltipContent>
            );
          }

          if (candidate.candidateStatus !== CandidateStatus.Active) {
            return (
              <TooltipContent>
                Only active candidate can be availed with claimable offer.
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
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, facere.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
