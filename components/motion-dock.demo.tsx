import {
  CpuIcon,
  PaperclipIcon,
  GlobeIcon,
  MicIcon,
  AudioLinesIcon,
} from "lucide-react";

import { MotionDock, type MotionDockProps } from "./motion-dock";

export function MotionDockDemo() {
  return <MotionDock className="[&_svg]:size-4.5" {...demoProps} />;
}
const demoProps: MotionDockProps = {
  dockItems: [
    {
      icon: <CpuIcon />,
      tooltip: "Choose a model",
    },
    {
      icon: <GlobeIcon />,
      tooltip: "Set sources for search",
    },
    {
      icon: <PaperclipIcon />,
      tooltip: "Attach files",
    },

    {
      icon: <MicIcon />,
      tooltip: "Dictation",
    },
    {
      icon: <AudioLinesIcon />,
      tooltip: "Voice mode",
      className: "text-destructive",
    },
  ],
};
