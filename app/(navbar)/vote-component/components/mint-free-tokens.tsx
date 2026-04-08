"use client";

import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  RegisterButton,
  CreateHxuiTokenAccountButton,
  UnregisterButton,
  CancelUnregisterButton,
  ClaimBackDepositButton,
  UnregisterAndClaimbackDepositButton,
} from "./register-for-free-tokens";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "../../../../components/ui/checkbox";
import { cn } from "@/lib/utils";
import { InfoIcon, PlusCircleIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { run } from "@/utils";
import { useHxuiLiteTokenContext } from "../providers/hxui-lite-token";
export function MintFreeTokens() {
  const { selectedWallet } = usePrivyAsSolanaWallet();
  const hxuiLiteToken = useHxuiLiteTokenContext();

  const disabled = !selectedWallet || hxuiLiteToken.isLoading;

  const freeMintTrackerExists =
    !hxuiLiteToken.isLoading &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.exists;
  const tokenAccountExists =
    !hxuiLiteToken.isLoading && hxuiLiteToken.maybeHxuiLiteTokenAccount.exists;
  const unregistered =
    !hxuiLiteToken.isLoading &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.exists &&
    hxuiLiteToken.maybeFreeMintTrackerAccount.data.unregistered;

  return (
    <Popover>
      <HxuiButtonGroup className="">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PopoverTrigger asChild disabled={disabled}>
                <HxuiButton className="">
                  {run(() => {
                    if (selectedWallet) {
                      if (hxuiLiteToken.isLoading) {
                        return <Spinner className="size-4" />;
                      }
                      if (hxuiLiteToken.maybeHxuiLiteTokenAccount.exists) {
                        return hxuiLiteToken.maybeHxuiLiteTokenAccount.data
                          .amount;
                      }
                    }

                    return 0;
                  })}
                  &nbsp;HxUI Lite tokens
                  <PlusCircleIcon className="fill-primary stroke-secondary size-5.5 rounded-full"></PlusCircleIcon>
                </HxuiButton>
              </PopoverTrigger>
            </span>
          </TooltipTrigger>
          {run(() => {
            if (!selectedWallet) {
              return (
                <TooltipContent>
                  Please connect to a Solana wallet
                </TooltipContent>
              );
            }
            return null;
          })}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <HxuiButton>
              <InfoIcon />
            </HxuiButton>
          </TooltipTrigger>
          <TooltipContent className="max-w-100">
            HxUI Lite tokens are earned for free by adding 100xUI components to
            your project via the shadcn CLI to vote on active candidate
            components.
          </TooltipContent>
        </Tooltip>
      </HxuiButtonGroup>
      {selectedWallet && !hxuiLiteToken.isLoading && (
        <PopoverContent className="w-80 space-y-3">
          {run(() => {
            if (!freeMintTrackerExists) {
              return (
                <>
                  <PopoverDescription className="text-sm">
                    Complete registration to start minting free HxUI Lite tokens
                    by adding 100xUI components to your project via the shadcn
                    CLI.
                  </PopoverDescription>
                  <Field>
                    <Field
                      orientation="horizontal"
                      // data-disabled
                    >
                      <Checkbox
                        id="registration-account"
                        name="registration-account"
                        checked={!freeMintTrackerExists}
                      />
                      <FieldLabel htmlFor="registration-account ">
                        Registration deposit of 0.00101616 SOL (redeemable)
                      </FieldLabel>
                    </Field>
                    <Field
                      orientation="horizontal"
                      // data-disabled
                    >
                      <Checkbox
                        id="hxui-lite-token-account"
                        name="hxui-lite-token-account"
                        disabled={tokenAccountExists}
                        checked={!tokenAccountExists}
                      />
                      <FieldLabel
                        htmlFor="hxui-lite-token-account"
                        className={cn(
                          "whitespace-nowrap",
                          tokenAccountExists && "line-through"
                        )}
                      >
                        Create HxUI Lite token account
                      </FieldLabel>
                    </Field>
                    <Field>
                      <RegisterButton />
                    </Field>
                  </Field>
                </>
              );
            }
            // control reaches here when registration account exists.
            else if (unregistered) {
              return (
                <div className="space-y-3">
                  <CancelUnregisterButton />
                  <ClaimBackDepositButton />
                </div>
              );
            } else {
              return (
                <>
                  <PopoverDescription className="text-sm">
                    Add 100xUI components using shadcn CLI to earn HxUI Lite
                    tokens.
                  </PopoverDescription>
                  {!tokenAccountExists && <CreateHxuiTokenAccountButton />}
                  <UnregisterButton />
                  <UnregisterAndClaimbackDepositButton />
                </>
              );
            }
          })}
        </PopoverContent>
      )}
    </Popover>
  );
}
