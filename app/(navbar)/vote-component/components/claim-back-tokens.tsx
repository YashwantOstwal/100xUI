"use client";
import { useSolanaClient } from "@/providers/solana-client";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import {
  address,
  appendTransactionMessageInstruction,
  compileTransaction,
  createNoopSigner,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  getBase58Decoder,
  MaybeAccount,
  getBase64Encoder,
} from "@solana/kit";

import {
  HxuiCandidate,
  CandidateStatus,
  fetchMaybeVoteReceipt,
  getClaimBackTokensInstructionAsync,
  getVoteReceiptCodec,
  HXUI_PROGRAM_ADDRESS,
  VoteReceipt,
} from "@/clients/generated/hxui";

import {
  HxuiButton,
  HxuiButtonGroup,
} from "@/components/www/file-explorer/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { run } from "@/utils";
import { InfoIcon, RefreshCcwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getVoteReceiptAddress } from "@/clients/pdas";
import { Spinner } from "@/components/ui/spinner";
import { getUnixTimestamp, useTimeContext } from "../providers/time";
import {
  SolanaExplorerWithArrow,
  SolanaExplorerFull,
} from "@/icons/solana-explorer.icon";
import { toast } from "sonner";

type Receipt =
  | { isLoading: true }
  | { isLoading: false; maybeVoteReceipt: MaybeAccount<VoteReceipt, string> };
export function ClaimBackTokens({ candidate }: { candidate: HxuiCandidate }) {
  const client = useSolanaClient();
  const { selectedWallet, signAndSendTransaction } = usePrivyAsSolanaWallet();
  const { timeNow, reload } = useTimeContext();
  const [voteReceipt, setVoteReceipt] = useState<Receipt>({
    isLoading: true,
  });

  useEffect(() => {
    if (!selectedWallet) return;
    const selectedWalletAddress = address(selectedWallet.address);
    run(async () => {
      const receiptAddress = await getVoteReceiptAddress({
        candidateName: candidate.name,
        owner: selectedWalletAddress,
      });
      const maybeVoteReceipt = await fetchMaybeVoteReceipt(
        client.rpc,
        receiptAddress
      );
      setVoteReceipt({ isLoading: false, maybeVoteReceipt });
    });

    const abortController = new AbortController();
    run(async () => {
      const receiptAddress = await getVoteReceiptAddress({
        candidateName: candidate.name,
        owner: selectedWalletAddress,
      });

      const voteReceiptAccountInfos = await client.rpcSubscriptions
        .accountNotifications(receiptAddress, {
          commitment: "confirmed",
          encoding: "base64",
        })
        .subscribe({ abortSignal: abortController.signal });
      run(async () => {
        for await (const accountInfo of voteReceiptAccountInfos) {
          if (accountInfo.value.owner === HXUI_PROGRAM_ADDRESS) {
            const base64Data = accountInfo.value.data[0];
            const dataBytes = getBase64Encoder().encode(base64Data);
            const decodedData = getVoteReceiptCodec().decode(dataBytes);

            const maybeVoteReceipt: MaybeAccount<VoteReceipt, string> = {
              exists: true,
              address: receiptAddress,
              ...accountInfo.value,
              data: decodedData,
              programAddress: accountInfo.value.owner,
            };
            setVoteReceipt({ isLoading: false, maybeVoteReceipt });
          } else {
            setVoteReceipt({
              isLoading: false,
              maybeVoteReceipt: { exists: false, address: receiptAddress },
            });
          }
        }
      });
    });
    return () => {
      setVoteReceipt({ isLoading: true });
      abortController.abort();
    };
  }, [
    selectedWallet?.address,
    candidate.name,
    client.rpc,
    client.rpcSubscriptions,
    selectedWallet,
  ]);

  async function claimBackTokens() {
    if (!selectedWallet)
      return console.error(
        "wallet not connected. please connect with your admin wallet to create a candidate"
      );

    if (voteReceipt.isLoading) {
      return console.error("User accounts are loading.");
    }

    if (!voteReceipt.maybeVoteReceipt.exists) {
      return console.error("No tokens to claimback.");
    }

    if (
      candidate.status === CandidateStatus.Active ||
      candidate.status === CandidateStatus.Winner
    ) {
      return console.error(
        "The candidate is not withdrawn or winner with claimback offer."
      );
    }

    if (candidate.claimDeadline === BigInt(0)) {
      return console.error(
        "Withdraw window is not opened for the candidate. wait until the admin opens the withdraw window."
      );
    }

    if (candidate.claimDeadline < getUnixTimestamp()) {
      return console.error(
        "Withdraw window is opened and subsequently closed for the candidate and can no longer be claimed."
      );
    }
    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const claimBackTokensIx = await getClaimBackTokensInstructionAsync({
      owner: selectedWalletSigner,
      name: candidate.name,
    });

    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash()
      .send();
    const txMessage = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(selectedWalletSigner, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
      (tx) => appendTransactionMessageInstruction(claimBackTokensIx, tx)
    );

    const compiledAndEncodedTx = pipe(
      compileTransaction(txMessage),
      (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
    );

    toast.promise(
      signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      }),
      {
        loading: "Pending...",
        success: ({ signature }) => {
          return (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className=""
              href={`https://explorer.solana.com/tx/${getBase58Decoder().decode(signature)}?cluster=devnet`}
            >
              <div className="flex items-center gap-1 text-nowrap">
                Transaction confirmed. View on
                <SolanaExplorerFull className="w-30" />
              </div>
            </a>
          );
        },
        error: (err) => {
          console.error(err);
          if (err?.message?.includes("rejected"))
            return "Transaction rejected.";
          return "Transaction failed to execute. Check the logs.";
        },
      }
    );
  }

  const disabled =
    !selectedWallet ||
    candidate.status == CandidateStatus.Active ||
    candidate.status == CandidateStatus.Winner ||
    voteReceipt.isLoading ||
    !voteReceipt.maybeVoteReceipt.exists ||
    candidate.claimDeadline == BigInt(0) ||
    candidate.claimDeadline < timeNow;

  return (
    <HxuiButtonGroup>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton onClick={claimBackTokens} disabled={disabled}>
              Claim back tokens&nbsp;
              {run(() => {
                if (selectedWallet && voteReceipt.isLoading) {
                  return <Spinner className="size-4" />;
                }
                return null;
              })}
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (!selectedWallet) {
            return (
              <TooltipContent className="max-w-80">
                Please connect to a Solana wallet.
              </TooltipContent>
            );
          }

          if (candidate.status == CandidateStatus.Winner) {
            return (
              <TooltipContent className="max-w-80">
                Spent HxUI tokens cannot be reclaimed for this candidate.
              </TooltipContent>
            );
          }

          if (voteReceipt.isLoading) {
            return null;
          }

          if (voteReceipt.maybeVoteReceipt.exists) {
            const tokens = voteReceipt.maybeVoteReceipt.data.tokens;

            if (candidate.status == CandidateStatus.Active) {
              if (candidate.claimBackOffer) {
                return (
                  <TooltipContent className="max-w-80">
                    You are eligible to reclaim {tokens / BigInt(2)} HxUI tokens
                    (50%) if this candidate wins, or {tokens} HxUI tokens (100%)
                    if it is withdrawn during claim-back window opened by the
                    admin.
                  </TooltipContent>
                );
              } else {
                // The control will reach here if the claim-back offer is not nabled for an active candidate

                return (
                  <TooltipContent className="max-w-80">
                    Spent HxUI tokens cannot be reclaimed unless this candidate
                    is withdrawn by the admin, or a 50% claim-back offer is
                    later enabled.
                  </TooltipContent>
                );
              }
            }

            // The control reaches here if and only if the candidate has status of winner with claim-back offer or withdrawn.
            if (candidate.claimDeadline == BigInt(0)) {
              return (
                <TooltipContent className="max-w-80">
                  Please wait for the admin to open the claim-back window to
                  reclaim{" "}
                  {candidate.status == CandidateStatus.Withdrawn
                    ? tokens
                    : tokens / BigInt(2)}{" "}
                  HxUI tokens.
                </TooltipContent>
              );
            }

            if (candidate.claimDeadline < timeNow) {
              return (
                <TooltipContent className="max-w-80">
                  The claim-back window has subsequently closed. HxUI tokens can
                  no longer be reclaimed.
                </TooltipContent>
              );
            }
          }

          if (!voteReceipt.maybeVoteReceipt.exists) {
            if (
              candidate.claimDeadline !== BigInt(0) &&
              candidate.claimDeadline < timeNow
            ) {
              return (
                <TooltipContent className="max-w-80">
                  No vote receipt exists. Either you did not spend paid HxUI
                  tokens, or your receipt was cleared by the admin after the
                  claim-back window subsequently closed.
                </TooltipContent>
              );
            }
            return (
              <TooltipContent className="max-w-80">
                No vote receipt exists. You have not spent paid HxUI tokens on
                this candidate, and HxUI Lite tokens are non-refundable.
              </TooltipContent>
            );
          }
        })}
      </Tooltip>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton
              disabled={
                voteReceipt.isLoading || !voteReceipt.maybeVoteReceipt.exists
              }
            >
              <a
                target="_blank"
                {...(!voteReceipt.isLoading &&
                  voteReceipt.maybeVoteReceipt.exists && {
                    href: `https://explorer.solana.com/address/${voteReceipt.maybeVoteReceipt.address}/anchor-account?cluster=devnet`,
                  })}
              >
                <SolanaExplorerWithArrow />
              </a>
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (voteReceipt.isLoading) {
            return null;
          }
          if (!voteReceipt.maybeVoteReceipt.exists) {
            return (
              <TooltipContent className="max-w-80">
                No vote receipt exists. Either you did not spend paid HxUI
                tokens, or your receipt was cleared by the admin after the
                claim-back window subsequently closed.
              </TooltipContent>
            );
          }
        })}
      </Tooltip>

      <HxuiButton onClick={reload}>
        <RefreshCcwIcon />
      </HxuiButton>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <HxuiButton>
            <InfoIcon />
          </HxuiButton>
        </TooltipTrigger>
        <TooltipContent className="max-w-80">
          Reclaim 50% (if winner with claim-back offer) or 100% (if withdrawn)
          of your paid HxUI tokens during the claim-back window.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
