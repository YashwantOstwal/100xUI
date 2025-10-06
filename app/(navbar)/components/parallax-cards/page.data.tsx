import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import { ListContainerProps } from "@/components/www/list-container";
import type { PropTableProps } from "@/app/(navbar)/components/_components/prop-table";
import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import { UTILS_TS } from "@/lib/code-strings";
const PARALLAX_CARDS_DEMO_TSX = `import { PlusIcon } from "lucide-react";

import { ParallaxCards } from "./parallax-cards";

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
      style={{ backgroundColor: \`var(--chart-\${index + 1})\` }}
    >
      <div className="border-foreground relative size-full border border-dashed p-4 sm:p-5">
        <Message>Parallax Cards</Message>
        <div className="size-full p-3.5 sm:p-5">
          <div className="border-foreground relative z-20 size-full border p-4 sm:px-6 sm:py-5">
            <Message>{\`Card #\${index + 1}\`}</Message>

            <div className="border-foreground relative grid size-full place-items-center overflow-hidden border border-dashed">
              <PlusIcon />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

const TITLE = "Parallax cards";
const DESCRIPTION =
  "A reusable and responsive component that gives each of its children a smooth parallax effect, adding a modern, interactive touch to your website. Perfect for showcasing lists of content blocks, feature cards, or image galleries.";
const PARALLAX_CARDS_TSX = `"use client";

import React from "react";
import {
  useScroll,
  useTransform,
  motion,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

export interface ParallaxCardsProps
  extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactElement[];
  maxStackedCards?: number;
  top?: React.CSSProperties["top"];
  forceParallax?: boolean;
}

export function ParallaxCards({
  maxStackedCards = 3,
  top = "50px",
  forceParallax = false,
  className,
  style,
  children,
  ...rest
}: ParallaxCardsProps) {
  const totalCards = children.length;
  const topMagnitude = parseFloat(String(top));
  const topUnit = String(top).slice(String(topMagnitude).length) || "px";

  if (topUnit === "%")
    throw new Error(
      "Invalid \`top\` value: percentages (%) are not supported by <ParallaxCards/>.",
    );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = React.useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  React.useEffect(() => {
    if (forceParallax) return;

    const element = containerRef.current;
    if (!element) return;

    const handleResize = () => {
      const cardHeight = element.getBoundingClientRect().height / totalCards;
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;
      setIsSticky(viewportHeight >= cardHeight);
    };

    handleResize();
    window.visualViewport?.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [totalCards, forceParallax]);

  return (
    <>
      <style>{\`
        html {
          scroll-behavior: smooth;
        }
      \`}</style>

      <div
        ref={containerRef}
        className={cn("w-full", className, "!relative !grid !py-0")}
        style={{
          ...style,
          gridTemplateRows: \`repeat(\${totalCards}, 1fr)\`,
        }}
        {...rest}
      >
        {children.map((child, index) => (
          <ParallaxCard
            key={\`cards[\${index}]\`}
            index={index}
            scrollYProgress={scrollYProgress}
            scrollRatio={1 / totalCards}
            maxStackedCards={maxStackedCards}
            top={{
              magnitude: topMagnitude,
              unit: topUnit,
              absolute: topMagnitude + topUnit,
            }}
            isSticky={isSticky}
            forceParallax={forceParallax}
          >
            {child}
          </ParallaxCard>
        ))}
      </div>
    </>
  );
}

interface CardProps {
  index: number;
  scrollYProgress: MotionValue<number>;
  scrollRatio: number;
  children: React.ReactElement;
  isSticky: boolean;
  maxStackedCards: number;
  top: {
    magnitude: number;
    unit: string;
    absolute: string;
  };
  forceParallax: boolean;
}

function ParallaxCard({
  index,
  scrollYProgress,
  maxStackedCards,
  scrollRatio,
  children,
  top,
  isSticky,
  forceParallax,
}: CardProps) {
  const y = useTransform(
    scrollYProgress,
    [
      index * scrollRatio,
      (index + maxStackedCards - 1) * scrollRatio,
      (index + maxStackedCards) * scrollRatio,
    ],
    [
      "0",
      \`-\${top.absolute}\`,
      \`\${-top.magnitude - top.magnitude / (maxStackedCards - 1)}\${top.unit}\`,
    ],
  );

  const scale = useTransform(
    scrollYProgress,
    [index * scrollRatio, (index + maxStackedCards) * scrollRatio],
    [1, 0.85],
  );

  const opacity = useTransform(
    scrollYProgress,
    [
      (index + maxStackedCards - 1) * scrollRatio,
      (index + maxStackedCards) * scrollRatio,
    ],
    [1, 0],
  );

  return (
    <div
      style={{
        paddingTop: top.absolute,
        position: isSticky ? "sticky" : "relative",
        top: "0px",
      }}
    >
      <motion.div
        {...(isSticky && {
          style: {
            scale,
            opacity,
            y,
            maxHeight: forceParallax ? \`calc(100vh - \${top.absolute})\` : "none",
          },
        })}
        className="grid size-full origin-top overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}`;

const ROOT_DIRECTORY: DirectoryItem[] = [
  {
    name: "components",
    type: "directory",
    items: [
      {
        name: "parallax-cards.tsx",
        type: "file",
        code: PARALLAX_CARDS_TSX,
      },
    ],
  },
  {
    name: "lib",
    type: "directory",
    items: [
      {
        name: "utils.ts",
        type: "file",
        code: UTILS_TS,
      },
    ],
  },
];
const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/parallax-cards.tsx",
  code: PARALLAX_CARDS_TSX,
};

const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<ParallaxCards/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              React.ReactElement[]
            </SyntaxHighlighterServer>
          ),
          description: (
            <div>
              An array of &nbsp;<code>ReactElements</code> to be rendered as
              individual cards in the parallax sequence.
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>maxStackedCards?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description:
            "The number of cards that remain visibly stacked on top of each other before the bottom-most card begins to fade and scroll out of view.",
          defaultValue: <SyntaxHighlighterServer>3</SyntaxHighlighterServer>,
        },
        {
          prop: <code>top?</code>,
          type: <SyntaxHighlighterServer>string</SyntaxHighlighterServer>,
          description: `The CSS top offset for the sticky cards. This determines how far from the top of the window each card "sticks" as you scroll.`,
          defaultValue: (
            <SyntaxHighlighterServer>&quot;50px&quot;</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>forceParallax?</code>,
          type: <SyntaxHighlighterServer>boolean</SyntaxHighlighterServer>,
          description: (
            <div>
              If set to&nbsp;<code>true</code>, enforces the parallax effect to
              run even when the card would be clipped at the bottom of the
              viewport (i.e., when card height + top offset &gt; viewport
              height).
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>false</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...rest</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentPropsWithoutRef<"div">`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>id, style or className</code>, which will be applied
              directly to the component&apos;s root element except for&nbsp;
              <code>ref</code>.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
  ],
};

const ADDITIONAL_INFORMATION: ListContainerProps[] = [
  {
    title: "Good to know:",
    variant: "pro-tips",
    list: [
      <>
        The parallax effect prevents content clipping by automatically disabling
        itself if any card&apos;s height plus its top offset exceeds the
        viewport height.
      </>,
      <>
        You can override this behavior by setting the&nbsp;
        <code>forceParallax</code>&nbsp;prop as &nbsp;
        <code>true</code>. This forces the parallax effect to run, but any
        overflowing part of the card will be clipped by the bottom of the
        viewport, making it ideal for non-critical or decorative content. Under
        the hood, this is done by setting the&nbsp;<code>max-height</code>
        &nbsp;to &nbsp;<code>{"calc(100vh - ${top})"}</code>.
      </>,
      <>
        Each child element spans the height of the tallest sibling, ensuring
        consistent sizing across children, preventing visual mismatches, and
        helping the algorithm deliver an ideal parallax effect.
      </>,
    ],
  },
];
const USAGE = {
  title: TITLE,
  code: PARALLAX_CARDS_DEMO_TSX,
};
export {
  TITLE,
  DESCRIPTION,
  ROOT_DIRECTORY,
  DEFAULT_ACTIVE_FILE,
  PROP_TABLE,
  ADDITIONAL_INFORMATION,
  USAGE,
};
