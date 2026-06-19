"use client";

import { useSpring, useTransform } from "motion/react";
import { motion } from "motion/react";
import Image from "next/image";

import { IPhone3DMockup, IPhone3DMockupScreen } from "./iphone-3d-mockup";
import appStoreScreenshot from "@/public/demo/iphone-3d-mockup/app-store-screenshot.jpeg";

const MotionIPhone3DMockup = motion.create(IPhone3DMockup); // Creating a motion-enhanced version of the IPhone3DMockup component

export function IPhone3DMockupDemo() {
  const mouseXProgress = useSpring(0.1);
  const mouseYProgress = useSpring(0.9);

  const rotateX = useTransform(mouseYProgress, [0, 1], ["25deg", "-25deg"]);
  const rotateY = useTransform(mouseXProgress, [0, 1], ["-35deg", "35deg"]);

  const handleMouseMove = (e: any) => {
    const { width, height, x, y } = e.target.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const relativeX = (mouseX - x) / width;
    const relativeY = (mouseY - y) / height;
    mouseXProgress.set(relativeX);
    mouseYProgress.set(relativeY);
  };
  const handleMouseLeave = () => {
    mouseXProgress.set(0.5);
    mouseYProgress.set(0.5);
  };
  return (
    <div
      className="py-20"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <MotionIPhone3DMockup
        style={{ rotateX, rotateY }}
        className="pointer-events-none mx-auto"
      >
        <IPhone3DMockupScreen>
          <Image src={appStoreScreenshot} alt="" className="h-full" />
        </IPhone3DMockupScreen>
      </MotionIPhone3DMockup>
    </div>
  );
}
