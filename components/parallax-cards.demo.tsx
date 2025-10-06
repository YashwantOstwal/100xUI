import { PlusIcon } from "lucide-react";

import { ParallaxCards } from "@/components/parallax-cards";

export function ParallaxCardsDemo() {
  return (
    <ParallaxCards maxStackedCards={3} top="54px">
      <PlaceholderCard index={0} />
      <PlaceholderCard index={1} />
      <PlaceholderCard index={2} />
      <PlaceholderCard index={3} />
      <PlaceholderCard index={4} />
    </ParallaxCards>
  );
}

function PlaceholderCard({ index }: { index: number }) {
  function Message({ children }: { children: string }) {
    return (
      <span className="absolute top-0.75 left-0.75 text-[9px] leading-none sm:text-xs">
        {children}
      </span>
    );
  }

  return (
    <div
      className="h-125 p-7 opacity-85 sm:p-10"
      style={{ backgroundColor: `var(--chart-${index + 1})` }}
    >
      <div className="border-foreground relative size-full border border-dashed p-4 sm:p-5">
        <Message>Parallax Cards</Message>

        <div className="size-full p-3.5 sm:p-5">
          <div className="border-foreground relative z-20 size-full border p-4 sm:px-6 sm:py-5">
            <Message>{`Card #${index + 1}`}</Message>

            <div className="border-foreground relative grid size-full place-items-center overflow-hidden border border-dashed">
              <PlusIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
