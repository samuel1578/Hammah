"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

/*
 * Logo file semantics (verified by visual inspection):
 * - logo-*-light.png = dark/black artwork → for use on LIGHT backgrounds
 * - logo-*-dark.png  = white/light artwork → for use on DARK backgrounds
 */

interface BrandLogoProps {
  variant: "primary" | "secondary";
  className?: string;
  /** Override theme detection. "light" = dark artwork for light bg, "dark" = white artwork for dark bg. */
  forceTheme?: "light" | "dark";
}

const logos = {
  primary: {
    light: "/images/hammah/global/logo/logo-primary-light.png",
    dark: "/images/hammah/global/logo/logo-primary-dark.png",
  },
  secondary: {
    light: "/images/hammah/global/logo/logo-secondary-light.png",
    dark: "/images/hammah/global/logo/logo-secondary-dark.png",
  },
} as const;

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function BrandLogo({ variant, className = "", forceTheme }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const isClient = useIsClient();

  const isDark = forceTheme === "dark" || (isClient && resolvedTheme === "dark");
  const src = isDark ? logos[variant].dark : logos[variant].light;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="SL by Hammah"
      className={className}
    />
  );
}
