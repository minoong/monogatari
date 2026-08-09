import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const PATH = /^schedule\/[0-9a-f-]+\.(?:jpe?g|png|webp)$/i;

export async function POST(request: Request) {
  try {
    const file = (await request.formData()).get("image");
    if (!(file instanceof File) || !EXTENSIONS[file.type] || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "JPG, PNG, WEBP files under 5MB only" }, { status: 400 });
    const path = `schedule/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
    const { error } = await supabase.storage.from("schedule-images").upload(path, file, { contentType: file.type, upsert: false }); if (error) throw error;
    return NextResponse.json({ data: { path, url: supabase.storage.from("schedule-images").getPublicUrl(path).data.publicUrl } }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload image" }, { status: 500 }); }
}
export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { paths?: unknown }; const paths = body.paths;
    if (!Array.isArray(paths) || paths.some((path) => typeof path !== "string" || !PATH.test(path))) return NextResponse.json({ error: "Invalid image paths" }, { status: 400 });
    const { error } = await supabase.storage.from("schedule-images").remove(paths); if (error) throw error;
    return NextResponse.json({ data: { removed: paths.length } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove images" }, { status: 500 }); }
}
