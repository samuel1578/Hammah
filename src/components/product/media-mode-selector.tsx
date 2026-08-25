"use client";

import { useState } from "react";
import { Camera, Video, Box } from "lucide-react";
import type { MediaMode } from "@/types/products";

const modes: { value: MediaMode; label: string; Icon: typeof Camera }[] = [
  { value: "photos", label: "Photos", Icon: Camera },
  { value: "video", label: "Video", Icon: Video },
  { value: "360", label: "360°", Icon: Box },
];

interface MediaModeSelectorProps {
  onChange?: (mode: MediaMode) => void;
}

export function MediaModeSelector({ onChange }: MediaModeSelectorProps) {
  const [active, setActive] = useState<MediaMode>("photos");

  const handleSelect = (mode: MediaMode) => {
    setActive(mode);
    onChange?.(mode);
  };

  return (
    <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
      {modes.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleSelect(value)}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            active === value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={active === value}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

export function MediaModePlaceholder({ mode }: { mode: MediaMode }) {
  if (mode === "photos") return null;
  return (
    <div className="flex aspect-[3/4] items-center justify-center bg-surface text-center">
      <div className="space-y-2 px-4">
        <p className="text-sm font-medium text-muted-foreground">
          {mode === "video"
            ? "Product video will appear here when available."
            : "Interactive garment view coming later."}
        </p>
      </div>
    </div>
  );
}
