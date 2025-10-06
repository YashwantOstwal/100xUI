"use client";

import React from "react";
import {
  useAnimate,
  motion,
  AnimatePresence,
  usePresence,
  useMotionValue,
  type Transition,
  type AnimationPlaybackControlsWithThen,
  type HTMLMotionProps,
} from "motion/react";

import { usePrevious } from "@/hooks/use-previous";
import { useDebouncedState } from "@/hooks/use-debounced-state";

import { cn } from "@/lib/utils";

interface DockItem extends Omit<HTMLMotionProps<"button">, "ref"> {
  icon: React.ReactElement;
  tooltip: string;
}

export interface MotionDockProps extends React.ComponentProps<"div"> {
  dockItems: DockItem[];
  tooltipBorderRadius?: React.CSSProperties["borderRadius"];
}
const TRANSITION: Transition = {
  duration: 0.2,
  ease: [0.76, 0, 0.24, 1], // easeInOutQuart
};
export function MotionDock({
  dockItems,
  className,
  tooltipBorderRadius = "var(--radius-sm)",
  ...rest
}: MotionDockProps) {
  const [activeItem, setActiveItem] = useDebouncedState<number>(-1, 100);
  const dockRef = React.useRef<HTMLDivElement>(null);

  const handleReset = () => setActiveItem(-1);

  return (
    <div className={cn(className, "!relative !w-fit")} {...rest}>
      <div
        ref={dockRef}
        className="bg-background text-foregroud border-border flex gap-0.5 rounded-full border p-1 shadow-sm"
        onMouseLeave={handleReset}
        onBlurCapture={handleReset}
      >
        {dockItems.map(
          ({ icon, tooltip, onMouseEnter, onFocus, className, ...rest }, i) => (
            <motion.button
              key={tooltip}
              aria-label={tooltip}
              onFocus={(e) => {
                setActiveItem(i);
                onFocus?.(e);
              }}
              onMouseEnter={(e) => {
                setActiveItem(i);
                onMouseEnter?.(e);
              }}
              data-dockitem={i}
              className={cn(
                "hover:text-accent-foreground hover:bg-accent focus-visible:text-accent-foreground focus-visible:bg-accent focus-visible:ring-ring focus-visible:ring-offset-background cursor-pointer rounded-full p-1.5 transition-colors duration-150 ease-out focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none",
                className,
              )}
              {...rest}
            >
              {icon}
            </motion.button>
          ),
        )}
      </div>
      <AnimatePresence>
        {activeItem >= 0 && (
          <ToolTipsContainer
            activeItem={activeItem}
            dockRef={dockRef as React.RefObject<HTMLDivElement>}
            tooltips={dockItems.map(({ tooltip }) => tooltip)}
            tooltipBorderRadius={tooltipBorderRadius}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface TooltipsContainerProps {
  dockRef: React.RefObject<HTMLDivElement>;
  activeItem: number;
  tooltips: string[];
  tooltipBorderRadius: React.CSSProperties["borderRadius"];
}
function ToolTipsContainer({
  dockRef,
  activeItem,
  tooltips,
  tooltipBorderRadius,
}: TooltipsContainerProps) {
  const prevMouseIn = usePrevious<number>(activeItem);
  const [isPresent, safeToRemove] = usePresence();
  const [tooltipContainerScope, animate] = useAnimate();
  const x = useMotionValue(0);

  const getTranslateX = React.useCallback(
    (activeItem: number) => {
      const hoverDockItem = dockRef.current.querySelector(
        `[data-dockitem="${activeItem}"]`,
      );
      const { left: hoverDockItemLeft, width: hoverDockItemWidth } =
        hoverDockItem!.getBoundingClientRect();
      const finalPosition = hoverDockItemLeft + hoverDockItemWidth / 2;

      const correspondingTooltip = tooltipContainerScope.current.querySelector(
        `[data-tooltip="${activeItem}"]`,
      );
      const { left: tooltipLeft, width: tooltipWidth } =
        correspondingTooltip!.getBoundingClientRect();
      const currentPosition = tooltipLeft + tooltipWidth / 2;

      const relativeTranslateX = finalPosition - currentPosition;
      const translateX = relativeTranslateX + x.get();
      return translateX;
    },
    [x, dockRef, tooltipContainerScope],
  );

  const getClipPath = React.useCallback(
    (activeItem: number) => {
      let left = 0;
      let right = 0;
      for (let j = 0; j < tooltips.length; j++) {
        const { width } = tooltipContainerScope.current
          .querySelector(`[data-tooltip="${j}"]`)
          .getBoundingClientRect();
        if (j < activeItem) {
          left += width;
        } else if (j > activeItem) {
          right += width;
        }
      }
      const clipPath = `inset(0px ${right}px 0px ${left}px round ${tooltipBorderRadius}`;

      return clipPath;
    },
    [tooltips.length, tooltipContainerScope, tooltipBorderRadius],
  );

  React.useEffect(() => {
    let control: AnimationPlaybackControlsWithThen | undefined = undefined;
    if (isPresent) {
      const keyframes = {
        clipPath: getClipPath(activeItem),
        x: getTranslateX(activeItem),
      };
      if (prevMouseIn === undefined) {
        const enterAnimation = async () => {
          if (typeof control !== "undefined") {
            control.stop();
          }
          await animate(tooltipContainerScope.current, keyframes, {
            duration: 0,
          });
          await animate(
            tooltipContainerScope.current,
            { opacity: 1 },
            TRANSITION,
          );
        };
        enterAnimation();
      } else {
        const intermediateAnimation = () => {
          animate(tooltipContainerScope.current, keyframes, TRANSITION);
        };
        intermediateAnimation();
      }
    } else {
      const exitAnimation = async () => {
        control = await animate(
          tooltipContainerScope.current,
          { opacity: 0 },
          TRANSITION,
        );
        safeToRemove();
      };
      exitAnimation();
    }
  }, [
    animate,
    safeToRemove,
    isPresent,
    prevMouseIn,
    activeItem,
    getClipPath,
    getTranslateX,
    tooltipContainerScope,
  ]);

  return (
    <motion.div
      ref={tooltipContainerScope}
      initial={{
        opacity: 0,
      }}
      style={{
        x,
      }}
      className="bg-primary text-primary-foreground absolute bottom-[calc(100%_+_var(--spacing)_*_1)] flex flex-nowrap py-1 text-xs"
    >
      {tooltips.map((tooltip, i) => (
        <div
          key={tooltip}
          className="px-2 text-nowrap whitespace-nowrap"
          data-tooltip={i}
        >
          {tooltip}
        </div>
      ))}
    </motion.div>
  );
}
