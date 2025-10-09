"use client";

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
        "!relative !text-nowrap text-inherit focus-visible:!outline-0",
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
              key={`char-visible-[${idx}]`}
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
              key={`char-hidden-[${idx}]`}
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
          initial: { x: `calc((${iconWidth} + ${gap}) * -1)` },
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
