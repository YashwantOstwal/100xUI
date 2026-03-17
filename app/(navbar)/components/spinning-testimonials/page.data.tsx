import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import type {
  ActiveFile,
  DirectoryItem,
} from "@/components/www/file-explorer/file-explorer.types";
import type { PropTableProps } from "../_components/prop-table";
import { ListContainerProps } from "@/components/www/list-container";
import registryItem from "@/public/c/spinning-testimonials.json";
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
    name: "globals.css",
    type: "file",
    absolutePath: "globals.css",
    code: internals.files.find((file) => file.path.endsWith("neutral.css"))!
      .content,
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
const DEFAULT_ACTIVE_FILE: ActiveFile = {
  absolutePath: "components/spinning-carousel.tsx",
  code: registryItem.files.find((file) =>
    file.path.endsWith("spinning-carousel.tsx")
  )!.content,
};

const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<SpinningCarousel/>"],
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
              individual carousel cards.
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>animationDurationInSec?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description:
            "Duration (in seconds) of the transition animation between carousel cards.",
          defaultValue: <SyntaxHighlighterServer>1</SyntaxHighlighterServer>,
        },
        {
          prop: <code>readTimeInSec?</code>,
          type: <SyntaxHighlighterServer>number</SyntaxHighlighterServer>,
          description: `Time (in seconds) each card stays visible before moving to the next. This allows the user time to read and view the content.`,
          defaultValue: <SyntaxHighlighterServer>4</SyntaxHighlighterServer>,
        },
        {
          prop: <code>...rest</code>,
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
      title: [
        "<TestimonialCard/>",
        "<TestimonialContent/>",
        "<TestimonialAuthor/>",
        "<TestimonialName/>",
        "<TestimonialPosition/>",
      ],
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
const TITLE = registryItem.title;
const USAGE = {
  title: registryItem.title,
  code: demos.files.find((file) =>
    file.path.endsWith("spinning-testimonials.demo.tsx")
  )!.content,
};
const DESCRIPTION = registryItem.description;

const ADDITIONAL_INFORMATION: ListContainerProps[] = [
  {
    title: "Caveats: ",
    variant: "caveats",
    list: [
      <>
        You need to explicitly set the height of the
        <code>{" <SpinningCarousel/> "}</code>based on the tallest card to
        prevent layout shifts when a newly rendered card requires more vertical
        space than currently available.
      </>,
      <>
        Set the height at two breakpoints (<code>base:</code> and&nbsp;
        <code>lg:</code>) as shown in the demo, because the card’s width
        relative to its parent changes at the lg breakpoint.
      </>,
    ],
  },
];
export {
  USAGE,
  TITLE,
  DESCRIPTION,
  ROOT_DIRECTORY,
  ADDITIONAL_INFORMATION,
  DEFAULT_ACTIVE_FILE,
  PROP_TABLE,
};
