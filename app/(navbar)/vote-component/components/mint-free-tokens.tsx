"use client";

import { useSolanaClient } from "@/providers/solana-client";
import Button, {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import bs58 from "bs58";
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
  Instruction,
  isSolanaError,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
  StringifiedNumber,
} from "@solana/kit";

import {
  fetchMaybeToken,
  getCreateAssociatedTokenInstructionAsync,
} from "@solana-program/token";
import { getBuyPaidTokensInstructionAsync } from "@/clients/generated/hxui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "@/components/ui/button-group";
import { useEffect, useState } from "react";
import {
  LAMPORTS_PER_SOL,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@/clients/constants";
import { getHxuiMintAddress, getHxuiTokenAddress } from "@/clients/pdas";
import { Checkbox } from "../../../../components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useHxuiTokenContext } from "../providers/hxui-token";
import { useProgramAccounts } from "../providers/program-accounts";
import { InfoIcon, PlusCircleIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { run } from "@/utils";
import { useHxuiLiteTokenContext } from "../providers/hxui-lite-token";
export function MintFreeTokens() {
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const hxuiLiteToken = useHxuiLiteTokenContext();

  const disabled = !selectedWallet || hxuiLiteToken.isLoading;
  return (
    <Popover>
      <HxuiButtonGroup className="">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger asChild disabled={disabled}>
                <HxuiButton>
                  {hxuiLiteToken.isLoading ? (
                    <Spinner className="size-4" />
                  ) : hxuiLiteToken.maybeHxuiLiteTokenAccount.exists ? (
                    hxuiLiteToken.maybeHxuiLiteTokenAccount.data.amount
                  ) : (
                    0
                  )}{" "}
                  HXUI Lite tokens
                  <PlusCircleIcon className="fill-primary stroke-secondary size-5.5 rounded-full"></PlusCircleIcon>
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (!selectedWallet) {
              return (
                <TooltipContent>
                  Please connect to a solana wallet
                </TooltipContent>
              );
            }
            return null;
          })}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <HxuiButton>
              <InfoIcon />
            </HxuiButton>
          </TooltipTrigger>
          <TooltipContent>
            Hxui Lite tokens can be used to vote candidate components.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      {!disabled && (
        <PopoverContent className="h-40">
          {hxuiLiteToken.maybeRegistrationAccount.exists &&
          hxuiLiteToken.maybeHxuiLiteTokenAccount.exists ? (
            <Field>
              <FieldDescription>
                Add 100xUI components using shadcn CLI to earn Hxui lite tokens.
              </FieldDescription>
            </Field>
          ) : (
            <FieldDescription>
              Please complete the regisration process and earn tokens by adding
              100xUI components to your project using shadcn CLI.
            </FieldDescription>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
