"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useConnectWallet } from "@privy-io/react-auth";

import {
  useWallets,
  useSignAndSendTransaction,
  useSignTransaction,
  useSignMessage,
  ConnectedStandardSolanaWallet,
} from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

export function PrivyConfigProvider({
  appId,
  children,
}: {
  appId: string;
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          walletList: [
            "phantom",
            "solflare",
            "backpack",
            "detected_solana_wallets",
            "wallet_connect_qr_solana",
          ],
          walletChainType: "solana-only",
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}

interface PrivyAsSolanaWallet {
  wallets: ReturnType<typeof useWallets>["wallets"];
  ready: ReturnType<typeof useWallets>["ready"];
  connectWallet: ReturnType<typeof useConnectWallet>["connectWallet"];
  signAndSendTransaction: ReturnType<
    typeof useSignAndSendTransaction
  >["signAndSendTransaction"];
  signTransaction: ReturnType<typeof useSignTransaction>["signTransaction"];
  signMessage: ReturnType<typeof useSignMessage>["signMessage"];
  disconnectWallet: (wallet: ConnectedStandardSolanaWallet) => void;
  selectNewWallet: (wallet: ConnectedStandardSolanaWallet) => void;
  selectedWallet: ConnectedStandardSolanaWallet | undefined;
}
const PrivyAsSolanaWalletContext = createContext<PrivyAsSolanaWallet | null>(
  null
);

export function PrivyAsSolanaWalletProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { wallets, ready } = useWallets();
  const { connectWallet } = useConnectWallet();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { signTransaction } = useSignTransaction();
  const { signMessage } = useSignMessage();
  const connectedWalletNamesRef = useRef<string[]>([]);
  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(
    null
  );

  const selectNewWallet = useCallback(
    (wallet: ConnectedStandardSolanaWallet) => {
      setSelectedWalletName(wallet.standardWallet.name);
    },
    []
  );

  const disconnectWallet = (wallet: ConnectedStandardSolanaWallet) => {
    wallet.disconnect();
  };

  const newlySelectedWalletName: string | null = useMemo(() => {
    // when no wallet exist to connect.
    if (wallets.length === 0) {
      const name = null;
      setSelectedWalletName(name);
      connectedWalletNamesRef.current = [];
      return name;
    }

    // when the first wallet is connected
    if (selectedWalletName === null) {
      const name = wallets[0].standardWallet.name;
      setSelectedWalletName(name);
      connectedWalletNamesRef.current = [name];

      return name;
    }

    // if there is no change in the length, it may be triggered due to change in the selectedWalletName. or accounts changes in the wallets in either of cases just return the selectedWalletName.
    if (wallets.length === connectedWalletNamesRef.current.length) {
      return selectedWalletName;
    } else if (wallets.length > connectedWalletNamesRef.current.length) {
      const newlyConnectedWalletName = wallets.find(
        (wallet) =>
          !connectedWalletNamesRef.current.includes(wallet.standardWallet.name)
      )!.standardWallet.name;
      setSelectedWalletName(newlyConnectedWalletName);
      connectedWalletNamesRef.current = [
        ...connectedWalletNamesRef.current,
        newlyConnectedWalletName,
      ];
      return newlyConnectedWalletName;
    } else {
      const disconnectedWalletName = connectedWalletNamesRef.current.find(
        (connectedWalletName) =>
          wallets.findIndex(
            (wallet) => wallet.standardWallet.name === connectedWalletName
          ) === -1
      );

      connectedWalletNamesRef.current = connectedWalletNamesRef.current.filter(
        (prevConnectedWalletName) =>
          prevConnectedWalletName !== disconnectedWalletName
      );

      if (disconnectedWalletName === selectedWalletName) {
        const name = wallets[0].standardWallet.name;
        setSelectedWalletName(name);
        return name;
      }

      return selectedWalletName;
    }
  }, [wallets, selectedWalletName]);
  return (
    <PrivyAsSolanaWalletContext.Provider
      value={{
        wallets,
        selectedWallet: wallets.find(
          (wallet) => wallet.standardWallet.name === newlySelectedWalletName
        ),
        ready,
        connectWallet,
        disconnectWallet,
        selectNewWallet,
        signAndSendTransaction,
        signTransaction,
        signMessage,
      }}
    >
      {children}
    </PrivyAsSolanaWalletContext.Provider>
  );
}
export function usePrivyAsSolanaWallet() {
  const ctx = useContext(PrivyAsSolanaWalletContext);
  if (ctx === null) {
    throw new Error("usePrivyAsSolanaWallet must be used with....");
  }
  return ctx;
}
