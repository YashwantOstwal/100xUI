"use client";

import Button from "@/components/www/file-explorer/button";
export function SmoothScrollA({
  href,
  ...rest
}: React.ComponentPropsWithoutRef<"a"> & { href: string }) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.history.pushState(null, "", `${href}`);
    const el = document.getElementById(href.slice(1));
    if (!el) return console.error(`no element with id ${href} found.`);
    el.scrollIntoView({ behavior: "smooth" });
  };
  return <Button as="a" href={href} onClick={onClick} {...rest} />;
}
