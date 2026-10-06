import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import {
  NotificationRecipientsSettings,
  type NotificationRecipient,
} from "@/components/admin/notification-recipients-settings";

export const metadata: Metadata = {
  title: "Settings | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("notification_recipients")
    .select("id, email, label, enabled, created_at, updated_at")
    .order("email", { ascending: true });

  const initialRecipients = (data as NotificationRecipient[] | null) ?? [];

  return (
    <Container>
      <div className="mb-8">
        <h1
          className="font-serif text-2xl italic text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage how HAMMAH communicates with you
        </p>
      </div>

      <NotificationRecipientsSettings initialRecipients={initialRecipients} />
    </Container>
  );
}
