import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import { ListContainerProps } from "@/components/www/list-container";
import type { PropTableProps } from "../_components/prop-table";
import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import registryItem from "@/public/components/chat-bento-card.json";
import internals from "@/public/components/internals.json";
import demos from "@/public/components/demos.json";

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
        name: "hooks",
        type: "directory",
        items: [
          ...registryItem.files
            .filter(({ type }) => type === "registry:hook")
            .map((hook) => {
              const name = hook.path.split("/").pop();
              return {
                name,
                type: "file",
                code: hook.content,
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
  {
    name: "hooks",
    type: "directory",
    items: [
      ...registryItem.files
        .filter(({ type }) => type === "registry:hook")
        .map((hook) => {
          const name = hook.path.split("/").pop();
          return {
            name,
            type: "file",
            code: hook.content,
          } as DirectoryItem;
        }),
    ],
  },
];
const TITLE = registryItem.title;

const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: `components/${TITLE.toLocaleLowerCase().replaceAll(" ", "-")}.tsx`,
  code: registryItem.files.find((file) =>
    file.path.endsWith(`${TITLE.toLocaleLowerCase().replaceAll(" ", "-")}.tsx`)
  )!.content,
};

const USAGE = {
  title: registryItem.title,
  code: demos.files.find((file) =>
    file.path.endsWith(
      `${TITLE.toLocaleLowerCase().replaceAll(" ", "-")}.demo.tsx`
    )
  )!.content,
};
const DESCRIPTION = registryItem.description;

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
