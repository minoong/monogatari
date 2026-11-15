import { CURRENCY_INFO, formatAmount, roundAmount, type LocalCurrencyCode } from "./currency";

export const EXPENSE_PEOPLE = ["gahyun", "minu"] as const;
export type ExpensePerson = (typeof EXPENSE_PEOPLE)[number];

export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "shopping",
  "stay",
  "activity",
  "massage",
  "convenience",
  "onsen",
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_PAYMENT_METHODS = ["cash", "card", "qr", "ic_card", "other"] as const;
export type ExpensePaymentMethod = (typeof EXPENSE_PAYMENT_METHODS)[number];
export type ExpenseRateSource = "frankfurter" | "manual_override";

export const EXPENSE_PERSON_META: Record<ExpensePerson, { label: string; image: string }> = {
  gahyun: { label: "가현쨩", image: "/avatars/gahyun.webp" },
  minu: { label: "미누쿤", image: "/avatars/minu.webp" },
};

export const EXPENSE_CATEGORY_META: Record<ExpenseCategory, { label: string; color: string }> = {
  food: { label: "식비", color: "#ff9f0a" },
  transport: { label: "교통", color: "#0a84ff" },
  shopping: { label: "쇼핑", color: "#bf5af2" },
  stay: { label: "숙박", color: "#5e5ce6" },
  activity: { label: "관광", color: "#30d158" },
  massage: { label: "마사지", color: "#ff375f" },
  convenience: { label: "편의점", color: "#64d2ff" },
  onsen: { label: "온천", color: "#00c7be" },
  other: { label: "기타", color: "#8e8e93" },
};

export const EXPENSE_PAYMENT_META: Record<ExpensePaymentMethod, string> = {
  cash: "현금",
  card: "카드",
  qr: "QR 결제",
  ic_card: "교통 IC카드",
  other: "기타",
};

export const EXPENSE_CURRENCY_META = {
  KRW: {
    code: "KRW" as const,
    label: "원화",
    symbol: "₩",
    color: "#0f172a",
    colorClass: "text-slate-900 dark:text-white",
    mutedClass: "text-slate-500 dark:text-slate-400",
  },
  THB: {
    code: "THB" as const,
    label: "바트",
    symbol: "฿",
    color: "#94a3b8",
    colorClass: "text-slate-600 dark:text-slate-300",
    mutedClass: "text-slate-400 dark:text-slate-500",
  },
  JPY: {
    code: "JPY" as const,
    label: "엔",
    symbol: "¥",
    color: "#94a3b8",
    colorClass: "text-slate-600 dark:text-slate-300",
    mutedClass: "text-slate-400 dark:text-slate-500",
  },
} as const;

export type ExpenseCurrencyCode = keyof typeof EXPENSE_CURRENCY_META;

export interface ExpenseImage {
  id: string;
  path: string;
  url: string;
  sort_order: number;
}

export interface Expense {
  id: string;
  trip_id: string;
  /** 결제 통화. amount_local과 share_*_local, exchange_rate_krw_per_unit이 이 통화 기준이다. */
  currency: LocalCurrencyCode;
  purchased_at: string;
  item_name: string;
  category: ExpenseCategory;
  custom_category: string | null;
  merchant: string | null;
  payment_method: ExpensePaymentMethod;
  amount_local: number;
  exchange_rate_krw_per_unit: number;
  exchange_rate_date: string;
  exchange_rate_source: ExpenseRateSource;
  amount_krw: number;
  actual_amount_krw: number | null;
  payer: ExpensePerson;
  share_gahyun_local: number;
  share_minu_local: number;
  share_gahyun_krw: number;
  share_minu_krw: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
  images: ExpenseImage[];
}

export interface ExpenseInput {
  purchased_at: string;
  item_name: string;
  category: ExpenseCategory;
  custom_category: string | null;
  merchant: string | null;
  payment_method: ExpensePaymentMethod;
  amount_local: number;
  exchange_rate_krw_per_unit: number;
  exchange_rate_date: string;
  rate_manually_edited: boolean;
  actual_amount_krw: number | null;
  payer: ExpensePerson;
  participants: ExpensePerson[];
  shares_local: Record<ExpensePerson, number>;
  memo: string | null;
  image_paths: string[];
}

export interface ExchangeRateSnapshot {
  rate: number;
  requestedDate: string;
  observedDate: string;
  source: "frankfurter" | "supabase_fallback";
}

export const isExpensePerson = (value: unknown): value is ExpensePerson =>
  typeof value === "string" && EXPENSE_PEOPLE.some((person) => person === value);

export const isExpenseCategory = (value: unknown): value is ExpenseCategory =>
  typeof value === "string" && EXPENSE_CATEGORIES.some((category) => category === value);

export const isExpensePaymentMethod = (value: unknown): value is ExpensePaymentMethod =>
  typeof value === "string" && EXPENSE_PAYMENT_METHODS.some((method) => method === value);

export const getEffectiveKrw = (expense: Expense) => expense.actual_amount_krw ?? expense.amount_krw;

export const getExpenseCategoryLabel = (
  expense: Pick<Expense, "category" | "custom_category">,
) => expense.custom_category ?? EXPENSE_CATEGORY_META[expense.category].label;

export const getExpenseCategoryColor = (
  expense: Pick<Expense, "category" | "custom_category">,
) => expense.custom_category
  ? EXPENSE_CATEGORY_META.other.color
  : EXPENSE_CATEGORY_META[expense.category].color;

export const getExpenseCategoryKey = (
  expense: Pick<Expense, "category" | "custom_category">,
) => expense.custom_category ? `custom:${expense.custom_category}` : expense.category;

export const formatKrw = (value: number) => {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return `₩${safe.toLocaleString("ko-KR")}`;
};
export const formatLocalAmount = (value: number, currency: LocalCurrencyCode) => formatAmount(value, currency);

export const roundLocalAmount = (value: number, currency: LocalCurrencyCode) => roundAmount(value, currency);

/** 통화의 최소 단위(바트 0.01, 엔 1). */
export const getCurrencyStep = (currency: LocalCurrencyCode) => 10 ** -CURRENCY_INFO[currency].fractionDigits;

/** 여행지 현지 시간대 기준 YYYY-MM-DD. */
export const formatTripDateKey = (value: string, timeZone: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

export const formatTripDate = (value: string, timeZone: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone,
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(value));

export const formatTripTime = (value: string, timeZone: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));

/** 시각을 여행지 현지 날짜(YYYY-MM-DD)와 시간(HH:mm)으로 나눈다. */
export const getTripLocalParts = (value: Date | string, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(typeof value === "string" ? new Date(value) : value)
    .reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
};

/** 여행지 현지 날짜·시간(예: 2026-12-19, 14:30)을 UTC ISO 문자열로 바꾼다. utcOffset은 "+09:00" 형식. */
export const tripLocalToIso = (date: string, time: string, utcOffset: string) =>
  new Date(`${date}T${time}:00${utcOffset}`).toISOString();

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const summarizeExpenses = (expenses: Expense[]) => {
  const totalLocal = sum(expenses.map((expense) => expense.amount_local));
  const totalKrw = sum(expenses.map(getEffectiveKrw));
  const paid = {
    gahyun: sum(expenses.filter((expense) => expense.payer === "gahyun").map(getEffectiveKrw)),
    minu: sum(expenses.filter((expense) => expense.payer === "minu").map(getEffectiveKrw)),
  };
  const used = {
    gahyun: sum(expenses.map((expense) => expense.share_gahyun_krw)),
    minu: sum(expenses.map((expense) => expense.share_minu_krw)),
  };
  const gahyunBalance = paid.gahyun - used.gahyun;
  const settlement = Math.abs(gahyunBalance) < 1
    ? null
    : gahyunBalance > 0
      ? { from: "minu" as const, to: "gahyun" as const, amount: Math.round(gahyunBalance) }
      : { from: "gahyun" as const, to: "minu" as const, amount: Math.round(-gahyunBalance) };

  return { totalLocal, totalKrw, count: expenses.length, paid, used, settlement };
};

/** 여행 중 숏컷용 — 여행지 현지 날짜 기준 오늘·총 지출 원화 */
export const getExpenseShortcutAmounts = (expenses: Expense[], timeZone: string, now = new Date()) => {
  const todayKey = formatTripDateKey(now.toISOString(), timeZone);
  const todayKrw = sum(
    expenses
      .filter((expense) => formatTripDateKey(expense.purchased_at, timeZone) === todayKey)
      .map(getEffectiveKrw),
  );
  const { totalKrw } = summarizeExpenses(expenses);
  return { todayKrw, totalKrw };
};

export const aggregateExpensesByDate = (expenses: Expense[], timeZone: string) => {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => {
    const key = formatTripDateKey(expense.purchased_at, timeZone);
    totals.set(key, (totals.get(key) ?? 0) + getEffectiveKrw(expense));
  });
  return Array.from(totals, ([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
};

export const aggregateExpensesByCategory = (expenses: Expense[]) => {
  const totals = new Map<string, { key: string; label: string; color: string; amount: number }>();
  expenses.forEach((expense) => {
    const key = getExpenseCategoryKey(expense);
    const current = totals.get(key);
    totals.set(key, {
      key,
      label: getExpenseCategoryLabel(expense),
      color: getExpenseCategoryColor(expense),
      amount: (current?.amount ?? 0) + getEffectiveKrw(expense),
    });
  });
  return Array.from(totals.values()).sort((a, b) => b.amount - a.amount);
};

export const splitKrwByLocal = ({
  effectiveKrw,
  payer,
  totalLocal,
  gahyunLocal,
}: {
  effectiveKrw: number;
  payer: ExpensePerson;
  totalLocal: number;
  gahyunLocal: number;
}) => {
  if (gahyunLocal <= 0) return { gahyun: 0, minu: effectiveKrw };
  if (gahyunLocal >= totalLocal) return { gahyun: effectiveKrw, minu: 0 };
  const exactGahyun = (effectiveKrw * gahyunLocal) / totalLocal;
  const floorGahyun = Math.floor(exactGahyun);
  const floorMinu = Math.floor(effectiveKrw - exactGahyun);
  const remaining = effectiveKrw - floorGahyun - floorMinu;
  return {
    gahyun: floorGahyun + (remaining > 0 && payer === "gahyun" ? remaining : 0),
    minu: floorMinu + (remaining > 0 && payer === "minu" ? remaining : 0),
  };
};
