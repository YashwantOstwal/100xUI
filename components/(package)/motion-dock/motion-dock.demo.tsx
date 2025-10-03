import {
  CpuIcon,
  PaperclipIcon,
  GlobeIcon,
  MicIcon,
  AudioLinesIcon,
} from "lucide-react";

import { MotionDock, type MotionDockProps } from "./motion-dock";

export function MotionDockDemo() {
  return <MotionDock {...demoProps} />;
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
      className:
        "text-cyan-600 hover:text-cyan-500 focus-visible:text-cyan-500",
    },
  ],
};
