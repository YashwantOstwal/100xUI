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

const IPHONE_FEATURE_IMAGES_PROPS = [
  { src: CeramicShield, alt: "Ceramic Shield" },
  { src: Cameras, alt: "Cameras" },
  { src: ChipBattery, alt: "Chip & Battery" },
  { src: FrontCamera, alt: "Front Camera" },
  { src: Intelligence, alt: "Intelligence" },
];

export function AppleGalleryDemo() {
  return (
    <AppleGallery>
      <AppleGalleryContainer className="h-160">
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
