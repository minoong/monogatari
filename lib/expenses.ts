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
  "other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_PAYMENT_METHODS = ["cash", "card", "qr", "other"] as const;
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
  other: { label: "기타", color: "#8e8e93" },
};

export const EXPENSE_PAYMENT_META: Record<ExpensePaymentMethod, string> = {
  cash: "현금",
  card: "카드",
  qr: "QR 결제",
  other: "기타",
};

export interface ExpenseImage {
  id: string;
  path: string;
  url: string;
  sort_order: number;
}

export interface Expense {
  id: string;
  purchased_at: string;
  item_name: string;
  category: ExpenseCategory;
  custom_category: string | null;
  merchant: string | null;
  payment_method: ExpensePaymentMethod;
  amount_thb: number;
  exchange_rate_krw_per_thb: number;
  exchange_rate_date: string;
  exchange_rate_source: ExpenseRateSource;
  amount_krw: number;
  actual_amount_krw: number | null;
  payer: ExpensePerson;
  share_gahyun_thb: number;
  share_minu_thb: number;
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
  amount_thb: number;
  exchange_rate_krw_per_thb: number;
  exchange_rate_date: string;
  rate_manually_edited: boolean;
  actual_amount_krw: number | null;
  payer: ExpensePerson;
  participants: ExpensePerson[];
  shares_thb: Record<ExpensePerson, number>;
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
export const formatThb = (value: number) => {
  const safe = Number.isFinite(value) ? value : 0;
  return `฿${safe.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`;
};

export const roundThb = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
};

export const formatBangkokDateKey = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));

export const formatBangkokDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Bangkok",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(value));

export const formatBangkokTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const summarizeExpenses = (expenses: Expense[]) => {
  const totalThb = sum(expenses.map((expense) => expense.amount_thb));
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

  return { totalThb, totalKrw, count: expenses.length, paid, used, settlement };
};

export const aggregateExpensesByDate = (expenses: Expense[]) => {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => {
    const key = formatBangkokDateKey(expense.purchased_at);
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

export const splitKrwByThb = ({
  effectiveKrw,
  payer,
  totalThb,
  gahyunThb,
}: {
  effectiveKrw: number;
  payer: ExpensePerson;
  totalThb: number;
  gahyunThb: number;
}) => {
  if (gahyunThb <= 0) return { gahyun: 0, minu: effectiveKrw };
  if (gahyunThb >= totalThb) return { gahyun: effectiveKrw, minu: 0 };
  const exactGahyun = (effectiveKrw * gahyunThb) / totalThb;
  const floorGahyun = Math.floor(exactGahyun);
  const floorMinu = Math.floor(effectiveKrw - exactGahyun);
  const remaining = effectiveKrw - floorGahyun - floorMinu;
  return {
    gahyun: floorGahyun + (remaining > 0 && payer === "gahyun" ? remaining : 0),
    minu: floorMinu + (remaining > 0 && payer === "minu" ? remaining : 0),
  };
};
