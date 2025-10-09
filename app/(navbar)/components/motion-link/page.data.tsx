import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import { PropTableProps } from "../_components/prop-table";
import { classNameProp } from "../_components/prop-table/commonly-used-props";
import Link from "next/link";
import {
  ActiveFile,
  DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import { GLOBALS_CSS } from "@/app/code-strings";
import { UTILS_TS } from "@/lib/code-strings";

export const TITLE = "Motion link";
export const DESCRIPTION = (
  <>
    <span className="text-foreground font-medium italic">
      Exclusive to Next.js.{" "}
    </span>
    A reusable component that extends the <code>{`<Link/>`} </code> component
    from &quot;next/link&quot; to power interactive animations using{" "}
    <Link
      href="https://motion.dev/"
      className="text-cyan-700 transition-colors ease-out hover:text-cyan-800"
    >
      motion.dev
    </Link>
    . It includes three predefined variants:{" "}
    <code>{`<MotionLinkUnderline/>`}</code>,{" "}
    <code>{`<MotionLinkSlideText/>`}</code>, and{" "}
    <code>{`<MotionLinkWithIcon/>`}</code>, while the base{" "}
    <code>{`<MotionLink/>`}</code> provides full flexibility to define custom
    animations with MotionProps like whileFocus, whileHover, and whileInView.
  </>
);

const MOTION_LINK_TSX = `"use client";

import React from "react";
import Link, { type LinkProps } from "next/link";
import { motion, stagger, MotionConfig, type MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

const MLink = motion.create(Link);

type CombinedAnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps | "href"
>;

export type MotionLinkBaseProps = LinkProps & MotionProps & CombinedAnchorProps;
export function MotionLink(props: MotionLinkBaseProps) {
  return <MLink {...props} />;
}

export interface MotionLinkUnderlineProps extends MotionLinkBaseProps {
  underlineColor?: React.CSSProperties["background"];
  underlineHeight?: React.CSSProperties["height"];
  startDirection?: "left" | "right";
  endDirection?: "left" | "right";
}
export function MotionLinkUnderline({
  className,
  children,
  underlineColor = "var(--color-foreground)",
  underlineHeight = "2px",
  startDirection = "left",
  endDirection = "right",
  ...rest
}: MotionLinkUnderlineProps) {
  const isStartDirectionLeft = startDirection === "left";
  const isEndDirectionRight = endDirection === "right";

  const underlineActiveStyles = {
    width: "100%",
    ...(isStartDirectionLeft
      ? { left: "0px", right: "auto" }
      : { left: "auto", right: "0px" }),
  };

  return (
    <MotionLink
      initial="initial"
      whileFocus="whileFocus"
      whileHover="whileHover"
      className={cn(
        "!relative w-fit !text-nowrap text-inherit focus-visible:!outline-0",
        className,
      )}
      {...rest}
    >
      {children}
      <motion.div
        style={{
          height: underlineHeight,
          background: underlineColor,
        }}
        className="absolute bottom-0"
        variants={{
          initial: {
            width: "0%",
            ...(isEndDirectionRight
              ? { left: "auto", right: "0px" }
              : { left: "0px", right: "auto" }),
          },
          whileHover: underlineActiveStyles,
          whileFocus: underlineActiveStyles,
        }}
        transition={{
          left: { duration: 0 },
          right: { duration: 0 },
          default: { ease: "easeInOut" },
        }}
      />
    </MotionLink>
  );
}

export interface MotionLinkSlideTextProps extends MotionLinkBaseProps {
  children: string;
}

export function MotionLinkSlideText({
  children,
  className,
  ...rest
}: MotionLinkSlideTextProps) {
  const characters = children.split("");
  const staggerDelay = { transition: { delayChildren: stagger(0.02) } };

  return (
    <MotionLink
      initial="initial"
      whileHover="whileHover"
      whileFocus="whileFocus"
      className={cn(
        "inline-block text-inherit",
        "!relative focus-visible:!outline-none",
        className,
      )}
      {...rest}
    >
      <MotionConfig transition={{ ease: "easeInOut" }}>
        <motion.div
          aria-hidden
          className="relative z-20 flex text-nowrap whitespace-pre"
          variants={{
            whileHover: staggerDelay,
            whileFocus: staggerDelay,
          }}
        >
          {characters.map((char, idx) => (
            <motion.span
              key={\`char-visible-[\${idx}]\`}
              variants={{
                initial: { scaleY: 1 },
                whileHover: { scaleY: 0 },
                whileFocus: { scaleY: 0 },
              }}
              className="origin-top"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        <motion.div
          aria-hidden
          variants={{
            whileHover: staggerDelay,
            whileFocus: staggerDelay,
          }}
          className="absolute inset-0 z-10 flex text-nowrap whitespace-pre"
        >
          {characters.map((char, idx) => (
            <motion.span
              key={\`char-hidden-[\${idx}]\`}
              variants={{
                initial: { scaleY: 0 },
                whileHover: { scaleY: 1 },
                whileFocus: { scaleY: 1 },
              }}
              className="origin-bottom"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </MotionConfig>
      <span className="sr-only">{children}</span>
    </MotionLink>
  );
}
export interface MotionLinkWithIconProps extends MotionLinkBaseProps {
  icon: React.ReactNode;
  iconWidth: React.CSSProperties["width"];
  gap?: React.CSSProperties["gap"];
}

export function MotionLinkWithIcon({
  icon,
  iconWidth,
  gap = "var(--spacing)",
  className,
  children,
  ...rest
}: MotionLinkWithIconProps) {
  return (
    <MotionLink
      initial="initial"
      whileHover="whileHover"
      whileFocus="whileFocus"
      className={cn(
        "inline-block !overflow-hidden text-inherit focus-visible:!outline-none",
        className,
      )}
      {...rest}
    >
      <motion.div
        variants={{
          initial: { x: \`calc((\${iconWidth} + \${gap}) * -1)\` },
          whileHover: { x: "0px" },
          whileFocus: { x: "0px" },
        }}
        transition={{ ease: "easeInOut" }}
        className="flex items-center"
        style={{ gap }}
      >
        {icon}
        {children}
      </motion.div>
    </MotionLink>
  );
}
`;

const MOTION_LINK_DEMO_TSX = `import {
  MotionLinkSlideText,
  MotionLinkUnderline,
  MotionLinkWithIcon,
} from "./motion-link";

export function MotionLinkDemo() {
  return (
    <div className="[&>a]:text-foreground flex flex-col items-center justify-center gap-x-10 gap-y-5 text-lg sm:flex-row sm:text-xl">
      <MotionLinkUnderline
        href="/components"
        tabIndex={1}
        underlineColor="linear-gradient(to right,var(--secondary),var(--primary))"
      >
        Focus me
      </MotionLinkUnderline>
      <MotionLinkSlideText
        href="/components/motion-link"
        className="uppercase italic"
        tabIndex={2}
      >
        Hover me
      </MotionLinkSlideText>
      <MotionLinkWithIcon
        href="https://github.com/YashwantOstwal/100xui"
        icon={<GithubIcon className="size-5" />}
        iconWidth="calc(var(--spacing) * 5)"
        gap="calc(var(--spacing) * 2)"
        tabIndex={3}
      >
        Github
      </MotionLinkWithIcon>
    </div>
  );
}

function GithubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 438.549 438.549"
      width="438.549"
      height="438.549"
      {...props}
    >
      <path
        stroke="currentColor"
        fill="currentColor"
        d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
      ></path>
    </svg>
  );
}
`;
export const ROOT_DIRECTORY: DirectoryItem[] = [
  {
    name: "globals.css | index.css",
    type: "file",
    absolutePath: "globals.css | index.css",
    code: GLOBALS_CSS,
  },
  {
    name: "components",
    type: "directory",
    items: [
      {
        name: "motion-link.tsx",
        type: "file",
        code: MOTION_LINK_TSX,
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

export const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/motion-link.tsx",
  code: MOTION_LINK_TSX,
};

export const USAGE = {
  code: MOTION_LINK_DEMO_TSX,
  title: TITLE,
};

export const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<MotionLinkUnderline/>"],
      tableData: [
        {
          prop: <code>underlineColor?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["background"]`}
            </SyntaxHighlighterServer>
          ),
          description: "The CSS background value for the underline color.",
          defaultValue: (
            <SyntaxHighlighterServer>
              {`"var(--foreground)"`}
            </SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>underlineHeight?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["height"]`}
            </SyntaxHighlighterServer>
          ),
          description:
            "The CSS height value for the thickness of the underline.",
          defaultValue: (
            <SyntaxHighlighterServer>{`"2px"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>startDirection?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`"left" | "right"`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Defines the side from which the underline animation should start.",
          defaultValue: (
            <SyntaxHighlighterServer>{`"left"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>endDirection?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`"left" | "right"`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Defines the side where the underline animation should end.",
          defaultValue: (
            <SyntaxHighlighterServer>{`"right"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...rest</code>,
          type: (
            <SyntaxHighlighterServer>{`LinkProps & MotionProps & Omit<
React.AnchorHTMLAttributes<HTMLAnchorElement>,
keyof LinkProps | "href">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              All standard props to <code>{`Link`}</code> from
              &quot;next/link&quot; (e.g., <code>href</code>,{" "}
              <code>children</code>, <code>tabIndex</code>) and MotionProps.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MotionLinkSlideText/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: <SyntaxHighlighterServer>string</SyntaxHighlighterServer>,
          description: <div>The text content of the string.</div>,
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...rest</code>,
          type: (
            <SyntaxHighlighterServer>{`LinkProps & MotionProps & Omit<
React.AnchorHTMLAttributes<HTMLAnchorElement>,
keyof LinkProps | "href">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              All standard props to <code>{`Link`}</code> from
              &quot;next/link&quot; (e.g., <code>href</code>,{" "}
              <code>children</code>, <code>tabIndex</code>) and MotionProps.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MotionLinkWithIcon/>"],
      tableData: [
        {
          prop: <code>icon</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactNode`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <div>
              The icon element to display. This is positioned before the{" "}
              <code>children</code> and is part of the slide animation.
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>iconWidth</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["width"]`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <div>The CSS width value for the icon&apos;s container.</div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>gap?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["gap"]`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <div>
              The CSS gap value that controls the spacing between the icon and
              the label.
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>{`"var(--spacing)"`}</SyntaxHighlighterServer>
          ),
        },
        classNameProp,
        {
          prop: <code>...rest</code>,
          type: (
            <SyntaxHighlighterServer>{`LinkProps & MotionProps & Omit<
React.AnchorHTMLAttributes<HTMLAnchorElement>,
keyof LinkProps | "href">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              All standard props to <code>{`Link`}</code> from
              &quot;next/link&quot; (e.g., <code>href</code>,{" "}
              <code>children</code>, <code>tabIndex</code>) and MotionProps.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MotionLink/>"],
      tableData: [
        {
          prop: <code>props</code>,
          type: (
            <SyntaxHighlighterServer>{`LinkProps & MotionProps & Omit<
React.AnchorHTMLAttributes<HTMLAnchorElement>,
keyof LinkProps | "href">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              All standard props to <code>{`Link`}</code> from
              &quot;next/link&quot; (e.g., <code>href</code>,{" "}
              <code>children</code>, <code>tabIndex</code>) and MotionProps.
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
