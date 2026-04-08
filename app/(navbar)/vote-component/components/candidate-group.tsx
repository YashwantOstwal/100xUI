"use client";
import { CodeCanvas as CandidateContent } from "@/components/www/file-explorer/code-canvas";
import { useTheme } from "next-themes";

import {
  HXUI_PROGRAM_ADDRESS,
  type HxuiCandidate,
  CandidateStatus,
  getHxuiCandidateCodec,
} from "@/clients/generated/hxui";
import { Account, getBase64Encoder } from "@solana/kit";
import { useSolanaClient } from "@/providers/solana-client";
import { SetStateAction, useEffect, useState } from "react";
import { run } from "@/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteCandidate } from "./vote-candidate";
import { ClaimBackTokens } from "./claim-back-tokens";
import { useIsAdminView } from "@/providers/is-admin-view";
import { OpenWithdrawWindowForCandidate } from "./open-claim-back-window";
import { WithdrawCandidate } from "./withdraw-candidate";
import { ClearReceipts } from "./close-vote-receipt";
import { EnableClaimBackOfferToggle } from "./enable-claim-back-offer";
import { CloseCandidate } from "./close-candidate";
import { useCandidatesContext } from "../providers/candidates";
import { Spinner } from "@/components/ui/spinner";
import { useCanDrawWinnerContext } from "../providers/can-draw-winner";
import { cn } from "@/lib/utils";
import { SolanaExplorerFull } from "@/icons/solana-explorer.icon";
import { ArrowUpRightIcon } from "lucide-react";
import { MotionLinkUnderline } from "@/registry/100xui/blocks/motion-link/components/motion-link";

export function CandidateGroup() {
  const candidatesContext = useCandidatesContext();

  if (candidatesContext.isLoading) {
    return (
      <div className="flex items-center justify-center gap-1 py-10">
        <span className="text-muted-foreground text-sm">
          Loading candidates...
        </span>
        <Spinner />
      </div>
    );
  }
  return (
    <div className="mt-10 flex flex-col gap-10">
      {candidatesContext.candidates.map((candidate) => (
        <HxuiCandidate
          key={candidate.data.id}
          candidate={candidate}
          setCandidates={candidatesContext.setCandidates}
        />
      ))}
    </div>
  );
}
export function HxuiCandidate({
  candidate,
  setCandidates,
}: {
  candidate: Account<HxuiCandidate, string>;
  setCandidates: React.Dispatch<
    SetStateAction<Account<HxuiCandidate, string>[]>
  >;
}) {
  const subscribedCandidate = useCandidateAccount(candidate, setCandidates);

  const { isAdminView } = useIsAdminView();

  return (
    <CandidateCard
      className={cn(
        (subscribedCandidate.data.status == CandidateStatus.Winner ||
          subscribedCandidate.data.status == CandidateStatus.ClaimableWinner) &&
          "bg-[#98db71] dark:bg-[#2a5018]",
        subscribedCandidate.data.status == CandidateStatus.Withdrawn &&
          "bg-[#e15e5a] dark:bg-[#240B0A]"
      )}
    >
      <div>
        <div className="flex items-center justify-between px-2 py-2">
          <CandidateHeader candidate={subscribedCandidate} />
          <div className="flex flex-nowrap gap-1">
            <VoteCandidate candidate={subscribedCandidate.data} />
            <ClaimBackTokens candidate={subscribedCandidate.data} />
          </div>
        </div>
        {isAdminView && (
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="text-muted-foreground text-xs uppercase">
              Admin actions:{" "}
            </div>
            <div className="flex flex-nowrap items-center gap-1">
              <EnableClaimBackOfferToggle
                candidate={subscribedCandidate.data}
              ></EnableClaimBackOfferToggle>
              <WithdrawCandidate candidate={subscribedCandidate.data} />

              <OpenWithdrawWindowForCandidate
                candidate={subscribedCandidate.data}
              />
              <ClearReceipts
                candidate={subscribedCandidate.data}
              ></ClearReceipts>

              <CloseCandidate candidate={subscribedCandidate.data} />
            </div>
          </div>
        )}
      </div>
      <CandidateContent className="flex flex-col justify-between gap-6 rounded-lg p-4 lg:h-50 lg:flex-row xl:h-75">
        <div className="text-muted-foreground text-base leading-[130%]">
          {subscribedCandidate.data.description}
        </div>
        <div className="aspect-video lg:h-full">
          <Video candidateName={subscribedCandidate.data.name} />
        </div>
      </CandidateContent>
    </CandidateCard>
  );
}
const Video = ({ candidateName }: { candidateName: string }) => {
  const { theme, systemTheme } = useTheme();

  const slug = candidateName.toLowerCase().replaceAll(" ", "-");
  return (
    <video
      width="100%"
      height="100%"
      className="h-full w-full object-cover"
      // height="100%"
      autoPlay
      muted
      loop
      playsInline
      poster="/og/default.png"
      src={
        theme?.startsWith("light") ||
        (theme === "system" && systemTheme === "light")
          ? `/component-assets/${slug}-light.mp4`
          : `/component-assets/${slug}-dark.mp4`
      }
    ></video>
  );
};
const CandidateCard = ({
  className,
  ...props
}: React.ComponentProps<typeof Card>) => (
  <Card
    {...props}
    className={cn(
      "text-foreground bg-muted relative z-10 w-full flex-1 overflow-hidden rounded-xl border-none p-1 text-sm shadow-[0px_8px_12px_-4px_rgba(16,12,12,0.08),_0px_0px_2px_0px_rgba(16,12,12,0.10),_0px_1px_2px_0px_rgba(16,12,12,0.10)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35),0_1px_rgba(255,255,255,0.05)_inset]",
      className
    )}
  />
);

export function useCandidateAccount(
  initialState: Account<HxuiCandidate, string>,
  setCandidates: React.Dispatch<
    SetStateAction<Account<HxuiCandidate, string>[]>
  >
) {
  const [candidate, setCandidate] =
    useState<Account<HxuiCandidate, string>>(initialState);
  const { setCanBeWinnerCandidates } = useCanDrawWinnerContext();
  const client = useSolanaClient();
  useEffect(() => {
    const abortController = new AbortController();
    run(async () => {
      const candidateAccountAccountInfos = await client.rpcSubscriptions
        .accountNotifications(candidate.address, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: abortController.signal });

      run(async () => {
        for await (const accountInfo of candidateAccountAccountInfos) {
          if (accountInfo.value.owner === HXUI_PROGRAM_ADDRESS) {
            const base64Data = accountInfo.value.data[0];
            const dataBytes = getBase64Encoder().encode(base64Data);
            const decodedCandidateData =
              getHxuiCandidateCodec().decode(dataBytes);
            if (
              decodedCandidateData.voteCount >= 10 &&
              decodedCandidateData.status === CandidateStatus.Active
            ) {
              setCanBeWinnerCandidates((prev) => {
                if (!prev.includes(candidate.address)) {
                  return [...prev, candidate.address];
                }
                return prev;
              });
            } else if (decodedCandidateData.status !== CandidateStatus.Active) {
              setCanBeWinnerCandidates((prev) =>
                prev.filter(
                  (prevCandidateAddress) =>
                    prevCandidateAddress !== candidate.address
                )
              );
            }
            setCandidate((prev) => ({ ...prev, data: decodedCandidateData }));
          } else {
            setCandidates((prev) =>
              prev.filter(
                (eachCandidate) => eachCandidate.address !== candidate.address
              )
            );
          }
        }
      });
    });
    return () => {
      abortController.abort();
    };
  }, [
    candidate.address,
    setCanBeWinnerCandidates,
    setCandidates,
    client.rpcSubscriptions,
  ]);

  return candidate;
}

export function CandidateHeader({
  candidate,
}: {
  candidate: Account<HxuiCandidate, string>;
}) {
  return (
    <div className="flex h-full flex-[1.25] gap-2 overflow-auto text-base text-nowrap whitespace-nowrap">
      <div className="bg-input text-input-primary font- grid size-11 shrink-0 place-items-center rounded-lg border font-mono text-xl">
        #{candidate.data.id}
      </div>
      <div className="flex flex-col gap-0">
        <div className="text-muted-foreground flex items-center text-xs leading-tight uppercase">
          Status:&nbsp;
          <span
            className={cn(
              "text-foreground",
              (candidate.data.status == CandidateStatus.Winner ||
                candidate.data.status == CandidateStatus.ClaimableWinner) &&
                "text-green-900 dark:text-[#46f73d]",
              candidate.data.status == CandidateStatus.Withdrawn &&
                "text-red-900 dark:text-[#f73d3d]"
            )}
          >
            {
              CandidateStatus[
                candidate.data.status == 3 ? 2 : candidate.data.status
              ]
            }
          </span>
          &nbsp;|&nbsp;votes:&nbsp;
          <span className="text-foreground">{candidate.data.voteCount}</span>
          &nbsp;|
          <a
            target="_blank"
            href={`https://explorer.solana.com/address/${candidate.address}/anchor-account?cluster=devnet`}
            className="peer group mb-0.5 flex items-center -space-x-1 text-xl font-medium hover:underline"
          >
            <SolanaExplorerFull className="h-4 w-35" />
            <ArrowUpRightIcon className="stroke-foreground size-3.5 group-hover:stroke-[#14f195]"></ArrowUpRightIcon>
          </a>
        </div>
        <div className="mr-1 mb-0.5 flex items-center gap-2">
          {candidate.data.status == CandidateStatus.Winner ||
          candidate.data.status == CandidateStatus.ClaimableWinner ? (
            <MotionLinkUnderline
              target="_blank"
              className="flex items-center text-xl font-medium"
              href={`/components/${candidate.data.name
                .toLocaleLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {candidate.data.name}
              <ArrowUpRightIcon className="size-4.5" />
            </MotionLinkUnderline>
          ) : (
            <div className="text-xl font-medium">{candidate.data.name}</div>
          )}

          {candidate.data.claimBackOffer && (
            <Badge
              variant="ghost"
              className="bg-emerald-500 leading-none text-white dark:bg-emerald-700"
            >
              Claim back tokens if winner
            </Badge>
          )}
          <Badge variant="destructive" className="leading-none">
            Refundable if withdrawn
          </Badge>
        </div>
      </div>
    </div>
  );
}
