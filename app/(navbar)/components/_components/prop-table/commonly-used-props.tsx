import SyntaxHighlighterServer from "@/components/syntax-highlighter/server";
import type { RowData } from "./";

const classNameProp: RowData = {
  prop: <code>className?</code>,
  type: <SyntaxHighlighterServer>string</SyntaxHighlighterServer>,
  description: "Optional class names to apply to the component's root element.",
  defaultValue: <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>,
};

const styleProp: RowData = {
  prop: <code>style?</code>,
  type: <SyntaxHighlighterServer>React.CSSProperties</SyntaxHighlighterServer>,
  description:
    "Optional inline styles to apply to the component's root element.",
  defaultValue: <SyntaxHighlighterServer>undefined</SyntaxHighlighterServer>,
};
export { styleProp, classNameProp };
