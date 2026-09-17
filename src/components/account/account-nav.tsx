"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Heart, Package, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/saved", label: "Saved Pieces", icon: Heart },
  { href: "/account/orders", label: "Orders", icon: Package },
] as const;

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/account") return pathname === "/account";
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav aria-label="Account navigation" className="space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
          }`}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Sign Out
      </button>
    </nav>
  );
}
