"use client";

import { Spinner } from "@/components/ui/spinner";
import { useProgramAccounts } from "../providers/program-accounts";
import { run } from "@/utils";
import { unixTimestamp } from "@solana/kit";
import { useTimeContext } from "../providers/time";
import { DrawWinner } from "./draw-winner";
import { CodeCard } from "@/components/www/code-card";

function PollDeadline() {
  const programAccounts = useProgramAccounts();
  const { timeNow } = useTimeContext();
  return (
    <div className="flex items-center justify-center py-2">
      {run(() => {
        if (programAccounts.isLoading) {
          return <Spinner />;
        }

        if (programAccounts.hxuiPoll.data.currentPollWinnerDrawn) {
          return (
            <CodeCard className="bg-secondary mb-4 flex w-full items-center justify-between p-3">
              <h2 className="ml-2.5 text-base">
                Winner for the current poll have already been drawn.
              </h2>
              <DrawWinner />
            </CodeCard>
          );
        }
        if (timeNow <= programAccounts.hxuiPoll.data.currentPollDeadline) {
          const seconds = Number(
            programAccounts.hxuiPoll.data.currentPollDeadline
          ); // Example timestamp
          const date = new Date(seconds * 1000);
          return (
            <CodeCard className="bg-secondary mb-4 flex w-full items-center justify-between p-3">
              <h2 className="ml-2.5 text-base">
                Winner can be drawn after{" "}
                <span className="text-muted-foreground">{date.toString()}</span>
                .
              </h2>
              <DrawWinner />
            </CodeCard>
          );
        } else {
          return (
            <CodeCard className="bg-secondary mb-4 flex w-full items-center justify-between p-3">
              <h2 className="ml-2.5 text-base">Draw winner now {"->"} </h2>
              <DrawWinner />
            </CodeCard>
          );
        }
      })}
    </div>
  );
}

export { PollDeadline };
