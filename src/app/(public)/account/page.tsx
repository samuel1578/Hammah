import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Heart, User, Package } from "lucide-react";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, date_of_birth, created_at")
    .eq("id", user!.id)
    .single();

  const joinYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : null;

  const cards = [
    {
      href: "/account/orders",
      label: "Orders",
      icon: Package,
      description: "Your order history and status.",
    },
    {
      href: "/account/profile",
      label: "Profile",
      icon: User,
      description: "Manage your name, phone, and birthday.",
    },
    {
      href: "/account/saved",
      label: "Saved Pieces",
      icon: Heart,
      description: "Designs you've saved for later.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          {profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : "Hamatee"}
          {joinYear && (
            <span className="ml-2">Hamatee since {joinYear}</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:bg-surface-elevated"
          >
            <card.icon className="mb-3 h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
            <p className="text-sm font-medium text-foreground">{card.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-md border border-border bg-surface p-5">
        <p className="text-sm font-medium text-foreground">Details</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex gap-4">
            <dt className="w-24 text-muted-foreground">Email</dt>
            <dd className="text-foreground">{user!.email}</dd>
          </div>
          {profile?.phone && (
            <div className="flex gap-4">
              <dt className="w-24 text-muted-foreground">Phone</dt>
              <dd className="text-foreground">{profile.phone}</dd>
            </div>
          )}
          {profile?.date_of_birth && (
            <div className="flex gap-4">
              <dt className="w-24 text-muted-foreground">Birthday</dt>
              <dd className="text-foreground">
                {new Date(profile.date_of_birth).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                })}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
