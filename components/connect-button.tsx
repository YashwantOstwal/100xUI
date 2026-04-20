"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { truncateAddress } from "@/utils";

import { ChevronDownIcon, Trash2Icon, WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import { cn } from "@/lib/utils";
import Image from "next/image";
export function ConnectButton() {
  const {
    wallets,
    selectedWallet,
    connectWallet,
    disconnectWallet,
    selectNewWallet,
  } = usePrivyAsSolanaWallet();
  return (
    <div className="w-17 shrink-0 lg:w-42">
      {!selectedWallet ? (
        <Button
          className="w-full"
          onClick={() =>
            connectWallet({
              description: "Connect to external wallets with privy.",
            })
          }
        >
          <span className="max-lg:hidden">Connect to wallet</span>
          <WalletIcon className="lg:hidden" />
        </Button>
      ) : (
        <DropdownMenu className="w-full">
          <DropdownMenuTrigger asChild>
            <Button className="text-sm">
              <Image
                width={20}
                height={20}
                src={selectedWallet.standardWallet.icon}
                alt={selectedWallet + "icon"}
                className="size-5"
              />
              <div className="hidden font-mono font-medium lg:block">
                {truncateAddress(selectedWallet.address)}
              </div>
              <ChevronDownIcon className="size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="relative z-100">
            <DropdownMenuGroup>
              {wallets.map((wallet) => (
                <DropdownMenuItem
                  key={wallet.address}
                  className={cn(
                    "mb-1 items-center justify-between font-mono text-sm",
                    wallet.standardWallet.name ==
                      selectedWallet.standardWallet.name && "bg-accent"
                  )}
                  onClick={() => selectNewWallet(wallet)}
                >
                  {truncateAddress(wallet.address)}
                  <Button
                    size="icon-sm"
                    className="bg-destructive/10 hover:bg-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      disconnectWallet(wallet);
                    }}
                  >
                    <Trash2Icon className="stroke-destructive size-4" />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  connectWallet({
                    description: "Using privy as wallet adapter",
                  })
                }
              >
                Connect to new wallet
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {/* <Button
            aria-hidden
            disabled
            className="invisible col-start-1 row-start-1"
          >
            Connect to wallet
          </Button>
          <Button
            aria-hidden
            disabled
            className="invisible col-start-1 row-start-1 flex items-center gap-2 text-sm"
          >
            <div className="size-5 shrink-0" />
            <div className="font-mono font-medium">XXXX...XXXX</div>
            <ChevronDownIcon className="size-4 shrink-0" />
          </Button> */}
    </div>
  );
}

export default ConnectButton;
