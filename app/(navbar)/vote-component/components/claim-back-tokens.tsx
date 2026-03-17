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
  Candidate,
  CandidateStatus,
  fetchMaybeVoteReceipt,
  getClaimTokensInstructionAsync,
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
import { ChevronDownIcon, InfoIcon, RefreshCcwIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getVoteReceiptAddress } from "@/clients/pdas";
import { Spinner } from "@/components/ui/spinner";
import { getUnixTimestamp, useTimeContext } from "../providers/time";

type Receipt =
  | { isLoading: true }
  | { isLoading: false; maybeVoteReceipt: MaybeAccount<VoteReceipt, string> };
export function ClaimBackTokens({ candidate }: { candidate: Candidate }) {
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
  }, [selectedWallet?.address]);

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
      candidate.candidateStatus === CandidateStatus.Active ||
      candidate.candidateStatus === CandidateStatus.Winner
    ) {
      return console.error(
        "The candidate is not withdrawn or winner with claimback offer."
      );
    }

    if (candidate.claimWindow === BigInt(0)) {
      return console.error(
        "Withdraw window is not opened for the candidate. wait until the admin opens the withdraw window."
      );
    }

    if (candidate.claimWindow <= getUnixTimestamp()) {
      return console.error(
        "Withdraw window is not closed for the candidate and can no longer be claimed."
      );
    }
    const selectedWalletAddress = address(selectedWallet.address);
    const selectedWalletSigner = createNoopSigner(selectedWalletAddress);

    const claimBackTokensIx = await getClaimTokensInstructionAsync({
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

    try {
      const { signature } = await signAndSendTransaction({
        transaction: compiledAndEncodedTx,
        wallet: selectedWallet,
        options: { commitment: "confirmed" },
      });

      console.log(getBase58Decoder().decode(signature));
    } catch (err) {
      console.log(err);
    }
  }

  const disabled =
    !selectedWallet ||
    candidate.candidateStatus == CandidateStatus.Active ||
    candidate.candidateStatus == CandidateStatus.Winner ||
    voteReceipt.isLoading ||
    !voteReceipt.maybeVoteReceipt.exists ||
    candidate.claimWindow == BigInt(0) ||
    candidate.claimWindow <= timeNow;
  return (
    <HxuiButtonGroup>
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <span>
            <HxuiButton onClick={claimBackTokens} disabled={disabled}>
              Claim back tokens
              {voteReceipt.isLoading && <Spinner className="size-4" />}
            </HxuiButton>
          </span>
        </TooltipTrigger>
        {run(() => {
          if (!selectedWallet) {
            return (
              <TooltipContent>Please connect to a solana wallet</TooltipContent>
            );
          }

          if (candidate.candidateStatus == CandidateStatus.Winner) {
            return (
              <TooltipContent>
                Tokens spent cannot be claimed back for this candidate.
              </TooltipContent>
            );
          }

          if (voteReceipt.isLoading) {
            return null;
          }

          if (voteReceipt.maybeVoteReceipt.exists) {
            // the control will reacch here if the claimback offer is availed for this candidate.
            if (
              candidate.claimWindow == BigInt(0) ||
              candidate.candidateStatus == CandidateStatus.Active
            ) {
              const tokens = voteReceipt.maybeVoteReceipt.data.tokens;
              return (
                <TooltipContent>
                  Wait until the admin opens the claim back window upon winner
                  or withdrawal to claim {tokens / BigInt(2)} tokens (50%) or{" "}
                  {tokens} (100%) respectively.
                </TooltipContent>
              );
            }

            if (candidate.claimWindow <= timeNow) {
              return (
                <TooltipContent>
                  The Claim back window is closed.
                </TooltipContent>
              );
            }
          }

          if (!voteReceipt.maybeVoteReceipt.exists) {
            return (
              <TooltipContent>
                No tokens to claim back for this candidate.
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
        <TooltipContent>
          50% or 100% of the tokens can be claimed back if winner or withdrawn
          respectively during withdraw window.
        </TooltipContent>
      </Tooltip>
    </HxuiButtonGroup>
  );
}
