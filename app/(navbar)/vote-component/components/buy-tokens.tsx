"use client";

import { useSolanaClient } from "@/providers/solana-client";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getBase58Decoder,
  getTransactionEncoder,
  Instruction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";

import { getCreateAssociatedTokenInstructionAsync } from "@solana-program/token";
import { getBuyTokensInstructionAsync } from "@/clients/generated/hxui";
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
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
export function BuyTokens() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const [buyAmount, setBuyAmount] = useState(10);
  const programAccounts = useProgramAccounts();
  const hxuiToken = useHxuiTokenContext();
  const [createAta, setCreateAta] = useState(true);
  const selectedWalletAddress = selectedWallet
    ? address(selectedWallet.address)
    : selectedWallet;

  async function buyTokens() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (programAccounts.isLoading)
      return console.error(
        "program accounts are loading. please wait and try again"
      );

    if (hxuiToken.isLoading)
      return console.error(
        "user accounts are loading. please wait and try again"
      );
    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const ixs: Instruction[] = [];

    if (!hxuiToken.maybeHxuiTokenAccount.exists) {
      if (createAta) {
        const hxuiMintAddress = await getHxuiMintAddress();
        const hxuiTokenAddress = await getHxuiTokenAddress({
          owner: selectedWalletAddress,
        });
        const createAssociatedTokenAccountIx =
          await getCreateAssociatedTokenInstructionAsync({
            payer: selectedWalletSigner,
            ata: hxuiTokenAddress,
            owner: selectedWalletAddress,
            mint: hxuiMintAddress,
            tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
          });
        ixs.push(createAssociatedTokenAccountIx);
      } else {
        return console.error("Approve the creation of HxUI token account.");
      }
    }

    const buyTokensIx = await getBuyTokensInstructionAsync({
      owner: selectedWalletSigner,
      amount: BigInt(buyAmount),
    });

    ixs.push(buyTokensIx);

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const compiledAndEncodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions(ixs, tx),
      (tx) => compileTransaction(tx),
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
    return () => {
      setCreateAta(true);
    };
  }, [selectedWalletAddress]);

  const disabled =
    !selectedWallet || programAccounts.isLoading || hxuiToken.isLoading;
  return (
    <Popover>
      <HxuiButtonGroup className="">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger asChild disabled={disabled}>
                <HxuiButton>
                  {run(() => {
                    if (!selectedWallet) {
                      return 0;
                    }
                    if (hxuiToken.isLoading || programAccounts.isLoading) {
                      return <Spinner className="size-4" />;
                    }
                    if (hxuiToken.maybeHxuiTokenAccount.exists) {
                      return hxuiToken.maybeHxuiTokenAccount.data.amount;
                    }
                    return 0;
                  })}
                  &nbsp;HxUI tokens
                  <PlusCircleIcon className="fill-primary stroke-secondary size-5.5 rounded-full"></PlusCircleIcon>
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (!selectedWallet) {
              return (
                <TooltipContent className="">
                  Please connect to a Solana wallet
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
          <TooltipContent className="">
            HxUI tokens purchased with SOL to vote on active candidate
            components.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      {!disabled && (
        <PopoverContent className="w-80">
          <Field>
            <FieldLabel htmlFor="buy-tokens">Buy HxUI tokens</FieldLabel>
            <FieldDescription className="-mt-3">
              1 HxUI token ={" "}
              {Number(programAccounts.hxuiConfig.data.pricePerToken) /
                LAMPORTS_PER_SOL}{" "}
              SOL
            </FieldDescription>
            <Input
              id="buy-tokens"
              type="number"
              min={1}
              value={buyAmount}
              onChange={(e) => setBuyAmount(Number(e.target.value))}
              placeholder="Amount (eg. 10)"
            />

            <ButtonGroup className="">
              <HxuiButton
                onClick={() => setBuyAmount((prev) => prev + 1)}
                size="sm"
                className="flex-1"
                variant="outline"
              >
                +1
              </HxuiButton>

              <HxuiButton
                onClick={() => setBuyAmount((prev) => prev + 5)}
                size="sm"
                className="flex-1"
                variant="outline"
              >
                +5
              </HxuiButton>
              <HxuiButton
                onClick={() => setBuyAmount((prev) => prev + 10)}
                size="sm"
                className="flex-1"
                variant="outline"
              >
                +10
              </HxuiButton>
            </ButtonGroup>
            <FieldDescription>
              These tokens can be used to cast votes to candidates |{" "}
              {programAccounts.hxuiConfig.data.tokensPerVote} tokens per vote.
            </FieldDescription>

            <Field
              orientation="horizontal"
              // data-disabled
            >
              <Checkbox
                id="create-ata"
                name="create-ata"
                onClick={() => setCreateAta((prev) => !prev)}
                disabled={hxuiToken.maybeHxuiTokenAccount.exists}
                checked={!hxuiToken.maybeHxuiTokenAccount.exists && createAta}
              />
              <FieldLabel
                htmlFor="create-ata"
                className={cn(
                  hxuiToken.maybeHxuiTokenAccount.exists && "line-through"
                )}
              >
                Create HxUI token account
              </FieldLabel>
            </Field>
            <HxuiButton
              onClick={buyTokens}
              disabled={
                buyAmount === 0 ||
                (!hxuiToken.maybeHxuiTokenAccount.exists && !createAta)
              }
            >
              Buy tokens for{" "}
              {(
                (buyAmount *
                  Number(programAccounts.hxuiConfig.data.pricePerToken)) /
                LAMPORTS_PER_SOL
              ).toFixed(3)}{" "}
              SOL
            </HxuiButton>
          </Field>
        </PopoverContent>
      )}
    </Popover>
  );
}
