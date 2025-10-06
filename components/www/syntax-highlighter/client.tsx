"use client";
import * as React from "react";
import type { JSX } from "react";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki/bundle/web";

export async function highlight(code: string) {
  const out = await codeToHast(code, {
    lang: "ts",
    themes: {
      light: "github-light",
      dark: "vesper",
    },
    tabindex: "-1",
  });

  return toJsxRuntime(out, {
    Fragment,
    jsx,
    jsxs,
  }) as JSX.Element;
}

interface SyntaxHighlighterClientProps {
  codeString: string;
  Loader: React.ReactElement;
}
export default function SyntaxHighlighterClient({
  codeString,
  Loader,
}: SyntaxHighlighterClientProps) {
  const [nodes, setNodes] = React.useState<React.JSX.Element | undefined>(
    undefined,
  );
  React.useEffect(() => {
    void highlight(codeString).then(setNodes);
  }, [codeString]);

  return nodes ?? Loader;
}
