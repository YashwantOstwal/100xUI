"use client";

import { TOKEN_2022_PROGRAM_ADDRESS } from "@/clients/constants";
import { getHxuiTokenAddress } from "@/clients/pdas";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import { useSolanaClient } from "@/providers/solana-client";
import { run } from "@/utils";
import { fetchMaybeToken, Token, getTokenCodec } from "@solana-program/token";
import { address, MaybeAccount, getBase64Encoder } from "@solana/kit";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type HxuiTokenContext =
  | { isLoading: true }
  | {
      isLoading: false;
      maybeHxuiTokenAccount: MaybeAccount<Token, string>;
    };
const HxuiTokenContext = createContext<HxuiTokenContext | null>(null);
export function HxuiTokenProvider({ children }: { children: ReactNode }) {
  const client = useSolanaClient();
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const [hxuiToken, setHxuiToken] = useState<HxuiTokenContext>({
    isLoading: true,
  });
  const selectedWalletAddress = selectedWallet
    ? address(selectedWallet.address)
    : selectedWallet;
  useEffect(() => {
    if (!selectedWalletAddress) return;

    run(async () => {
      const hxuiTokenAddress = await getHxuiTokenAddress({
        owner: selectedWalletAddress,
      });
      const maybeHxuiTokenAccount = await fetchMaybeToken(
        client.rpc,
        hxuiTokenAddress
      );

      setHxuiToken({
        isLoading: false,
        maybeHxuiTokenAccount,
      });
    });

    const abortController = new AbortController();

    run(async () => {
      const hxuiTokenAddress = await getHxuiTokenAddress({
        owner: selectedWalletAddress,
      });

      const hxuiTokenNotifications = await client.rpcSubscriptions
        .accountNotifications(hxuiTokenAddress, {
          encoding: "base64",
          commitment: "confirmed",
        })
        .subscribe({ abortSignal: abortController.signal });

      run(async () => {
        for await (const accountInfo of hxuiTokenNotifications) {
          if (accountInfo.value.owner == TOKEN_2022_PROGRAM_ADDRESS) {
            const encodedBase64Data = accountInfo.value.data[0];
            const dataBytes = getTokenCodec().decode(
              getBase64Encoder().encode(encodedBase64Data)
            );

            const maybeHxuiTokenAccount: MaybeAccount<Token, string> = {
              exists: true,
              address: hxuiTokenAddress,
              ...accountInfo.value,
              data: dataBytes,
              programAddress: accountInfo.value.owner,
            };

            setHxuiToken({ maybeHxuiTokenAccount, isLoading: false });
          } else {
            setHxuiToken({
              isLoading: false,
              maybeHxuiTokenAccount: {
                exists: false,
                address: hxuiTokenAddress,
              },
            });
          }
        }
      });
    });
    return () => {
      setHxuiToken({ isLoading: true });
      abortController.abort();
    };
  }, [client.rpc, client.rpcSubscriptions, selectedWalletAddress]);

  return (
    <HxuiTokenContext.Provider value={hxuiToken}>
      {children}
    </HxuiTokenContext.Provider>
  );
}

export function useHxuiTokenContext() {
  const ctx = useContext(HxuiTokenContext);
  if (ctx == null)
    throw new Error("must be used within its hxui token provider");
  return ctx;
}
