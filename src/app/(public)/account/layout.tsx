import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountNav } from "@/components/account/account-nav";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/ui/container";

export const metadata = {
  title: "My Account | SL by Hammah",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  return (
    <section className="py-12 md:py-20" aria-labelledby="account-heading">
      <Container>
        <div className="mb-8">
          <BrandLogo variant="secondary" className="mb-5 h-[52px] sm:h-[60px] w-auto md:h-[72px] md:mb-6 lg:h-[84px] lg:mb-7" />
          <h1
            id="account-heading"
            className="font-serif italic text-3xl tracking-tight text-foreground sm:text-4xl"
          >
            {profile?.first_name ? `Welcome back, ${profile.first_name}` : "My Account"}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
          <aside className="md:sticky md:top-24 md:self-start">
            <AccountNav />
          </aside>
          <main id="main-content">{children}</main>
        </div>
      </Container>
    </section>
  );
}
