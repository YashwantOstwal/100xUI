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
import { MotionLinkUnderline } from "@/registry/100xui/blocks/motion-link/components/motion-link";
import { FileIcon } from "lucide-react";
// import { UpdateConfig } from "./components/update-config";

function Page() {
  const { isAdminView } = useIsAdminView();

  return (
    <HxuiTokenProvider>
      <CanDrawWinnerProvider>
        <CandidatesProvider>
          <div className="relative min-h-screen">
            <VoteComponentHero />
            {isAdminView && <AdminActions />}
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

function AdminActions() {
  return (
    <CodeCard className="bg-secondary mb-2 flex w-full items-center justify-between rounded-full pl-3">
      <h2 className="ml-2.5 text-base">Admin actions:</h2>
      <div className="flex items-center gap-2">
        <SetDropTime></SetDropTime>
        <CreateCandidate></CreateCandidate>
        <WithdrawVaultFunds></WithdrawVaultFunds>
        {/* <UpdateConfig /> */}
      </div>
    </CodeCard>
  );
}
function VoteComponentHero() {
  return (
    <div>
      <a
        href="https://github.com/YashwantOstwal/hxui_program/"
        className="text-destructive flex w-fit items-center gap-1 font-mono text-sm leading-5 font-medium tracking-normal hover:underline"
      >
        Implements HxUI Protocol <FileIcon className="size-4" />
      </a>
      <h1 className="mt-4 text-[clamp(0px,_8vw,_40px)] leading-none font-semibold tracking-tight text-pretty">
        Premium components,
        <br />
        prioritized by you.
      </h1>
      <div className="text-muted-foreground my-5 max-w-[550px] leading-snug text-pretty sm:text-base">
        Choose what ships next on{" "}
        <MotionLinkUnderline href="/" className="text-foreground font-medium">
          100xui.com
        </MotionLinkUnderline>
        . Buy HxUI tokens or earn HxUI Lite tokens straight from your CLI, vote
        for your favorite candidates, and fund the exact UIs your project needs.
      </div>
      {/* <div className="mt-3 flex gap-2 font-mono">
        <span className="text-sm leading-5 font-medium tracking-normal">
          README.md
        </span>
        <span className="text-sm leading-5 font-medium tracking-normal">
          source
        </span>
      </div> */}
    </div>
  );
}

export default Page;
