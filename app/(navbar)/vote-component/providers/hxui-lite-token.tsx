"use client";

import {
  fetchMaybeFreeTokenTimestamp,
  FreeTokenTimestamp,
  getFreeTokenTimestampCodec,
  HXUI_PROGRAM_ADDRESS,
} from "@/clients/generated/hxui";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@/clients/constants";
import {
  getHxuiLiteTokenAddress,
  getRegistrationAccountAddress,
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
      maybeRegistrationAccount: MaybeAccount<FreeTokenTimestamp, string>;
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

  const [freeVotingToken, setFreeVotingToken] = useState<HxuiLiteToken>({
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

      const registrationAddress = await getRegistrationAccountAddress({
        owner: selectedWalletAddress,
      });

      const maybeRegistrationAccount = await fetchMaybeFreeTokenTimestamp(
        client.rpc,
        registrationAddress
      );

      setFreeVotingToken({
        isLoading: false,
        maybeRegistrationAccount,
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
          const encodedBase64Data = accountInfo.value.data[0];
          const encodedDataBytes = getBase64Encoder().encode(encodedBase64Data);

          const decodedData = getTokenCodec().decode(encodedDataBytes);
          if (accountInfo.value.owner == TOKEN_2022_PROGRAM_ADDRESS) {
            const maybeHxuiLiteTokenAccount: MaybeAccount<Token, string> = {
              exists: true,
              address: hxuiLiteTokenAddress,
              programAddress: TOKEN_2022_PROGRAM_ADDRESS,
              ...accountInfo.value,
              data: decodedData,
            };

            setFreeVotingToken((prev) => {
              if (!prev.isLoading) {
                return { ...prev, maybeHxuiLiteTokenAccount };
              } else return prev;
            });
          } else {
            setFreeVotingToken((prev) => {
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

      const registrationAddress = await getRegistrationAccountAddress({
        owner: selectedWalletAddress,
      });

      const registrationAccountAccountInfos = await client.rpcSubscriptions
        .accountNotifications(registrationAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: abortController2.signal });

      run(async () => {
        for await (const accountInfo of registrationAccountAccountInfos) {
          const encodedBase64Data = accountInfo.value.data[0];
          const encodedDataBytes = getBase64Encoder().encode(encodedBase64Data);
          const decodedData =
            getFreeTokenTimestampCodec().decode(encodedDataBytes);
          console.log({ accountInfo, decodedData });

          if (accountInfo.value.owner == HXUI_PROGRAM_ADDRESS) {
            const maybeRegistrationAccount: MaybeAccount<
              FreeTokenTimestamp,
              string
            > = {
              exists: true,
              address: registrationAddress,
              programAddress: HXUI_PROGRAM_ADDRESS,
              ...accountInfo.value,
              data: decodedData,
            };
            setFreeVotingToken((prev) => {
              if (!prev.isLoading) {
                return { ...prev, maybeRegistrationAccount };
              } else return prev;
            });
          } else {
            setFreeVotingToken((prev) => {
              if (!prev.isLoading) {
                return {
                  ...prev,
                  maybeRegistrationAccount: {
                    exists: false,
                    address: registrationAddress,
                  },
                };
              } else return prev;
            });
          }
        }
      });
    });
    return () => {
      setFreeVotingToken({ isLoading: true });
      abortController.abort();
    };
  }, [selectedWallet?.address]);

  return (
    <HxuiLiteToken.Provider value={freeVotingToken}>
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
