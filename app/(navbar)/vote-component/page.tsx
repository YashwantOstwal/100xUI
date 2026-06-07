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

function Page() {
  const { isAdminView } = useIsAdminView();

  return (
    <HxuiTokenProvider>
      <CanDrawWinnerProvider>
        <CandidatesProvider>
          <div className="relative mx-auto min-h-screen max-w-screen-2xl px-3 pt-16">
            <VoteComponentHero />
            {isAdminView && <AdminActions />}
            <DrawWinner />
            <div className="z-20 mb-4 flex flex-col items-end gap-1 lg:sticky lg:top-14 lg:flex-row lg:items-center">
              <GetAdminAccess />
              <div className="flex flex-col items-end max-lg:sticky sm:flex-row md:items-center">
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
    <CodeCard className="bg-secondary mb-2 flex w-full flex-col items-center justify-between gap-y-3 max-lg:p-2 lg:flex-row lg:rounded-full">
      <h2 className="text-lg lg:ml-3">Admin actions: </h2>
      <div className="flex flex-col flex-wrap items-center justify-center gap-1 md:flex-row md:gap-2">
        <CreateCandidate></CreateCandidate>
        <WithdrawVaultFunds></WithdrawVaultFunds>
        <SetDropTime></SetDropTime>
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
