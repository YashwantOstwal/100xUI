"use client";

import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import type { HxuiCandidate } from "@/clients/generated/hxui";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSolanaClient } from "@/providers/solana-client";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  RegisterButton,
  CreateHxuiTokenAccountButton,
  UnregisterButton,
  CancelUnregisterButton,
  ClaimBackDepositButton,
  UnregisterAndClaimbackDepositButton,
} from "./register-for-free-tokens";
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

import { getCreateAssociatedTokenInstructionAsync } from "@solana-program/token";
import {
  CandidateStatus,
  getBuyTokensInstructionAsync,
  getVoteWithHxuiInstructionAsync,
  getVoteWithHxuiLiteInstructionAsync,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@/clients/constants";
import { getHxuiMintAddress, getHxuiTokenAddress } from "@/clients/pdas";
import { Checkbox } from "../../../../components/ui/checkbox";
import { useHxuiTokenContext } from "../providers/hxui-token";
import { cn } from "@/lib/utils";
import { useHxuiLiteTokenContext } from "../providers/hxui-lite-token";
import { Switch } from "@/components/ui/switch";
import { useProgramAccounts } from "../providers/program-accounts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { ChevronDownIcon, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";

export function VoteCandidate({ candidate }: { candidate: HxuiCandidate }) {
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  const { isLoading: isHxuiTokenLoading } = useHxuiTokenContext();
  const { isLoading: isHxuiLiteTokenLoading } = useHxuiLiteTokenContext();

  const accountsLoading =
    isHxuiTokenLoading || isHxuiLiteTokenLoading || programAccounts.isLoading;
  const disabled =
    !selectedWallet ||
    accountsLoading ||
    candidate.status != CandidateStatus.Active;
  return (
    <Popover>
      <HxuiButtonGroup className="border-none">
        <Tooltip delayDuration={250}>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger disabled={disabled} asChild>
                <HxuiButton>
                  Vote candidate&nbsp;
                  {run(() => {
                    if (!selectedWallet) {
                      return null;
                    }
                    if (accountsLoading) {
                      return <Spinner className="size-4" />;
                    }
                    return <ChevronDownIcon className="size-4" />;
                  })}
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

            if (candidate.status !== CandidateStatus.Active) {
              return (
                <TooltipContent>
                  Only active candidate components are eligible to receive
                  votes.
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
          <TooltipContent className="max-w-100">
            Cast your votes using HxUI tokens or HxUI Lite tokens. You may
            allocate votes across any number of active candidates.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      {!disabled && (
        <PopoverContent hidden={disabled} className="space-y-2">
          <PopoverHeader>
            <PopoverTitle>
              Vote&nbsp;
              <span className="font-medium capitalize">{candidate.name}</span>
            </PopoverTitle>
            <PopoverDescription>
              Each vote case requires{" "}
              {programAccounts.hxuiConfig.data.tokensPerVote} tokens.
            </PopoverDescription>
          </PopoverHeader>
          <PopoverDescription></PopoverDescription>
          <Tabs defaultValue="100xui" className="space-y-2">
            <TabsList className="w-full" variant="line">
              <TabsTrigger value="100xui">HxUI</TabsTrigger>
              <TabsTrigger value="100xui-lite">HxUI Lite</TabsTrigger>
            </TabsList>
            <TabsContent value="100xui">
              {!programAccounts.isLoading && (
                <Field className="flex h-35 flex-col justify-between gap-0">
                  <VoteWithHxui candidate={candidate} />
                </Field>
              )}
            </TabsContent>
            <TabsContent value="100xui-lite" className="">
              <Field className="flex flex-col justify-between gap-2">
                <VoteWithHxuiLite candidate={candidate} />
              </Field>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      )}
    </Popover>
  );
}

function VoteWithHxui({ candidate }: { candidate: HxuiCandidate }) {
  const programAccounts = useProgramAccounts();
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();

  const [isMaxVotes, setIsMaxVotes] = useState(false);
  const [voteAmount, setVoteAmount] = useState<bigint>(BigInt(1));
  const hxuiToken = useHxuiTokenContext();

  async function voteCandidate() {
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

    if (candidate.status !== CandidateStatus.Active) {
      return console.error(
        "Only active candidate components are eligible to receive votes"
      );
    }

    if (voteAmount <= BigInt(0)) {
      return console.error("You must cast one or more votes for the candidate");
    }
    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const ixs: Instruction[] = [];
    if (!hxuiToken.maybeHxuiTokenAccount.exists) {
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

      const buyTokensIx = await getBuyTokensInstructionAsync({
        owner: selectedWalletSigner,
        amount: BigInt(
          voteAmount * programAccounts.hxuiConfig.data.tokensPerVote
        ),
      });
      ixs.push(createAssociatedTokenAccountIx, buyTokensIx);
    } else if (
      voteAmount >
      hxuiToken.maybeHxuiTokenAccount.data.amount /
        programAccounts.hxuiConfig.data.tokensPerVote
    ) {
      const buyTokensIx = await getBuyTokensInstructionAsync({
        owner: selectedWalletSigner,
        amount: BigInt(
          voteAmount * programAccounts.hxuiConfig.data.tokensPerVote -
            hxuiToken.maybeHxuiTokenAccount.data.amount
        ),
      });
      ixs.push(buyTokensIx);
    }
    const voteCandidateIx = await getVoteWithHxuiInstructionAsync({
      name: candidate.name,
      votes: voteAmount,
      owner: selectedWalletSigner,
    });

    ixs.push(voteCandidateIx);
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstructions(ixs, tx)
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
          setIsMaxVotes(false);
          setVoteAmount(BigInt(1));
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
      setIsMaxVotes(false);
      setVoteAmount(BigInt(1));
    };
  }, [selectedWallet?.address]);
  if (hxuiToken.isLoading || programAccounts.isLoading) {
    return null;
  }
  return (
    <>
      <Field>
        <InputGroup>
          <InputGroupInput
            disabled={isMaxVotes}
            value={Number(voteAmount)}
            onChange={(e) => {
              setVoteAmount(BigInt(e.target.value));
            }}
            min={1}
            type="number"
            placeholder="1"
            id="vote-amount"
          />
          <InputGroupAddon align="inline-end">
            <Field orientation="horizontal" className="gap-2">
              <FieldLabel htmlFor="max-withdrawl">Max</FieldLabel>
              <Switch
                id="max-withdrawl"
                checked={isMaxVotes}
                disabled={!hxuiToken.maybeHxuiTokenAccount.exists}
                onClick={() => {
                  if (hxuiToken.maybeHxuiTokenAccount.exists) {
                    setIsMaxVotes((prev) => !prev);
                    setVoteAmount(
                      hxuiToken.maybeHxuiTokenAccount.data.amount /
                        programAccounts.hxuiConfig.data.tokensPerVote
                    );
                  }
                }}
              />
            </Field>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field
        orientation="horizontal"
        // data-disabled
      >
        <Checkbox
          id="create-ata-2"
          name="create-ata-2"
          checked={
            voteAmount > BigInt(0) && !hxuiToken.maybeHxuiTokenAccount.exists
          }
          disabled={
            !(voteAmount > BigInt(0) && !hxuiToken.maybeHxuiTokenAccount.exists)
          }
        />
        <FieldLabel
          htmlFor="create-ata-2"
          className={cn(
            !(
              voteAmount > BigInt(0) && !hxuiToken.maybeHxuiTokenAccount.exists
            ) && "line-through"
          )}
        >
          Create HxUI token account
        </FieldLabel>
      </Field>
      <Field
        orientation="horizontal"
        // data-disabled
      >
        <Checkbox
          id="buy-tokens"
          name="buy-tokens"
          disabled={
            !(
              voteAmount > BigInt(0) &&
              (!hxuiToken.maybeHxuiTokenAccount.exists ||
                voteAmount >
                  hxuiToken.maybeHxuiTokenAccount.data.amount /
                    programAccounts.hxuiConfig.data.tokensPerVote)
            )
          }
          checked={
            voteAmount > BigInt(0) &&
            (!hxuiToken.maybeHxuiTokenAccount.exists ||
              voteAmount >
                hxuiToken.maybeHxuiTokenAccount.data.amount /
                  programAccounts.hxuiConfig.data.tokensPerVote)
          }
        />
        <FieldLabel
          htmlFor="buy-tokens"
          className={cn(
            !(
              voteAmount > BigInt(0) &&
              (!hxuiToken.maybeHxuiTokenAccount.exists ||
                voteAmount >
                  hxuiToken.maybeHxuiTokenAccount.data.amount /
                    programAccounts.hxuiConfig.data.tokensPerVote)
            ) && "line-through"
          )}
        >
          Buy &nbsp;
          {hxuiToken.maybeHxuiTokenAccount.exists
            ? hxuiToken.maybeHxuiTokenAccount.data.amount /
                programAccounts.hxuiConfig.data.tokensPerVote <
              voteAmount
              ? voteAmount * programAccounts.hxuiConfig.data.tokensPerVote -
                hxuiToken.maybeHxuiTokenAccount.data.amount
              : 0
            : voteAmount * programAccounts.hxuiConfig.data.tokensPerVote}
          &nbsp;tokens
        </FieldLabel>
      </Field>
      <Field>
        <HxuiButton
          disabled={voteAmount == BigInt(0)}
          onClick={voteCandidate}
          className="w-full"
        >
          {run(() => {
            const actions: string[] = [];
            if (
              voteAmount > BigInt(0) &&
              !hxuiToken.maybeHxuiTokenAccount.exists
            ) {
              actions.push("Create");
            }
            if (
              voteAmount > BigInt(0) &&
              (!hxuiToken.maybeHxuiTokenAccount.exists ||
                voteAmount >
                  hxuiToken.maybeHxuiTokenAccount.data.amount /
                    programAccounts.hxuiConfig.data.tokensPerVote)
            ) {
              actions.push("Buy");
            }

            actions.push(`Vote: ${voteAmount}`);
            return actions.join(" & ");
          })}
        </HxuiButton>
      </Field>
    </>
  );
}

function VoteWithHxuiLite({ candidate }: { candidate: HxuiCandidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const hxuiLiteToken = useHxuiLiteTokenContext();
  const [isMaxVotes, setIsMaxVotes] = useState(false);
  const [voteAmount, setVoteAmount] = useState<bigint>(BigInt(0));
  const programAccounts = useProgramAccounts();

  useEffect(() => {
    return () => {
      setIsMaxVotes(false);
      setVoteAmount(BigInt(0));
    };
  }, [selectedWallet?.address]);
  async function voteWithHxuiLite() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (programAccounts.isLoading)
      return console.error(
        "program accounts are loading. please wait and try again"
      );

    if (hxuiLiteToken.isLoading)
      return console.error(
        "user accounts are loading. please wait and try again"
      );

    if (
      !hxuiLiteToken.maybeHxuiLiteTokenAccount.exists ||
      !hxuiLiteToken.maybeFreeMintTrackerAccount.exists
    ) {
      return console.error("One of the required accounts does not exist");
    }
    if (candidate.status != CandidateStatus.Active)
      return console.error("Only active candidate can be voted");

    if (voteAmount <= BigInt(0)) {
      return console.error("Votes must be greater than 0");
    }
    if (
      voteAmount >
      hxuiLiteToken.maybeHxuiLiteTokenAccount.data.amount /
        programAccounts.hxuiConfig.data.tokensPerVote
    ) {
      return console.error(
        `Not enough HxUI Lite tokens to cast ${voteAmount} votes`
      );
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);
    const voteCandidateWithHxuiLiteIx =
      await getVoteWithHxuiLiteInstructionAsync({
        name: candidate.name,
        votes: voteAmount,
        owner: selectedWalletSigner,
      });

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) =>
        appendTransactionMessageInstruction(voteCandidateWithHxuiLiteIx, tx)
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
          setIsMaxVotes(false);
          setVoteAmount(BigInt(0));
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

  if (hxuiLiteToken.isLoading || programAccounts.isLoading) {
    return null;
  }
  if (
    hxuiLiteToken.maybeHxuiLiteTokenAccount.exists &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.exists &&
    !hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered
  ) {
    return (
      <>
        <Field>
          <InputGroup>
            <InputGroupInput
              disabled={isMaxVotes}
              value={Number(voteAmount)}
              onChange={(e) => {
                setVoteAmount(BigInt(e.target.value));
              }}
              min={1}
              type="number"
              placeholder="1"
              id="vote-amount"
            />
            <InputGroupAddon align="inline-end">
              <Field orientation="horizontal" className="gap-2">
                <FieldLabel htmlFor="max-votes">Max</FieldLabel>
                <Switch
                  id="max-votes"
                  checked={isMaxVotes}
                  onClick={() => {
                    setIsMaxVotes((prev) => !prev);
                    if (hxuiLiteToken.maybeHxuiLiteTokenAccount.exists) {
                      setVoteAmount(
                        hxuiLiteToken.maybeHxuiLiteTokenAccount.data.amount /
                          programAccounts.hxuiConfig.data.tokensPerVote
                      );
                    }
                  }}
                />
              </Field>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>
            Add 100xUI components using shadcn CLI to earn HxUI Lite tokens.
          </FieldDescription>
        </Field>
        <Field>
          <HxuiButton
            className="w-full"
            disabled={voteAmount == BigInt(0)}
            onClick={voteWithHxuiLite}
          >
            Vote: {voteAmount}
          </HxuiButton>
        </Field>
      </>
    );
  }
  if (!hxuiLiteToken.maybeFreeMintTrackerAccount.exists) {
    return (
      <>
        <PopoverDescription className="text-sm">
          Complete registration to start minting free HxUI Lite tokens by adding
          100xUI components to your project via the shadcn CLI.
        </PopoverDescription>
        <Field>
          <Field
            orientation="horizontal"
            // data-disabled
          >
            <Checkbox
              id="free-mint-tracker-account"
              name="free-mint-tracker-account"
              checked={!hxuiLiteToken.maybeFreeMintTrackerAccount.exists}
            />
            <FieldLabel htmlFor="free-mint-tracker-account ">
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
              disabled={hxuiLiteToken.maybeHxuiLiteTokenAccount.exists}
              checked={!hxuiLiteToken.maybeHxuiLiteTokenAccount.exists}
            />
            <FieldLabel
              htmlFor="hxui-lite-token-account"
              className={cn(
                "whitespace-nowrap",
                hxuiLiteToken.maybeHxuiLiteTokenAccount.exists && "line-through"
              )}
            >
              Create HxUI Lite token account
            </FieldLabel>
          </Field>
          <Field>
            <RegisterButton />
          </Field>
        </Field>
      </>
    );
  }
  // control reaches here when free mint tracker account exists.
  if (
    hxuiLiteToken.maybeFreeMintTrackerAccount.exists &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered
  ) {
    return (
      <>
        <CancelUnregisterButton />
        <ClaimBackDepositButton />
      </>
    );
  }

  return (
    <>
      {!hxuiLiteToken.maybeHxuiLiteTokenAccount.exists && (
        <CreateHxuiTokenAccountButton />
      )}
      <UnregisterButton />
      <UnregisterAndClaimbackDepositButton />
    </>
  );
}
