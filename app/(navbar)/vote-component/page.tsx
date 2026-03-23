"use client";

import { HxuiTokenProvider } from "./providers/hxui-token";
import { SetDropTime } from "./components/set-drop-time";
import { BuyTokens } from "./components/buy-tokens";
import { CandidateGroup } from "./components/candidate-group";
import { CreateCandidate } from "./components/create-candidate";
import { WithdrawVaultFunds } from "./components/withdraw-vault-funds";
import { CodeCard } from "@/components/www/code-card";
import { CandidatesProvider } from "./providers/candidates";
import { useIsAdminView } from "@/providers/is-admin-view";
import { MintFreeTokens } from "./components/mint-free-tokens";
import { DrawWinner } from "./components/draw-winner";
import { GetAdminAccess } from "./components/get-admin-access";
import { CanDrawWinnerProvider } from "./providers/can-draw-winner";
function Page() {
  const { isAdminView } = useIsAdminView();

  return (
    <HxuiTokenProvider>
      <CanDrawWinnerProvider>
        <CandidatesProvider>
          <div className="relative min-h-screen">
            {isAdminView && (
              <CodeCard className="bg-secondary mb-2 flex w-full items-center justify-between rounded-full pl-3">
                <h2 className="ml-2.5 text-base">Admin actions:</h2>
                <div className="flex items-center gap-2">
                  <SetDropTime></SetDropTime>
                  <CreateCandidate></CreateCandidate>
                  <WithdrawVaultFunds></WithdrawVaultFunds>
                </div>
              </CodeCard>
            )}
            <DrawWinner />

            <div className="sticky top-13 z-20 mb-4 flex items-center justify-end gap-1">
              <GetAdminAccess />
              <div className="flex items-center">
                <BuyTokens />
                <MintFreeTokens />
              </div>
            </div>
            <CandidateGroup />
          </div>
        </CandidatesProvider>
      </CanDrawWinnerProvider>
    </HxuiTokenProvider>
  );
}

export default Page;
