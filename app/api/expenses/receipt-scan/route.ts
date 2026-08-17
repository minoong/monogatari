import { NextResponse } from "next/server";
import { EXPENSE_CATEGORY_META, EXPENSE_CATEGORIES } from "@/lib/expenses";
import { isAcceptedImageFile, MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILE_SIZE_MB, normalizeImageMimeType } from "@/lib/image-upload";
import { parseReceiptScanJson, RECEIPT_SCAN_MODEL } from "@/lib/receipt-scan";

const CATEGORY_GUIDE = EXPENSE_CATEGORIES
  .map((value) => `${value}=${EXPENSE_CATEGORY_META[value].label}`)
  .join(", ");

const RECEIPT_PROMPT = `Extract expense fields from this receipt or payment slip photo.
The photo may be a Thai receipt (THB, baht, ฿, VAT, PromptPay/QR) or a Korean card slip (KRW, 원, ₩).
Reply with a JSON object only, using exactly these keys:
{
  "is_receipt": true,
  "item_name": "short Korean name of the main purchase, max 100 chars, or null",
  "merchant": "store name, max 100 chars, or null",
  "amount": 0,
  "currency": "THB",
  "purchased_date": "YYYY-MM-DD",
  "purchased_time": "HH:mm",
  "payment_method": "cash",
  "category": "food",
  "custom_category": null,
  "memo": "short Korean line-item summary, max 500 chars, or null"
}
Rules:
- amount is the grand total as a number, or null. Prefer the final payable total, not a subtotal.
- currency is "THB" or "KRW" or null. Use THB for Thai baht receipts.
- purchased_date is "YYYY-MM-DD" or null. purchased_time is "HH:mm" 24-hour or null.
- payment_method is "cash" | "card" | "qr" | "other" or null.
- category is one of ${CATEGORY_GUIDE}, or null.
- custom_category is a Korean tag max 30 chars only if no preset fits, otherwise null.
- If the image is not a receipt or invoice, set is_receipt to false and all other fields to null.
- Do not invent amounts, dates, or merchants that are not visible.`;

const toDataUrl = async (file: File, mimeType: string) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const groqErrorCode = (payload: unknown) => {
  if (!payload || typeof payload !== "object" || !("error" in payload)) return null;
  const error = (payload as { error?: { code?: unknown } }).error;
  return error && typeof error.code === "string" ? error.code : null;
};

const groqContent = (payload: unknown) => {
  if (!payload || typeof payload !== "object" || !("choices" in payload)) return undefined;
  return (payload as { choices?: { message?: { content?: unknown } }[] }).choices?.[0]?.message?.content;
};

const requestGroq = async (apiKey: string, imageUrl: string, jsonMode: boolean) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: RECEIPT_SCAN_MODEL,
      temperature: 0.2,
      max_completion_tokens: 2048,
      reasoning_effort: "none",
      reasoning_format: "hidden",
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: RECEIPT_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });
  const payload: unknown = await response.json().catch(() => null);
  return { response, payload };
};

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "인식 기능을 아직 설정하지 않았어요." }, { status: 503 });
  }

  try {
    const file = (await request.formData()).get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "사진이 필요해요." }, { status: 400 });
    if (!isAcceptedImageFile(file)) return NextResponse.json({ error: "JPG, PNG, WEBP, HEIC 사진만 인식할 수 있어요." }, { status: 400 });
    if (file.size > MAX_IMAGE_FILE_SIZE) return NextResponse.json({ error: `사진은 장당 ${MAX_IMAGE_FILE_SIZE_MB}MB 이하여야 해요.` }, { status: 400 });

    const mimeType = normalizeImageMimeType(file);
    const imageUrl = await toDataUrl(file, mimeType);
    let { response: groqResponse, payload: groqPayload } = await requestGroq(apiKey, imageUrl, true);
    if (!groqResponse.ok && groqErrorCode(groqPayload) === "json_validate_failed") {
      ({ response: groqResponse, payload: groqPayload } = await requestGroq(apiKey, imageUrl, false));
    }
    if (!groqResponse.ok) {
      console.error("Groq receipt scan failed", groqResponse.status, groqPayload);
      return NextResponse.json({ error: "영수증을 인식하지 못했어요." }, { status: groqResponse.status === 429 ? 429 : 502 });
    }

    const content = groqContent(groqPayload);
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "영수증을 읽지 못했어요." }, { status: 502 });
    }

    const parsed = parseReceiptScanJson(content);
    if (parsed.error || !parsed.data) {
      return NextResponse.json({ error: parsed.error ?? "영수증을 읽지 못했어요." }, { status: 422 });
    }

    const hasField = Object.values(parsed.data).some((value) => value != null);
    if (!hasField) return NextResponse.json({ error: "영수증에서 채울 내용을 찾지 못했어요." }, { status: 422 });

    return NextResponse.json({ data: parsed.data });
  } catch (error) {
    console.error("Receipt scan failed", error);
    return NextResponse.json({ error: "영수증을 인식하지 못했어요." }, { status: 500 });
  }
}
