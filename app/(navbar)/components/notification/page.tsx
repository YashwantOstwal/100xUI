import { ComponentPage } from "../_components/container";
import {
  TITLE,
  DESCRIPTION,
  DEFAULT_ACTIVE_FILE,
  ROOT_DIRECTORY,
  PROP_TABLE,
  // ADDITIONAL_INFORMATION,
  USAGE,
} from "./page.data";
import { Metadata } from "next";
import { PackageManagerProvider } from "@/components/www/package-manager-providers";
import AnimatedTab from "@/components/www/animated-tab";
import { AnimatedTabsProvider } from "@/components/www/animated-tabs-provider";
import { ThemePresetSwitcher } from "../../../../components/theme-preset-switcher";
import { NotificationDemo } from "@/components/notification.demo";
import React from "react";
import PlaceHolder from "@/components/www/place-holder";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  twitter: {
    card: "summary_large_image",
  },
  openGraph: {
    title: `${TITLE} | 100xUI`,
    description: DESCRIPTION,
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
export default function MotionDockPage() {
  return (
    <ComponentPage>
      <ComponentPage.Title>{TITLE}</ComponentPage.Title>
      <ComponentPage.Description>{DESCRIPTION}</ComponentPage.Description>
      <ThemePresetSwitcher />
      <PlaceHolder
        center={
          <p className="grid h-75 place-items-center px-2 text-center text-sm leading-tight sm:h-100 sm:text-base">
            &quot;Please direct your attention to the bottom-right corner of the
            viewport for a preview.&quot;
          </p>
        }
        className="-mx-2 my-10 lg:-mx-3"
      />
      <ComponentPage.Preview container={false}>
        <NotificationDemo />
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
                dependencies={[
                  "motion",
                  "clsx",
                  "tailwind-merge",
                  "lucide-react",
                ]}
              />
            </div>
            <div className="mb-6" data-tracker="step-2">
              <ComponentPage.Note>
                <AnimatedTab trackerFor="step-2">2</AnimatedTab>
                Copy and paste the following code into your project.
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
        ))}
        {/* {ADDITIONAL_INFORMATION.map((props, index) => (
          <ComponentPage.ListContainer
            {...props}
            key={`container-${index + 1}`}
          />
        ))} */}
      </ComponentPage.Documentation>
    </ComponentPage>
  );
}
