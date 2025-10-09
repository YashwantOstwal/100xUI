import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import { PropTableProps } from "../_components/prop-table";
import { classNameProp } from "../_components/prop-table/commonly-used-props";

export const PROP_TABLE: PropTableProps = {
  data: [
    {
      title: ["<MotionLinkUnderline/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.ReactNode`}
            </SyntaxHighlighterServer>
          ),
          description: (
            <div>
              A <code>ReactNode</code> to be rendered inside the link.
            </div>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>underlineColor?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["background"]`}
            </SyntaxHighlighterServer>
          ),
          description: "The CSS background value for the underline color.",
          defaultValue: (
            <SyntaxHighlighterServer>
              {`"var(--foreground)"`}
            </SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>underlineHeight?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`React.CSSProperties["height"]`}
            </SyntaxHighlighterServer>
          ),
          description:
            "The CSS height value for the thickness of the underline.",
          defaultValue: (
            <SyntaxHighlighterServer>{`"2px"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>startDirection?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`"left" | "right"`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Defines the side from which the underline animation should start.",
          defaultValue: (
            <SyntaxHighlighterServer>{`"left"`}</SyntaxHighlighterServer>
          ),
        },
        {
          prop: <code>endDirection?</code>,
          type: (
            <SyntaxHighlighterServer>
              {`"left" | "right"`}
            </SyntaxHighlighterServer>
          ),
          description:
            "Defines the side where the underline animation should end.",
          defaultValue: (
            <SyntaxHighlighterServer>{`"right"`}</SyntaxHighlighterServer>
          ),
        },
        classNameProp,
        {
          prop: <code>...rest</code>,
          type: <SyntaxHighlighterServer>LinkProps</SyntaxHighlighterServer>,
          description: (
            <>
              All standard <code>Next.js LinkProps</code> (e.g.,{" "}
              <code>href</code>, <code>replace</code>).
            </>
          ),
          defaultValue: (
            <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>
          ),
        },
      ],
    },
    {
      title: ["<MotionLinkSlideText/>"],
      tableData: [
        {
          prop: <code>children</code>,
          type: <SyntaxHighlighterServer>string</SyntaxHighlighterServer>,
          description: <div>The text content of the string.</div>,
          defaultValue: (
            <SyntaxHighlighterServer>(required)</SyntaxHighlighterServer>
          ),
        },
        classNameProp,
        {
          prop: <code>...rest</code>,
          type: <SyntaxHighlighterServer>LinkProps</SyntaxHighlighterServer>,
          description: (
            <>
              All standard <code>Next.js LinkProps</code> (e.g.,{" "}
              <code>href</code>, <code>replace</code>).
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
