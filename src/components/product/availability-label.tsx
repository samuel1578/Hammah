import type { Availability } from "@/types/products";

interface AvailabilityLabelProps {
  availability: Availability;
  className?: string;
}

export function AvailabilityLabel({ availability, className = "" }: AvailabilityLabelProps) {
  const isAvailable = availability === "AVAILABLE";

  return (
    <span
      className={`availability-badge ${className}`}
    >
      {isAvailable ? "Available" : "Coming soon"}
    </span>
  );
}
