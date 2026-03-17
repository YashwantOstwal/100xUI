import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import registryItem from "@/public/c/chat-bento-card.json";
import internals from "@/public/c/internals.json";
import demos from "@/public/c/demos.json";

const ROOT_DIRECTORY: DirectoryItem[] = [
  {
    name: "components",
    type: "directory",
    items: [
      ...registryItem.files
        .filter((file) => file.type === "registry:component")
        .map((file) => {
          const name = file.path.split("/").pop();
          return { name, type: "file", code: file.content } as DirectoryItem;
        }),
      {
        name: "ui",
        type: "directory",
        items: [
          {
            name: "avatar.tsx",
            type: "file",
            code: internals.files.find((file) =>
              file.path.endsWith("avatar.tsx")
            )!.content,
          },
          ...registryItem.files
            .filter((file) => file.type === "registry:ui")
            .map((file) => {
              const name = file.path.split("/").pop();
              return {
                name,
                type: "file",
                code: file.content,
              } as DirectoryItem;
            }),
        ],
      },
    ],
  },
  {
    name: "globals.css",
    type: "file",
    absolutePath: "globals.css",
    code: internals.files.find((file) => file.path.endsWith("neutral.css"))!
      .content,
  },
  {
    name: "lib",
    type: "directory",
    items: [
      {
        name: "utils.ts",
        type: "file",
        code: internals.files.find((file) => file.path.endsWith("utils.ts"))!
          .content,
      },
    ],
  },
];
const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/chat-bento-card.tsx",
  code: registryItem.files.find((file) =>
    file.path.endsWith("chat-bento-card.tsx")
  )!.content,
};

const TITLE = registryItem.title;
const USAGE = {
  title: registryItem.title,
  code: demos.files.find((file) =>
    file.path.endsWith("chat-bento-card.demo.tsx")
  )!.content,
};
const DESCRIPTION = registryItem.description;
const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<ChatBentoCard/>"],
      tableData: [
        {
          prop: <code>messages</code>,
          type: (
            <SyntaxHighlighterServer>{`(
  | {
      type: "outgoing";
      content: React.ReactNode;
    }
  | {
      type: "incoming";
      content: React.ReactNode;
      from: string;
      avatarProps: {
        src?: string | Blob;
        fallback: string;
      };
    }
)[];`}</SyntaxHighlighterServer>
          ),
          description: (
            <>Array of messages to display in the chat bento card.</>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>staggerMessagesInSec?</code>,
          type: <SyntaxHighlighterServer>{`number`}</SyntaxHighlighterServer>,
          description: <>Delay in seconds between rendering each message.</>,
          defaultValue: <SyntaxHighlighterServer>2</SyntaxHighlighterServer>,
        },
        {
          prop: <code>typingDurationInSec?</code>,
          type: <SyntaxHighlighterServer>{`number`}</SyntaxHighlighterServer>,
          description: (
            <>
              Duration in seconds to show the typing indicator for incoming
              messages.Typically shorter than <code>staggerMessagesInSec</code>.
            </>
          ),
          defaultValue: <SyntaxHighlighterServer>0.75</SyntaxHighlighterServer>,
        },
        {
          prop: <code>initialMessagesCount?</code>,
          type: <SyntaxHighlighterServer>{`number`}</SyntaxHighlighterServer>,
          description: <>Number of messages to be rendered initially.</>,
          defaultValue: <SyntaxHighlighterServer>1</SyntaxHighlighterServer>,
        },
        {
          prop: <code>timestamp?</code>,
          type: (
            <SyntaxHighlighterServer>{`React.ReactNode`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Header or timestamp shown at the top of the chat (e.g., Today,
              Yesterday).
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>{`"Today"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>viewOptions?</code>,
          type: (
            <SyntaxHighlighterServer>{`IntersectionObserverInit`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Options for IntersectionObserver when startChatOn is
              &quot;view&quot;.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>{`{ threshold: 1 }`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>startChatOn?</code>,
          type: (
            <SyntaxHighlighterServer>{`"hover" | "view"`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Defines when to start the chat animation: &quot;hover&quot; or
              &quot;view&quot;.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>{`"view"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...rest</code>,
          type: (
            <SyntaxHighlighterServer>{`React.ComponentPropsWithoutRef<"div">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>id, style or className</code>, which will be applied
              directly to the component&apos;s root element, except for&nbsp;
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

export {
  USAGE,
  TITLE,
  DESCRIPTION,
  ROOT_DIRECTORY,
  DEFAULT_ACTIVE_FILE,
  PROP_TABLE,
};
