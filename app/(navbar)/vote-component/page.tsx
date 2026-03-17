"use client";
import { usePrivyAsSolanaWallet } from "@/providers/privy-as-solana-wallet";
import { HxuiTokenProvider } from "./providers/hxui-token";
import { VoteCandidate } from "./components/vote-candidate";
import { HxuiLiteTokenProvider } from "./providers/hxui-lite-token";
import { ProgramAccountsProvider } from "./providers/program-accounts";
import { CreatePoll } from "./components/create-poll";
import { ClaimBackTokens } from "./components/claim-back-tokens";
import { BuyTokens } from "./components/buy-tokens";
import { CandidateGroup } from "./components/candidate-group";
import { OpenWithdrawWindowForCandidate } from "./components/open-withdraw-window-for-candidate";
import { AvailClaimBackOfferToggle } from "./components/avail-claim-back-offer-toggle";
import { WithdrawCandidate } from "./components/withdraw-candidate";
import { DrawWinner } from "./components/draw-winner";
import { CreateCandidate } from "./components/create-candidate";
import { WithdrawSolFromVault } from "./components/withdraw-sol-from-vault";
import { CodeCard } from "@/components/www/code-card";
import { CandidatesProvider } from "./providers/candidates";
import { useIsAdminView } from "@/providers/is-admin-view";
import { RegisterToMintFreeTokens } from "./components/register-for-free-tokens";
import { MintFreeTokens } from "./components/mint-free-tokens";
import { PollDeadline } from "./components/poll-deadline";
import { GetAdminAccess } from "./components/get-admin-access";
function Page() {
  const { isAdminView } = useIsAdminView();
  // const client = useSolanaClient();
  // async function setup() {
  //   if (selectedWallet == null) return;
  //   const adminAddress = address(selectedWallet.address);
  //   const adminSigner = createNoopSigner(adminAddress);
  //   const initialiseDuiIx = await getInitialiseDappInstructionAsync({
  //     admin: adminSigner,
  //     liteAuthority: adminAddress,
  //     tokensPerVote: 2,
  //     pricePerToken: lamports(BigInt(1000000)),
  //   });

  //   const createGenesisPollIx = await getCreatePollInstructionAsync({
  //     admin: adminSigner,
  //     pollDeadline: BigInt(1772648224),
  //   });

  //   const createCandidateIx = await getCreateCandidateInstructionAsync({
  //     admin: adminSigner,
  //     name: "Second candidate",
  //     description: "lorem lorem",
  //     claimableIfWinner: false,
  //   });

  //   const { value: latestBlockhash } = await client.rpc
  //     .getLatestBlockhash()
  //     .send();
  //   const encodedTransactionMessage = pipe(
  //     createTransactionMessage({ version: 0 }),
  //     (tx) => setTransactionMessageFeePayerSigner(adminSigner, tx),
  //     (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  //     (tx) =>
  //       appendTransactionMessageInstructions(
  //         [initialiseDuiIx, createGenesisPollIx, createCandidateIx],
  //         tx
  //       ),
  //     (tx) => compileTransaction(tx),
  //     (tx) => new Uint8Array(getTransactionEncoder().encode(tx))
  //   );

  //   try {
  //     const { signature } = await signAndSendTransaction({
  //       transaction: encodedTransactionMessage,
  //       wallet: selectedWallet,
  //       options: { commitment: "confirmed" },
  //     });
  //     console.log(bs58.encode(signature));
  //   } catch (err) {
  //     console.log(err);
  //   }

  //   // const allProgramAccounts = await client.rpc
  //   //   .getProgramAccounts(HXUI_PROGRAM_ADDRESS, {
  //   //     // encoding: "jsonParsed",
  //   //     commitment: "confirmed",
  //   //     // filters: [
  //   //     //   {
  //   //     //     memcmp: {
  //   //     //       encoding: "base58",
  //   //     //       offset: BigInt(0),
  //   //     //       bytes: bs58.encode(
  //   //     //         CANDIDATE_DISCRIMINATOR
  //   //     //       ) as Base58EncodedBytes,
  //   //     //     },
  //   //     //   },
  //   //     // ],
  //   //   })
  //   //   .send();
  //   // console.log(allProgramAccounts);
  // }

  return (
    <HxuiTokenProvider>
      <CandidatesProvider>
        <div className="min-h-screen">
          {isAdminView && (
            <CodeCard className="bg-secondary mb-4 flex w-full items-center justify-between p-3">
              <h2 className="ml-2.5 text-base">Admin actions:</h2>
              <div className="flex items-center gap-2">
                <CreatePoll></CreatePoll>
                <CreateCandidate></CreateCandidate>
                <WithdrawSolFromVault></WithdrawSolFromVault>
              </div>
            </CodeCard>
          )}
          <PollDeadline></PollDeadline>
          <GetAdminAccess />
          <div className="justifymix-blend-soft-light mt-2 mb-4 flex items-center">
            <BuyTokens />
            <MintFreeTokens />
          </div>

          <CandidateGroup />
          <RegisterToMintFreeTokens />
        </div>
      </CandidatesProvider>
    </HxuiTokenProvider>
  );
}

export default Page;
