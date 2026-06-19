"use client";

import React from "react";
import {
  type HTMLMotionProps,
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  animate,
} from "motion/react";
import { PlayIcon, PauseIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AppleGalleryContext = React.createContext<null | {
  slideCount: number;
  isPlaying: boolean;
  setActiveSlideIndex: React.Dispatch<React.SetStateAction<number>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  activeSlideIndex: number;
  targetSlideIndexRef: React.RefObject<null | number>;
  progressAnimationRef: React.RefObject<ReturnType<typeof animate> | null>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  scrollToSlide: (childIndex: number) => void;
  durationInSec: number;
}>(null);

export function useAppleGallery() {
  const ctx = React.useContext(AppleGalleryContext);
  if (ctx === null) {
    throw new Error("useAppleGallery must be used within an <AppleGallery />");
  }
  return ctx;
}

export function AppleGallery({
  children,
  durationInSec = 4,
  className,
  ...props
}: {
  children: React.ReactNode;
  durationInSec?: number;
} & React.ComponentProps<"div">) {
  const [slideCount] = React.useState(
    (
      (React.Children.toArray(children)[0] as React.ReactElement).props as {
        children: React.ReactElement[];
      }
    ).children.length
  );

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const progressAnimationRef = React.useRef<ReturnType<typeof animate> | null>(
    null
  );
  const targetSlideIndexRef = React.useRef<null | number>(activeSlideIndex);

  const scrollToSlide = React.useCallback(
    (childIndex: number) => {
      if (containerRef.current) {
        setIsPlaying(false);
        setActiveSlideIndex(childIndex);
        targetSlideIndexRef.current = childIndex;
        progressAnimationRef.current = null;
        containerRef.current.children[childIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    },
    [targetSlideIndexRef, setIsPlaying]
  );

  return (
    <AppleGalleryContext.Provider
      value={{
        slideCount,
        isPlaying,
        activeSlideIndex,
        progressAnimationRef,
        setActiveSlideIndex,
        containerRef,
        scrollToSlide,
        setIsPlaying,
        durationInSec,
        targetSlideIndexRef,
      }}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-y-3",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AppleGalleryContext.Provider>
  );
}

export function AppleGalleryContainer({
  children,
  gapInPx = 40,
  paddingInlineInPx = 100,
  className,
  style,
  ...props
}: {
  children: React.ReactElement[];
  gapInPx?: number;
  paddingInlineInPx?: number;
} & React.ComponentPropsWithoutRef<"div">) {
  const {
    containerRef,
    setIsPlaying,
    targetSlideIndexRef,
    setActiveSlideIndex,
    progressAnimationRef,
    scrollToSlide,
  } = useAppleGallery();

  const id = React.useId();

  React.useEffect(() => {
    if (containerRef.current === null) return;

    const containerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsPlaying(entry.isIntersecting);
        if (progressAnimationRef.current) {
          if (entry.isIntersecting) {
            progressAnimationRef.current.play();
          } else {
            progressAnimationRef.current.pause();
          }
        }
      },
      { threshold: 0.5 }
    );

    const childrenObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const childIndex = Array.from(containerRef.current!.children).indexOf(
            entry.target
          );

          if (entry.isIntersecting) {
            if (targetSlideIndexRef.current === null) {
              setIsPlaying(false);
              setActiveSlideIndex(childIndex);
              progressAnimationRef.current = null;
            } else if (targetSlideIndexRef.current === childIndex) {
              targetSlideIndexRef.current = null;
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: `0px ${-paddingInlineInPx + gapInPx / 2}px 0px ${-paddingInlineInPx + gapInPx / 2}px`,
        threshold: 0.5,
      }
    );

    containerObserver.observe(containerRef.current);
    Array.from(containerRef.current.children).forEach((child) => {
      const childIndex = Array.from(containerRef.current!.children).indexOf(
        child
      );
      childrenObserver.observe(child);
      child.addEventListener("click", () => {
        scrollToSlide(childIndex);
      });
    });

    return () => {
      containerObserver.disconnect();
      childrenObserver.disconnect();
      if (containerRef.current === null) return;
      Array.from(containerRef.current.children).forEach((child) => {
        const childIndex = Array.from(containerRef.current!.children).indexOf(
          child
        );
        child.removeEventListener("click", () => {
          scrollToSlide(childIndex);
        });
      });
    };
  }, [
    containerRef,
    setIsPlaying,
    setActiveSlideIndex,
    targetSlideIndexRef,
    scrollToSlide,
    gapInPx,
    paddingInlineInPx,
  ]);

  return (
    <>
      <style>
        {`
        .no-scrollbar-${id}::-webkit-scrollbar {
            display:none;
        }
        .no-scrollbar-${id}{
        -ms-overflow-style:none;
        scrollbar-width:none;
        }
        `}
      </style>
      <div
        ref={containerRef}
        style={{ ...style, paddingInline: paddingInlineInPx, gap: gapInPx }}
        className={cn(
          "flex w-full snap-x snap-mandatory overflow-x-scroll py-1 *:w-full *:shrink-0 *:snap-center",
          `no-scrollbar-${id}`,
          className,
          "gap-0 px-0"
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export function AppleGalleryControls({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { slideCount, progressAnimationRef, isPlaying, setIsPlaying } =
    useAppleGallery();

  return (
    <div
      className={cn("sticky bottom-2 z-20 my-2 flex h-10 gap-2", className)}
      {...props}
    >
      <div className="bg-secondary flex items-center justify-center gap-3 rounded-full p-4">
        {[...Array(slideCount)].map((_, index) => (
          <SlideIndicator index={index} key={index} />
        ))}
      </div>
      <div>
        <Button
          className="grid size-10 shrink-0 place-items-center rounded-full"
          size="icon-lg"
          variant="secondary"
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false);
              if (progressAnimationRef.current) {
                progressAnimationRef.current.pause();
              }
            } else {
              setIsPlaying(true);
              if (progressAnimationRef.current) {
                progressAnimationRef.current.play();
              }
            }
          }}
        >
          {isPlaying ? (
            <PauseIcon className="text-secondary-foreground fill-secondary-foreground" />
          ) : (
            <PlayIcon className="text-secondary-foreground fill-secondary-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}

const MotionButton = motion.create(Button);

function SlideIndicator({
  index,
  ...rest
}: {
  index: number;
} & HTMLMotionProps<"button">) {
  const { slideCount, activeSlideIndex, scrollToSlide, containerRef } =
    useAppleGallery();

  const { scrollXProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end end"],
  });

  const width = useTransform(
    scrollXProgress,
    [
      (index - 1) / (slideCount - 1),
      index / (slideCount - 1),
      (index + 1) / (slideCount - 1),
    ],
    ["8px", "48px", "8px"]
  );

  return (
    <MotionButton
      style={{
        borderRadius: "999px",
        width,
        height: "8px",
      }}
      onClick={() => scrollToSlide(index)}
      className="bg-muted-foreground shrink-0 overflow-hidden border-none p-0 transition-none"
      {...rest}
    >
      {activeSlideIndex == index && <SlideProgressFiller index={index} />}
    </MotionButton>
  );
}

function SlideProgressFiller({ index }: { index: number }) {
  const {
    slideCount,
    isPlaying,
    activeSlideIndex,
    setActiveSlideIndex,
    progressAnimationRef,
    containerRef,
    targetSlideIndexRef,
    durationInSec,
  } = useAppleGallery();

  const scaleX = useMotionValue(0);

  React.useEffect(() => {
    if (
      isPlaying &&
      containerRef.current &&
      (progressAnimationRef.current === null ||
        progressAnimationRef.current.state === "finished")
    ) {
      progressAnimationRef.current = animate(scaleX, 1, {
        duration: durationInSec,
        ease: "linear",
        delay: 0.6,
      });

      progressAnimationRef.current.then(() => {
        const newActiveSlideIndex = (index + 1) % slideCount;
        setActiveSlideIndex((prev) => (prev + 1) % slideCount);
        containerRef.current!.children[newActiveSlideIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        targetSlideIndexRef.current = newActiveSlideIndex;
      });
    }
  }, [
    isPlaying,
    activeSlideIndex,
    progressAnimationRef,
    setActiveSlideIndex,
    containerRef,
    index,
    scaleX,
    slideCount,
    durationInSec,
    targetSlideIndexRef,
  ]);

  return (
    <motion.div
      style={{ scaleX }}
      className="bg-secondary-foreground size-full origin-left rounded-full"
    />
  );
}
