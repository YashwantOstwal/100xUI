"use client";

import {
  HxuiCandidate,
  HXUI_CANDIDATE_DISCRIMINATOR,
  CandidateStatus,
  getHxuiCandidateCodec,
  HXUI_PROGRAM_ADDRESS,
} from "@/clients/generated/hxui";
import { useSolanaClient } from "@/providers/solana-client";
import { run } from "@/utils";
import {
  getBase64Encoder,
  Account,
  getBase58Decoder,
  Base58EncodedBytes,
  Address,
} from "@solana/kit";
import { createContext, useContext, useEffect, useState } from "react";
import { useCanDrawWinnerContext } from "./can-draw-winner";

type CandidatesContext =
  | { isLoading: true }
  | {
      isLoading: false;
      candidates: Account<HxuiCandidate, string>[];
      setCandidates: React.Dispatch<
        React.SetStateAction<Account<HxuiCandidate, string>[]>
      >;
    };
const CandidatesContext = createContext<CandidatesContext | null>(null);
export function CandidatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useSolanaClient();

  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState<
    Account<HxuiCandidate, string>[]
  >([]);
  const { setCanBeWinnerCandidates } = useCanDrawWinnerContext();

  useEffect(() => {
    run(async () => {
      const candidates = await client.rpc
        .getProgramAccounts(HXUI_PROGRAM_ADDRESS, {
          encoding: "base64",
          commitment: "confirmed",
          filters: [
            {
              memcmp: {
                encoding: "base58",
                offset: BigInt(0),
                bytes: getBase58Decoder().decode(
                  HXUI_CANDIDATE_DISCRIMINATOR
                ) as Base58EncodedBytes,
              },
            },
          ],
        })
        .send();

      const canBeWinnerCandidates: Address[] = [];
      const decodedCandidateAccounts = candidates.map((candidate) => {
        const base64Data = candidate.account.data[0];
        const dataBytes = getBase64Encoder().encode(base64Data);
        const decodedCandidateData = getHxuiCandidateCodec().decode(dataBytes);

        if (
          decodedCandidateData.voteCount >= 10 &&
          decodedCandidateData.status === CandidateStatus.Active
        ) {
          canBeWinnerCandidates.push(candidate.pubkey);
        }
        const decodedCandidateAccount: Account<HxuiCandidate, string> = {
          address: candidate.pubkey,
          ...candidate.account,
          data: decodedCandidateData,
          programAddress: HXUI_PROGRAM_ADDRESS,
        };
        return decodedCandidateAccount;
      });

      setCanBeWinnerCandidates(canBeWinnerCandidates);
      setCandidates(
        decodedCandidateAccounts.sort((a, b) => b.data.id - a.data.id)
      );
      setIsLoading(false);
    });
  }, [client.rpc, setCanBeWinnerCandidates]);

  return (
    <CandidatesContext.Provider
      value={
        isLoading
          ? { isLoading }
          : {
              isLoading,
              candidates,
              setCandidates,
            }
      }
    >
      {children}
    </CandidatesContext.Provider>
  );
}

export function useCandidatesContext() {
  const ctx = useContext(CandidatesContext);
  if (ctx === null)
    throw new Error("must be used within the Candidates provider");
  return ctx;
}
