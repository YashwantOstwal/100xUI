import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import {
  type ActiveFile,
  type DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import registryItem from "@/public/components/menu-wheel.json";
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
      title: ["<MenuWheel />"],
      tableData: [
        {
          prop: <code>showCurrent?</code>,
          type: <SyntaxHighlighterServer>boolean</SyntaxHighlighterServer>,
          description: (
            <>
              Determines whether the currently active item should receive
              distinct visual styling to indicate its selected state.
            </>
          ),
          defaultValue: <SyntaxHighlighterServer>true</SyntaxHighlighterServer>,
        },
        {
          prop: <code>defaultValue?</code>,
          type: <SyntaxHighlighterServer>string</SyntaxHighlighterServer>,
          description: (
            <>
              The initial active value of the wheel when rendered. Useful when
              you want an uncontrolled component.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>onValueChange?</code>,
          type: (
            <SyntaxHighlighterServer>{`(value: string) => void`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Event handler called immediately after a user releases their mouse
              over a new item in the wheel.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...props</code>,
          type: (
            <SyntaxHighlighterServer>{`React.ComponentProps<"div">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props, like <code>className</code> or{" "}
              <code>style</code>, applied directly to the root wrapper.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MenuWheelTrigger />"],
      tableData: [
        {
          prop: <code>cancel?</code>,
          type: <SyntaxHighlighterServer>ReactNode</SyntaxHighlighterServer>,
          description: (
            <>
              The element rendered inside the trigger button when the wheel is
              expanded to indicate the interaction can be aborted.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>{`<XIcon />`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...props</code>,
          type: (
            <SyntaxHighlighterServer>{`React.ComponentProps<"button"> & MotionProps`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Inherits all standard HTML button attributes and Motion
              properties.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },

    {
      title: ["<MenuWheelContainer />"],
      tableData: [
        {
          prop: <code>props</code>,
          type: (
            <SyntaxHighlighterServer>{`React.ComponentProps<"div"> & MotionProps`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard React div props and Motion properties applied to the
              container.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MenuWheelItem />"],
      tableData: [
        {
          prop: <code>index</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description: (
            <>
              The zero-based positional index of the item within the wheel.
              Strictly required to mathematically calculate the correct clipping
              path and rotation angle for the slice.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>Required</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>value?</code>,
          type: <SyntaxHighlighterServer>string</SyntaxHighlighterServer>,
          description: (
            <>
              The unique underlying string identifier for this item. This is the
              payload passed to the parent&apos;s <code>onValueChange</code>{" "}
              callback upon selection.
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>...props</code>,
          type: (
            <SyntaxHighlighterServer>{`React.ComponentProps<"button">`}</SyntaxHighlighterServer>
          ),
          description: (
            <>
              Any standard HTML button props applied directly to the individual
              slice button.
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
