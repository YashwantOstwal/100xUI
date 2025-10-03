import { InPageNavbar } from "./in-page-navbar";

export function InPageNavbarDemo() {
  return <InPageNavbar logo={logo} sections={sections} />;
}

const logo = (
    <div className="px-1 text-lg leading-none font-semibold sm:py-0.5">
      100<span className="text-destructive">x</span>U
      <span className="text-destructive">I</span>
    </div>
  ),
  sections = [
    {
      label: "About",
      id: "about",
    },
    {
      label: "Pricing",
      id: "pricing",
    },
    {
      label: "API Usage",
      id: "api-usage",
    },
    {
      label: "Installation",
      id: "installation",
    },
    {
      label: "Documentation",
      id: "documentation",
    },
  ];
