"use client";

import { ChevronDownIcon, InfoIcon, RefreshCcwIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  address,
  appendTransactionMessageInstruction,
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
import {
  getCancelDeregisterFromFreeMintInstructionAsync,
  getClaimRegistrationDepositInstructionAsync,
  getRegisterForFreeTokensInstructionAsync,
  getDeregisterFromFreeMintInstructionAsync,
} from "@/clients/generated/hxui";
import { getCreateAssociatedTokenInstructionAsync } from "@solana-program/token";
import {
  getHxuiLiteMintAddress,
  getHxuiLiteTokenAddress,
} from "@/clients/pdas";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@/clients/constants";
import { useSolanaClient } from "@/providers/solana-client";
import { useHxuiLiteTokenContext } from "../providers/hxui-lite-token";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { run } from "@/utils";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "../../../../components/www/file-explorer/button";
import { Spinner } from "@/components/ui/spinner";
import { useTimeContext, getUnixTimestamp } from "../providers/time";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
import { toast } from "sonner";

export function RegisterToMintFreeTokens() {
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const { reload } = useTimeContext();

  const accountsLoading = hxuiLiteToken.isLoading;
  const freeMintTrackerExists =
    !hxuiLiteToken.isLoading &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.exists;
  const tokenAccountExists =
    !hxuiLiteToken.isLoading && hxuiLiteToken.maybeHxuiLiteTokenAccount.exists;
  const unregistered =
    !hxuiLiteToken.isLoading &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.exists &&
    // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp !== BigInt(0);
    hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered;

  // const freeMintTrackerExists = true;
  // const tokenAccountExists = false;
  // const unregistered = true;
  return (
    <Popover>
      <HxuiButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger
                disabled={!selectedWallet || accountsLoading}
                asChild
              >
                <HxuiButton>
                  {run(() => {
                    if (accountsLoading || !freeMintTrackerExists) {
                      return "Register to mint HxUI Lite tokens";
                    }

                    if (unregistered) {
                      return "Claim back the deposit";
                    }
                    if (!tokenAccountExists) {
                      return "Complete setup";
                    }

                    // control reaches here when both exists.
                    return "Registered";
                  })}
                  {accountsLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <ChevronDownIcon className="size-4" />
                  )}
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (!selectedWallet) {
              return (
                <TooltipContent>
                  Please connect to a Solana wallet.
                </TooltipContent>
              );
            }
            if (accountsLoading) {
              return null;
            }
          })}
        </Tooltip>
        {freeMintTrackerExists && (
          <HxuiButton onClick={reload}>
            <RefreshCcwIcon />
          </HxuiButton>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <HxuiButton>
              <InfoIcon />
            </HxuiButton>
          </TooltipTrigger>
          <TooltipContent className="max-w-100">
            Register your wallet to become eligible to mint free HxUI Lite
            tokens when adding components via the shadcn CLI. This step is
            required to enforce personal rate limits and cooldown periods for
            the free minting system.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      {selectedWallet && !accountsLoading && (
        <PopoverContent className="w-80 space-y-3">
          {run(() => {
            if (!freeMintTrackerExists) {
              return (
                <Field>
                  <Field
                    orientation="horizontal"
                    // data-disabled
                  >
                    <Checkbox
                      id="registration-account"
                      name="registration-account"
                      checked={!freeMintTrackerExists}
                    />
                    <FieldLabel htmlFor="registration-account ">
                      Registration deposit of 0.00101616 SOL (redeemable)
                    </FieldLabel>
                  </Field>
                  <Field
                    orientation="horizontal"
                    // data-disabled
                  >
                    <Checkbox
                      id="hxui-lite-token-account"
                      name="hxui-lite-token-account"
                      disabled={tokenAccountExists}
                      checked={!tokenAccountExists}
                    />
                    <FieldLabel
                      htmlFor="hxui-lite-token-account"
                      className={cn(
                        "whitespace-nowrap",
                        tokenAccountExists && "line-through"
                      )}
                    >
                      Create HxUI Lite token account
                    </FieldLabel>
                  </Field>
                  <Field>
                    <RegisterButton />
                  </Field>
                </Field>
              );
            }
            // control reaches here when registration account exists.
            else if (unregistered) {
              return (
                <div className="space-y-3">
                  <CancelUnregisterButton />
                  <ClaimBackDepositButton />
                </div>
              );
            } else {
              return (
                <>
                  {!tokenAccountExists && <CreateHxuiTokenAccountButton />}
                  <UnregisterButton />
                  <UnregisterAndClaimbackDepositButton />
                </>
              );
            }
          })}
        </PopoverContent>
      )}
    </Popover>
  );
}
export function RegisterButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { reload } = useTimeContext();

  async function register() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect to a solana wallet."
      );

    if (hxuiLiteToken.isLoading)
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    if (hxuiLiteToken.maybeFreeMintTrackerAccount.exists)
      return console.error("Already registered.");
    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const ixs: Instruction[] = [];

    const createRegistrationAccountIx =
      await getRegisterForFreeTokensInstructionAsync({
        owner: selectedWalletSigner,
      });
    ixs.push(createRegistrationAccountIx);

    if (!hxuiLiteToken.maybeHxuiLiteTokenAccount.exists) {
      const hxuiLiteTokenAddress = await getHxuiLiteTokenAddress({
        owner: selectedWalletAddress,
      });
      const hxuiLiteMintAddress = await getHxuiLiteMintAddress();
      const createAssociatedTokenAccountIx =
        await getCreateAssociatedTokenInstructionAsync({
          payer: selectedWalletSigner,
          ata: hxuiLiteTokenAddress,
          owner: selectedWalletAddress,
          mint: hxuiLiteMintAddress,
          tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
        });
      ixs.push(createAssociatedTokenAccountIx);
    }

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
          reload();

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
    <HxuiButton
      disabled={
        !selectedWallet ||
        hxuiLiteToken.isLoading ||
        hxuiLiteToken.maybeFreeMintTrackerAccount.exists
      }
      className="w-full"
      onClick={register}
    >
      Register
    </HxuiButton>
  );
}
export function CreateHxuiTokenAccountButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  async function createHxuiTokenAccount() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with a solana wallet."
      );

    if (hxuiLiteToken.isLoading)
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    if (hxuiLiteToken.maybeHxuiLiteTokenAccount.exists)
      return console.error("HxUI Lite token account already exists.");

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const hxuiLiteTokenAddress = await getHxuiLiteTokenAddress({
      owner: selectedWalletAddress,
    });
    const hxuiLiteMintAddress = await getHxuiLiteMintAddress();
    const createAssociatedTokenAccountIx =
      await getCreateAssociatedTokenInstructionAsync({
        payer: selectedWalletSigner,
        ata: hxuiLiteTokenAddress,
        owner: selectedWalletAddress,
        mint: hxuiLiteMintAddress,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      });

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const compiledAndEncodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) =>
        appendTransactionMessageInstruction(createAssociatedTokenAccountIx, tx),
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
  return (
    <HxuiButton
      disabled={
        !selectedWallet ||
        hxuiLiteToken.isLoading ||
        hxuiLiteToken.maybeHxuiLiteTokenAccount.exists
      }
      className="w-full"
      onClick={createHxuiTokenAccount}
    >
      Create Hxui Lite token
    </HxuiButton>
  );
}

export function UnregisterButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { reload } = useTimeContext();

  async function unregister() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with a solana wallet."
      );

    if (hxuiLiteToken.isLoading)
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    if (!hxuiLiteToken.maybeFreeMintTrackerAccount.exists)
      return console.error(
        "Registration account does not exist for the selected wallet."
      );

    if (
      // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp !==
      // BigInt(0)
      hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered
    )
      return console.error("Already Unregistered.");
    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const unregisterFreeTokensIx =
      await getDeregisterFromFreeMintInstructionAsync({
        owner: selectedWalletSigner,
      });

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const compiledAndEncodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) =>
        appendTransactionMessageInstructions([unregisterFreeTokensIx], tx),
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
          reload();
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
    <HxuiButton
      disabled={
        !selectedWallet ||
        hxuiLiteToken.isLoading ||
        !hxuiLiteToken.maybeFreeMintTrackerAccount.exists ||
        // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp !==
        //   BigInt(0)
        hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered
      }
      className="w-full"
      onClick={unregister}
    >
      Unregister
    </HxuiButton>
  );
}

export function CancelUnregisterButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  async function cancelUnregister() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with a solana wallet."
      );

    if (hxuiLiteToken.isLoading) {
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    }
    if (!hxuiLiteToken.maybeFreeMintTrackerAccount.exists) {
      return console.error(
        "Free Mint tracker does not exist for the selected wallet."
      );
    }
    if (
      // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp ===
      // BigInt(0)
      !hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered
    ) {
      return console.error(
        "Free mint tracker is not deregistered to cancel deregistration"
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const cancelUnregisterIx =
      await getCancelDeregisterFromFreeMintInstructionAsync({
        owner: selectedWalletSigner,
      });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const compiledAndEncodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions([cancelUnregisterIx], tx),
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
  return (
    <HxuiButton
      disabled={
        !selectedWallet ||
        hxuiLiteToken.isLoading ||
        !hxuiLiteToken.maybeFreeMintTrackerAccount.exists ||
        // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp ===
        //   BigInt(0)
        !hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered
      }
      className="w-full"
      onClick={cancelUnregister}
    >
      Cancel unregister
    </HxuiButton>
  );
}

export function ClaimBackDepositButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow } = useTimeContext();

  async function claimBackDeposit() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with a solana wallet."
      );

    if (hxuiLiteToken.isLoading) {
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    }
    if (!hxuiLiteToken.maybeFreeMintTrackerAccount.exists) {
      return console.error(
        "Registration account does not exist for the selected wallet."
      );
    }
    if (
      // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp ===
      // BigInt(0)
      !hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered
    ) {
      return console.error("Unregister first");
    }

    if (
      // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp >
      // getUnixTimestamp()
      hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp >
      getUnixTimestamp()
    ) {
      return console.error(
        `Cannot be closed now wait until ${
          new Date(
            Number(
              // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp
              hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp
            ) * 1000
          ).toLocaleString
        }`
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const claimbackDepositIx =
      await getClaimRegistrationDepositInstructionAsync({
        owner: selectedWalletSigner,
      });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const compiledAndEncodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions([claimbackDepositIx], tx),
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

  return (
    <>
      <div className="peer">
        <HxuiButton
          disabled={
            !selectedWallet ||
            hxuiLiteToken.isLoading ||
            !hxuiLiteToken.maybeFreeMintTrackerAccount.exists ||
            // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp ===
            //   BigInt(0) ||
            // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp >
            //   timeNow
            !hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered ||
            hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp >
              timeNow
          }
          className="w-full"
          onClick={claimBackDeposit}
        >
          Claim back deposit
        </HxuiButton>
      </div>
      {selectedWallet &&
        !hxuiLiteToken.isLoading &&
        hxuiLiteToken.maybeFreeMintTrackerAccount.exists &&
        // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp !==
        //   BigInt(0) &&
        // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp >
        //   timeNow
        hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered &&
        hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp >
          timeNow && (
          <div
            className={cn(
              "flex gap-1 text-xs transition-colors",
              "text-card-foreground peer-hover:text-destructive"
            )}
          >
            <InfoIcon className="size-4" />
            <div>
              Your Deposit can only be claimed after&nbsp;
              {new Date(
                Number(
                  // hxuiLiteToken.maybeFreeMintTrackerAccount.data.closableTimestamp
                  hxuiLiteToken.maybeFreeMintTrackerAccount.data
                    .nextMintTimestamp
                ) * 1000
              ).toLocaleString()}
            </div>
          </div>
        )}
    </>
  );
}

export function UnregisterAndClaimbackDepositButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow } = useTimeContext();

  async function UnregisterAndClaimbackDeposit() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with a solana wallet."
      );

    if (hxuiLiteToken.isLoading) {
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    }
    if (!hxuiLiteToken.maybeFreeMintTrackerAccount.exists) {
      return console.error(
        "Registration account does not exist for the selected wallet."
      );
    }

    if (
      hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp >
      getUnixTimestamp()
    ) {
      return console.error(
        `Cannot be unregistered and claimed the deposit immediately wait until ${
          new Date(
            Number(
              hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp
            ) * 1000
          ).toLocaleString
        }`
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const unregisterFreeTokensIx =
      await getDeregisterFromFreeMintInstructionAsync({
        owner: selectedWalletSigner,
      });
    const claimbackDepositIx =
      await getClaimRegistrationDepositInstructionAsync({
        owner: selectedWalletSigner,
      });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const compiledAndEncodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) =>
        appendTransactionMessageInstructions(
          [unregisterFreeTokensIx, claimbackDepositIx],
          tx
        ),
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

  return (
    <>
      <div className="peer">
        <HxuiButton
          disabled={
            !selectedWallet ||
            hxuiLiteToken.isLoading ||
            !hxuiLiteToken.maybeFreeMintTrackerAccount.exists ||
            hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp >
              timeNow
          }
          className="w-full"
          onClick={UnregisterAndClaimbackDeposit}
        >
          Unregister & Claim back the deposit
        </HxuiButton>
      </div>

      {selectedWallet &&
        !hxuiLiteToken.isLoading &&
        hxuiLiteToken.maybeFreeMintTrackerAccount.exists &&
        hxuiLiteToken.maybeFreeMintTrackerAccount.data.nextMintTimestamp >
          timeNow && (
          <div
            className={cn(
              "flex gap-1 text-xs transition-colors",
              "text-card-foreground peer-hover:text-destructive"
            )}
          >
            <InfoIcon className="size-4" />
            <div>
              Your Deposit can only be claimed after&nbsp;
              {new Date(
                Number(
                  hxuiLiteToken.maybeFreeMintTrackerAccount.data
                    .nextMintTimestamp
                ) * 1000
              ).toLocaleString()}
            </div>
          </div>
        )}
    </>
  );
}
