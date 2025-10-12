import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import { GLOBALS_CSS } from "@/app/code-strings";

import registryItem from "@/public/components/morph-modal.json";

const MORPH_MODAL_TSX = registryItem?.files?.find(({ path }) =>
  path.endsWith("morph-modal.tsx"),
)?.content;
const UTILS_TS = registryItem?.files?.find(({ path }) =>
  path.endsWith("utils.ts"),
)?.content;
export const DESCRIPTION =
  'A reusable modal component that smoothly "morphs" from the dimensions and position of its trigger element';
export const TITLE = "Morph modal";

const MORPH_MODAL_DEMO_TSX = `"use client";

import { PlayIcon } from "lucide-react";

import {
  MorphModal,
  MorphModalTrigger,
  MorphModalContent,
  MorphModalOverlay,
} from "@/components/morph-modal";

export function MorphModalDemo() {
  return (
    <MorphModal transition={{ ease: "easeInOut" }}>
      <MorphModalTrigger className="bg-secondary text-secondary-foreground border-border/50 rounded-full border px-3.5 py-2">
        <div className="flex items-center gap-1.5">
          Watch demo
          <PlayIcon className="fill-foreground stroke-foreground bg-background box-content size-3.5 rounded-full p-1" />
        </div>
      </MorphModalTrigger>
      <MorphModalOverlay className="z-50">
        <MorphModalContent className="bg-muted border-border/50 m-2 rounded-xl border p-1">
          <iframe
            className="aspect-[560/315] max-w-full rounded-lg"
            width="768px"
            height="auto"
            src="https://www.youtube.com/embed/aWBiZc5XKJM?si=muuRWjXzomYeoQ2K"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </MorphModalContent>
      </MorphModalOverlay>
    </MorphModal>
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
        name: "morph-modal.tsx",
        type: "file",
        code: MORPH_MODAL_TSX as string,
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
        code: UTILS_TS as string,
      },
    ],
  },
];
export const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: `components/morph-link.tsx`,
  code: MORPH_MODAL_TSX as string,
};

export const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<MorphModal/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactNode`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              React nodes that will be rendered inside the&nbsp;
              <code>{`MorphModal`}</code>&nbsp;as children. This typically
              includes the&nbsp;
              <code>{`MorphModalTrigger`}</code>&nbsp;and the&nbsp;
              <code>{`MorphModalOverlay`}</code>.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: "transition?",
          type: (
            <SyntaxHighlighterServer>{`Omit<Transition, "delay">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              <code>
                Object that defines the animation properties for the morphing
                transition except&nbsp;<code>delay</code>
              </code>
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MorphModalTrigger/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactNode`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              The single child element to be rendered inside the trigger, such
              as text, an icon, or a single nested component.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: "...rest",
          type: (
            <SyntaxHighlighterServer>{`HTMLMotionProps<"button">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React button props, like&nbsp;
              <code>onClick</code>&nbsp;handlers or <code>disabled</code>{" "}
              states, which will be applied directly to the button
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MorphModalOverlay/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactNode`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              The content to be rendered inside the overlay. This should
              typically be the&nbsp;<code>MorphModalContent</code>
              &nbsp;component.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: "...rest",
          type: (
            <SyntaxHighlighterServer>{`HTMLMotionProps<"div">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>id, style or className</code>, which will be applied
              directly to the component&apos;s root element.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MorphModalOverlay/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactNode`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              The single child element to be displayed inside the modal (e.g.,
              text, videos, forms, or custom components).
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: "...rest",
          type: (
            <SyntaxHighlighterServer>{`HTMLMotionProps<"div">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>id, style or className</code>, which will be applied
              directly to the component&apos;s root element.
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
export const USAGE = {
  code: MORPH_MODAL_DEMO_TSX,
  title: TITLE,
};
