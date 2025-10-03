import * as motion from "motion/react-client";
import { Transition } from "motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { MotionStyle } from "motion/react";

// const BREAKPOINTS = {
//   sm: "640px",
//   md: "768px",
//   lg: "1024px",
//   xl: "1280px",
//   "2xl": "1536px",
// } as const;
// keyof typeof BREAKPOINTS |

type BreakpointUnits = "px" | "em" | "rem";
type RenderType = Partial<Record<`${number}${BreakpointUnits}`, string>>;

const maskVariants = {
  initial: {
    y: "100%",
  },
  visible: {
    y: "0%",
  },
};

export function MaskTextServer({ children }: { children: ReactNode }) {
  return children;
}

MaskTextServer.ByLines = function MaskTextServerByLines({
  render,
  splitToken = "\n",
  transition = { duration: 0.4 },
  staggerLines = 0.5,
  className,
  ...rest
}: {
  render: () => RenderType;
  splitToken?: string;
  className?: string;
  style?: MotionStyle;
  transition?: Transition;
  staggerLines?: number;
}) {
  const obj: Partial<Record<`${number}${BreakpointUnits}`, string>> = {};
  for (const [key, value] of Object.entries(render())) {
    obj[key as `${number}${BreakpointUnits}`] = value as string;
  }
  const breakpoints = (
    Object.keys(obj) as `${number}${BreakpointUnits}`[]
  ).sort();

  let cssStyle = "";
  breakpoints.forEach((breakpoint, i) => {
    cssStyle += `
      .mask-text-${breakpoint} {
        display:none;
      }
  
      @media (min-width: ${breakpoint}) ${breakpoints[i + 1] ? `and (max-width: calc(${breakpoints[i + 1]} - 0.02px))` : ""} {
        .mask-text-${breakpoint} {
          display: block;
        }
      }
    `;
  });

  return (
    <>
      <style>{cssStyle}</style>
      {breakpoints.map((breakpoint) => (
        <motion.div
          key={`mask-text-${breakpoint}`}
          {...rest}
          initial="initial"
          whileInView="visible"
          className={cn(className)}
          variants={{
            visible: {
              transition: {
                staggerChildren: staggerLines,
              },
            },
          }}
        >
          {obj[breakpoint]?.split(splitToken).map((eachLine, index) => (
            <div
              key={`mask-text-${breakpoint}-line-${index}`}
              className="overflow-hidden"
            >
              <motion.p
                variants={{
                  initial: {
                    y: "100%",
                  },
                  visible: {
                    y: "0%",
                  },
                }}
                transition={transition}
                className={`mask-text-${breakpoint} text-nowrap`}
              >
                {eachLine}
              </motion.p>
            </div>
          ))}
        </motion.div>
      ))}
    </>
  );
};
MaskTextServer.ByWords = function MaskTextServerByWords({
  render,
  transition = { duration: 0.4 },
  staggerWords = 0.25,
  className,
  textAlign = "left",
  ...rest
}: {
  render: () => string;
  className?: string;
  style?: MotionStyle;
  transition?: Transition;
  staggerWords?: number;
  textAlign: "left" | "right" | "center" | "justify"; //start and end
}) {
  const textAlignValues = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
    justify: "justify-between",
  };
  return (
    <motion.div
      {...rest}
      initial="initial"
      whileInView="visible"
      className={cn("flex flex-wrap", className, textAlignValues[textAlign])}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerWords,
          },
        },
      }}
    >
      {render()
        .split(" ")
        .map((word, i) => (
          <span className="overflow-hidden" key={"word" + i}>
            <motion.span
              className="inline-block"
              variants={maskVariants}
              transition={transition}
            >
              {word}
              &nbsp;
            </motion.span>
          </span>
        ))}
    </motion.div>
  );
};

MaskTextServer.ByLetters = function MaskTextServerByLetters({
  render,
  staggerLetters = 0.05,
  className,
  transition = { duration: 0.4 },
  ...rest
}: {
  render: () => string;
  staggerLetters?: number;
  className?: string;
  style?: MotionStyle;
  transition?: Transition;
}) {
  return (
    <motion.div
      {...rest}
      initial="initial"
      whileInView="visible"
      className={cn("flex flex-wrap", className)}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerLetters,
          },
        },
      }}
    >
      {render()
        .split(" ")
        .map((word, i) => (
          <span className="overflow-hidden" key={"word-" + i}>
            {word.split("").map((letter, j) => (
              <motion.span
                key={"word-" + i + "letter-" + j}
                variants={maskVariants}
                transition={transition}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            &nbsp;
          </span>
        ))}
    </motion.div>
  );
};
