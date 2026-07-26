import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isGoogleMapsUrl, isWishType, type WishItem } from "@/lib/wishes";

const withImageUrl = (item: Omit<WishItem, "image_url">): WishItem => ({
  ...item,
  image_url: item.image_path
    ? supabase.storage.from("wish-images").getPublicUrl(item.image_path).data.publicUrl
    : null,
});

const optionalText = (value: unknown, maxLength: number) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed || null : undefined;
};

const categoriesValue = (value: unknown) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return undefined;

  const categories = value.map((item) => typeof item === "string" ? item.trim() : null);
  if (categories.some((item) => !item || item.length > 14)) return undefined;
  if (new Set(categories).size !== categories.length) return undefined;
  return categories as string[];
};

const textListValue = (value: unknown, maxLength: number) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return undefined;

  const items = value.map((item) => typeof item === "string" ? item.trim() : null);
  if (items.some((item) => !item || item.length > maxLength)) return undefined;
  if (new Set(items).size !== items.length) return undefined;
  return items as string[];
};

const linksValue = (value: unknown) => {
  const links = textListValue(value, 500);
  if (!links) return undefined;

  try {
    return links.every((link) => {
      const url = new URL(link);
      return url.protocol === "http:" || url.protocol === "https:";
    }) ? links : undefined;
  } catch {
    return undefined;
  }
};

const locationsValue = (value: unknown) => {
  const locations = textListValue(value, 2048);
  return locations?.every(isGoogleMapsUrl) ? locations : undefined;
};

const wishIdValue = (value: string | null) =>
  value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;

const wishInputValue = (body: Record<string, unknown>) => {
  const type = body.type;
  const title = optionalText(body.title, 100);
  const categories = categoriesValue(body.categories);
  const locations = locationsValue(body.locations);
  const links = linksValue(body.links);
  const memo = optionalText(body.memo, 500);
  const vendor = optionalText(body.vendor, 100);
  const imagePath = optionalText(body.image_path, 200);
  const targetPrice = body.target_price_thb === "" || body.target_price_thb === null || body.target_price_thb === undefined
    ? null
    : Number(body.target_price_thb);

  if (!isWishType(type) || !title) return { error: "type and title are required" };
  if (
    categories === undefined
    || locations === undefined
    || links === undefined
    || [memo, vendor, imagePath].some((value) => value === undefined)
  ) {
    return { error: "Invalid text field" };
  }
  if (!Number.isFinite(targetPrice) && targetPrice !== null) {
    return { error: "target_price_thb must be a number" };
  }
  if (targetPrice !== null && targetPrice < 0) {
    return { error: "target_price_thb must be zero or greater" };
  }
  if (imagePath && !/^wishes\/[0-9a-f-]+\.(?:jpe?g|png|webp)$/i.test(imagePath)) {
    return { error: "Invalid image path" };
  }

  return {
    data: {
      type,
      title,
      categories,
      target_price_thb: targetPrice,
      memo,
      vendor,
      image_path: imagePath,
      locations,
      links,
    },
  };
};

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");

  if (type !== null && !isWishType(type)) {
    return NextResponse.json({ error: "Invalid wish type" }, { status: 400 });
  }

  let query = supabase.from("wish_items").select("*").order("created_at", { ascending: false });
  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: (data ?? []).map(withImageUrl) });
}

export async function POST(request: Request) {
  try {
    const input = wishInputValue(await request.json());
    if (!input.data) return NextResponse.json({ error: input.error }, { status: 400 });

    const { data, error } = await supabase
      .from("wish_items")
      .insert(input.data)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data: withImageUrl(data) }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const id = wishIdValue(new URL(request.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Invalid wish id" }, { status: 400 });

    const input = wishInputValue(await request.json());
    if (!input.data) return NextResponse.json({ error: input.error }, { status: 400 });

    const { data: current, error: currentError } = await supabase
      .from("wish_items")
      .select("image_path")
      .eq("id", id)
      .single();
    if (currentError) {
      return NextResponse.json(
        { error: currentError.code === "PGRST116" ? "Wish not found" : currentError.message },
        { status: currentError.code === "PGRST116" ? 404 : 500 },
      );
    }

    const { data, error } = await supabase
      .from("wish_items")
      .update({ ...input.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      return NextResponse.json(
        {
          error: error.code === "PGRST116"
            ? "위시 수정 권한이 설정되지 않았습니다."
            : error.message,
        },
        { status: error.code === "PGRST116" ? 403 : 500 },
      );
    }

    if (current.image_path && current.image_path !== input.data.image_path) {
      await supabase.storage.from("wish-images").remove([current.image_path]);
    }

    return NextResponse.json({ data: withImageUrl(data) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = wishIdValue(new URL(request.url).searchParams.get("id"));
    if (!id) return NextResponse.json({ error: "Invalid wish id" }, { status: 400 });

    const { data, error } = await supabase
      .from("wish_items")
      .delete()
      .eq("id", id)
      .select("id, image_path")
      .single();
    if (error) {
      return NextResponse.json(
        {
          error: error.code === "PGRST116"
            ? "위시 삭제 권한이 설정되지 않았거나 항목이 없습니다."
            : error.message,
        },
        { status: error.code === "PGRST116" ? 403 : 500 },
      );
    }

    if (data.image_path) {
      await supabase.storage.from("wish-images").remove([data.image_path]);
    }

    return NextResponse.json({ data: { id: data.id } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
