"use client";

import {
  Candidate,
  CANDIDATE_DISCRIMINATOR,
  getCandidateCodec,
  HXUI_PROGRAM_ADDRESS,
} from "@/clients/generated/hxui";
import { useSolanaClient } from "@/providers/solana-client";
import { run } from "@/utils";
import {
  getBase64Encoder,
  Account,
  getBase58Decoder,
  Base58EncodedBytes,
} from "@solana/kit";
import { createContext, useContext, useEffect, useState } from "react";

type CandidatesContext =
  | { isLoading: true }
  | {
      isLoading: false;
      candidates: Account<Candidate, string>[];
      setCandidates: React.Dispatch<
        React.SetStateAction<Account<Candidate, string>[]>
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
  const [candidates, setCandidates] = useState<Account<Candidate, string>[]>(
    []
  );

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
                  CANDIDATE_DISCRIMINATOR
                ) as Base58EncodedBytes,
              },
            },
          ],
        })
        .send();

      const decodedCandidateAccounts = candidates.map((candidate) => {
        const base64Data = candidate.account.data[0];
        const dataBytes = getBase64Encoder().encode(base64Data);
        const decodedCandidateData = getCandidateCodec().decode(dataBytes);

        const decodedCandidateAccount: Account<Candidate, string> = {
          address: candidate.pubkey,
          ...candidate.account,
          data: decodedCandidateData,
          programAddress: HXUI_PROGRAM_ADDRESS,
        };
        return decodedCandidateAccount;
      });

      setCandidates(
        decodedCandidateAccounts.sort((a, b) => b.data.id - a.data.id)
      );
      setIsLoading(false);
    });
  }, []);

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
