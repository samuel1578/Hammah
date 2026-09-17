"use client";

import { Camera, Video } from "lucide-react";
import type { MediaMode } from "@/types/products";

interface MediaModeSelectorProps {
  videoUrl?: string | null;
  activeMode: MediaMode;
  onChange?: (mode: MediaMode) => void;
}

export function MediaModeSelector({ videoUrl, activeMode, onChange }: MediaModeSelectorProps) {
  const modes: { value: MediaMode; label: string; Icon: typeof Camera }[] = [
    { value: "photos", label: "Photos", Icon: Camera },
    ...(videoUrl ? [{ value: "video" as const, label: "Video", Icon: Video }] : []),
  ];

  if (modes.length <= 1) return null;

  return (
    <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
      {modes.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange?.(value)}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            activeMode === value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={activeMode === value}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
