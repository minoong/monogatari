import {
  isExpenseCategory,
  isExpensePaymentMethod,
  type ExpenseCategory,
  type ExpensePaymentMethod,
} from "@/lib/expenses";
import { CURRENCY_INFO, type LocalCurrencyCode } from "@/lib/currency";
import { type InputCurrency } from "@/lib/exchange-rates";

/**
 * Groq 비전 모델. 이전 모델(qwen/qwen3.6-27b)이 Groq에서 내려가 404(model_not_found)가 나서 3.8로 바꿨다.
 * 모델이 또 바뀌면 코드를 고치지 않고 서버 환경변수 GROQ_RECEIPT_MODEL로 덮어쓸 수 있다.
 */
export const RECEIPT_SCAN_MODEL = "qwen/qwen3.8-27b";

export interface ReceiptScanResult {
  item_name: string | null;
  merchant: string | null;
  amount: number | null;
  currency: InputCurrency | null;
  purchased_date: string | null;
  purchased_time: string | null;
  payment_method: ExpensePaymentMethod | null;
  category: ExpenseCategory | null;
  custom_category: string | null;
  memo: string | null;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const isRealDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const optionalText = (value: unknown, max: number) => {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length <= max ? trimmed : undefined;
};

const tripToday = (timeZone: string) => new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

/** AI가 읽은 영수증 JSON을 검증한다. 통화는 여행 통화(localCurrency)와 원화만 허용한다. */
export const parseReceiptScanJson = (
  raw: string,
  trip: { timeZone: string; localCurrency: LocalCurrencyCode },
): { data?: ReceiptScanResult; error?: string } => {
  const stripped = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const jsonText = stripped.includes("{")
    ? stripped.slice(stripped.indexOf("{"), stripped.lastIndexOf("}") + 1)
    : stripped;
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { error: "영수증을 읽지 못했어요." };
  }
  if (!parsed || typeof parsed !== "object") return { error: "영수증을 읽지 못했어요." };
  const body = parsed as Record<string, unknown>;
  if (body.is_receipt === false) return { error: "영수증을 찾지 못했어요." };

  const itemName = optionalText(body.item_name, 100);
  const merchant = optionalText(body.merchant, 100);
  const memo = optionalText(body.memo, 500);
  const customCategory = optionalText(body.custom_category, 30);
  if (itemName === undefined || merchant === undefined || memo === undefined || customCategory === undefined) {
    return { error: "영수증 내용을 확인해 주세요." };
  }

  const allowedCurrencies: string[] = [trip.localCurrency, "KRW"];
  const currency: InputCurrency | null | undefined = typeof body.currency === "string" && allowedCurrencies.includes(body.currency)
    ? (body.currency as InputCurrency)
    : body.currency == null || body.currency === "" ? null : undefined;
  if (currency === undefined) return { error: "영수증 내용을 확인해 주세요." };

  let amount: number | null = null;
  if (body.amount != null && body.amount !== "") {
    const number = typeof body.amount === "number" || typeof body.amount === "string" ? Number(body.amount) : Number.NaN;
    if (!Number.isFinite(number) || number <= 0) return { error: "영수증 내용을 확인해 주세요." };
    amount = Number(number.toFixed(CURRENCY_INFO[currency ?? trip.localCurrency].fractionDigits));
    if (amount <= 0) return { error: "영수증 내용을 확인해 주세요." };
  }

  let purchasedDate: string | null = null;
  if (body.purchased_date != null && body.purchased_date !== "") {
    if (typeof body.purchased_date !== "string" || !isRealDate(body.purchased_date)) {
      return { error: "영수증 내용을 확인해 주세요." };
    }
    if (body.purchased_date <= tripToday(trip.timeZone)) purchasedDate = body.purchased_date;
  }

  const purchasedTime = typeof body.purchased_time === "string" && TIME_PATTERN.test(body.purchased_time)
    ? body.purchased_time
    : body.purchased_time == null || body.purchased_time === ""
      ? null
      : undefined;
  if (purchasedTime === undefined) return { error: "영수증 내용을 확인해 주세요." };

  // 결제수단과 카테고리는 모델이 허용 목록 밖의 말(예: "au PAY")을 돌려줘도 스캔 전체를 버리지 않고 비워 둔다.
  // 금액·날짜·상호를 제대로 읽었는데 부가 정보 한 칸 때문에 실패하는 쪽이 사용자에게 더 나쁘다.
  const paymentMethod = isExpensePaymentMethod(body.payment_method) ? body.payment_method : null;
  const category = isExpenseCategory(body.category) ? body.category : null;

  return {
    data: {
      item_name: itemName,
      merchant,
      amount,
      currency,
      purchased_date: purchasedDate,
      purchased_time: purchasedTime,
      payment_method: paymentMethod,
      category: customCategory ? "other" : category,
      custom_category: customCategory,
      memo,
    },
  };
};
