import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import type {
  ActiveFile,
  DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import { USE_IS_IN_VIEW_INTERVAL } from "@/hooks/code-strings";
import { GLOBALS_CSS } from "@/app/code-strings";
import { UTILS_TS } from "@/lib/code-strings";
import { ListContainerProps } from "@/components/www/list-container";

const SPINNING_CAROUSEL_TSX = `"use client";

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
              key={\`spinningCarouselCard[\${i}]\`}
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
`;
const SPINNING_TESTIMONIALS_DEMO_TSX = `import { SpinningCarousel } from "@/components/spinning-carousel";
import {
  TestimonialCard,
  TestimonialContent,
  TestimonialAvatar,
  TestimonialAvatarFallback,
  TestimonialAvatarImage,
  TestimonialName,
  TestimonialPosition,
  TestimonialAuthor,
} from "@/components/ui/testimonial";

export function SpinningTestimonialsDemo() {
  return (
    <SpinningCarousel className="h-[calc(500px_-_30vw)] min-h-60 lg:h-[calc(400px_-_7vw)]">

      {TESTIMONIALS.map(({ name, testimonial, position, src, fallback }) => (
        <TestimonialCard key={name}>

          <TestimonialContent className="-indent-1.5 lg:-indent-2">
            &quot;{testimonial}&quot;
          </TestimonialContent>
          
          <TestimonialAuthor>
            <TestimonialAvatar className="size-10">
              <TestimonialAvatarImage src={src} />
              <TestimonialAvatarFallback>{fallback}</TestimonialAvatarFallback>
            </TestimonialAvatar>
            <TestimonialName>{name}</TestimonialName>
            <TestimonialPosition>{position}</TestimonialPosition>
          </TestimonialAuthor>

        </TestimonialCard>
      ))}
        
    </SpinningCarousel>
  );
}

const TESTIMONIALS = [
  {
    testimonial:
      "This SaaS cut our onboarding time from days to hours, all without messy spreadsheets.",
    name: "Guillermo Rauch",
    position: "CEO / Vercel",
    src: "https://github.com/rauchg.png",
    fallback: "GR",
  },
  {
    testimonial:
      "The dashboard delivers real-time insights, helping us make faster, smarter decisions.",
    name: "Theo Browne",
    position: "CEO / Ping Labs",
    src: "https://github.com/t3dotgg.png",
    fallback: "TB",
  },
  {
    testimonial:
      "We replaced three tools with this one. It’s clean, intuitive, and a joy to use.We replaced three tools with this one. It’s clean, intuitive, and a joy to use.",
    name: "Kent C. Dodds",
    position: "Frontend Educator",
    src: "https://github.com/kentcdodds.png",
    fallback: "KCD",
  },
  {
    testimonial:
      "Support is fast, friendly, and the product keeps getting better with each update.",
    name: "shadcn",
    position: "Creator of shadcn/ui",
    src: "https://github.com/shadcn.png",
    fallback: "CN",
  },
  {
    name: "Paul Copperstone",
    position: "CEO / Supabase",
    testimonial:
      "Setup took less than a day, and productivity improved immediately across teams.",
    src: "https://github.com/kiwicopple.png",
    fallback: "PC",
  },
];
`;
const TESTIMONIALS_TSX = `import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TestimonialCard = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "bg-card text-card-foreground border-border/40 inset-shadow-border/40 flex flex-col justify-between gap-10 rounded-4xl border px-5 py-4 shadow-md inset-shadow-2xs lg:px-7 lg:py-6",
      className,
    )}
    {...rest}
  />
);

const TestimonialContent = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div className={cn("text-lg font-medium lg:text-2xl", className)} {...rest} />
);

const TestimonialAuthor = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-x-3 lg:gap-x-4",
      className,
    )}
    {...rest}
  />
);

const TestimonialAvatar = ({
  className,
  ...rest
}: React.ComponentProps<typeof Avatar>) => (
  <Avatar
    className={cn("col-start-1 row-span-2 row-start-1 my-auto", className)}
    {...rest}
  />
);

const TestimonialAvatarImage = (
  props: React.ComponentProps<typeof AvatarImage>,
) => <AvatarImage {...props} />;

const TestimonialAvatarFallback = (
  props: React.ComponentProps<typeof AvatarFallback>,
) => <AvatarFallback {...props} />;

const TestimonialName = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "col-start-2 row-start-1 text-sm font-medium lg:text-base",
      className,
    )}
    {...rest}
  />
);

const TestimonialPosition = ({
  className,
  ...rest
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "text-muted-foreground col-start-2 row-start-2 text-xs lg:text-sm",
      className,
    )}
    {...rest}
  />
);

export {
  TestimonialCard,
  TestimonialContent,
  TestimonialAuthor,
  TestimonialAvatar,
  TestimonialName,
  TestimonialPosition,
  TestimonialAvatarFallback,
  TestimonialAvatarImage,
};`;

const AVATAR_TSX = `"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }`;
const ROOT_DIRECTORY: DirectoryItem[] = [
  {
    name: "components",
    type: "directory",
    items: [
      {
        name: "spinning-carousel.tsx",
        type: "file",
        code: SPINNING_CAROUSEL_TSX,
      },
      {
        name: "ui",
        type: "directory",
        items: [
          {
            name: "testimonial.tsx",
            type: "file",
            code: TESTIMONIALS_TSX,
          },
          {
            name: "avatar.tsx",
            type: "file",
            code: AVATAR_TSX,
          },
        ],
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
  {
    name: "hooks",
    type: "directory",
    items: [
      {
        name: "use-in-view-interval.ts",
        type: "file",
        code: USE_IS_IN_VIEW_INTERVAL,
      },
    ],
  },
  {
    name: "globals.css | index.css",
    type: "file",
    absolutePath: "globals.css | index.css",
    code: GLOBALS_CSS,
  },
];
const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/spinning-carousel.tsx",
  code: SPINNING_CAROUSEL_TSX,
};

const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<SpinningCarousel/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactElement[]`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <div>
              An array of &nbsp;<code>ReactElements</code> to be rendered as
              individual carousel cards.
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>animationDurationInSec?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description:
            "Duration (in seconds) of the transition animation between carousel cards.",
          defaultValue: <SyntaxHighlighterServer>1</SyntaxHighlighterServer>,
        },
        {
          prop: <code>readTimeInSec?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description: `Time (in seconds) each card stays visible before moving to the next. This allows the user time to read and view the content.`,
          defaultValue: <SyntaxHighlighterServer>4</SyntaxHighlighterServer>,
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
    {
      title: [
        "<TestimonialCard/>",
        "<TestimonialContent/>",
        "<TestimonialAuthor/>",
        "<TestimonialName/>",
        "<TestimonialPosition/>",
      ],
      tableData: [
        {
          prop: <code>props</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentProps<"div">`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>children, id, style or className</code>, which will be
              applied directly to the component&apos;s root element.
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
const TITLE = "Spinning Testimonials";
const USAGE = {
  title: TITLE,
  code: SPINNING_TESTIMONIALS_DEMO_TSX,
};
const DESCRIPTION =
  "A sleek, reusable testimonial carousel that smoothly spins through any number of testimonials. Designed to be fully responsive, it automatically converts its direct children into carousel slides, making it perfect for highlighting customer feedback in a compact, eye-catching way.";

const ADDITIONAL_INFORMATION: ListContainerProps[] = [
  {
    title: "Caveats: ",
    variant: "caveats",
    list: [
      <>
        You need to explicitly set the height of the
        <code>{" <SpinningCarousel/> "}</code>based on the tallest card to
        prevent layout shifts when a newly rendered card requires more vertical
        space than currently available.
      </>,
      <>
        Set the height at two breakpoints (<code>base:</code> and&nbsp;
        <code>lg:</code>) as shown in the demo, because the card’s width
        relative to its parent changes at the lg breakpoint.
      </>,
    ],
  },
];
export {
  USAGE,
  TITLE,
  DESCRIPTION,
  ROOT_DIRECTORY,
  ADDITIONAL_INFORMATION,
  DEFAULT_ACTIVE_FILE,
  PROP_TABLE,
};
