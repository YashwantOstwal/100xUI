"use client";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import { PackageManagers, Terminal } from "../terminal";
import { useHxuiLiteTokenContext } from "../../vote-component/providers/hxui-lite-token";

export function MintFreeTokensCLI({
  packageManagerCommands,
}: {
  packageManagerCommands: Record<PackageManagers, string>;
}) {
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const hxuiLiteToken = useHxuiLiteTokenContext();

  const regsitered =
    selectedWallet &&
    !hxuiLiteToken.isLoading &&
    hxuiLiteToken.maybeHxuiLiteTokenAccount.exists &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.exists &&
    !hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered;

  return (
    <Terminal
      mintFreeTokens
      packageManagerCommands={
        regsitered
          ? {
              npm:
                packageManagerCommands["npm"] +
                `?pubkey=${selectedWallet.address}`,
              pnpm:
                packageManagerCommands["pnpm"] +
                `?pubkey=${selectedWallet.address}`,
              bun:
                packageManagerCommands["bun"] +
                `?pubkey=${selectedWallet.address}`,
              yarn:
                packageManagerCommands["yarn"] +
                `?pubkey=${selectedWallet.address}`,
            }
          : packageManagerCommands
      }
    ></Terminal>
  );
}
