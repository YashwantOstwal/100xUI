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
} from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronDownIcon, InfoIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  getWithdrawVaultFundsInstructionAsync,
  getVoteReceiptSize,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import { useProgramAccounts } from "../providers/program-accounts";
import { cn } from "@/lib/utils";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
import { toast } from "sonner";

export function WithdrawVaultFunds() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const [withdrawLamports, setWithdrawLamports] = useState<bigint>(BigInt(0));
  const [maxWithdrawlPossible, setMaxWithdrawlPossible] = useState<bigint>(
    BigInt(0)
  );

  const [isMaxWithdraw, setIsMaxWithdraw] = useState(false);
  const programAccounts = useProgramAccounts();
  async function withdrawVaultFunds() {
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

    const withdrawVaultFundsIx = await getWithdrawVaultFundsInstructionAsync({
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
      (tx) => appendTransactionMessageInstruction(withdrawVaultFundsIx, tx)
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
  }, [programAccounts, client.rpc]);

  return (
    <Popover>
      <HxuiButtonGroup>
        <PopoverTrigger
          asChild
          disabled={!selectedWallet || programAccounts.isLoading}
        >
          <HxuiButton>
            Withdraw vault funds
            <ChevronDownIcon className="size-4" />
          </HxuiButton>
        </PopoverTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <HxuiButton>
              <InfoIcon />
            </HxuiButton>
          </TooltipTrigger>
          <TooltipContent>
            Transfer HxUI token sale proceeds to your admin wallet.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      <PopoverContent hidden={programAccounts.isLoading} className="w-100">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="withdraw-amount">
              Withdraw vault funds to admin
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
              Enter the amount to transfer proceeds from HxUI token sales in
              lamports to your admin wallet.
              <br /> Note: The protocol enforces a safety reserve to ensure the
              HxUI Vault and all future Vote receipt accounts remain rent-exempt
              and operational.
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
              onClick={withdrawVaultFunds}
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
