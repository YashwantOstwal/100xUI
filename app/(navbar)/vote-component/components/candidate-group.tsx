"use client";
import { CodeCanvas as CandidateContent } from "@/components/www/file-explorer/code-canvas";
import { CopyButton } from "@/components/www/copy-button";
import FileExtensionIcon from "@/components/www/file-explorer/file-extension";
import { CodeCard } from "@/components/www/code-card";
// import { CardHeader } from "@/components/www/file-explorer/card-header";
import bs58 from "bs58";
import {
  getCreateCandidateInstructionAsync,
  getCreatePollInstructionAsync,
  getInitialiseDappInstructionAsync,
  HXUI_PROGRAM_ADDRESS,
  CANDIDATE_DISCRIMINATOR,
  fetchCandidate,
  type Candidate,
  CandidateStatus,
  getCandidateCodec,
} from "@/clients/generated/hxui";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  Account,
  address,
  appendTransactionMessageInstructions,
  Base58EncodedBytes,
  compileTransaction,
  createNoopSigner,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getBase64Encoder,
  getProgramDerivedAddress,
  getTransactionEncoder,
  lamports,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";
import { useSolanaClient } from "@/providers/solana-client";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import { run } from "@/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VoteCandidate } from "./vote-candidate";
import { ClaimBackTokens } from "./claim-back-tokens";
import { useIsAdminView } from "@/providers/is-admin-view";
import { OpenWithdrawWindowForCandidate } from "./open-withdraw-window-for-candidate";
import { WithdrawCandidate } from "./withdraw-candidate";
import { ClearReceipts } from "./clear-receipts";
import { AvailClaimBackOfferToggle } from "./avail-claim-back-offer-toggle";
import { CloseCandidate } from "./close-candidate";
import { useCandidatesContext } from "../providers/candidates";
import { Spinner } from "@/components/ui/spinner";

export function CandidateGroup() {
  const candidatesContext = useCandidatesContext();

  if (candidatesContext.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-10">
      {candidatesContext.candidates.map((candidate) => (
        <Candidate
          key={candidate.data.id}
          candidate={candidate}
          setCandidates={candidatesContext.setCandidates}
        />
      ))}
    </div>
  );
}
export function Candidate({
  candidate,
  setCandidates,
}: {
  candidate: Account<Candidate, string>;
  setCandidates: React.Dispatch<SetStateAction<Account<Candidate, string>[]>>;
}) {
  const client = useSolanaClient();
  const subscribedCandidate = useCandidateAccount(
    client.rpcSubscriptions,
    candidate,
    setCandidates
  );

  const { isAdminView } = useIsAdminView();

  return (
    <CandidateCard>
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
            <div className="text-lg font-medium capitalize">
              Admin actions:{" "}
            </div>
            <div className="flex flex-nowrap items-center gap-1">
              <OpenWithdrawWindowForCandidate
                candidate={subscribedCandidate.data}
              />
              <ClearReceipts
                candidate={subscribedCandidate.data}
              ></ClearReceipts>
              <WithdrawCandidate candidate={subscribedCandidate.data} />
              <AvailClaimBackOfferToggle
                candidate={subscribedCandidate.data}
              ></AvailClaimBackOfferToggle>
              <CloseCandidate candidate={subscribedCandidate.data} />
            </div>
          </div>
        )}
      </div>
      <CandidateContent className="flex flex-col justify-center gap-6 rounded-lg p-4 lg:h-50 lg:flex-row xl:h-75">
        <div className="text-muted-foreground text-base leading-[130%]">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Earum
          voluptate eveniet corrupti tempora incidunt voluptas eos obcaecati,
          excepturi doloremque distinctio? Cumque quae iusto eligendi rem
          architecto distinctio dicta quasi enim.
        </div>
        <div className="aspect-video bg-red-300 lg:h-full"></div>
      </CandidateContent>
    </CandidateCard>
  );
}

const CandidateCard = ({
  className,
  ...props
}: React.ComponentProps<typeof Card>) => (
  <Card
    {...props}
    className="bg-muted text-foreground relative z-10 w-full flex-1 overflow-hidden rounded-xl border-none p-1 text-sm shadow-[0px_8px_12px_-4px_rgba(16,12,12,0.08),_0px_0px_2px_0px_rgba(16,12,12,0.10),_0px_1px_2px_0px_rgba(16,12,12,0.10)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35),0_1px_rgba(255,255,255,0.05)_inset]"
  />
);

export function useCandidateAccount(
  rpcSubscriptions: ReturnType<typeof createSolanaRpcSubscriptions>,
  initialState: Account<Candidate, string>,
  setCandidates: React.Dispatch<SetStateAction<Account<Candidate, string>[]>>
) {
  const [candidate, setCandidate] =
    useState<Account<Candidate, string>>(initialState);
  useEffect(() => {
    const abortController = new AbortController();
    run(async () => {
      const candidateAccountAccountInfos = await rpcSubscriptions
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
            const decodedCandidateData = getCandidateCodec().decode(dataBytes);

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
  }, []);

  return candidate;
}

export function CandidateHeader({
  candidate,
}: {
  candidate: Account<Candidate, string>;
}) {
  return (
    <div className="flex h-full flex-[1.25] gap-2 overflow-auto text-base text-nowrap whitespace-nowrap">
      <div className="bg-input text-input-primary font- grid size-11 shrink-0 place-items-center rounded-lg border font-mono text-xl">
        #{candidate.data.id}
      </div>
      <div className="flex flex-col gap-0">
        <div className="text-muted-foreground text-xs uppercase">
          Candidate status:{" "}
          {
            CandidateStatus[
              candidate.data.candidateStatus == 3
                ? 2
                : candidate.data.candidateStatus
            ]
          }{" "}
          | votes: {candidate.data.numberOfVotes}
        </div>
        <div className="flex items-center gap-1">
          <div className="mr-1 text-xl font-medium capitalize">
            {candidate.data.name}
          </div>
          {candidate.data.claimableIfWinner && (
            <Badge
              variant="outline"
              className="bg-emerald-500 leading-none text-white dark:bg-emerald-700"
            >
              Claim back tokens if winner
            </Badge>
          )}
          <Badge variant="destructive" className="leading-none">
            Refundable
          </Badge>
        </div>
      </div>
    </div>
  );
}
