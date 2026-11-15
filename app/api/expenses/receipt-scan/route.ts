import { NextResponse } from "next/server";
import { EXPENSE_CATEGORY_META } from "@/lib/expenses";
import { isAcceptedImageFile, MAX_IMAGE_FILE_SIZE, MAX_IMAGE_FILE_SIZE_MB, normalizeImageMimeType } from "@/lib/image-upload";
import { parseReceiptScanJson, RECEIPT_SCAN_MODEL } from "@/lib/receipt-scan";
import { getTripBySlug, type TripConfig } from "@/lib/trips";

const RECEIPT_HINTS = {
  THB: {
    description: "a Thai receipt (THB, baht, ฿, VAT, PromptPay/QR)",
    currency: "THB",
    hint: "Use THB for Thai baht receipts.",
    paymentHint: 'PromptPay and other QR payments are "qr".',
  },
  JPY: {
    description: "a Japanese receipt (JPY, yen, 円, ¥, 税込, 消費税, レシート, PayPay/IC card)",
    currency: "JPY",
    hint: "Use JPY for Japanese yen receipts. Prefer the tax-included (税込) total.",
    paymentHint: 'Smartphone wallet payments such as PayPay, au PAY, d払い, 楽天ペイ and QR codes are "qr". Suica, ICOCA and other transit IC cards are "ic_card". 現金/お預り is "cash". Credit and debit cards are "card".',
  },
} as const;

const buildReceiptPrompt = (trip: TripConfig) => {
  const hints = RECEIPT_HINTS[trip.currency.code];
  const categoryGuide = trip.expenseCategories
    .map((value) => `${value}=${EXPENSE_CATEGORY_META[value].label}`)
    .join(", ");
  return `Extract expense fields from this receipt or payment slip photo.
The photo may be ${hints.description} or a Korean card slip (KRW, 원, ₩).
Reply with a JSON object only, using exactly these keys:
{
  "is_receipt": true,
  "item_name": "short Korean name of the main purchase, max 100 chars, or null",
  "merchant": "store name, max 100 chars, or null",
  "amount": 0,
  "currency": "${hints.currency}",
  "purchased_date": "YYYY-MM-DD",
  "purchased_time": "HH:mm",
  "payment_method": "cash",
  "category": "food",
  "custom_category": null,
  "memo": "short Korean line-item summary, max 500 chars, or null"
}
Rules:
- amount is the grand total as a number, or null. Prefer the final payable total, not a subtotal.
- currency is "${hints.currency}" or "KRW" or null. ${hints.hint}
- purchased_date is "YYYY-MM-DD" or null. purchased_time is "HH:mm" 24-hour or null.
- payment_method is ${trip.paymentMethods.map((method) => `"${method}"`).join(" | ")} or null. ${hints.paymentHint}
- category is one of ${categoryGuide}, or null.
- custom_category is a Korean tag max 30 chars only if no preset fits, otherwise null.
- If the image is not a receipt or invoice, set is_receipt to false and all other fields to null.
- Do not invent amounts, dates, or merchants that are not visible.`;
};

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

const requestGroq = async (apiKey: string, imageUrl: string, jsonMode: boolean, prompt: string, model: string) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_completion_tokens: 2048,
      reasoning_effort: "none",
      reasoning_format: "hidden",
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
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
    const formData = await request.formData();
    const trip = getTripBySlug(String(formData.get("trip") ?? ""));
    if (!trip) return NextResponse.json({ error: "여행 정보를 확인해 주세요." }, { status: 400 });
    const prompt = buildReceiptPrompt(trip);
    const model = process.env.GROQ_RECEIPT_MODEL?.trim() || RECEIPT_SCAN_MODEL;
    const file = formData.get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "사진이 필요해요." }, { status: 400 });
    if (!isAcceptedImageFile(file)) return NextResponse.json({ error: "JPG, PNG, WEBP, HEIC 사진만 인식할 수 있어요." }, { status: 400 });
    if (file.size > MAX_IMAGE_FILE_SIZE) return NextResponse.json({ error: `사진은 장당 ${MAX_IMAGE_FILE_SIZE_MB}MB 이하여야 해요.` }, { status: 400 });

    const mimeType = normalizeImageMimeType(file);
    const imageUrl = await toDataUrl(file, mimeType);
    let { response: groqResponse, payload: groqPayload } = await requestGroq(apiKey, imageUrl, true, prompt, model);
    if (!groqResponse.ok && groqErrorCode(groqPayload) === "json_validate_failed") {
      ({ response: groqResponse, payload: groqPayload } = await requestGroq(apiKey, imageUrl, false, prompt, model));
    }
    if (!groqResponse.ok) {
      console.error("Groq receipt scan failed", groqResponse.status, groqErrorCode(groqPayload), model);
      if (groqResponse.status === 404 || groqErrorCode(groqPayload) === "model_not_found") {
        // 모델이 내려갔거나 접근 권한이 없다. 사용자가 다시 시도해도 소용없으니 원인을 알려 준다.
        return NextResponse.json({ error: "영수증 인식 모델을 지금 쓸 수 없어요. 설정을 확인해야 해요." }, { status: 503 });
      }
      return NextResponse.json({ error: "영수증을 인식하지 못했어요." }, { status: groqResponse.status === 429 ? 429 : 502 });
    }

    const content = groqContent(groqPayload);
    if (typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "영수증을 읽지 못했어요." }, { status: 502 });
    }

    const parsed = parseReceiptScanJson(content, { timeZone: trip.timeZone, localCurrency: trip.currency.code });
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
