import FileExplorer from "@/components/www/file-explorer";
import type { FileExplorerProps } from "@/components/www/file-explorer/file-explorer.types";
import { PropsTable } from "../_components/prop-table";
// import type { PropTableProps } from "../_components/prop-table";

import { HomeLink } from "@/components/www/home-link";
import Description from "@/components/www/description";
import Preview from "@/components/www/preview";
import Title from "@/components/www/title";
import { cn } from "@/lib/utils";
import React, { ComponentProps } from "react";
import { CardHeader } from "@/components/www/file-explorer/card-header";
import SubTitle from "@/components/www/sub-title";

import { Terminal } from "../terminal";
import SyntaxHighlighterServer from "@/components/www/syntax-highlighter/server";
import { CodeCanvas } from "@/components/www/file-explorer/code-canvas";
import { CopyButton } from "@/components/www/copy-button";
import FileExtensionIcon from "@/components/www/file-explorer/file-extension";
import { CodeCard } from "@/components/www/code-card";
import ListContainer from "@/components/www/list-container";
import { SubSubTitle } from "@/components/www/sub-sub-title";
// type ContainerProps = TailwindCSSClassname & ComponentProps<"main">;

export function ComponentPage({
  className,
  children,
  ...rest
}: ComponentProps<"main">) {
  return (
    <main className={cn(className)} {...rest}>
      <HomeLink />
      {children}
    </main>
  );
}

ComponentPage.Title = function ComponentPageTitle({
  className,
  ...rest
}: ComponentProps<"h1">) {
  return <Title className={cn("mt-5", className)} {...rest} />;
};

ComponentPage.Description = function ComponentPageDescription({
  className,
  ...rest
}: ComponentProps<"p">) {
  return <Description className={cn("mt-2", className)} {...rest} />;
};
ComponentPage.SubTitle = function ComponentPageSubTitle(
  props: ComponentProps<"h2">,
) {
  return <SubTitle className="mt-12 mb-4" {...props} />;
};

ComponentPage.Installation = function ComponentPageInstallation(
  props: ComponentProps<"section">,
) {
  return <section {...props} />;
};

ComponentPage.SubSubTitle = SubSubTitle;
ComponentPage.Documentation = function ComponentPageDocumentation({
  children,
  ...rest
}: ComponentProps<"section">) {
  return (
    <section {...rest}>
      <ComponentPage.SubTitle>API reference</ComponentPage.SubTitle>
      <div className={cn("overflow-x-auto")}>
        <div className="w-fit min-w-full text-[15px] leading-[1.4286] [&>*]:w-full">
          {children}
        </div>
      </div>
    </section>
  );
};

ComponentPage.PropsTable = PropsTable;
ComponentPage.ListContainer = ListContainer;

ComponentPage.Usage = function ComponentPageUsage({
  title,
  code,
  ...rest
}: { title: string; code: string } & ComponentProps<"section">) {
  const absolutePath = `components/${title.toLocaleLowerCase().replaceAll(" ", "-")}.demo.tsx`;

  return (
    <section {...rest}>
      <ComponentPage.SubTitle>API usage</ComponentPage.SubTitle>
      <CodeCard>
        <CardHeader>
          <CardHeader.FlexOneFlex>
            <FileExtensionIcon fileName={absolutePath} />
            {absolutePath}
          </CardHeader.FlexOneFlex>
          <CopyButton codeString={code} />
        </CardHeader>
        <CodeCanvas className="rounded-lg [&_pre]:min-w-fit">
          <SyntaxHighlighterServer className="w-full overflow-auto rounded-lg">
            {code}
          </SyntaxHighlighterServer>
        </CodeCanvas>
      </CodeCard>
    </section>
  );
};

ComponentPage.FileExplorer = function ComponentPageFileExplorer({
  rootDirectory,
  defaultActiveFile,
  className,
  ...rest
}: FileExplorerProps) {
  return (
    <section className={cn(className)} {...rest}>
      {/* <ComponentPage.SubTitle>Code</ComponentPage.SubTitle> */}
      <FileExplorer
        rootDirectory={rootDirectory}
        defaultActiveFile={defaultActiveFile}
      />
    </section>
  );
};

ComponentPage.Preview = function ComponentPagePreview({
  className,
  ...rest
}: React.ComponentProps<"div"> & { container?: boolean }) {
  return <Preview className={cn("mt-10", className)} {...rest} />;
};

const NOTES = {
  "cli-installation-step-1": (
    <>
      <div className="text-primary-foreground dark:bg-primary/70 bg-primary/50 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full font-mono text-xs">
        1
      </div>
      <div>
        Run the command below to add the component to your project.
        <div className="text-muted-foreground">
          It will also generate the required base stylesheet if one doesn&apos;t
          already exist and guide you through setting up the import alias&nbsp;
          <code className="text-[#032f62] dark:text-[#99ffe4]">
            @/components/...
          </code>
          &nbsp;if it isn&apos;t already configured.
        </div>
      </div>
    </>
  ),
  "theme-installation-support": (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="text-destructive size-5 h-[1lh]"
        width="20"
        height="20"
      >
        <circle
          cx="10"
          cy="10"
          r="7.25"
          fill="currentColor"
          fill-opacity="0.15"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5px"
        ></circle>
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M10 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0-2a1 1 0 0 1-1-1V7a1 1 0 0 1 2 0v2a1 1 0 0 1-1 1Z"
          clip-rule="evenodd"
        ></path>
      </svg>
      Dedicated theme installation support is under development. For now, you
      can style your application with{" "}
      <span className="font-medium">chosen</span> theme by referencing the
      official documentation [link].
    </>
  ),
} as const;
ComponentPage.Note = function ComponentPageNote({
  className,
  note,
  children,
  ...rest
}: ComponentProps<"div"> & { note?: keyof typeof NOTES }) {
  return (
    <div className={cn("mb-2.5 flex gap-x-1.5", className)} {...rest}>
      {note ? NOTES[note] : children}
    </div>
  );
};
ComponentPage.Cli = function Cli({
  title,
  ...rest
}: { title: string } & React.ComponentProps<"section">) {
  const registryItemName = title.toLocaleLowerCase().replaceAll(" ", "-");

  const packageManagerCommands = {
    pnpm: `pnpm dlx shadcn@latest add https://100xui.com/components/${registryItemName}.json`,
    npm: `npx shadcn@latest add https://100xui.com/components/${registryItemName}.json`,
    yarn: `yarn shadcn@latest add https://100xui.com/components/${registryItemName}.json`,
    bun: `bun --bun shadcn@latest add https://100xui.com/components/${registryItemName}.json`,
  } as const;

  return (
    <section {...rest}>
      {/* <ComponentPage.SubTitle>Cli</ComponentPage.SubTitle> */}
      <Terminal packageManagerCommands={packageManagerCommands} />
    </section>
  );
};
ComponentPage.Dependencies = function Dependencies({
  dependencies,
  ...rest
}: {
  dependencies: (
    | "motion"
    | "lucide-react"
    | "tailwind-merge"
    | "clsx"
    | "@radix-ui/react-avatar"
  )[];
} & React.ComponentProps<"section">) {
  const stringifiedDependencies = dependencies.sort().join(" ");

  const packageManagerCommands = {
    pnpm: `pnpm add ${stringifiedDependencies}`,
    npm: `npm install ${stringifiedDependencies}`,
    yarn: `yarn add ${stringifiedDependencies}`,
    bun: `bun add ${stringifiedDependencies}`,
  } as const;

  return (
    <section {...rest}>
      {/* <ComponentPage.SubTitle>Cli</ComponentPage.SubTitle> */}
      <Terminal packageManagerCommands={packageManagerCommands} />
    </section>
  );
};
