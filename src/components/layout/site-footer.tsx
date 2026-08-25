import Link from "next/link";
import { footerNavigation } from "@/data/navigation";
import { Container } from "@/components/ui/container";
import { BrandLogo } from "@/components/brand/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface" role="contentinfo">
      <Container className="py-12 md:py-16">
        {/* Brand + tagline */}
        <div className="mb-10 md:mb-12">
          <BrandLogo variant="secondary" className="h-[80px] sm:h-[90px] md:h-[105px] w-auto" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Considered essentials, cut for people who don&apos;t dress for
            anyone else.
          </p>
        </div>

        {/* Navigation columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
          {footerNavigation.map((group) => (
            <div key={group.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social + copyright */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <div className="flex gap-6">
            {/* TODO: Add real social URLs when available */}
            <span className="text-sm text-muted-foreground">Instagram</span>
            <span className="text-sm text-muted-foreground">WhatsApp</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} SL by Hammah. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
