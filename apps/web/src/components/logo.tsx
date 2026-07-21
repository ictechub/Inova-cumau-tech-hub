import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_SRC = {
  color: "/logo/color.svg",
  white: "/logo/white.svg",
  dark: "/logo/dark.svg",
  floresta900: "/logo/floresta900.svg",
  floresta300: "/logo/floresta300.svg",
} as const;

export function Logo({
  variant = "color",
  className,
}: {
  variant?: keyof typeof LOGO_SRC;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_SRC[variant]}
      alt="Inova Cumaú"
      width={40}
      height={44}
      className={cn("h-9 w-auto", className)}
      priority
    />
  );
}
