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

import { CalendarIcon, InfoIcon, RefreshCcwIcon } from "lucide-react";
import { useSolanaClient } from "@/providers/solana-client";
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
import { Button as ShadcnButton } from "@/components/ui/button";
import {
  HxuiCandidate,
  CandidateStatus,
  getOpenClaimBackWindowInstructionAsync,
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
import { toast } from "sonner";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
interface ClaimDeadline {
  date: Date | undefined;
  time: string;
  deadline: bigint | undefined;
}
const INITIAL_DEADLINE: ClaimDeadline = {
  date: undefined,
  time: "00:00:00",
  deadline: undefined,
};
export function OpenWithdrawWindowForCandidate({
  candidate,
}: {
  candidate: HxuiCandidate;
}) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow, reload } = useTimeContext();

  const [claimDeadline, setClaimDeadline] =
    useState<ClaimDeadline>(INITIAL_DEADLINE);

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

    if (
      candidate.status == CandidateStatus.Active ||
      candidate.status == CandidateStatus.Winner
    ) {
      return console.error(
        " A claim-back window can only be opened for withdrawn candidates or winners with claim-back offer enabled."
      );
    }

    if (candidate.claimDeadline !== BigInt(0)) {
      return console.error(
        ` The claim-back window for this candidate has already been opened${candidate.claimDeadline < getUnixTimestamp() ? " and subsequently closed." : " and is currently active."}`
      );
    }

    if (candidate.receiptCount == BigInt(0)) {
      return console.error(
        "No claim-back window required; there are no vote receipt accounts to be reclaimed."
      );
    }
    if (
      !claimDeadline.deadline ||
      claimDeadline.deadline <= getUnixTimestamp()
    ) {
      return console.error("Invalid deadline");
    }
    const openClaimableWindowIx = await getOpenClaimBackWindowInstructionAsync({
      admin: adminSigner,
      name: candidate.name,
      until: claimDeadline.deadline,
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

  const disabled =
    candidate.status == CandidateStatus.Active ||
    candidate.status == CandidateStatus.Winner ||
    candidate.claimDeadline !== BigInt(0) ||
    candidate.receiptCount == BigInt(0);
  return (
    <Popover>
      <HxuiButtonGroup className="border-none">
        <Tooltip delayDuration={250}>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger disabled={disabled} asChild>
                <HxuiButton className="">
                  Open a claim-back window
                  {programAccounts.isLoading ? (
                    <Spinner className="size-4" />
                  ) : null}
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (
              candidate.status == CandidateStatus.Active ||
              candidate.status == CandidateStatus.Winner
            ) {
              return (
                <TooltipContent>
                  A claim-back window can only be opened for withdrawn
                  candidates or winners with claim-back offer enabled.
                </TooltipContent>
              );
            }

            if (candidate.claimDeadline !== BigInt(0)) {
              return (
                <TooltipContent>
                  The claim-back window for this candidate has already been
                  opened
                  {candidate.claimDeadline < timeNow
                    ? " and subsequently closed."
                    : " and is currently active."}
                </TooltipContent>
              );
            }

            if (candidate.receiptCount == BigInt(0)) {
              return (
                <TooltipContent>
                  No claim-back window required; there are no vote receipt
                  accounts to be reclaimed.
                </TooltipContent>
              );
            }
          })}
        </Tooltip>
        <HxuiButton onClick={reload}>
          <RefreshCcwIcon />
        </HxuiButton>
        <Tooltip delayDuration={250}>
          <TooltipTrigger asChild>
            <HxuiButton>
              <InfoIcon />
            </HxuiButton>
          </TooltipTrigger>
          <TooltipContent className="max-w-100">
            Defines the duration during which voters can recover their spent
            HxUI tokens. This window must be opened by the admin following a
            candidate withdrawal or a winner with a claim-back offer enabled.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      <PopoverContent className="w-100">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="new-candidate-name">Poll deadline</FieldLabel>
            <div className="grid grid-cols-3 gap-4">
              <DatePicker
                claimDeadline={claimDeadline}
                setClaimDeadline={setClaimDeadline}
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
                  setClaimDeadline((prev) => {
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
                value={claimDeadline.time}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
            <FieldDescription>
              The timestamp marking the end of the claim-back window. Once
              passed, token recovery is disabled, allowing the admin to clear
              all remaining vote receipt accounts.
            </FieldDescription>
          </Field>
          <Field>
            <HxuiButton
              className="w-full"
              disabled={
                !claimDeadline.deadline || claimDeadline.deadline <= timeNow
              }
              onClick={openWithdrawWindowForCandidate}
            >
              Open a claim-back window
            </HxuiButton>
          </Field>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

function DatePicker({
  claimDeadline,
  setClaimDeadline,
}: {
  claimDeadline: ClaimDeadline;
  setClaimDeadline: Dispatch<SetStateAction<ClaimDeadline>>;
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
          data-empty={!claimDeadline.date}
          className="data-[empty=true]:text-muted-foreground col-span-2 justify-start text-left font-normal"
        >
          <CalendarIcon />
          {claimDeadline.date ? (
            format(claimDeadline.date, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
        </ShadcnButton>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={claimDeadline.date}
          onSelect={(date) => {
            setClaimDeadline((prev) => {
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
