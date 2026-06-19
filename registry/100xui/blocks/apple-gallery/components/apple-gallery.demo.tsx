"use client";

import Image from "next/image";

import { Card } from "@/components/ui/card";
import {
  AppleGallery,
  AppleGalleryContainer,
  AppleGalleryControls,
} from "./apple-gallery";

import CeramicShield from "@/public/demo/apple-cards-slideshow/CeramicShield.jpeg";
import Cameras from "@/public/demo/apple-cards-slideshow/Cameras.png";
import ChipBattery from "@/public/demo/apple-cards-slideshow/ChipBattery.jpeg";
import FrontCamera from "@/public/demo/apple-cards-slideshow/FrontCamera.jpeg";
import Intelligence from "@/public/demo/apple-cards-slideshow/Intelligence.jpeg";
import { useEffect, useState } from "react";

const IPHONE_FEATURE_IMAGES_PROPS = [
  { src: CeramicShield, alt: "Ceramic Shield" },
  { src: Cameras, alt: "Cameras" },
  { src: ChipBattery, alt: "Chip & Battery" },
  { src: FrontCamera, alt: "Front Camera" },
  { src: Intelligence, alt: "Intelligence" },
];

export function AppleGalleryDemo() {
  const matches = useMediaQuery("(max-width: 767px)");
  return (
    <AppleGallery>
      <AppleGalleryContainer
        {...(matches && {
          paddingInlineInPx: 25,
          gapInPx: 10,
        })}
        className="h-100 max-h-screen md:h-160"
      >
        {IPHONE_FEATURE_IMAGES_PROPS.map((props) => (
          <Card key={props.alt} className="relative overflow-hidden">
            <Image
              fill
              {...props}
              className="size-full object-cover object-top"
            />
          </Card>
        ))}
      </AppleGalleryContainer>
      <AppleGalleryControls />
    </AppleGallery>
  );
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    const isServer = typeof window == "undefined";
    if (isServer) return false;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQueryList = window.matchMedia(query);

    const handleMediaQuery = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQueryList.addEventListener("change", (e) => handleMediaQuery(e));
    return () => {
      mediaQueryList.removeEventListener("change", (e) => handleMediaQuery(e));
    };
  }, [query]);
  return matches;
}
