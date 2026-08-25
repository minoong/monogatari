import { NextResponse } from "next/server";
import { isGoogleMapsUrl, isScheduleDate, isTimeValue, type ScheduleImage, type ScheduleImageKind, type ScheduleItem } from "@/lib/schedule";
import { supabase } from "@/lib/supabase";

const IMAGE_PATH = /^schedule\/[0-9a-f-]+\.(?:jpe?g|png|webp)$/i;
type ScheduleImageRow = { id: string; storage_path: string; sort_order: number; kind?: string };
type ScheduleRow = Omit<ScheduleItem, "images" | "tripImages" | "schedule_date" | "start_time"> & {
  schedule_date: string;
  start_time: string;
  schedule_images?: ScheduleImageRow[];
};

const toPublicImage = (image: ScheduleImageRow): ScheduleImage => ({
  id: image.id,
  path: image.storage_path,
  sort_order: image.sort_order,
  url: supabase.storage.from("schedule-images").getPublicUrl(image.storage_path).data.publicUrl,
});

const ofKind = (rows: ScheduleImageRow[] | undefined, kind: ScheduleImageKind) =>
  (rows ?? []).filter((image) => (image.kind ?? "cover") === kind).sort((a, b) => a.sort_order - b.sort_order).map(toPublicImage);

const withImages = (row: ScheduleRow): ScheduleItem => ({
  ...row,
  schedule_date: row.schedule_date as ScheduleItem["schedule_date"],
  start_time: row.start_time.slice(0, 5),
  images: ofKind(row.schedule_images, "cover"),
  tripImages: ofKind(row.schedule_images, "trip"),
});

const parseId = (value: string | null) => value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
const selectSchedule = "*, schedule_images(id, storage_path, sort_order, kind)";

const optionalText = (value: unknown, maxLength: number) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed || null : undefined;
};

function parsePaths(value: unknown) {
  if (!Array.isArray(value) || value.length > 5 || value.some((path) => typeof path !== "string" || !IMAGE_PATH.test(path))) return { error: "Invalid image paths" } as const;
  if (new Set(value).size !== value.length) return { error: "Duplicate image paths" } as const;
  return { data: value as string[] } as const;
}

function parseInput(body: unknown, mode: "create" | "update") {
  if (!body || typeof body !== "object") return { error: "Invalid request" } as const;
  const { schedule_date, start_time, title, subtitle, google_maps_url, image_paths, trip_image_paths, trip_memo } = body as Record<string, unknown>;
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedSubtitle = typeof subtitle === "string" && subtitle.trim() ? subtitle.trim() : null;
  const normalizedMap = typeof google_maps_url === "string" && google_maps_url.trim() ? google_maps_url.trim() : null;
  if (!isScheduleDate(schedule_date) || !isTimeValue(start_time) || !normalizedTitle || normalizedTitle.length > 100) return { error: "Invalid date, time, or title" } as const;
  if (normalizedSubtitle && normalizedSubtitle.length > 500) return { error: "Subtitle is too long" } as const;
  if (normalizedMap && !isGoogleMapsUrl(normalizedMap)) return { error: "Google Maps URL is invalid" } as const;

  let normalizedTripMemo: string | null | undefined;
  if (trip_memo !== undefined) {
    normalizedTripMemo = optionalText(trip_memo, 500);
    if (normalizedTripMemo === undefined) return { error: "Trip memo is too long" } as const;
  }

  let coverPaths: string[] | undefined;
  let tripPaths: string[] | undefined;
  if (image_paths !== undefined || mode === "create") {
    const parsed = parsePaths(image_paths ?? []);
    if (!parsed.data) return { error: parsed.error } as const;
    coverPaths = parsed.data;
  }
  if (trip_image_paths !== undefined) {
    const parsed = parsePaths(trip_image_paths);
    if (!parsed.data) return { error: parsed.error } as const;
    tripPaths = parsed.data;
  }
  if (mode === "update" && coverPaths === undefined && tripPaths === undefined && normalizedTripMemo === undefined) {
    return { error: "Invalid image paths" } as const;
  }

  return {
    data: {
      schedule_date,
      start_time,
      title: normalizedTitle,
      subtitle: normalizedSubtitle,
      google_maps_url: normalizedMap,
      ...(normalizedTripMemo !== undefined ? { trip_memo: normalizedTripMemo } : {}),
      coverPaths,
      tripPaths,
    },
  } as const;
}

async function saveImages(scheduleItemId: string, paths: string[], kind: ScheduleImageKind) {
  const { error: deleteError } = await supabase.from("schedule_images").delete().eq("schedule_item_id", scheduleItemId).eq("kind", kind);
  if (deleteError) throw deleteError;
  if (paths.length) {
    const { error } = await supabase.from("schedule_images").insert(
      paths.map((storage_path, sort_order) => ({ schedule_item_id: scheduleItemId, storage_path, sort_order, kind })),
    );
    if (error) throw error;
  }
}

export async function GET() {
  const { data, error } = await supabase.from("schedule_items").select(selectSchedule).order("schedule_date").order("start_time").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: (data as ScheduleRow[] ?? []).map(withImages) });
}

export async function POST(request: Request) {
  try {
    const parsed = parseInput(await request.json(), "create"); if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { coverPaths, tripPaths, ...item } = parsed.data;
    const { data, error } = await supabase.from("schedule_items").insert(item).select("id").single(); if (error) throw error;
    await saveImages(data.id, coverPaths ?? [], "cover");
    if (tripPaths) await saveImages(data.id, tripPaths, "trip");
    const { data: saved, error: readError } = await supabase.from("schedule_items").select(selectSchedule).eq("id", data.id).single(); if (readError) throw readError;
    return NextResponse.json({ data: withImages(saved as ScheduleRow) }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save schedule" }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const id = parseId(new URL(request.url).searchParams.get("id")); if (!id) return NextResponse.json({ error: "Invalid schedule id" }, { status: 400 });
    const parsed = parseInput(await request.json(), "update"); if (!parsed.data) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { coverPaths, tripPaths, ...item } = parsed.data;
    const { error } = await supabase.from("schedule_items").update({ ...item, updated_at: new Date().toISOString() }).eq("id", id); if (error) throw error;
    if (coverPaths) await saveImages(id, coverPaths, "cover");
    if (tripPaths) await saveImages(id, tripPaths, "trip");
    const { data, error: readError } = await supabase.from("schedule_items").select(selectSchedule).eq("id", id).single(); if (readError) throw readError;
    return NextResponse.json({ data: withImages(data as ScheduleRow) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update schedule" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  try {
    const id = parseId(new URL(request.url).searchParams.get("id")); if (!id) return NextResponse.json({ error: "Invalid schedule id" }, { status: 400 });
    const { data, error } = await supabase.from("schedule_items").delete().eq("id", id).select(selectSchedule).single(); if (error) throw error;
    const paths = (data as ScheduleRow).schedule_images?.map((image) => image.storage_path) ?? [];
    if (paths.length) await supabase.storage.from("schedule-images").remove(paths);
    return NextResponse.json({ data: withImages(data as ScheduleRow) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete schedule" }, { status: 500 }); }
}
