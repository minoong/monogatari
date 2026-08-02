import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "image is required" }, { status: 400 });
    }

    const extension = EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json({ error: "JPG, PNG, WEBP images only" }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
    }

    const path = `wishes/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("wish-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (error) throw error;
    const { data } = supabase.storage.from("wish-images").getPublicUrl(path);
    return NextResponse.json({ data: { path, url: data.publicUrl } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body: unknown = await request.json();
    const paths = body && typeof body === "object" && "paths" in body ? (body as { paths?: unknown }).paths : undefined;
    if (!Array.isArray(paths) || paths.some((path) => typeof path !== "string" || !/^wishes\/[0-9a-f-]+\.(?:jpe?g|png|webp)$/i.test(path))) {
      return NextResponse.json({ error: "Invalid image paths" }, { status: 400 });
    }
    const { error } = await supabase.storage.from("wish-images").remove(paths);
    if (error) throw error;
    return NextResponse.json({ data: { removed: paths.length } });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
