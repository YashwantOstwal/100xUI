"use client";

import React from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type Variants,
  type MotionValue,
} from "motion/react";
import { EqualIcon, XIcon } from "lucide-react";

import { useIsServer } from "@/hooks/use-is-server";
import { cn } from "@/lib/utils";

const fadeVariants: Variants = {
  fadeIn: { opacity: 1 },
  fadeOut: { opacity: 0 },
};

interface NavSection extends Omit<React.ComponentProps<"a">, "href"> {
  label: string;
  id: string;
}

export interface InPageNavbarProps extends React.ComponentProps<"div"> {
  logo: React.ReactElement;
  sections: NavSection[];
}

export function InPageNavbar({
  logo,
  sections,
  className,
  ...rest
}: InPageNavbarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSmallScreen, setIsSmallScreen] = React.useState(false);

  const isServer = useIsServer();

  const navButtons = (
    <NavButtonGroup
      sections={sections}
      isServer={isServer}
      className="gap-x-1.5 gap-y-1 max-sm:mx-auto max-sm:grid max-sm:max-w-fit max-sm:grid-rows-3 max-sm:py-8 max-sm:text-sm sm:flex sm:items-center"
    />
  );

  React.useEffect(() => {
    const handleMediaQuery = ({ matches }: { matches: boolean }) =>
      setIsSmallScreen(matches);

    const mediaQuery = window.matchMedia("(max-width:639px)");
    mediaQuery.addEventListener("change", handleMediaQuery);

    return () => mediaQuery.removeEventListener("change", handleMediaQuery);
  }, []);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none fixed inset-x-4.5 top-1.5 z-[100]",
          "[&_a,button]:focus-visible:ring-offset-background [&_a,button]:focus-visible:ring-ring [&_a,button]:transition-opacity [&_a,button]:duration-150 [&_a,button]:ease-out [&_a,button]:hover:opacity-70 [&_a,button]:focus-visible:opacity-70 [&_a,button]:focus-visible:ring-1 [&_a,button]:focus-visible:ring-offset-1 [&_a,button]:focus-visible:outline-0",
          className,
        )}
        {...rest}
      >
        <motion.div
          initial={false}
          animate={isSidebarOpen && isSmallScreen ? "fadeOut" : "fadeIn"}
          variants={fadeVariants}
          className="bg-card/85 inset-shadow-border/40 pointer-events-auto mx-auto flex max-w-xl items-center justify-between rounded-lg p-3 text-sm font-medium shadow-md inset-shadow-2xs backdrop-blur-[2px] sm:rounded-xl"
        >
          <a
            href="#"
            tabIndex={1}
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, "", window.location.pathname);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-full p-0.5"
          >
            {logo}
          </a>
          <>
            <nav className="hidden sm:block">{navButtons}</nav>
            <button
              tabIndex={2}
              aria-label="Open sidebar"
              onClick={() => {
                setIsSmallScreen(true);
                setIsSidebarOpen(true);
              }}
              className="text-foreground -mr-2 cursor-pointer rounded-full px-1 sm:hidden"
            >
              <EqualIcon />
            </button>
          </>
        </motion.div>
      </div>
      <AnimatePresence>
        {isSmallScreen && isSidebarOpen && (
          <motion.div
            initial="fadeOut"
            animate="fadeIn"
            exit="fadeOut"
            variants={fadeVariants}
            className="bg-card/85 inset-shadow-border/40 [&_a,button]:focus-visible:ring-offset-background [&_a,button]:focus-visible:ring-ring fixed inset-x-4.5 top-1.5 z-[110] overflow-hidden rounded-lg shadow-md inset-shadow-2xs backdrop-blur-[2px] [&_a,button]:transition-opacity [&_a,button]:duration-150 [&_a,button]:ease-out [&_a,button]:hover:opacity-70 [&_a,button]:focus-visible:opacity-70 [&_a,button]:focus-visible:ring-1 [&_a,button]:focus-visible:ring-offset-1 [&_a,button]:focus-visible:outline-0"
          >
            <button
              tabIndex={3}
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="text-foreground absolute top-3 right-2 cursor-pointer rounded-full"
            >
              <XIcon />
            </button>
            {navButtons}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface NavButtonGroupProps {
  sections: NavSection[];
  isServer: boolean;
  className: string;
}

function NavButtonGroup({
  sections,
  isServer,
  className,
}: NavButtonGroupProps) {
  const { scrollY } = useScroll();

  return (
    <nav className={className}>
      {sections.map((props) => (
        <NavItem
          key={props.id}
          scrollY={scrollY}
          isServer={isServer}
          {...props}
        />
      ))}
    </nav>
  );
}

interface NavItemProps extends NavSection {
  scrollY: MotionValue<number>;
  isServer: boolean;
}

function NavItem({
  label,
  id,
  isServer,
  scrollY,
  onClick,
  className,
  ...rest
}: NavItemProps) {
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(
    null,
  );

  const sectionProgress = useTransform(scrollY, (latest) => {
    if (isServer || !targetElement) return 0;

    const viewportHeight = window.innerHeight;
    const targetElementTop = targetElement.offsetTop;
    const targetElementHeight = targetElement.offsetHeight;

    const visibleRatio =
      (latest + viewportHeight - targetElementTop) / targetElementHeight;

    return Math.min(1, Math.max(visibleRatio, 0));
  });

  const clipPath = useTransform(
    sectionProgress,
    [0, 1],
    ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
  );

  React.useEffect(() => {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`No section found with id="${id}".`);
    }
    setTargetElement(element);
  }, [id]);

  return (
    <a
      tabIndex={2}
      {...rest}
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState(null, "", `#${id}`);
        targetElement?.scrollIntoView({ behavior: "smooth" });
        onClick?.(e);
      }}
      className={cn(
        "bg-background text-foreground border-border relative overflow-hidden rounded-full border font-medium capitalize transition-opacity duration-150 ease-out sm:text-xs",
        className,
      )}
    >
      <span className="relative z-20 inline-block size-full px-4 py-2.5 text-center leading-none sm:px-3 sm:py-2">
        {label}
      </span>

      {targetElement && (
        <motion.span
          initial="fadeOut"
          animate="fadeIn"
          variants={fadeVariants}
          style={{ clipPath }}
          className="bg-muted text-muted-foreground absolute -inset-0.5 z-30 grid place-items-center rounded-[inherit] leading-none"
        >
          {label}
        </motion.span>
      )}
    </a>
  );
}
