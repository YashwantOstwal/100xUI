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
  ReceiptRussianRuble,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { useSolanaClient } from "@/providers/solana-client";
import Button, {
  HxuiButton,
  HxuiButtonGroup,
} from "../../../../components/www/file-explorer/button";
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
  Lamports,
} from "@solana/kit";
import {
  getHxuiConfigAddress,
  getHxuiPollAddress,
  getHxuiVaultAddress,
} from "@/clients/pdas";
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
  fetchConfig,
  fetchPoll,
  getCreateCandidateInstructionAsync,
  getCreatePollInstructionAsync,
  getDrawWinnerInstructionAsync,
  getPollCodec,
  getSafeWithdrawFromVaultInstructionAsync,
  getVoteReceiptSize,
  HXUI_PROGRAM_ADDRESS,
  isHxuiError,
} from "@/clients/generated/hxui";
import bs58 from "bs58";
import { run } from "@/utils";
import { Input } from "@/components/ui/input";
import { getAccountMetaFactory } from "@/clients/generated/hxui/shared";
import { ButtonGroup } from "@/components/ui/button-group";
import { useProgramAccounts } from "../providers/program-accounts";
import { cn } from "@/lib/utils";
export function WithdrawSolFromVault() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const [withdrawLamports, setWithdrawLamports] = useState<bigint>(BigInt(0));
  const [maxWithdrawlPossible, setMaxWithdrawlPossible] = useState<bigint>(
    BigInt(0)
  );

  const [isMaxWithdraw, setIsMaxWithdraw] = useState(false);
  const programAccounts = useProgramAccounts();
  async function withdrawSolFromVault() {
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

    const withdrawSolIx = await getSafeWithdrawFromVaultInstructionAsync({
      admin: adminSigner,
      amount: isMaxWithdraw ? null : withdrawLamports,
    });

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(withdrawSolIx, tx)
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

  useEffect(() => {
    if (programAccounts.isLoading) return;

    run(async () => {
      const vaultRent = await client.rpc
        .getMinimumBalanceForRentExemption(BigInt(0))
        .send();
      const voteReceiptRent = await client.rpc
        .getMinimumBalanceForRentExemption(BigInt(getVoteReceiptSize()))
        .send();
      const maxVoteReceiptsGivenSupply = Math.floor(
        Number(
          programAccounts.hxuiMint.data.supply /
            programAccounts.hxuiConfig.data.tokensPerVote
        )
      );

      const minimumVaultBalance =
        vaultRent +
        BigInt(voteReceiptRent) * BigInt(maxVoteReceiptsGivenSupply);
      setMaxWithdrawlPossible(
        programAccounts.hxuiVault.lamports - minimumVaultBalance
      );
    });
  }, [programAccounts]);

  return (
    <Popover>
      <PopoverTrigger
        asChild
        disabled={!selectedWallet || programAccounts.isLoading}
      >
        <HxuiButtonGroup>
          <HxuiButton>
            Withdraw from vault
            <ChevronDownIcon className="size-4" />
          </HxuiButton>
        </HxuiButtonGroup>
      </PopoverTrigger>
      <PopoverContent hidden={programAccounts.isLoading} className="w-100">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="withdraw-amount">
              Withdraw lamports to admin
            </FieldLabel>
            <FieldDescription className="-mt-3">
              Max withdraw amount in lamports: {Number(maxWithdrawlPossible)}.
            </FieldDescription>
            <InputGroup>
              <InputGroupInput
                className={cn(
                  withdrawLamports > maxWithdrawlPossible
                    ? "text-destructive"
                    : "text-accent-foreground"
                )}
                disabled={isMaxWithdraw}
                value={
                  isMaxWithdraw
                    ? Number(maxWithdrawlPossible)
                    : Number(withdrawLamports)
                }
                onChange={(e) => {
                  setWithdrawLamports(BigInt(e.target.value));
                }}
                type="number"
                max={Number(maxWithdrawlPossible)}
                placeholder="1000000000 (1 SOL)"
                id="withdraw-amount"
              />
              <InputGroupAddon align="inline-end">
                <Field orientation="horizontal" className="gap-2">
                  <FieldLabel htmlFor="max-withdrawl">Max</FieldLabel>
                  <Switch
                    id="max-withdrawl"
                    checked={isMaxWithdraw}
                    onClick={() => setIsMaxWithdraw((prev) => !prev)}
                  />
                </Field>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>
              Enter the earnings you want to withdraw from the vault to the
              admin wallet. It is ensured that the vault has enough balance to
              exempt its rent and all the vote receipt accounts that can
              possibly be created with the current supply of hxui tokens.
            </FieldDescription>
          </Field>
          <Field>
            <HxuiButton
              disabled={
                programAccounts.isLoading ||
                (isMaxWithdraw
                  ? maxWithdrawlPossible == BigInt(0)
                  : withdrawLamports == BigInt(0)) ||
                withdrawLamports > maxWithdrawlPossible
              }
              className={cn(
                withdrawLamports > maxWithdrawlPossible &&
                  !isMaxWithdraw &&
                  "text-destructive"
              )}
              onClick={withdrawSolFromVault}
            >
              {run(() => {
                if (withdrawLamports > maxWithdrawlPossible && !isMaxWithdraw) {
                  return "Exceeds max withdraw limit";
                } else return "Withdraw";
              })}
            </HxuiButton>
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}
