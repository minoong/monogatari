import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isWishType, type WishItem } from "@/lib/wishes";

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
    const body = await request.json();
    const type = body.type;
    const title = optionalText(body.title, 100);
    const categories = categoriesValue(body.categories);
    const locations = textListValue(body.locations, 200);
    const links = linksValue(body.links);
    const memo = optionalText(body.memo, 500);
    const vendor = optionalText(body.vendor, 100);
    const imagePath = optionalText(body.image_path, 200);
    const targetPrice = body.target_price_thb === "" || body.target_price_thb === null || body.target_price_thb === undefined
      ? null
      : Number(body.target_price_thb);

    if (!isWishType(type) || !title) {
      return NextResponse.json({ error: "type and title are required" }, { status: 400 });
    }

    if (
      categories === undefined
      || locations === undefined
      || links === undefined
      || [memo, vendor, imagePath].some((value) => value === undefined)
    ) {
      return NextResponse.json({ error: "Invalid text field" }, { status: 400 });
    }

    if (!Number.isFinite(targetPrice) && targetPrice !== null) {
      return NextResponse.json({ error: "target_price_thb must be a number" }, { status: 400 });
    }

    if (targetPrice !== null && targetPrice < 0) {
      return NextResponse.json({ error: "target_price_thb must be zero or greater" }, { status: 400 });
    }

    if (imagePath && !/^wishes\/[0-9a-f-]+\.(?:jpe?g|png|webp)$/i.test(imagePath)) {
      return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("wish_items")
      .insert({
        type,
        title,
        categories,
        target_price_thb: targetPrice,
        memo,
        vendor,
        image_path: imagePath,
        locations,
        links,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data: withImageUrl(data) }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
