import { TextSwitcher } from "./text-switcher";

export function TextSwitcherDemo() {
  return (
    <div className="text-sm sm:text-base md:text-xl lg:text-2xl">
      As someone who styles divs and <br className="md:hidden" /> solves
      backend&nbsp;
      <br className="max-md:hidden" />
      nightmares, I write <br className="md:hidden" />
      code that&nbsp;
      <TextSwitcher
        phrases={["compiles", "ships", "breaks", "runs anyway"]}
        className="font-medium"
      />
    </div>
  );
}
