import { Reveal } from "@/components/motion/reveal";

interface LegalSectionProps {
  id: string;
  heading: string;
  children: React.ReactNode;
  headingLevel?: "h2" | "h3";
  working?: boolean;
}

export function LegalSection({
  id,
  heading,
  children,
  headingLevel = "h2",
  working = false,
}: LegalSectionProps) {
  const Tag = headingLevel;

  return (
    <section id={id} className="scroll-mt-24">
      <Reveal>
        <div className="flex items-center gap-3">
          <Tag
            className={`font-serif italic tracking-tight text-foreground ${
              headingLevel === "h2"
                ? "text-2xl sm:text-3xl"
                : "text-xl sm:text-2xl"
            }`}
          >
            {heading}
          </Tag>
          {working && (
            <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Working policy
            </span>
          )}
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
          {children}
        </div>
      </Reveal>
    </section>
  );
}
