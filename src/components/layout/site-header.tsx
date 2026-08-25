"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { User, Heart, Menu, Search } from "lucide-react";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { BrandLogo } from "@/components/brand/brand-logo";
import { primaryNavigation } from "@/data/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => document.body.classList.remove("menu-open");
  }, [mobileOpen]);

  const isSolid = !isHome || scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isSolid
            ? "h-14 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
            : "h-16 border-b border-transparent bg-transparent"
        }`}
        role="banner"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:text-accent lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Brand — mobile center, desktop left */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 h-full flex items-center"
          >
            <BrandLogo variant="primary" className="h-6 w-auto" />
          </Link>

          {/* Primary navigation — desktop */}
          <nav className="hidden lg:flex lg:items-center lg:gap-8" aria-label="Primary">
            {primaryNavigation.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-foreground"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Utility actions — desktop */}
          <div className="hidden items-center gap-1 lg:flex">
            {/* Search — placeholder until backend search is implemented */}
            <button
              type="button"
              disabled
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/40 cursor-not-allowed"
              aria-label="Search (coming soon)"
              title="Search coming soon"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/saved"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:text-foreground"
              aria-label="Saved items"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:text-foreground"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>
            <ThemeMenu />
          </div>

          {/* Mobile utility */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              disabled
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/40 cursor-not-allowed"
              aria-label="Search (coming soon)"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/saved"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70"
              aria-label="Saved items"
            >
              <Heart className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70"
              aria-label="Account"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
