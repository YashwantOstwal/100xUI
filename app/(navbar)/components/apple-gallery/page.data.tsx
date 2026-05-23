import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import registryItem from "@/public/components/apple-gallery.json";
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
        name: "ui",
        type: "directory",
        items: [
          {
            name: "button.tsx",
            type: "file",
            code: internals.files.find((file) =>
              file.path.endsWith("button.tsx")
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
  absolutePath: `components/${registryItem.name}.tsx`,
  code: registryItem.files.find((file) =>
    file.path.endsWith(`${registryItem.name}.tsx`)
  )!.content,
};

const TITLE = registryItem.title;
const USAGE = {
  title: registryItem.title,
  code: demos.files.find((file) =>
    file.path.endsWith(`${registryItem.name}.demo.tsx`)
  )!.content,
};
const DESCRIPTION = registryItem.description;
const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<AppleGallery/>"],
      tableData: [
        {
          prop: <code>durationInSec?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description: `Time (in seconds) each gallery item stays visible before moving to the next. This allows the user time to read and view the content.`,
          defaultValue: <SyntaxHighlighterServer>4</SyntaxHighlighterServer>,
        },
        {
          prop: <code>...props</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentProps<"div">`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>children, id, style or className</code>, which will be
              applied directly to the component&apos;s root element.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<AppleGalleryContainer/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactElement[]`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <div>
              An array of &nbsp;<code>ReactElements</code> to be rendered as
              gallery items.
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>gapInPx?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description: "The spacing between gallery items.",
          defaultValue: <SyntaxHighlighterServer>40</SyntaxHighlighterServer>,
        },
        {
          prop: <code>paddingInlineInPx?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description: "The container's horizontal inner padding.",
          defaultValue: <SyntaxHighlighterServer>100</SyntaxHighlighterServer>,
        },
        {
          prop: <code>...props</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentPropsWithoutRef<"div">`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>id, style or className</code>, which will be applied
              directly to the component&apos;s root element except for&nbsp;
              <code>ref</code>.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<AppleGalleryControls/>"],
      tableData: [
        {
          prop: <code>props</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ComponentProps<"div">`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like&nbsp;
              <code>children, id, style or className</code>, which will be
              applied directly to the component&apos;s root element.
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
