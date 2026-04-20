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
} from "@/components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Calendar } from "@/components/ui/calendar";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSetDropTimeInstructionAsync } from "@/clients/generated/hxui";
import { Input } from "@/components/ui/input";
import { useProgramAccounts } from "../providers/program-accounts";
import { Spinner } from "@/components/ui/spinner";
import { run } from "@/utils";
import { getUnixTimestamp, useTimeContext } from "../providers/time";
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
interface DropTime {
  date: Date | undefined;
  time: string;
  deadline: bigint | undefined;
}

const INITIAL_DROP_TIME: DropTime = {
  date: undefined,
  time: "00:00:00",
  deadline: undefined,
};
export function SetDropTime() {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const programAccounts = useProgramAccounts();
  const { timeNow, reload } = useTimeContext();

  const [dropTime, setNewDropTime] = useState<DropTime>(INITIAL_DROP_TIME);

  async function setDropTime() {
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
      return console.error("only admin can invoke this instruction");

    if (
      programAccounts.hxuiDropTime.data.dropTimestamp !== BigInt(0) &&
      !programAccounts.hxuiDropTime.data.isWinnerDrawn
    )
      return console.error(
        "Draw the current cycle's winner before setting a new drop time."
      );
    if (programAccounts.hxuiDropTime.data.dropTimestamp >= timeNow)
      return console.error(
        "A drop time is already set. You can set a new drop time only after the current drop ends and the cycle’s winner is drawn."
      );

    if (!dropTime.deadline || dropTime.deadline <= getUnixTimestamp()) {
      return console.error("Invalid drop time");
    }

    const adminSigner = createNoopSigner(selectedWalletAddress);

    const createPollIx = await getSetDropTimeInstructionAsync({
      admin: adminSigner,
      newDropTime: dropTime.deadline,
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

    toast.promise(
      signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      }),
      {
        loading: "Pending...",
        success: ({ signature }) => {
          setNewDropTime(INITIAL_DROP_TIME);
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

  const disabled =
    programAccounts.isLoading ||
    (programAccounts.hxuiDropTime.data.dropTimestamp !== BigInt(0) &&
      !programAccounts.hxuiDropTime.data.isWinnerDrawn) ||
    programAccounts.hxuiDropTime.data.dropTimestamp >= timeNow;

  const now = getUnixTimestamp();
  return (
    <Popover>
      <HxuiButtonGroup className="">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger disabled={disabled} asChild>
                <HxuiButton>
                  Set a new drop time
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

            if (programAccounts.hxuiDropTime.data.dropTimestamp >= timeNow) {
              return (
                <TooltipContent>
                  A drop time is already set. You can set a new drop time only
                  after the current drop ends and the cycle’s winner is drawn.
                </TooltipContent>
              );
            }
            if (
              programAccounts.hxuiDropTime.data.dropTimestamp !== BigInt(0) &&
              !programAccounts.hxuiDropTime.data.isWinnerDrawn
            ) {
              return (
                <TooltipContent>
                  Draw the current cycle&apos;s winner before setting a new drop
                  time.
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
            Set a drop time after which a winner can be selected from active
            candidates, informing users and giving them enough time to
            participate and influence the outcome.
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
                  dropTime={dropTime}
                  setNewDropTime={setNewDropTime}
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
                    setNewDropTime((prev) => {
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
                  value={dropTime.time}
                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
              <FieldDescription>
                Set a drop time after which a winner can be selected from active
                candidates.Make sure the drop time is in the future.
              </FieldDescription>
            </Field>
            <Field>
              <HxuiButton
                className="w-full disabled:opacity-50"
                disabled={
                  !dropTime.deadline ||
                  dropTime.deadline <= timeNow ||
                  dropTime.deadline <= now
                }
                onClick={setDropTime}
              >
                Set drop time
              </HxuiButton>
            </Field>
          </FieldGroup>
        </PopoverContent>
      )}
    </Popover>
  );
}

function DatePicker({
  dropTime,
  setNewDropTime,
}: {
  dropTime: DropTime;
  setNewDropTime: Dispatch<SetStateAction<DropTime>>;
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
          data-empty={!dropTime.date}
          className="data-[empty=true]:text-muted-foreground col-span-2 justify-start text-left font-normal"
        >
          <CalendarIcon />
          {dropTime.date ? (
            format(dropTime.date, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dropTime.date}
          onSelect={(date) => {
            setNewDropTime((prev) => {
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
