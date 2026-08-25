"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";

interface TocItem {
  id: string;
  label: string;
}

interface LegalTableOfContentsProps {
  items: TocItem[];
}

export function LegalTableOfContents({ items }: LegalTableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? "auto" : "smooth", block: "start" });
    }
  };

  return (
    <nav aria-label="Page sections" className="sticky top-24">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleClick(item.id)}
              className={`w-full text-left text-sm leading-relaxed transition-colors ${
                activeId === item.id
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeId === item.id && (
                <motion.span
                  layoutId="toc-indicator"
                  className="absolute -left-3 top-0 h-full w-px bg-accent"
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                />
              )}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
