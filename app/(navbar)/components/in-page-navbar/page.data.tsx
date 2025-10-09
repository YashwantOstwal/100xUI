import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import { ListContainerProps } from "@/components/www/list-container";
import type { PropTableProps } from "../_components/prop-table";
import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import { UTILS_TS } from "@/lib/code-strings";
import { GLOBALS_CSS } from "@/app/code-strings";

const IN_PAGE_NAVBAR_DEMO_TSX = `import { InPageNavbar } from "./in-page-navbar";

export function InPageNavbarDemo() {
  return <InPageNavbar logo={logo} sections={sections} />;
}

const logo = (
    <div className="px-1 text-lg leading-none font-semibold sm:py-0.5">
      100<span className="text-destructive">x</span>U
      <span className="text-destructive">I</span>
    </div>
  ),
  sections = [
    {
      label: "About",
      id: "about",
    },
    {
      label: "Pricing",
      id: "pricing",
    },
    {
      label: "API Usage",
      id: "api-usage",
    },
    {
      label: "Installation",
      id: "installation",
    },
    {
      label: "Documentation",
      id: "documentation",
    },
  ];
`;
const IN_PAGE_NAVBAR_TSX = `"use client";

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
          className="bg-card/85 border-border/50 pointer-events-auto mx-auto flex max-w-xl items-center justify-between rounded-lg border p-3 text-sm font-medium shadow-md backdrop-blur-[2px] sm:rounded-xl"
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
            className="bg-card/85 border-border/50 [&_a,button]:focus-visible:ring-offset-background [&_a,button]:focus-visible:ring-ring fixed inset-x-4.5 top-1.5 z-[110] overflow-hidden rounded-lg border shadow-md backdrop-blur-[2px] [&_a,button]:transition-opacity [&_a,button]:duration-150 [&_a,button]:ease-out [&_a,button]:hover:opacity-70 [&_a,button]:focus-visible:opacity-70 [&_a,button]:focus-visible:ring-1 [&_a,button]:focus-visible:ring-offset-1 [&_a,button]:focus-visible:outline-0"
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
      throw new Error(\`No section found with id="\${id}".\`);
    }
    setTargetElement(element);
  }, [id]);

  return (
    <a
      tabIndex={2}
      {...rest}
      href={\`#\${id}\`}
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState(null, "", \`#\${id}\`);
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
}`;
const TITLE = "In-page navbar";
const DESCRIPTION =
    "A smart, fully responsive, and accessible navigation bar that tracks section progress as you scroll, providing a clear visual indicator of your journey through the page. Best suited for single-page layouts where all content lives on a single page.",
  USAGE = {
    title: TITLE,
    code: IN_PAGE_NAVBAR_DEMO_TSX,
  };

const USE_IS_SERVER = `import * as React from "react";

export function useIsServer() {
  const isServer = React.useRef(typeof window === "undefined");
  return isServer.current;
}
`;

const ROOT_DIRECTORY: DirectoryItem[] = [
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
        name: "in-page-navbar.tsx",
        type: "file",
        code: IN_PAGE_NAVBAR_TSX,
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
    items: [{ name: "use-is-server.ts", type: "file", code: USE_IS_SERVER }],
  },
];
const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/in-page-navbar.tsx",
  code: IN_PAGE_NAVBAR_TSX,
};

const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<InPageNavbar/>"],
      tableData: [
        {
          prop: <code>logo</code>,
          type: (
            <SyntaxHighlighterServer>
              React.ReactElement
            </SyntaxHighlighterServer>
          ),
          description:
            "The logo to be displayed, typically on the left side of the navbar. Accepts any renderable React element.",
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>sections</code>,
          type: (
            <SyntaxHighlighterServer>{`{
  label: string;
  id: string;
  ...rest: Omit<React.ComponentProps<"a">, "href">;
}[]`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              <div className="mb-1">
                <code className="inline-block">label:</code>&nbsp;The text
                displayed for the navigation link.
              </div>
              <div className="mb-1">
                <code>id:</code>&nbsp;The id of the section element used for
                progress tracking and as a link target for smooth scrolling.
              </div>
              <div className="mb-1">
                <code>rest:</code>&nbsp;Any standard React anchor props,
                like&nbsp;
                <code>target, rel, or className</code>, which will be applied
                directly to the element, except for&nbsp;<code>href</code>.
              </div>
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...rest</code>,
          type: (
            <SyntaxHighlighterServer>
              {"React.ComponentProps<'div'>"}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>id, style or className</code>, which will be applied
              directly to the component&pos;s root element.
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
        <code>{"<InPageNavbar/>"}</code>&nbsp;automatically transforms into
        a&nbsp;
        <span className="font-medium">sidebar</span>&nbsp;on screens smaller
        than 640px (sm).
      </>,
      "Place this component at the end of your page or layout to ensure it correctly detects and tracks all sections above it.",
    ],
  },
];
export {
  TITLE,
  DESCRIPTION,
  ROOT_DIRECTORY,
  DEFAULT_ACTIVE_FILE,
  PROP_TABLE,
  ADDITIONAL_INFORMATION,
  USAGE,
};
