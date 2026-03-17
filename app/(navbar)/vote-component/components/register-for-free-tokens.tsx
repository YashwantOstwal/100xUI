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
  getCancelUnregisterForFreeTokensInstructionAsync,
  getClaimRegistrationFeesInstructionAsync,
  getMintFreeTokensInstructionAsync,
  getRegisterForFreeTokensInstructionAsync,
  getUnregisterForFreeTokensInstructionAsync,
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

export function RegisterToMintFreeTokens() {
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const { reload } = useTimeContext();

  const accountsLoading = hxuiLiteToken.isLoading;
  const registrationAccountExists =
    !hxuiLiteToken.isLoading && hxuiLiteToken.maybeRegistrationAccount.exists;
  const tokenAccountExists =
    !hxuiLiteToken.isLoading && hxuiLiteToken.maybeHxuiLiteTokenAccount.exists;
  const unregistered =
    !hxuiLiteToken.isLoading &&
    hxuiLiteToken.maybeRegistrationAccount.exists &&
    hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp !== BigInt(0);

  // const registrationAccountExists = true;
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
                    if (accountsLoading || !registrationAccountExists) {
                      return "Register to mint free tokens";
                    }
                    // control reaches here when atleast if registration account does not exist

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
                  Please connect to a solana wallet.
                </TooltipContent>
              );
            }
            if (accountsLoading) {
              return null;
            }
          })}
        </Tooltip>
        {registrationAccountExists && (
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
          <TooltipContent>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti,
            expedita!
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      {selectedWallet && !accountsLoading && (
        <PopoverContent className="w-80 space-y-3">
          {run(() => {
            if (!registrationAccountExists) {
              return (
                <Field>
                  <Field
                    orientation="horizontal"
                    // data-disabled
                  >
                    <Checkbox
                      id="registration-account"
                      name="registration-account"
                      checked={!registrationAccountExists}
                    />
                    <FieldLabel htmlFor="registration-account ">
                      Registration deposit of 0.001 SOL (redeemable)
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
                      Create HXUI Lite token account
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

function RegisterButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  async function register() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (hxuiLiteToken.isLoading)
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    if (hxuiLiteToken.maybeRegistrationAccount.exists)
      return console.error("Registration account for the user already exists.");
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
    const encodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions(ixs, tx),
      (tx) => compileTransaction(tx),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    try {
      const { signature } = await signAndSendTransaction({
        transaction: encodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });

      console.log(getBase58Decoder().decode(signature));
      // TODO: render the toast.
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <HxuiButton
      disabled={
        !selectedWallet ||
        hxuiLiteToken.isLoading ||
        hxuiLiteToken.maybeRegistrationAccount.exists
      }
      className="w-full"
      onClick={register}
    >
      Register
    </HxuiButton>
  );
}
function CreateHxuiTokenAccountButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  async function createHxuiTokenAccount() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (hxuiLiteToken.isLoading)
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    if (hxuiLiteToken.maybeHxuiLiteTokenAccount.exists)
      return console.error("Token account already exists.");
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
    const encodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) =>
        appendTransactionMessageInstruction(createAssociatedTokenAccountIx, tx),
      (tx) => compileTransaction(tx),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    try {
      const { signature } = await signAndSendTransaction({
        transaction: encodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });

      console.log(getBase58Decoder().decode(signature));
      // TODO: render the toast.
    } catch (err) {
      console.log(err);
    }
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

function UnregisterButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  async function unregister() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (hxuiLiteToken.isLoading)
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    if (!hxuiLiteToken.maybeRegistrationAccount.exists)
      return console.error(
        "Registration account does not exist for the selected wallet."
      );

    if (
      hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp !==
      BigInt(0)
    )
      return console.error("Already Unregistered.");
    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const unregisterFreeTokensIx =
      await getUnregisterForFreeTokensInstructionAsync({
        owner: selectedWalletSigner,
      });

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const encodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) =>
        appendTransactionMessageInstructions([unregisterFreeTokensIx], tx),
      (tx) => compileTransaction(tx),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    try {
      const { signature } = await signAndSendTransaction({
        transaction: encodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });

      console.log(getBase58Decoder().decode(signature));
      // TODO: render the toast.
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <HxuiButton
      disabled={
        !selectedWallet ||
        hxuiLiteToken.isLoading ||
        !hxuiLiteToken.maybeRegistrationAccount.exists ||
        hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp !==
          BigInt(0)
      }
      className="w-full"
      onClick={unregister}
    >
      Unregister
    </HxuiButton>
  );
}

function CancelUnregisterButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  async function cancelUnregister() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (hxuiLiteToken.isLoading) {
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    }
    if (!hxuiLiteToken.maybeRegistrationAccount.exists) {
      return console.error(
        "Registration account does not exist for the selected wallet."
      );
    }
    if (
      hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp ===
      BigInt(0)
    ) {
      return console.error(
        "Registration account is not unregistered to cancel unregistration"
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const cancelUnregisterIx =
      await getCancelUnregisterForFreeTokensInstructionAsync({
        owner: selectedWalletSigner,
      });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const encodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions([cancelUnregisterIx], tx),
      (tx) => compileTransaction(tx),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    try {
      const { signature } = await signAndSendTransaction({
        transaction: encodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });

      console.log(getBase58Decoder().decode(signature));
      // TODO: render the toast.
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <HxuiButton
      disabled={
        !selectedWallet ||
        hxuiLiteToken.isLoading ||
        !hxuiLiteToken.maybeRegistrationAccount.exists ||
        hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp ===
          BigInt(0)
      }
      className="w-full"
      onClick={cancelUnregister}
    >
      Cancel unregister
    </HxuiButton>
  );
}

function ClaimBackDepositButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow } = useTimeContext();

  async function claimBackDeposit() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (hxuiLiteToken.isLoading) {
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    }
    if (!hxuiLiteToken.maybeRegistrationAccount.exists) {
      return console.error(
        "Registration account does not exist for the selected wallet."
      );
    }
    if (
      hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp !==
      BigInt(0)
    ) {
      return console.error("Unregister first");
    }

    if (
      hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp <
      getUnixTimestamp()
    ) {
      return console.error(
        `Cannot be closed now wait until ${new Date(
          Number(hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp)
        ).toDateString()}`
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const claimbackDepositIx = await getClaimRegistrationFeesInstructionAsync({
      owner: selectedWalletSigner,
    });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const encodedTx = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions([claimbackDepositIx], tx),
      (tx) => compileTransaction(tx),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    try {
      const { signature } = await signAndSendTransaction({
        transaction: encodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });

      console.log(getBase58Decoder().decode(signature));
      // TODO: render the toast.
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      <div className="peer">
        <HxuiButton
          disabled={
            !selectedWallet ||
            hxuiLiteToken.isLoading ||
            !hxuiLiteToken.maybeRegistrationAccount.exists ||
            hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp !==
              BigInt(0) ||
            hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp <
              timeNow
          }
          className="w-full"
          onClick={claimBackDeposit}
        >
          Claim back deposit
        </HxuiButton>
      </div>
      {!(
        hxuiLiteToken.isLoading ||
        !hxuiLiteToken.maybeRegistrationAccount.exists ||
        hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp !==
          BigInt(0) ||
        hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp < timeNow
      ) && (
        <div
          className={cn(
            "flex gap-1 text-xs transition-colors",
            "text-card-foreground peer-hover:text-destructive"
          )}
        >
          <InfoIcon className="size-4" />
          <div>
            Your Deposit can only be claimed after
            {new Date(
              Number(
                hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp
              )
            ).toDateString()}
          </div>
        </div>
      )}
    </>
  );
}

function UnregisterAndClaimbackDepositButton() {
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow } = useTimeContext();

  async function UnregisterAndClaimbackDeposit() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (hxuiLiteToken.isLoading) {
      return console.error(
        "User accounts are loading. please wait and try again"
      );
    }
    if (!hxuiLiteToken.maybeRegistrationAccount.exists) {
      return console.error(
        "Registration account does not exist for the selected wallet."
      );
    }

    if (
      hxuiLiteToken.maybeRegistrationAccount.data.nextMintableTimestamp <
      getUnixTimestamp()
    ) {
      return console.error(
        `Cannot be unregistered and claimed the deposit immediately wait until ${new Date(
          Number(hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp)
        ).toDateString()}`
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const unregisterFreeTokensIx =
      await getUnregisterForFreeTokensInstructionAsync({
        owner: selectedWalletSigner,
      });
    const claimbackDepositIx = await getClaimRegistrationFeesInstructionAsync({
      owner: selectedWalletSigner,
    });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const encodedTx = pipe(
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

    try {
      const { signature } = await signAndSendTransaction({
        transaction: encodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });

      console.log(getBase58Decoder().decode(signature));
      // TODO: render the toast.
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      <div className="peer">
        <HxuiButton
          disabled={
            !selectedWallet ||
            hxuiLiteToken.isLoading ||
            !hxuiLiteToken.maybeRegistrationAccount.exists ||
            hxuiLiteToken.maybeRegistrationAccount.data.nextMintableTimestamp <
              timeNow
          }
          className="w-full"
          onClick={UnregisterAndClaimbackDeposit}
        >
          Unregister & Claim back the deposit
        </HxuiButton>
      </div>

      {!hxuiLiteToken.isLoading &&
        hxuiLiteToken.maybeRegistrationAccount.exists &&
        hxuiLiteToken.maybeRegistrationAccount.data.nextMintableTimestamp >=
          timeNow && (
          <div
            className={cn(
              "flex gap-1 text-xs transition-colors",
              "text-card-foreground peer-hover:text-destructive"
            )}
          >
            <InfoIcon className="size-4" />
            <div>
              Your Deposit can only be claimed after
              {new Date(
                Number(
                  hxuiLiteToken.maybeRegistrationAccount.data.closableTimestamp
                )
              ).toDateString()}
            </div>
          </div>
        )}
    </>
  );
}
