"use client";

import { InfoIcon, RefreshCcwIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSolanaClient } from "@/providers/solana-client";
import Button from "../../../../components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
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
  AccountMeta,
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
  CANDIDATE_DISCRIMINATOR,
  CandidateStatus,
  fetchConfig,
  fetchPoll,
  getCandidateCodec,
  getCreateCandidateInstructionAsync,
  getCreatePollInstructionAsync,
  getDrawWinnerInstructionAsync,
  getPollCodec,
  HXUI_PROGRAM_ADDRESS,
  isHxuiError,
} from "@/clients/generated/hxui";
import bs58 from "bs58";
import { run } from "@/utils";
import { Input } from "@/components/ui/input";
import { getAccountMetaFactory } from "@/clients/generated/hxui/shared";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { useProgramAccounts } from "../providers/program-accounts";
import { getUnixTimestamp, useTimeContext } from "../providers/time";
export function DrawWinner() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  const { timeNow, reload } = useTimeContext();
  const programAccounts = useProgramAccounts();

  async function drawWinner() {
    if (!selectedWallet)
      return console.error("Please connect to wallet to invoke this ixn.");

    if (programAccounts.isLoading)
      return console.error(
        "Program accounts are still loading. Please wait and try again."
      );
    else if (programAccounts.hxuiPoll.data.currentPollWinnerDrawn)
      return console.error(
        "Winner for current poll is already drawn. Create a new poll."
      );
    else if (
      programAccounts.hxuiPoll.data.currentPollDeadline >= getUnixTimestamp()
    ) {
      return console.error(
        "Winner cannot be drawn now as the poll is still live. Please wait until the poll deadline has passed to draw the winner."
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
                CANDIDATE_DISCRIMINATOR
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
    //     return decodedCandidateData.candidateStatus === CandidateStatus.Active;
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
      //@ts-ignore
      // passing active candidate for picking winner among them.
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
  return (
    <HxuiButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton
              disabled={
                programAccounts.isLoading ||
                programAccounts.hxuiPoll.data.currentPollWinnerDrawn ||
                programAccounts.hxuiPoll.data.currentPollDeadline >= timeNow
              }
              onClick={drawWinner}
            >
              Draw winner
              {programAccounts.isLoading && <Spinner className="size-4" />}
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (programAccounts.isLoading) {
            return null;
          }
          if (programAccounts.hxuiPoll.data.currentPollWinnerDrawn) {
            return (
              <TooltipContent>
                Winner has already been drawn for the current poll.
              </TooltipContent>
            );
          }
          if (programAccounts.hxuiPoll.data.currentPollDeadline >= timeNow) {
            return (
              <TooltipContent>
                Winner cannot be drawn now as the poll is still live. Please
                wait until the poll deadline has passed to draw the winner.
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
        <TooltipContent>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim, facere.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
