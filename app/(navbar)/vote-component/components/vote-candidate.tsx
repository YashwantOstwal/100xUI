"use client";

import Button, {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import type { Candidate } from "@/clients/generated/hxui";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
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
import bs58 from "bs58";
import {
  Account,
  Address,
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  Base58EncodedBytes,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getBase58Decoder,
  getProgramDerivedAddress,
  getTransactionEncoder,
  Instruction,
  isSolanaError,
  lamports,
  MaybeAccount,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
  SOLANA_ERROR__TRANSACTION_ERROR__WOULD_EXCEED_MAX_VOTE_COST_LIMIT,
  StringifiedNumber,
} from "@solana/kit";

import {
  fetchMaybeToken,
  fetchToken,
  getCreateAssociatedTokenInstructionAsync,
  Token,
} from "@solana-program/token";
import {
  CandidateStatus,
  getBuyPaidTokensInstructionAsync,
  getVoteCandidateInstructionAsync,
  getVoteCandidateWithHxuiLiteInstructionAsync,
  HXUI_ERROR__ONLY_ACTIVE_CANDIDATE_CAN_BE_VOTED,
  HXUI_ERROR__VOTES_MUST_BE_GREATER_THAN0,
} from "@/clients/generated/hxui";
import { Input } from "@/components/ui/input";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { Button as ShadcnButton } from "@/components/ui/button";
import { run } from "@/utils";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@/clients/constants";
import { getHxuiMintAddress, getHxuiTokenAddress } from "@/clients/pdas";
import { isHxuiTokenAccountFound } from "@/clients/helpers";
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
export function VoteCandidate({ candidate }: { candidate: Candidate }) {
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  const { isLoading: isHxuiTokenLoading } = useHxuiTokenContext();
  const { isLoading: isHxuiLiteTokenLoading } = useHxuiLiteTokenContext();

  const accountsLoading =
    isHxuiTokenLoading || isHxuiLiteTokenLoading || programAccounts.isLoading;
  const disabled =
    !selectedWallet ||
    accountsLoading ||
    candidate.candidateStatus != CandidateStatus.Active;
  return (
    <Popover>
      <HxuiButtonGroup className="border-none">
        <Tooltip delayDuration={250}>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger disabled={disabled} asChild>
                <HxuiButton className="">
                  Vote Candidate
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
                  Please connect to a solana wallet
                </TooltipContent>
              );
            }

            if (candidate.candidateStatus != CandidateStatus.Active) {
              return (
                <TooltipContent>
                  Only candidates with active status can be voted
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
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim,
            facere.
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
              Each vote requires {programAccounts.hxuiConfig.data.tokensPerVote}{" "}
              tokens.
            </PopoverDescription>
          </PopoverHeader>
          <PopoverDescription></PopoverDescription>
          <Tabs defaultValue="100xui" className="space-y-2">
            <TabsList className="w-full" variant="line">
              <TabsTrigger value="100xui">HXUI</TabsTrigger>
              <TabsTrigger value="100xui-lite">HXUILite</TabsTrigger>
            </TabsList>
            <TabsContent value="100xui">
              {!programAccounts.isLoading && (
                <Field className="flex h-40 flex-col justify-between gap-0">
                  <VoteWithHxui candidate={candidate} />
                </Field>
              )}
            </TabsContent>
            <TabsContent value="100xui-lite" className="">
              <Field className="flex h-40 flex-col justify-between gap-0">
                <VoteWithHxuiLite candidate={candidate} />
              </Field>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      )}
    </Popover>
  );
}

function VoteWithHxui({ candidate }: { candidate: Candidate }) {
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

    if (candidate.candidateStatus != CandidateStatus.Active)
      return console.error("Only active candidate can be voted");

    if (voteAmount <= BigInt(0)) {
      return console.error("Votes must be greater than 0");
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

      const buyTokensIx = await getBuyPaidTokensInstructionAsync({
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
      const buyTokensIx = await getBuyPaidTokensInstructionAsync({
        owner: selectedWalletSigner,
        amount: BigInt(
          voteAmount * programAccounts.hxuiConfig.data.tokensPerVote -
            hxuiToken.maybeHxuiTokenAccount.data.amount
        ),
      });
      ixs.push(buyTokensIx);
    }
    const voteCandidateIx = await getVoteCandidateInstructionAsync({
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

    try {
      const { signature } = await signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });
      console.log(getBase58Decoder().decode(signature));
      setIsMaxVotes(false);
      setVoteAmount(BigInt(1));
    } catch (err) {
      console.error(err);
    }
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
          Create HXUI token account
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
          className="w-full disabled:opacity-50"
        >
          {run(() => {
            let actions: string[] = [];
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

function VoteWithHxuiLite({ candidate }: { candidate: Candidate }) {
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
  async function voteCandidateWithHxuiLite() {
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
      !hxuiLiteToken.maybeRegistrationAccount.exists
    ) {
      return console.error("One of the required accounts does not exist");
    }
    if (candidate.candidateStatus != CandidateStatus.Active)
      return console.error("Only active candidate can be voted");

    if (voteAmount <= BigInt(0)) {
      return console.error("Votes must be greater than 0");
    }
    if (
      voteAmount >
      hxuiLiteToken.maybeHxuiLiteTokenAccount.data.amount /
        programAccounts.hxuiConfig.data.tokensPerVote
    ) {
      return;
    }

    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);
    const voteCandidateWithHxuiLiteIx =
      await getVoteCandidateWithHxuiLiteInstructionAsync({
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

    try {
      const { signature } = await signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });
      console.log(getBase58Decoder().decode(signature));
      setIsMaxVotes(false);
      setVoteAmount(BigInt(0));
    } catch (err) {
      console.error(err);
    }
  }
  if (hxuiLiteToken.isLoading || programAccounts.isLoading) {
    return null;
  }

  if (
    hxuiLiteToken.maybeHxuiLiteTokenAccount.exists &&
    hxuiLiteToken.maybeRegistrationAccount.exists
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
                  // disabled={
                  //   hxuiLiteToken.maybeHxuiLiteTokenAccount.exists &&
                  //   hxuiLiteToken.maybeHxuiLiteTokenAccount.data.amount /
                  //                           programAccounts.hxuiConfig.data.tokensPerVote
                  //     1
                  // }
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
            Add 100xUI components using shadcn CLI to earn Hxui lite tokens.
          </FieldDescription>
        </Field>
        <Field>
          <HxuiButton
            className="w-full"
            disabled={voteAmount == BigInt(0)}
            onClick={voteCandidateWithHxuiLite}
          >
            Vote: {voteAmount}
          </HxuiButton>
        </Field>
      </>
    );
  }

  return (
    <div className="h-40">
      <PopoverDescription className="text-sm">
        Please complete the regisration process and earn tokens by adding 100xUI
        components to your project using shadcn CLI.
      </PopoverDescription>
    </div>
  );
}
