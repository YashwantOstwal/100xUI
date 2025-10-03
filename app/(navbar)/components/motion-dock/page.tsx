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
import { PackageManagerProvider } from "@/components/package-manager-providers";
import AnimatedTab from "@/components/animated-tab";
import { AnimatedTabsProvider } from "@/components/animated-tabs-provider";
import { MotionDockDemo } from "@/components/(package)/motion-dock/motion-dock.demo";
import Link from "next/link";

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
      <ComponentPage.Description>
        {DESCRIPTION}&nbsp; Designed by my favorite -&nbsp;
        <Link href="https://rauno.me/craft" className="text-cyan-700">
          Rauno Freiberg
        </Link>
        .
      </ComponentPage.Description>
      <ComponentPage.Preview>
        <MotionDockDemo />
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
        <ComponentPage.PropsTable tableData={PROP_TABLE.tableData} />
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
