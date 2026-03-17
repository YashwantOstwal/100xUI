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
  InfoIcon,
  LoaderIcon,
} from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Candidate,
  CandidateStatus,
  fetchConfig,
  fetchPoll,
  getCreateCandidateInstructionAsync,
  getCreatePollInstructionAsync,
  getOpenClaimableWindowInstructionAsync,
  getPollCodec,
  isHxuiError,
} from "@/clients/generated/hxui";
import { run } from "@/utils";
import { Input } from "@/components/ui/input";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { useProgramAccounts } from "../providers/program-accounts";
import { getUnixTimestamp, useTimeContext } from "../providers/time";
import { Spinner } from "@/components/ui/spinner";
interface PollDeadline {
  date: Date | undefined;
  time: string;
  deadline: bigint | undefined;
}
const DEFAULT_POLL_DEADLINE: PollDeadline = {
  date: undefined,
  time: "00:00:00",
  deadline: undefined,
};
export function OpenWithdrawWindowForCandidate({
  candidate,
}: {
  candidate: Candidate;
}) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow, reload } = useTimeContext();

  const [pollDeadline, setPollDeadline] = useState<PollDeadline>(
    DEFAULT_POLL_DEADLINE
  );

  const programAccounts = useProgramAccounts();
  async function openWithdrawWindowForCandidate() {
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

    if (!pollDeadline.deadline || pollDeadline.deadline <= Date.now() / 1000) {
      return console.error("Invalid deadline for claim back window");
    }
    const openClaimableWindowIx = await getOpenClaimableWindowInstructionAsync({
      admin: adminSigner,
      name: candidate.name,
      until: pollDeadline.deadline,
    });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(openClaimableWindowIx, tx)
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
      console.log(err instanceof Error ? err.message : err);
    }
  }

  const disabled =
    candidate.candidateStatus == CandidateStatus.Active ||
    candidate.candidateStatus == CandidateStatus.Winner ||
    candidate.claimWindow !== BigInt(0) ||
    candidate.totalReceipts == BigInt(0);
  return (
    <Popover>
      <HxuiButtonGroup className="border-none">
        <Tooltip delayDuration={250}>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger disabled={disabled} asChild>
                <HxuiButton className="">
                  Open withdraw window
                  {programAccounts.isLoading ? (
                    <Spinner className="size-4" />
                  ) : null}
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (
              candidate.candidateStatus == CandidateStatus.Active ||
              candidate.candidateStatus == CandidateStatus.Winner
            ) {
              return (
                <TooltipContent>
                  Withdraw window can only be opened for withdrawn candidate or
                  winner with claim back offer.
                </TooltipContent>
              );
            }

            if (candidate.claimWindow !== BigInt(0)) {
              return (
                <TooltipContent>
                  Withdraw window is already opened.
                </TooltipContent>
              );
            }

            if (candidate.totalReceipts == BigInt(0)) {
              return (
                <TooltipContent>
                  The withdraw window need not be opened as no receipts to
                  claim.
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
      <PopoverContent className="w-100">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-candidate-name">Poll deadline</FieldLabel>
            <div className="grid grid-cols-3 gap-4">
              <DatePicker
                pollDeadline={pollDeadline}
                setPollDeadline={setPollDeadline}
              />
              <Input
                onChange={(e) => {
                  const time = e.target.value;
                  const hms = time.split(":").map((each) => parseInt(each));
                  const hoursInSeconds = 3600 * hms[0];
                  const minutesInSeconds = 60 * hms[1];
                  const seconds = hms[2];
                  const timeInSeconds =
                    hoursInSeconds + minutesInSeconds + seconds;
                  setPollDeadline((prev) => {
                    return {
                      date: prev.date,
                      time: e.target.value,
                      deadline: prev.date
                        ? BigInt(prev.date.getTime() / 1000 + timeInSeconds)
                        : undefined,
                    };
                  });
                }}
                type="time"
                step="1"
                value={pollDeadline.time}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
            <FieldDescription>
              Deadline of the poll after which the winner can be drawn.
            </FieldDescription>
          </Field>
          <Field>
            <Button
              className="w-full disabled:opacity-50"
              disabled={
                !pollDeadline.deadline || pollDeadline.deadline <= timeNow
              }
              onClick={openWithdrawWindowForCandidate}
            >
              Open claim back window
            </Button>
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

function DatePicker({
  pollDeadline,
  setPollDeadline,
}: {
  pollDeadline: PollDeadline;
  setPollDeadline: Dispatch<SetStateAction<PollDeadline>>;
}) {
  const [open, setOpen] = useState(false);
  const [timeZone, setTimeZone] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ShadcnButton
          variant="outline"
          data-empty={!pollDeadline.date}
          className="data-[empty=true]:text-muted-foreground col-span-2 justify-start text-left font-normal"
        >
          <CalendarIcon />
          {pollDeadline.date ? (
            format(pollDeadline.date, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
        </ShadcnButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={pollDeadline.date}
          onSelect={(date) => {
            setPollDeadline((prev) => {
              const time = prev.time;
              const hms = time.split(":").map((each) => parseInt(each));
              const hoursInSeconds = 3600 * hms[0];
              const minutesInSeconds = 60 * hms[1];
              const seconds = hms[2];
              const timeInSeconds = hoursInSeconds + minutesInSeconds + seconds;
              if (date) {
                return {
                  ...prev,
                  date,
                  deadline: BigInt(date.getTime() / 1000 + timeInSeconds),
                };
              } else {
                return { ...prev, date, deadline: undefined };
              }
            });
            setOpen(false);
          }}
          timeZone={timeZone}
        />
      </PopoverContent>
    </Popover>
  );
}
