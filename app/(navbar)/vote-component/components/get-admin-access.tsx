"use client";

import { InfoIcon } from "lucide-react";
import { useSolanaClient } from "@/providers/solana-client";
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
import { getGetAdminAccessForTestingInstructionAsync } from "@/clients/generated/hxui";
import { run } from "@/utils";
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
import { CodeCard } from "@/components/www/code-card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
export function GetAdminAccess() {
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <CodeCard className="bg-secondary flex w-full flex-col items-center justify-between gap-3 max-sm:p-2 sm:flex-row sm:rounded-full">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <h2 className="text-lg text-nowrap sm:ml-3">Get the admin access </h2>
          <Badge className="leading-none">Test mode</Badge>
        </div>
        <GetAdminAccessButton />
      </CodeCard>
    </div>
  );
}

export function GetAdminAccessButton() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  const programAccounts = useProgramAccounts();

  const selectedWalletAddress = selectedWallet
    ? address(selectedWallet.address)
    : selectedWallet;
  async function getAdminAccessForTesting() {
    if (!selectedWallet)
      return console.error("Please connect to wallet to invoke this ixn.");

    if (programAccounts.isLoading)
      return console.error(
        "Program accounts are still loading. Please wait and try again."
      );
    const selectedWalletAddress = address(selectedWallet.address);
    if (programAccounts.hxuiConfig.data.admin === selectedWalletAddress)
      return console.error("You are already the admin.");

    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const getAdminAccessIx = await getGetAdminAccessForTestingInstructionAsync({
      newAdmin: selectedWalletSigner,
    });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(getAdminAccessIx, tx)
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
    <HxuiButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton
              disabled={
                !selectedWallet ||
                programAccounts.isLoading ||
                address(selectedWallet.address) ===
                  programAccounts.hxuiConfig.data.admin
              }
              onClick={getAdminAccessForTesting}
            >
              Get admin access
              {programAccounts.isLoading && <Spinner className="size-4" />}
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (!selectedWallet) {
            return (
              <TooltipContent>Please connect to a Solana wallet</TooltipContent>
            );
          }
          if (programAccounts.isLoading) {
            return null;
          }
          if (selectedWalletAddress == programAccounts.hxuiConfig.data.admin) {
            return <TooltipContent>You are already the admin.</TooltipContent>;
          }
        })}
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <HxuiButton>
            <InfoIcon />
          </HxuiButton>
        </TooltipTrigger>
        <TooltipContent className="max-w-100">
          Grants admin access to set drop times, create candidate components,
          withdraw vault funds, and execute candidate-specific actions like
          withdrawing candidates or enabling claim-back offers.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
