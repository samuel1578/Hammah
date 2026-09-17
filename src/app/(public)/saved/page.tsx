import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { TextReveal } from "@/components/motion/text-reveal";
import { Reveal } from "@/components/motion/reveal";

export const metadata = {
  title: "Saved Pieces | SL by Hammah",
};

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/account/saved");
  }

  return (
    <section className="py-20 md:py-32" aria-labelledby="saved-heading">
      <Container>
        <div className="mb-8 md:mb-12">
          <TextReveal
            as="h1"
            id="saved-heading"
            className="font-serif italic text-4xl tracking-tight text-foreground sm:text-5xl"
          >
            Saved
          </TextReveal>
          <Reveal delay={0.1} y={12}>
            <p className="mt-3 text-muted-foreground">Saved Pieces</p>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="py-20 text-center">
            <p className="text-2xl font-serif italic text-foreground">
              Keep your saved pieces together.
            </p>
            <p className="mt-3 max-w-sm mx-auto text-sm text-muted-foreground">
              Join the Hammah Legacy or sign in to keep saved pieces connected
              to your account.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-md btn-engraved-secondary px-5 text-sm font-medium"
              >
                Join the Legacy
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
