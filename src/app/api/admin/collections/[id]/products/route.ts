import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("collection_products")
    .select("product_id, sort_order, products(id, name, slug, status)")
    .eq("collection_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  if (!body.product_id) {
    return NextResponse.json(
      { error: "product_id is required" },
      { status: 400 },
    );
  }

  const { data: existing } = await supabase
    .from("collection_products")
    .select("id")
    .eq("collection_id", id)
    .eq("product_id", body.product_id)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "Product already in collection" },
      { status: 409 },
    );
  }

  const { data: maxSort } = await supabase
    .from("collection_products")
    .select("sort_order")
    .eq("collection_id", id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder =
    body.sort_order ?? (maxSort ? maxSort.sort_order + 1 : 0);

  const { data, error } = await supabase
    .from("collection_products")
    .insert({
      collection_id: id,
      product_id: body.product_id,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");
  const collectionId = searchParams.get("collection_id");

  if (!productId || !collectionId) {
    return NextResponse.json(
      { error: "product_id and collection_id are required" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("collection_products")
    .delete()
    .eq("collection_id", collectionId)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
