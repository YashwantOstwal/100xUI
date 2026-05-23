import * as motion from "motion/react-client";
import { SmoothScrollA } from "./smooth-scroll-a";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import { MotionLinkUnderline } from "@/registry/100xui/blocks/motion-link/components/motion-link";

export function Hero() {
  return (
    <div className="flex flex-col items-center pt-16 sm:px-2">
      <div className="text-muted-foreground flex flex-wrap items-center justify-center text-center font-mono leading-5 tracking-normal">
        {"New component every 7 days".split(" ").map((word, i) => (
          <span key={`words[${i}]`}>{word}&nbsp;</span>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [null, 1, 1, 0] }}
          transition={{
            repeatDelay: 1,
            duration: 1,
            times: [0, 0, 1, 1],
            repeat: Infinity,
          }}
          className="bg-muted-foreground/40"
        >
          &nbsp;
        </motion.span>
      </div>
      <h1 className="mt-14 text-center text-[clamp(0px,_9vw,_50px)] leading-none font-semibold tracking-tight text-pretty">
        Reusable motion
        <br />
        components for <i>React</i>
      </h1>
      <p className="text-muted-foreground mt-5 max-w-[550px] text-center text-base leading-snug text-pretty sm:text-lg">
        High-quality motion components, inspired by the best of the web, crafted
        for world-class React UIs.
      </p>
      <div className="mt-8 grid w-fit gap-x-3 gap-y-4 max-sm:grid-rows-[auto_auto] sm:w-full sm:grid-cols-2">
        <div
          className="max-sm:m-auto sm:ml-auto"
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
        >
          <SmoothScrollA
            href="#components"
            className="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground ml-auto px-3.5 text-center text-sm font-medium transition-opacity hover:opacity-90 hover:brightness-[1] focus-visible:opacity-90 focus-visible:brightness-[1] hover:dark:brightness-[1] focus-visible:dark:brightness-[1]"
          >
            Browse Components
          </SmoothScrollA>
        </div>
        {/* <LastlyAdded
          href="/components/notification"
          lastAddedDate={new Date()}
        /> */}
        <MotionLinkUnderline
          href="/vote-component"
          className={cn(
            "group my-auto flex items-center gap-x-2 text-sm transition-opacity"
            // isMounted ? "opacity-100" : "opacity-0"
          )}
        >
          Decide the Next Drop
          <ArrowRightIcon className="size-4 -translate-x-0.5 transition-transform ease-out group-hover:translate-x-0 group-focus-visible:translate-x-0" />
        </MotionLinkUnderline>
      </div>
      <span className="text-muted-foreground mt-5 text-center text-sm">
        Fully compatible with shadcn/ui theming ecosystem.
      </span>
    </div>
  );
}
