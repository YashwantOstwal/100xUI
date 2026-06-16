import {
  ComponentGridItem,
  type ComponentGridItemProps,
} from "./component-grid-item";
import SpinningTestimonialsShowcase from "@/public/og/spinning-testimonials.png";
import MotionLinkShowcase from "@/public/og/motion-link.png";

import ParallaxCardsShowcase from "@/public/og/parallax-cards.png";
import InPageNavbarShowcase from "@/public/og/in-page-navbar.png";
import MotionDockShowcase from "@/public/og/motion-dock.png";
import TextSwitcherShowcase from "@/public/og/text-switcher.png";
import MorphModal from "@/public/og/morph-modal.png";
import Default from "@/public/og/default.png";
import ChatBentoCard from "@/public/og/chat-bento-card.png";
import AppleGallery from "@/public/og/apple-gallery.png";
import Iphone3DMockup from "@/public/og/iphone-3d-mockup.png";
import MenuWheel from "@/public/og/menu-wheel.png";
const components: ComponentGridItemProps[] = [
  {
    name: "Menu wheel",
    href: "/components/menu-wheel",
    imgProps: {
      src: MenuWheel,
      alt: "menu-wheel-display",
    },
  },
  {
    name: "iPhone 3D mockup",
    href: "/components/iphone-3d-mockup",
    imgProps: {
      src: Iphone3DMockup,
      alt: "iphone-3d-mockup",
    },
  },
  {
    name: "Apple gallery",
    href: "/components/apple-gallery",
    imgProps: {
      src: AppleGallery,
      alt: "apple-gallery",
    },
  },
  {
    name: "Chat bento card",
    href: "/components/chat-bento-card",
    imgProps: {
      src: ChatBentoCard,
      alt: "chat-bento-card",
    },
  },
  {
    name: "Spinning testimonials",
    href: "/components/spinning-testimonials",
    imgProps: {
      src: SpinningTestimonialsShowcase,
      alt: "spinning-testimonials",
    },
  },
  {
    name: "Motion dock",
    href: "/components/motion-dock",
    imgProps: {
      src: MotionDockShowcase,
      alt: "motion-dock",
    },
  },
  {
    name: "Parallax cards",
    href: "/components/parallax-cards",
    imgProps: {
      src: ParallaxCardsShowcase,
      alt: "parallax-cards",
    },
  },
  {
    name: "Morph modal",
    href: "/components/morph-modal",
    imgProps: {
      src: MorphModal,
      alt: "morph-modal",
    },
  },

  {
    name: "Motion link",
    href: "/components/motion-link",
    imgProps: {
      src: MotionLinkShowcase,
      alt: "motion-link",
    },
  },

  {
    name: "In-page navbar",
    href: "/components/in-page-navbar",
    imgProps: {
      src: InPageNavbarShowcase,
      alt: "in-page-navbar",
    },
  },
  {
    name: "Text switcher",
    href: "/components/text-switcher",
    imgProps: {
      src: TextSwitcherShowcase,
      alt: "text-switcher",
    },
  },

  {
    name: "Notification",
    href: "/components/notification",
    imgProps: {
      src: Default,
      alt: "notification",
    },
  },
];

export function ComponentsGrid() {
  return (
    <section
      id="components"
      className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-x-3 gap-y-2.5 pt-8 sm:grid-cols-2"
    >
      {components.map((props) => (
        <ComponentGridItem key={props.href} {...props} />
      ))}
    </section>
  );
}
