import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_PATH = /^expenses\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpe?g|png|webp)$/i;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    const file = (await request.formData()).get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "사진이 필요해요." }, { status: 400 });
    const extension = EXTENSIONS[file.type];
    if (!extension) return NextResponse.json({ error: "JPG, PNG, WEBP 사진만 등록할 수 있어요." }, { status: 400 });
    if (file.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: "사진은 장당 5MB 이하여야 해요." }, { status: 400 });

    const path = `expenses/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("expense-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("expense-images").getPublicUrl(path);
    return NextResponse.json({ data: { path, url: data.publicUrl } }, { status: 201 });
  } catch (error) {
    console.error("Expense image upload failed", error);
    return NextResponse.json({ error: "사진을 업로드하지 못했어요." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body: unknown = await request.json();
    const paths = body && typeof body === "object" && "paths" in body
      ? (body as { paths?: unknown }).paths
      : undefined;
    if (!Array.isArray(paths) || paths.length > 5 || paths.some((path) => typeof path !== "string" || !IMAGE_PATH.test(path))) {
      return NextResponse.json({ error: "사진 경로를 확인해 주세요." }, { status: 400 });
    }
    if (paths.length) {
      const { error } = await supabase.storage.from("expense-images").remove(paths);
      if (error) throw error;
    }
    return NextResponse.json({ data: { removed: paths.length } });
  } catch (error) {
    console.error("Expense image cleanup failed", error);
    return NextResponse.json({ error: "사진을 정리하지 못했어요." }, { status: 500 });
  }
}
