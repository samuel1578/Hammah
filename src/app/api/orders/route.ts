import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createHamateeEnrolment } from "@/lib/hamatee/enrolment";
import type { CreateOrderResponse } from "@/lib/orders/types";

const postgresUuid = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    "Invalid product",
  );

const OrderSchema = z.object({
  customer_name: z.string().min(1, "Name is required").max(200),
  customer_phone: z.string().min(1, "Phone is required").max(50),
  customer_email: z.string().email("Invalid email").max(200).optional().nullable(),
  delivery_region: z.string().min(1, "Region is required").max(200),
  delivery_city: z.string().min(1, "City is required").max(200),
  delivery_area: z.string().max(200).optional().nullable(),
  delivery_landmark: z.string().max(200).optional().nullable(),
  delivery_gps: z.string().max(100).optional().nullable(),
  delivery_notes: z.string().max(500).optional().nullable(),
  customer_note: z.string().max(500).optional().nullable(),
  product_id: postgresUuid,
  variant_value: z.string().max(50).optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum quantity is 10").default(1),
  idempotency_key: z.string().uuid().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = OrderSchema.parse(body);

    // Conditional validation: birthday requires email
    if (parsed.date_of_birth && !parsed.customer_email) {
      return NextResponse.json(
        { error: "Email is required when birthday is provided" },
        { status: 400 },
      );
    }

    // Validate DOB is not a future date
    if (parsed.date_of_birth) {
      const dob = new Date(parsed.date_of_birth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        return NextResponse.json(
          { error: "Please provide a valid birthday" },
          { status: 400 },
        );
      }
    }

    const supabase = createAdminClient();

    // Check for authenticated user (server-side session)
    let userId: string | null = null;
    let isAuthUser = false;

    try {
      const serverClient = await createClient();
      const { data: { user } } = await serverClient.auth.getUser();
      if (user) {
        userId = user.id;
        isAuthUser = true;
      }
    } catch {
      // Session check failed — proceed as guest
    }

    // Determine source
    const source = isAuthUser ? "hamatee" : "website_guest";

    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: parsed.customer_name,
      p_customer_phone: parsed.customer_phone,
      p_customer_email: parsed.customer_email ?? null,
      p_delivery_region: parsed.delivery_region,
      p_delivery_city: parsed.delivery_city,
      p_delivery_area: parsed.delivery_area ?? null,
      p_delivery_landmark: parsed.delivery_landmark ?? null,
      p_delivery_gps: parsed.delivery_gps ?? null,
      p_delivery_notes: parsed.delivery_notes ?? null,
      p_customer_note: parsed.customer_note ?? null,
      p_product_id: parsed.product_id,
      p_variant_value: parsed.variant_value ?? null,
      p_quantity: parsed.quantity,
      p_idempotency_key: parsed.idempotency_key ?? null,
      p_user_id: userId,
      p_source: source,
    });

    if (error) {
      console.error("[orders] create_order_rpc failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Pass through known customer-safe validation messages
      const safeMessages = [
        "Please select a size before placing your order.",
        "Selected size is not available",
        "Variant not found for this product",
        "Product is not currently available",
        "Product not found or not available",
      ];
      const customerMessage = safeMessages.includes(error.message)
        ? error.message
        : "Failed to create order";

      return NextResponse.json(
        { error: customerMessage },
        { status: 400 },
      );
    }

    const result = (data as CreateOrderResponse[])?.[0];

    if (!result) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Handle Hamatee enrolment for guest birthday submissions
    // Order success is never rolled back if enrolment fails
    let enrolmentStatus: string | null = null;
    if (parsed.date_of_birth && parsed.customer_email && !isAuthUser) {
      const enrolment = await createHamateeEnrolment({
        orderId: result.order_id,
        email: parsed.customer_email,
        dateOfBirth: parsed.date_of_birth,
        firstName: parsed.customer_name.split(" ")[0] ?? null,
        lastName: parsed.customer_name.split(" ").slice(1).join(" ") || null,
        phone: parsed.customer_phone,
      });
      enrolmentStatus = enrolment.status;
    }

    return NextResponse.json({
      order_id: result.order_id,
      order_number: result.order_number,
      ...(enrolmentStatus ? { enrolment_status: enrolmentStatus } : {}),
    }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Invalid request" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
