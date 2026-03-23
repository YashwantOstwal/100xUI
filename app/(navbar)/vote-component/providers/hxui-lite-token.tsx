"use client";

import {
  fetchMaybeFreeMintTracker,
  FreeMintTracker,
  getFreeMintTrackerCodec,
  HXUI_PROGRAM_ADDRESS,
} from "@/clients/generated/hxui";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@/clients/constants";
import {
  getHxuiLiteTokenAddress,
  getFreeMintTrackerAddress,
} from "@/clients/pdas";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import { useSolanaClient } from "@/providers/solana-client";
import { run } from "@/utils";
import { fetchMaybeToken, Token, getTokenCodec } from "@solana-program/token";
import { address, MaybeAccount, getBase64Encoder } from "@solana/kit";
import { createContext, useContext, useEffect, useState } from "react";

type HxuiLiteToken =
  | {
      isLoading: false;
      maybeHxuiLiteTokenAccount: MaybeAccount<Token, string>;
      maybeFreeMintTrackerAccount: MaybeAccount<FreeMintTracker, string>;
    }
  | { isLoading: true };
const HxuiLiteToken = createContext<HxuiLiteToken | null>(null);
export function HxuiLiteTokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useSolanaClient();
  const { selectedWallet } = usePrivyAsSolanaWallet();

  const [freeMintTracker, setFreeMintTracker] = useState<HxuiLiteToken>({
    isLoading: true,
  });

  const selectedWalletAddress = selectedWallet
    ? address(selectedWallet.address)
    : selectedWallet;
  useEffect(() => {
    if (!selectedWalletAddress) return;

    run(async () => {
      const hxuiLiteTokenAddress = await getHxuiLiteTokenAddress({
        owner: selectedWalletAddress,
      });

      const maybeHxuiLiteTokenAccount = await fetchMaybeToken(
        client.rpc,
        hxuiLiteTokenAddress
      );

      const freeMintTrackerAddress = await getFreeMintTrackerAddress({
        owner: selectedWalletAddress,
      });

      const maybeFreeMintTrackerAccount = await fetchMaybeFreeMintTracker(
        client.rpc,
        freeMintTrackerAddress
      );

      setFreeMintTracker({
        isLoading: false,
        maybeFreeMintTrackerAccount,
        maybeHxuiLiteTokenAccount,
      });
    });

    const abortController = new AbortController();
    const abortController2 = new AbortController();

    run(async () => {
      const hxuiLiteTokenAddress = await getHxuiLiteTokenAddress({
        owner: selectedWalletAddress,
      });

      const hxuiLiteTokenAccountInfos = await client.rpcSubscriptions
        .accountNotifications(hxuiLiteTokenAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: abortController.signal });
      run(async () => {
        for await (const accountInfo of hxuiLiteTokenAccountInfos) {
          if (accountInfo.value.owner == TOKEN_2022_PROGRAM_ADDRESS) {
            const encodedBase64Data = accountInfo.value.data[0];
            const encodedDataBytes =
              getBase64Encoder().encode(encodedBase64Data);

            const decodedData = getTokenCodec().decode(encodedDataBytes);
            const maybeHxuiLiteTokenAccount: MaybeAccount<Token, string> = {
              exists: true,
              address: hxuiLiteTokenAddress,
              programAddress: TOKEN_2022_PROGRAM_ADDRESS,
              ...accountInfo.value,
              data: decodedData,
            };

            setFreeMintTracker((prev) => {
              if (!prev.isLoading) {
                return { ...prev, maybeHxuiLiteTokenAccount };
              } else return prev;
            });
          } else {
            setFreeMintTracker((prev) => {
              if (!prev.isLoading) {
                return {
                  ...prev,
                  maybeHxuiLiteTokenAccount: {
                    exists: false,
                    address: hxuiLiteTokenAddress,
                  },
                };
              } else return prev;
            });
          }
        }
      });

      const freeMintTrackerAddress = await getFreeMintTrackerAddress({
        owner: selectedWalletAddress,
      });

      const freeMintTrackerNotifications = await client.rpcSubscriptions
        .accountNotifications(freeMintTrackerAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: abortController2.signal });

      run(async () => {
        for await (const accountInfo of freeMintTrackerNotifications) {
          if (accountInfo.value.owner == HXUI_PROGRAM_ADDRESS) {
            const encodedBase64Data = accountInfo.value.data[0];
            const encodedDataBytes =
              getBase64Encoder().encode(encodedBase64Data);
            const decodedData =
              getFreeMintTrackerCodec().decode(encodedDataBytes);
            const maybeFreeMintTrackerAccount: MaybeAccount<
              FreeMintTracker,
              string
            > = {
              exists: true,
              address: freeMintTrackerAddress,
              programAddress: HXUI_PROGRAM_ADDRESS,
              ...accountInfo.value,
              data: decodedData,
            };
            setFreeMintTracker((prev) => {
              if (!prev.isLoading) {
                return { ...prev, maybeFreeMintTrackerAccount };
              } else return prev;
            });
          } else {
            setFreeMintTracker((prev) => {
              if (!prev.isLoading) {
                return {
                  ...prev,
                  maybeFreeMintTrackerAccount: {
                    exists: false,
                    address: freeMintTrackerAddress,
                  },
                };
              } else return prev;
            });
          }
        }
      });
    });
    return () => {
      setFreeMintTracker({ isLoading: true });
      abortController.abort();
    };
  }, [selectedWalletAddress, client.rpc, client.rpcSubscriptions]);

  return (
    <HxuiLiteToken.Provider value={freeMintTracker}>
      {children}
    </HxuiLiteToken.Provider>
  );
}

export function useHxuiLiteTokenContext() {
  const ctx = useContext(HxuiLiteToken);
  if (ctx === null)
    throw new Error("must be used within the hxui lite provider");
  return ctx;
}
