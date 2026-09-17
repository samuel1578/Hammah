import { createAdminClient } from "@/lib/supabase/admin";

export type EnrolmentStatus =
  | "pending"
  | "invited"
  | "activated"
  | "existing_account"
  | "failed"
  | "cancelled";

export interface HamateeEnrolment {
  id: string;
  orderId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string;
  status: EnrolmentStatus;
  activatedUserId: string | null;
  createdAt: string;
  updatedAt: string;
  activatedAt: string | null;
  lastError: string | null;
}

export interface CreateEnrolmentResult {
  enrolmentId: string;
  status: EnrolmentStatus;
}

/**
 * Create a Hamatee enrolment intent after a successful guest order with birthday.
 * Runs server-side with service-role client (bypasses RLS).
 *
 * The RPC function handles existing account detection via SQL.
 * Returns the enrolment status so the caller can determine messaging.
 * Does NOT throw on failure — returns a safe failure status instead.
 * Order success must never be rolled back due to enrolment failure.
 */
export async function createHamateeEnrolment(params: {
  orderId: string;
  email: string;
  dateOfBirth: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}): Promise<CreateEnrolmentResult> {
  const supabase = createAdminClient();

  try {
    // The RPC function checks if email belongs to an existing auth user
    // and sets status accordingly (pending vs existing_account)
    const { data, error } = await supabase.rpc("create_hamatee_enrolment", {
      p_order_id: params.orderId,
      p_email: params.email,
      p_date_of_birth: params.dateOfBirth,
      p_first_name: params.firstName ?? null,
      p_last_name: params.lastName ?? null,
      p_phone: params.phone ?? null,
    });

    if (error) {
      console.error("[enrolment] create_hamatee_enrolment failed", {
        code: error.code,
        message: error.message,
        orderId: params.orderId,
      });
      return { enrolmentId: "", status: "failed" };
    }

    const enrolmentId = data as string;

    // Now check the actual status that was set by the RPC
    const { data: enrolment } = await supabase
      .from("hamatee_enrolments")
      .select("status")
      .eq("id", enrolmentId)
      .single();

    const status: EnrolmentStatus = (enrolment?.status as EnrolmentStatus) ?? "pending";

    return { enrolmentId, status };
  } catch (err) {
    console.error("[enrolment] unexpected error", err);
    return { enrolmentId: "", status: "failed" };
  }
}
