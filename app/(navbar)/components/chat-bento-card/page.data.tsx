import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import { GLOBALS_CSS } from "@/app/code-strings";
import registryItem from "@/public/components/chat-bento-card.json";

const CHAT_BENTO_CARD_TSX = registryItem?.files?.find(({ path }) =>
  path.endsWith("chat-bento-card.tsx"),
)?.content as string;
const UTILS_TS = registryItem?.files?.find(({ path }) =>
  path.endsWith("utils.ts"),
)?.content as string;
const AVATAR_TSX = registryItem?.files?.find(({ path }) =>
  path.endsWith("avatar.tsx"),
)?.content as string;
const CHAT_BENTO_CARD_DEMO_TSX = `import {
  ChatBentoCard,
  type ChatMessageType,
} from "@/components/chat-bento-card";

export function ChatBentoCardDemo() {
  return (
    <div className="border-border bg-card box-content w-full max-w-96 rounded-md border px-1 pt-0">
      <ChatBentoCard
        className="aspect-square"
        viewOptions={{ threshold: 0.75 }}
        messages={messages}
      />
      <div className="p-3">
        <div className="text-card-foreground mb-2 font-medium">
          Chat bento card
        </div>
        <p className="text-muted-foreground text-sm">
          A Bento chat interface card that mimics live chat interactions, great
          for embedding conversational UI demos in a Bento grid.
        </p>
      </div>
    </div>
  );
}

const messages: ChatMessageType[] = [
  {
    type: "outgoing",
    content: (
      <>
        Have you seen <span className="font-medium">100xUI</span>? The motion
        components are truly impressive.
      </>
    ),
  },
  {
    type: "incoming",
    from: "Founder",
    avatarProps: {
      src: "/bento-card-avatar.png",
      fallback: "FO",
    },
    content: (
      <p>
        Agreed. That level of craftsmanship is exactly what we need. We should
        hire its creator for our team.
      </p>
    ),
  },
  {
    type: "outgoing",

    content: <>My thoughts exactly. Let's make an offer.</>,
  },
  {
    type: "incoming",
    from: "Founder",
    avatarProps: {
      src: "/bento-card-avatar.png",
      fallback: "FO",
    },
    content: <p>Definitely. Get the process started.</p>,
  },
];
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
        name: "chat-bento-card.tsx",
        type: "file",
        code: CHAT_BENTO_CARD_TSX,
      },
      {
        name: "ui",
        type: "directory",
        items: [
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
];
export const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/chat-bento-card.tsx",
  code: CHAT_BENTO_CARD_TSX,
};

export const PROP_TABLE: PropTableProps = {
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

export const TITLE = "Chat bento card";
export const DESCRIPTION =
  "A Bento chat interface card that mimics live chat interactions, great for embedding conversational UI demos in a Bento grid.";
export const USAGE = {
  code: CHAT_BENTO_CARD_DEMO_TSX,
  title: TITLE,
};
