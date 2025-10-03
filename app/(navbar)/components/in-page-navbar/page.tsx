import { ComponentPage } from "../_components/container";
import {
  TITLE,
  DESCRIPTION,
  DEFAULT_ACTIVE_FILE,
  ROOT_DIRECTORY,
  PROP_TABLE,
  ADDITIONAL_INFORMATION,
  USAGE,
} from "./page.data";
import { Metadata } from "next";
import { PackageManagerProvider } from "@/components/package-manager-providers";
import AnimatedTab from "@/components/animated-tab";
import { AnimatedTabsProvider } from "@/components/animated-tabs-provider";
import PlaceHolder from "@/components/place-holder";
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
        url: `/og/${TITLE.toLowerCase().replaceAll(" ", "-")}.png`,
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};
export default function InPageNavbarPage() {
  return (
    <ComponentPage>
      <ComponentPage.Title>{TITLE}</ComponentPage.Title>
      <ComponentPage.Description>{DESCRIPTION}</ComponentPage.Description>
      <div className="-mx-2 space-y-1 py-10 lg:-mx-3">
        {[
          {
            id: "about",
            className: "h-160",
          },
          {
            id: "pricing",
            className: "h-fit",
          },
        ].map(({ id, className }, i) => (
          <PlaceHolder
            msg1={`id="${id}" className="${className}"`}
            msg2="This is still a server component."
            center={
              <p className="px-2 py-10 text-center text-sm leading-tight after:content-['Open_the_sidebar_for_section_progress_as_you_scroll.'] sm:py-16 sm:text-base sm:after:content-['Watch_the_navbar_for_section_progress_as_you_scroll.']" />
            }
            key={id}
            index={i}
            id={id}
            className={className}
          />
        ))}
      </div>
      <ComponentPage.Usage id="api-usage" {...USAGE} />
      <ComponentPage.Installation id="installation">
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
                <AnimatedTab className="mt-0.5" trackerFor="step-1">
                  1
                </AnimatedTab>
                Install the following dependencies.
              </ComponentPage.Note>
              <ComponentPage.Dependencies
                dependencies={["clsx", "lucide-react", "motion", "tw-merge"]}
              />
            </div>
            <div className="mb-6" data-tracker="step-2">
              <ComponentPage.Note>
                <AnimatedTab className="mt-0.5" trackerFor="step-2">
                  2
                </AnimatedTab>
                Copy and paste the following code into your project.
              </ComponentPage.Note>
              <ComponentPage.FileExplorer
                defaultActiveFile={DEFAULT_ACTIVE_FILE}
                rootDirectory={ROOT_DIRECTORY}
              />
            </div>
            <div className="-mt-6 -mb-12 pt-6 pb-12" data-tracker="step-3">
              <ComponentPage.Note>
                <AnimatedTab className="mt-0.5" trackerFor="step-3">
                  3
                </AnimatedTab>{" "}
                Finally, Update the import paths to match your project setup.
              </ComponentPage.Note>
            </div>
          </AnimatedTabsProvider>
        </PackageManagerProvider>
      </ComponentPage.Installation>
      <ComponentPage.Documentation id="documentation">
        <ComponentPage.PropsTable tableData={PROP_TABLE.tableData} />
        {ADDITIONAL_INFORMATION.map((props, index) => (
          <ComponentPage.ListContainer
            {...props}
            key={`container-${index + 1}`}
          />
        ))}
      </ComponentPage.Documentation>
    </ComponentPage>
  );
}
