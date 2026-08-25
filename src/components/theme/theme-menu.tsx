"use client";

import { useTheme } from "next-themes";
import { Monitor, Sun, Moon, Check } from "lucide-react";
import { useSyncExternalStore, useState, useRef, useEffect } from "react";

const themes = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const mounted = useIsHydrated();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!mounted) {
    return (
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground opacity-50">
        <Monitor className="h-4 w-4" />
      </div>
    );
  }

  const currentTheme = themes.find((t) => t.value === theme) ?? themes[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-foreground transition-colors hover:bg-surface-elevated"
        aria-label={`Theme: ${currentTheme.label}. Click to change.`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <currentTheme.Icon className="h-3.5 w-3.5" />
        <span className="hidden xl:inline">{currentTheme.label}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-border bg-surface p-1 shadow-lg"
          role="menu"
          aria-label="Theme options"
        >
          {themes.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                theme === value
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              }`}
              role="menuitem"
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {theme === value && <Check className="ml-auto h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
