"use client";

import React from "react";
import {
  cubicBezier,
  motion,
  MotionConfig,
  type HTMLMotionProps,
} from "motion/react";

import { cn } from "@/lib/utils";
import { useInViewInterval } from "@/hooks/use-in-view-interval";

const CAROUSEL_CARD_POSITIONS = [
  { opacity: 0.5, zIndex: 2, x: "-100%" },
  { opacity: 1, zIndex: 3, x: "0%" },
  { opacity: 0.5, zIndex: 2, x: "100%" },
  { opacity: 0, zIndex: 1, x: "0%" },
];

const TOTAL_CARDS = 4;

export interface SpinningCarouselProps
  extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactElement[];
  readTimeInSec?: number;
  animationDurationInSec?: number;
}

export function SpinningCarousel({
  children,
  readTimeInSec = 4,
  animationDurationInSec = 1,
  className,
  ...rest
}: SpinningCarouselProps) {
  const totalChildren = children.length;

  const [carouselState, setCarouselState] = React.useState<{
    index: number;
    visibleCardIndices: number[];
  }>({
    index: 0,
    visibleCardIndices: Array.from(
      { length: TOTAL_CARDS },
      (_, i) => i % totalChildren,
    ),
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleInterval = React.useCallback(() => {
    setCarouselState(({ index, visibleCardIndices }) => {
      const nextIndex = index + 1;

      const updatedVisibleIndices = visibleCardIndices.map((cardIndex, i) =>
        (i - (nextIndex % TOTAL_CARDS) + TOTAL_CARDS) % TOTAL_CARDS === 2
          ? (index + TOTAL_CARDS - 1) % totalChildren
          : cardIndex,
      );

      return {
        index: nextIndex,
        visibleCardIndices: updatedVisibleIndices,
      };
    });
  }, [totalChildren]);

  useInViewInterval(
    containerRef,
    handleInterval,
    (readTimeInSec + animationDurationInSec) * 1000,
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full",
        className,
        "!grid !grid-cols-7 !overflow-hidden lg:!grid-cols-4 lg:py-3",
      )}
      {...rest}
    >
      <MotionConfig
        transition={{
          duration: animationDurationInSec,
          ease: cubicBezier(0.08, 0.82, 0.17, 1),
        }}
      >
        {carouselState.visibleCardIndices.map((cardIndex, i) => {
          const positionIndex =
            (i - (carouselState.index % TOTAL_CARDS) + TOTAL_CARDS) %
            TOTAL_CARDS;

          return (
            <SpinningCarouselCard
              key={`SpinningCarouselCard[${i}]`}
              initial={CAROUSEL_CARD_POSITIONS[i]}
              animate={CAROUSEL_CARD_POSITIONS[positionIndex]}
            >
              {children[cardIndex]}
            </SpinningCarouselCard>
          );
        })}
      </MotionConfig>
    </div>
  );
}

function SpinningCarouselCard(props: HTMLMotionProps<"div">) {
  return (
    <motion.div
      {...props}
      className="col-span-5 col-start-2 row-start-1 grid px-2 lg:col-span-2 lg:col-start-2 lg:px-3"
    />
  );
}
