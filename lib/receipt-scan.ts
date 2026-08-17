import {
  isExpenseCategory,
  isExpensePaymentMethod,
  type ExpenseCategory,
  type ExpensePaymentMethod,
} from "@/lib/expenses";
import { type InputCurrency } from "@/lib/exchange-rates";

export const RECEIPT_SCAN_MODEL = "qwen/qwen3.6-27b";

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

const bangkokToday = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

export const parseReceiptScanJson = (raw: string): { data?: ReceiptScanResult; error?: string } => {
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

  const currency = body.currency === "THB" || body.currency === "KRW" ? body.currency : body.currency == null || body.currency === "" ? null : undefined;
  if (currency === undefined) return { error: "영수증 내용을 확인해 주세요." };

  let amount: number | null = null;
  if (body.amount != null && body.amount !== "") {
    const number = typeof body.amount === "number" || typeof body.amount === "string" ? Number(body.amount) : Number.NaN;
    if (!Number.isFinite(number) || number <= 0) return { error: "영수증 내용을 확인해 주세요." };
    amount = currency === "KRW" ? Math.round(number) : Number(number.toFixed(2));
    if (amount <= 0) return { error: "영수증 내용을 확인해 주세요." };
  }

  let purchasedDate: string | null = null;
  if (body.purchased_date != null && body.purchased_date !== "") {
    if (typeof body.purchased_date !== "string" || !isRealDate(body.purchased_date)) {
      return { error: "영수증 내용을 확인해 주세요." };
    }
    if (body.purchased_date <= bangkokToday()) purchasedDate = body.purchased_date;
  }

  const purchasedTime = typeof body.purchased_time === "string" && TIME_PATTERN.test(body.purchased_time)
    ? body.purchased_time
    : body.purchased_time == null || body.purchased_time === ""
      ? null
      : undefined;
  if (purchasedTime === undefined) return { error: "영수증 내용을 확인해 주세요." };

  const paymentMethod = isExpensePaymentMethod(body.payment_method)
    ? body.payment_method
    : body.payment_method == null || body.payment_method === ""
      ? null
      : undefined;
  if (paymentMethod === undefined) return { error: "영수증 내용을 확인해 주세요." };

  const category = isExpenseCategory(body.category)
    ? body.category
    : body.category == null || body.category === ""
      ? null
      : undefined;
  if (category === undefined) return { error: "영수증 내용을 확인해 주세요." };

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
