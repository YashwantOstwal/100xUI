import React from "react";
import { ComponentPage } from "../_components/container";
import {
  TITLE,
  DESCRIPTION,
  DEFAULT_ACTIVE_FILE,
  ROOT_DIRECTORY,
  PROP_TABLE,
  USAGE,
} from "./page.data";
import { ThemePresetSwitcher } from "@/components/theme-preset-switcher";
import { MotionLinkDemo } from "@/components/motion-link.demo";
import { Metadata } from "next";
import { PackageManagerProvider } from "@/components/www/package-manager-providers";
import AnimatedTab from "@/components/www/animated-tab";
import { AnimatedTabsProvider } from "@/components/www/animated-tabs-provider";

export const metadata: Metadata = {
  title: TITLE,
  description: `Exclusive to Next.js. A reusable component that extends the <Link/> component from "next/link" to power interactive animations using motion.dev. It includes three predefined variants: <MotionLinkUnderline/>, <MotionLinkSlideText/>, and <MotionLinkWithIcon/>, while the base <MotionLink/> provides full flexibility to define custom animations with MotionProps like whileFocus, whileHover, and whileInView.`,
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: `${TITLE} | 100xUI`,
    description: `Exclusive to Next.js. A reusable component that extends the <Link/> component from "next/link" to power interactive animations using motion.dev. It includes three predefined variants: <MotionLinkUnderline/>, <MotionLinkSlideText/>, and <MotionLinkWithIcon/>, while the base <MotionLink/> provides full flexibility to define custom animations with MotionProps like whileFocus, whileHover, and whileInView.`,
    images: [
      {
        url: `/og/motion-dock.png`,
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

// const IDS = [
//   "api-ref-underline",
//   "api-ref-slide-text",
//   "api-ref-with-icon",
//   "api-ref-base",
// ];
export default function MotionLink() {
  return (
    <ComponentPage>
      <ComponentPage.Title>{TITLE}</ComponentPage.Title>
      <ComponentPage.Description>{DESCRIPTION}</ComponentPage.Description>

      <ThemePresetSwitcher />
      <ComponentPage.Preview>
        <MotionLinkDemo />
      </ComponentPage.Preview>

      <ComponentPage.Usage {...USAGE} />
      <ComponentPage.Installation>
        <ComponentPage.SubTitle>Installation</ComponentPage.SubTitle>
        <PackageManagerProvider>
          <div className="mb-10">
            <ComponentPage.SubSubTitle>
              CLI&nbsp;
              <i className="text-base font-light">(recommended)</i>
            </ComponentPage.SubSubTitle>
            <ComponentPage.Note note="cli-installation-step-1"></ComponentPage.Note>
            <ComponentPage.Cli title={TITLE}></ComponentPage.Cli>
          </div>
          <AnimatedTabsProvider>
            <ComponentPage.SubSubTitle>Manual</ComponentPage.SubSubTitle>
            <div className="mb-6" data-tracker="step-1">
              <ComponentPage.Note>
                <AnimatedTab trackerFor="step-1">1</AnimatedTab>
                Install the following dependencies.
              </ComponentPage.Note>
              <ComponentPage.Dependencies
                dependencies={["motion", "clsx", "tailwind-merge"]}
              />
            </div>
            <div className="mb-6" data-tracker="step-2">
              <ComponentPage.Note>
                <AnimatedTab trackerFor="step-2">2</AnimatedTab>
                Copy and paste the following code into your project. To apply
                your own styles, simply skip copying the stylesheet.
              </ComponentPage.Note>
              <ComponentPage.FileExplorer
                defaultActiveFile={DEFAULT_ACTIVE_FILE}
                rootDirectory={ROOT_DIRECTORY}
              />
            </div>
            <div className="-mt-6 -mb-12 pt-6 pb-12" data-tracker="step-3">
              <ComponentPage.Note>
                <AnimatedTab trackerFor="step-3">3</AnimatedTab> Finally, Update
                the import paths to match your project setup.
              </ComponentPage.Note>
            </div>
          </AnimatedTabsProvider>
        </PackageManagerProvider>
      </ComponentPage.Installation>
      <ComponentPage.Documentation>
        {PROP_TABLE.data.map(({ title, tableData }, i) => (
          // <div key={i} className="not-last:mb-10">
          <React.Fragment key={i}>
            <ComponentPage.SubSubTitle className="flex flex-col items-start text-base font-medium sm:text-lg">
              {title.map((eachTitle) => (
                <React.Fragment key={eachTitle}>
                  <span className="bg-muted text-muted-foreground p-0.5">
                    {eachTitle}
                  </span>
                </React.Fragment>
              ))}
            </ComponentPage.SubSubTitle>
            <ComponentPage.PropsTable tableData={tableData} />
          </React.Fragment>
          // </div>
        ))}
      </ComponentPage.Documentation>
    </ComponentPage>
  );
}
