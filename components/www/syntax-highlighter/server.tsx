import { ComponentProps } from "react";
import { codeToHtml } from "shiki";

export default async function SyntaxHighlighterServer({
  children,
  ...rest
}: ComponentProps<"div"> & {
  children: string;
}) {
  const out = await codeToHtml(children, {
    lang: "ts",
    themes: {
      light: "github-light",
      dark: "vesper",
    },
    tabindex: "-1",
  });

  return (
    <div {...rest} tabIndex={-1} dangerouslySetInnerHTML={{ __html: out }} />
  );
}
