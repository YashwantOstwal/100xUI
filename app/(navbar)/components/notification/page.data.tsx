import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import { PropTableProps } from "../_components/prop-table";
import {
  ActiveFile,
  DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import { GLOBALS_CSS } from "@/app/code-strings";
import { UTILS_TS } from "@/lib/code-strings";

import registryItem from "@/public/components/notification.json";

const NOTIFICATION = registryItem?.files?.find(({ path }) =>
  path.endsWith("notification.tsx"),
)?.content as string;
export const TITLE = "Notification";
export const DESCRIPTION =
  "A reusable notification component that displays animated messages with smooth slide and scale transitions, perfect for in-app alerts, toasts, and contextual updates.";

const NOTIFICATION_DEMO = `import {
  Notification,
  NotificationCancel,
  NotificationContent,
  NotificationTrigger,
} from "./notification";

export function NotificationDemo() {
  return (
    <Notification
      className="right-5 bottom-5 z-50 max-w-xs text-sm"
      slideContentFrom="bottom"
    >
      <NotificationTrigger>
        <h3 className="font-medium">Nexus raises $40M Series B 🎉</h3>
        <p className="mt-1 text-xs">
          Fueling the future of social identity and agent-driven play.
        </p>
      </NotificationTrigger>
      <NotificationContent className="max-h-(--container-xs)">
        The new funding, led by Aurora Ventures and Vector Capital, will help us
        advance agent identity, expand cross-world integrations, and elevate the
        creator experience across the Nexus ecosystem.
      </NotificationContent>
      <NotificationCancel />
    </Notification>
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
        name: "notification.tsx",
        type: "file",
        code: NOTIFICATION,
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
  absolutePath: "components/notification.tsx",
  code: NOTIFICATION,
};

export const USAGE = {
  code: NOTIFICATION_DEMO,
  title: TITLE,
};

export const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<Notification/>"],
      tableData: [
        {
          prop: <code>transition?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`Partial<Record<"scale" | "translateY", Transition>>`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Custom motion transitions for scale and vertical movement. Lets you fine-tune animation timing and easing.",
          defaultValue: (
            <SyntaxHighlighterServer>
              {`{
  scale: { ease: "easeOut" },
  translateY: { ease: "easeOut" }
}`}
            </SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>initialContentScale?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["scale"]`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Sets the starting scale of the content before expansion. Adjust this to create a subtle zoom-in or pop effect when the notification opens.",
          defaultValue: <SyntaxHighlighterServer>0.95</SyntaxHighlighterServer>,
        },
        {
          prop: <code>expandedGap?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["gap"]`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Specifies the gap between the trigger and the expanded content when the notification is open.",
          defaultValue: (
            <SyntaxHighlighterServer>
              {`"calc(var(--spacing) * 2)"`}
            </SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>minVisibleContentHeight?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["height"]`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Determines how much of the content remains visible when the notification is collapsed. Useful for showing a preview.",
          defaultValue: (
            <SyntaxHighlighterServer>
              {`"calc(var(--spacing) * 2)"`}
            </SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>slideContentFrom?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`"bottom" | "top"`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Controls the direction from which the content slides in during expansion.",
          defaultValue: (
            <SyntaxHighlighterServer>{`"top"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...rest</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentProps<"div">`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Any standard React div props, like id, style or className, which will be applied directly to the component's root element.",
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<NotificationTrigger/>"],
      tableData: [
        {
          prop: <code>props</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentProps<"div">`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Any standard React div props like id, style, className, onMouseEnter, etc. These will be applied directly to the trigger element.",
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<NotificationContent/>"],
      tableData: [
        {
          prop: <code>props</code>,
          type: (
            <SyntaxHighlighterServer>
              {`Omit<HTMLMotionProps<"div">, "ref">`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Any standard motion.div props excluding ref. These will be applied to the content wrapper element, allowing custom styles, classNames, or event handlers.",
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<NotificationCancel/>"],
      tableData: [
        {
          prop: <code>props</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentProps<"button">`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Any standard React button props, like id, style, className, or onClick. Applied to the cancel button, with built-in dismiss and hide functionality.",
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
  ],
};
