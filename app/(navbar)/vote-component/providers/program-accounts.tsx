"use client";

import { Mint, fetchMint, getMintCodec } from "@solana-program/token";

import { getBase64Encoder, Account, BaseAccount } from "@solana/kit";
import { createContext, useContext, useEffect, useState } from "react";

import {
  Config,
  fetchPoll,
  fetchConfig,
  getConfigCodec,
  Poll,
  getPollCodec,
} from "@/clients/generated/hxui";
import {
  getHxuiMintAddress,
  getHxuiConfigAddress,
  getHxuiPollAddress,
  getHxuiVaultAddress,
} from "@/clients/pdas";
import { useSolanaClient } from "@/providers/solana-client";
import { run } from "@/utils";

type ProgramAccounts =
  | {
      isLoading: true;
    }
  | {
      isLoading: false;
      hxuiMint: Account<Mint, string>;
      hxuiPoll: Account<Poll, string>;
      hxuiConfig: Account<Config, string>;
      hxuiVault: BaseAccount;
    };
const ProgramAccountsContext = createContext<ProgramAccounts | null>(null);
export function ProgramAccountsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useSolanaClient();
  const [programAccounts, setProgramAccounts] = useState<ProgramAccounts>({
    isLoading: true,
  });

  useEffect(() => {
    run(async () => {
      const hxuiConfigAddress = await getHxuiConfigAddress();
      const hxuiMintAddress = await getHxuiMintAddress();
      const hxuiPollAddress = await getHxuiPollAddress();
      const hxuiVaultAddress = await getHxuiVaultAddress();

      const hxuiConfig = await fetchConfig(client.rpc, hxuiConfigAddress);
      const hxuiMint = await fetchMint(client.rpc, hxuiMintAddress);
      const hxuiPoll = await fetchPoll(client.rpc, hxuiPollAddress);
      const { value } = await client.rpc
        .getAccountInfo(hxuiVaultAddress)
        .send()!;

      setProgramAccounts({
        isLoading: false,
        hxuiConfig,
        hxuiMint,
        hxuiPoll,
        hxuiVault: {
          lamports: value!.lamports,
          executable: value!.executable,
          space: value!.space,
          programAddress: value!.owner,
        },
      });
    });

    const hxuiConfigAbortController = new AbortController();
    const hxuiMintAbortController = new AbortController();
    const hxuiPollAbortController = new AbortController();
    const hxuiVaultAbortController = new AbortController();

    run(async () => {
      const hxuiConfigAddress = await getHxuiConfigAddress();
      const hxuiMintAddress = await getHxuiMintAddress();
      const hxuiPollAddress = await getHxuiPollAddress();
      const hxuiVaultAddress = await getHxuiVaultAddress();

      const hxuiConfigNotifications = await client.rpcSubscriptions
        .accountNotifications(hxuiConfigAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: hxuiConfigAbortController.signal });
      const hxuiMintNotifications = await client.rpcSubscriptions
        .accountNotifications(hxuiMintAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: hxuiMintAbortController.signal });
      const hxuiPollNotifications = await client.rpcSubscriptions
        .accountNotifications(hxuiPollAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: hxuiPollAbortController.signal });
      const hxuiVaultNotifications = await client.rpcSubscriptions
        .accountNotifications(hxuiVaultAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: hxuiVaultAbortController.signal });

      run(async () => {
        for await (const accountInfo of hxuiVaultNotifications) {
          const lamports = accountInfo.value.lamports;

          setProgramAccounts((prev) => {
            if (!prev.isLoading) {
              return {
                ...prev,
                hxuiVault: { ...prev.hxuiVault, lamports },
              };
            } else return prev;
          });
        }
      });
      run(async () => {
        for await (const accountInfo of hxuiConfigNotifications) {
          const base64Data = accountInfo.value.data[0];
          const dataBytes = getBase64Encoder().encode(base64Data);

          const decodedData = getConfigCodec().decode(dataBytes);
          setProgramAccounts((prev) => {
            if (!prev.isLoading) {
              return {
                ...prev,
                hxuiConfig: { ...prev.hxuiConfig, data: decodedData },
              };
            } else return prev;
          });
        }
      });

      run(async () => {
        for await (const accountInfo of hxuiMintNotifications) {
          const base64Data = accountInfo.value.data[0];
          const dataBytes = getBase64Encoder().encode(base64Data);

          const decodedData = getMintCodec().decode(dataBytes);
          setProgramAccounts((prev) => {
            if (!prev.isLoading) {
              return {
                ...prev,
                hxuiMint: { ...prev.hxuiMint, data: decodedData },
              };
            } else return prev;
          });
        }
      });

      run(async () => {
        for await (const accountInfo of hxuiPollNotifications) {
          const base64Data = accountInfo.value.data[0];
          const dataBytes = getBase64Encoder().encode(base64Data);

          const decodedData = getPollCodec().decode(dataBytes);
          setProgramAccounts((prev) => {
            if (!prev.isLoading) {
              return {
                ...prev,
                hxuiPoll: { ...prev.hxuiPoll, data: decodedData },
              };
            } else return prev;
          });
        }
      });
    });
    return () => {
      hxuiConfigAbortController.abort();
      hxuiPollAbortController.abort();
      hxuiMintAbortController.abort();
      hxuiVaultAbortController.abort();
    };
  }, []);

  return (
    <ProgramAccountsContext.Provider value={programAccounts}>
      {children}
    </ProgramAccountsContext.Provider>
  );
}

export function useProgramAccounts() {
  const ctx = useContext(ProgramAccountsContext);
  if (ctx === null)
    throw new Error("must be used within the program accounts provider");
  return ctx;
}
