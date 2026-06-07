import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import registryItem from "@/public/components/iphone-3d-mockup.json";
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
      title: ["<IPhone3DMockup/>", "<IPhone3DMockupScreen/>"],
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
