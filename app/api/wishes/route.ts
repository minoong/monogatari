import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isGoogleMapsUrl, isWishType, type WishImage, type WishItem } from "@/lib/wishes";

const IMAGE_PATH = /^wishes\/[0-9a-f-]+\.(?:jpe?g|png|webp)$/i;

type WishRow = Omit<WishItem, "images"> & { image_path?: string | null; wish_images?: { id: string; storage_path: string; sort_order: number }[] };

const withImages = (item: WishRow): WishItem => ({
  ...item,
  images: (item.wish_images?.length ? item.wish_images : item.image_path ? [{ id: `legacy-${item.id}`, storage_path: item.image_path, sort_order: 0 }] : []).sort((a, b) => a.sort_order - b.sort_order).map((image): WishImage => ({
    id: image.id,
    path: image.storage_path,
    sort_order: image.sort_order,
    url: supabase.storage.from("wish-images").getPublicUrl(image.storage_path).data.publicUrl,
  })),
});

const optionalText = (value: unknown, maxLength: number) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed || null : undefined;
};

const textListValue = (value: unknown, maxLength: number) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return undefined;
  const items = value.map((item) => typeof item === "string" ? item.trim() : null);
  if (items.some((item) => !item || item.length > maxLength) || new Set(items).size !== items.length) return undefined;
  return items as string[];
};

const categoriesValue = (value: unknown) => textListValue(value, 14);
const linksValue = (value: unknown) => {
  const links = textListValue(value, 500);
  if (!links) return undefined;
  try { return links.every((link) => ["http:", "https:"].includes(new URL(link).protocol)) ? links : undefined; } catch { return undefined; }
};
const locationsValue = (value: unknown) => {
  const locations = textListValue(value, 2048);
  return locations?.every(isGoogleMapsUrl) ? locations : undefined;
};
const imagePathsValue = (value: unknown) => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 5) return undefined;
  const paths = value.map((item) => typeof item === "string" ? item.trim() : null);
  return paths.every((path) => path && IMAGE_PATH.test(path)) && new Set(paths).size === paths.length ? paths as string[] : undefined;
};
const wishIdValue = (value: string | null) => value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;

const wishInputValue = (body: Record<string, unknown>) => {
  const type = body.type; const title = optionalText(body.title, 100); const categories = categoriesValue(body.categories);
  const locations = locationsValue(body.locations); const links = linksValue(body.links); const memo = optionalText(body.memo, 500);
  const vendor = optionalText(body.vendor, 100); const imagePaths = imagePathsValue(body.image_paths);
  const targetPrice = body.target_price_thb === "" || body.target_price_thb == null ? null : Number(body.target_price_thb);
  if (!isWishType(type) || !title) return { error: "type and title are required" };
  if ([categories, locations, links, imagePaths].some((value) => value === undefined) || [memo, vendor].some((value) => value === undefined)) return { error: "Invalid field" };
  if (!Number.isFinite(targetPrice) && targetPrice !== null || targetPrice !== null && targetPrice < 0) return { error: "Invalid target price" };
  return { data: { type, title, categories, target_price_thb: targetPrice, memo, vendor, locations, links, image_paths: imagePaths! } };
};

const selectWish = "*, wish_images(id, storage_path, sort_order)";
const missingGalleryTable = (error: { message?: string } | null) => Boolean(error?.message?.includes("wish_images"));
const saveImages = async (wishId: string, paths: string[], oldPaths: string[] = []) => {
  const stalePaths = oldPaths.filter((path) => !paths.includes(path));
  const { error: deleteError } = await supabase.from("wish_images").delete().eq("wish_id", wishId);
  if (deleteError) throw deleteError;
  if (paths.length) {
    const { error } = await supabase.from("wish_images").insert(paths.map((storage_path, sort_order) => ({ wish_id: wishId, storage_path, sort_order })));
    if (error) throw error;
  }
  if (stalePaths.length) await supabase.storage.from("wish-images").remove(stalePaths);
};

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  if (type !== null && !isWishType(type)) return NextResponse.json({ error: "Invalid wish type" }, { status: 400 });
  let query = supabase.from("wish_items").select(selectWish).order("created_at", { ascending: false });
  if (type) query = query.eq("type", type);
  let { data, error } = await query;
  // Deploys can briefly run newer app code before the SQL migration. Keep existing wishes readable.
  if (missingGalleryTable(error)) {
    let legacyQuery = supabase.from("wish_items").select("*").order("created_at", { ascending: false });
    if (type) legacyQuery = legacyQuery.eq("type", type);
    const legacy = await legacyQuery;
    data = legacy.data as typeof data;
    error = legacy.error;
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data ?? []).map((item) => withImages(item as WishRow)) });
}

export async function POST(request: Request) {
  try {
    const input = wishInputValue(await request.json()); if (!input.data) return NextResponse.json({ error: input.error }, { status: 400 });
    const { image_paths, ...wishData } = input.data;
    const { data, error } = await supabase.from("wish_items").insert(wishData).select("id").single(); if (error) throw error;
    await saveImages(data.id, image_paths);
    const { data: saved, error: readError } = await supabase.from("wish_items").select(selectWish).eq("id", data.id).single(); if (readError) throw readError;
    return NextResponse.json({ data: withImages(saved as WishRow) }, { status: 201 });
  } catch (error: unknown) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const id = wishIdValue(new URL(request.url).searchParams.get("id")); if (!id) return NextResponse.json({ error: "Invalid wish id" }, { status: 400 });
    const input = wishInputValue(await request.json()); if (!input.data) return NextResponse.json({ error: input.error }, { status: 400 });
    const { data: current, error: currentError } = await supabase.from("wish_items").select(selectWish).eq("id", id).single();
    if (currentError) return NextResponse.json({ error: currentError.code === "PGRST116" ? "Wish not found" : currentError.message }, { status: currentError.code === "PGRST116" ? 404 : 500 });
    const { image_paths, ...wishData } = input.data;
    const { error } = await supabase.from("wish_items").update({ ...wishData, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw error;
    await saveImages(id, image_paths, (current.wish_images ?? []).map((image: { storage_path: string }) => image.storage_path));
    const { data: saved, error: readError } = await supabase.from("wish_items").select(selectWish).eq("id", id).single(); if (readError) throw readError;
    return NextResponse.json({ data: withImages(saved as WishRow) });
  } catch (error: unknown) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = wishIdValue(new URL(request.url).searchParams.get("id")); if (!id) return NextResponse.json({ error: "Invalid wish id" }, { status: 400 });
    const { data, error } = await supabase.from("wish_items").delete().eq("id", id).select(selectWish).single();
    if (error) return NextResponse.json({ error: error.code === "PGRST116" ? "위시 삭제 권한이 설정되지 않았거나 항목이 없습니다." : error.message }, { status: error.code === "PGRST116" ? 403 : 500 });
    const paths = (data.wish_images ?? []).map((image: { storage_path: string }) => image.storage_path); if (paths.length) await supabase.storage.from("wish-images").remove(paths);
    return NextResponse.json({ data: { id: data.id } });
  } catch (error: unknown) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 }); }
}
