import { XIcon } from "@/icons/x.icon";
import React from "react";

export function ViewX() {
  return (
    <div className="bg-background/75 border-border/50 shrink-0 rounded-full border p-0.5 backdrop-blur-[2px] lg:pointer-events-auto">
      <a
        className="bg-secondary text-secondary-foreground border-border/50 focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:bg-accent/85 focus-visible:text-accent-foreground/85 hover:bg-accent/85 hover:text-accent-foreground/85 flex size-full items-center justify-center rounded-full border px-2 py-1 font-mono text-sm transition-colors duration-150 ease-out focus-visible:ring focus-visible:ring-offset-2 focus-visible:!outline-0 focus-visible:brightness-[97%] dark:hover:brightness-90 dark:focus-visible:brightness-90 [&>svg]:stroke-[2]"
        href="https://x.com/Yashwant_Ostwal"
      >
        <XIcon className="size-3" />
      </a>
    </div>
  );
}
