"use client";

import * as React from "react";
import { SunIcon, MoonIcon, LaptopIcon, SunMoonIcon } from "lucide-react";

import {
  MenuWheel,
  MenuWheelContainer,
  MenuWheelItem,
  MenuWheelTrigger,
} from "./menu-wheel";
import { useTheme } from "next-themes";

export function MenuWheelDemo() {
  const { theme, setTheme } = useTheme();
  return (
    <MenuWheel
      defaultValue={theme}
      showCurrent
      onValueChange={(value: string) => setTheme(value)}
    >
      <MenuWheelTrigger>
        <SunMoonIcon />
      </MenuWheelTrigger>
      <MenuWheelContainer>
        <MenuWheelItem index={0} value="light">
          <SunIcon />
        </MenuWheelItem>
        <MenuWheelItem index={1} value="dark">
          <MoonIcon />
        </MenuWheelItem>
        <MenuWheelItem index={2} value="system">
          <LaptopIcon />
        </MenuWheelItem>
      </MenuWheelContainer>
    </MenuWheel>
  );
}
