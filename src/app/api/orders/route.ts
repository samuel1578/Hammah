import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
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
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = OrderSchema.parse(body);

    const supabase = createAdminClient();

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
    });

    if (error) {
      console.error("[orders] create_order_rpc failed", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 400 },
      );
    }

    const result = (data as CreateOrderResponse[])?.[0];

    if (!result) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    return NextResponse.json({
      order_id: result.order_id,
      order_number: result.order_number,
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
