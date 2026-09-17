"use client";

interface ProductVideoProps {
  videoUrl: string;
  alt: string;
}

export function ProductVideo({ videoUrl, alt }: ProductVideoProps) {
  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <video
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          aria-label={alt}
        >
          <source src={videoUrl} />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
