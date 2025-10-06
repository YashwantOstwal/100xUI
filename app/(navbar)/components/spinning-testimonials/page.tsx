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
import { SpinningTestimonialsDemo } from "@/components/spinning-testimonials.demo";
import { Metadata } from "next";
import { PackageManagerProvider } from "@/components/www/package-manager-providers";
import AnimatedTab from "@/components/www/animated-tab";
import { AnimatedTabsProvider } from "@/components/www/animated-tabs-provider";
import React from "react";
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
        url: `/og/${TITLE.toLowerCase().replaceAll(" ", "-")}.png`,
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};
export default function SpinningTestimonialsPage() {
  return (
    <ComponentPage>
      <ComponentPage.Title>{TITLE}</ComponentPage.Title>
      <ComponentPage.Description className="mb-16">
        {DESCRIPTION}
      </ComponentPage.Description>
      <SpinningTestimonialsDemo />
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
                <AnimatedTab className="mt-0.5" trackerFor="step-1">
                  1
                </AnimatedTab>
                Install the following dependencies.
              </ComponentPage.Note>
              <ComponentPage.Dependencies
                dependencies={[
                  "motion",
                  "clsx",
                  "tailwind-merge",
                  "@radix-ui/react-avatar",
                ]}
              />
            </div>
            <div className="mb-6" data-tracker="step-2">
              <ComponentPage.Note>
                <AnimatedTab className="mt-0.5" trackerFor="step-2">
                  2
                </AnimatedTab>
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
                <AnimatedTab className="mt-0.5" trackerFor="step-3">
                  3
                </AnimatedTab>
                Finally, Update the import paths to match your project setup.
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
                  <span className="bg-muted text-muted-foreground border border-dashed p-0.5">
                    {eachTitle}
                  </span>
                </React.Fragment>
              ))}
            </ComponentPage.SubSubTitle>
            <ComponentPage.PropsTable tableData={tableData} />
          </React.Fragment>
        ))}
        <ComponentPage.SubSubTitle className="flex flex-col items-start text-base font-medium sm:text-lg">
          {[
            "<TestimonialAvatar/>",
            "<TestimonialAvatarImage/>",
            "<TestimonialAvatarFallback/>",
          ].map((eachTitle) => (
            <span
              key={eachTitle}
              className="bg-muted text-muted-foreground border border-dashed p-0.5"
            >
              {eachTitle}
            </span>
          ))}
        </ComponentPage.SubSubTitle>
        <ComponentPage.Note className="mb-10 block max-w-(--breakpoint-md) leading-relaxed">
          These components wrap shadcn/ui&apos;s&nbsp;
          <span className="bg-muted text-muted-foreground border border-dashed p-0.5">{`<Avatar/>`}</span>
          ,&nbsp;
          <span className="bg-muted text-muted-foreground border border-dashed p-0.5">{`<AvatarImage/>`}</span>
          , and&nbsp;
          <span className="bg-muted text-muted-foreground border border-dashed p-0.5">{`<AvatarFallback/>`}</span>
          , respectively, applying custom styling for the testimonial layout.
          See the&nbsp;
          <Link
            href="https://ui.shadcn.com/docs/components/avatar"
            className="text-cyan-700"
          >
            API reference
          </Link>
          &nbsp;for details .
        </ComponentPage.Note>
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
