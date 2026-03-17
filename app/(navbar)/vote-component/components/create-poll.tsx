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
  RefreshCcwIcon,
} from "lucide-react";
import { useSolanaClient } from "@/providers/solana-client";
import {
  HxuiButton,
  HxuiButtonGroup,
} from "../../../../components/www/file-explorer/button";
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

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  getCreatePollInstructionAsync,
  getPollCodec,
  HXUI_ERROR__INVALID_DEADLINE,
  HXUI_ERROR__ONLY_ADMIN_ACCESS,
  HXUI_ERROR__WINNER_NOT_DRAWN,
  isHxuiError,
} from "@/clients/generated/hxui";
import { Input } from "@/components/ui/input";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";
import { run } from "@/utils";
import { getUnixTimestamp, useTimeContext } from "../providers/time";
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
export function CreatePoll() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  const { timeNow, reload } = useTimeContext();

  const [pollDeadline, setPollDeadline] = useState<PollDeadline>(
    DEFAULT_POLL_DEADLINE
  );

  async function createPoll() {
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

    if (!programAccounts.hxuiPoll.data.currentPollWinnerDrawn)
      return console.error("");

    if (!pollDeadline.deadline || pollDeadline.deadline <= getUnixTimestamp()) {
      return console.error("");
    }

    const adminSigner = createNoopSigner(selectedWalletAddress);

    const createPollIx = await getCreatePollInstructionAsync({
      admin: adminSigner,
      pollDeadline: pollDeadline.deadline,
    });
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(createPollIx, tx)
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
      setPollDeadline(DEFAULT_POLL_DEADLINE);
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
      }
    }
  }

  const disabled =
    programAccounts.isLoading ||
    !programAccounts.hxuiPoll.data.currentPollWinnerDrawn ||
    programAccounts.hxuiPoll.data.currentPollDeadline >= timeNow;
  return (
    <Popover>
      <HxuiButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger disabled={disabled} asChild>
                <HxuiButton>
                  Create new poll
                  {programAccounts.isLoading ? (
                    <Spinner className="size-4" />
                  ) : (
                    <ChevronDownIcon className="size-4" />
                  )}
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (programAccounts.isLoading) {
              return null;
            }

            if (!programAccounts.hxuiPoll.data.currentPollWinnerDrawn) {
              return (
                <TooltipContent>
                  Winner of the current poll is not drawn yet. Please draw the
                  winner to create a new poll.
                </TooltipContent>
              );
            }
            if (programAccounts.hxuiPoll.data.currentPollDeadline >= timeNow) {
              return (
                <TooltipContent>
                  Current poll is still active. New poll can only be created
                  after the deadline of current poll.
                </TooltipContent>
              );
            }
            return;
          })}
        </Tooltip>
        <HxuiButton onClick={reload}>
          <RefreshCcwIcon />
        </HxuiButton>
        <Tooltip>
          <TooltipTrigger asChild>
            <HxuiButton>
              <InfoIcon />
            </HxuiButton>
          </TooltipTrigger>
          <TooltipContent>
            Create a new poll by setting a deadline. After the deadline, the
            winner can be drawn for the poll. Only one poll can be active at a
            time.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      {!disabled && (
        <PopoverContent className="w-100" hidden={disabled}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-candidate-name">
                Poll deadline
              </FieldLabel>
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
                Set the deadline for the poll. After the deadline, the winner
                can be drawn. The deadline should be in the future.
              </FieldDescription>
            </Field>
            <Field>
              <HxuiButton
                className="w-full disabled:opacity-50"
                disabled={
                  !pollDeadline.deadline || pollDeadline.deadline <= timeNow
                }
                onClick={createPoll}
              >
                Create Poll
              </HxuiButton>
            </Field>
          </FieldGroup>
        </PopoverContent>
      )}
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
        <Button
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
        </Button>
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
