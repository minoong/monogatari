import { NextResponse } from "next/server";
import {
  isExpenseCategory,
  isExpensePaymentMethod,
  isExpensePerson,
  splitKrwByThb,
  type Expense,
  type ExpenseImage,
  type ExpensePerson,
} from "@/lib/expenses";
import { supabase } from "@/lib/supabase";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_PATH = /^expenses\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpe?g|png|webp)$/i;
const SELECT_EXPENSE = "*, expense_images(id, storage_path, sort_order)";

type ExpenseRow = Omit<Expense, "amount_thb" | "exchange_rate_krw_per_thb" | "share_gahyun_thb" | "share_minu_thb" | "images"> & {
  amount_thb: number | string;
  exchange_rate_krw_per_thb: number | string;
  share_gahyun_thb: number | string;
  share_minu_thb: number | string;
  expense_images?: { id: string; storage_path: string; sort_order: number }[];
};

const toExpense = (row: ExpenseRow): Expense => {
  const { expense_images: expenseImages = [], ...data } = row;
  return {
  ...data,
  amount_thb: Number(data.amount_thb),
  exchange_rate_krw_per_thb: Number(data.exchange_rate_krw_per_thb),
  share_gahyun_thb: Number(data.share_gahyun_thb),
  share_minu_thb: Number(data.share_minu_thb),
  images: expenseImages.sort((a, b) => a.sort_order - b.sort_order).map((image): ExpenseImage => ({
    id: image.id,
    path: image.storage_path,
    sort_order: image.sort_order,
    url: supabase.storage.from("expense-images").getPublicUrl(image.storage_path).data.publicUrl,
  })),
};
};

const isRealDate = (value: string) => {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const bangkokDate = (value: Date) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit",
}).format(value);

const optionalText = (value: unknown, max: number) => {
  if (value == null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed || null : undefined;
};

const money = (value: unknown, allowZero = false) => {
  const number = typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(number) || number < (allowZero ? 0 : 0.01) || Math.round(number * 100) !== number * 100) return undefined;
  return number;
};

const integerMoney = (value: unknown, optional = false) => {
  if (optional && (value == null || value === "")) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : undefined;
};

const parseInput = (body: Record<string, unknown>) => {
  const purchasedDate = typeof body.purchased_at === "string" ? new Date(body.purchased_at) : null;
  const purchasedAt = purchasedDate && Number.isFinite(purchasedDate.getTime()) && purchasedDate.getTime() <= Date.now() + 5 * 60 * 1000 ? body.purchased_at as string : null;
  const itemName = optionalText(body.item_name, 100);
  const customCategory = optionalText(body.custom_category, 30);
  const merchant = optionalText(body.merchant, 100);
  const memo = optionalText(body.memo, 500);
  const amountThb = money(body.amount_thb);
  const rate = Number(body.exchange_rate_krw_per_thb);
  const actualKrw = integerMoney(body.actual_amount_krw, true);
  const rateDate = typeof body.exchange_rate_date === "string" && isRealDate(body.exchange_rate_date) ? body.exchange_rate_date : null;
  const payer = body.payer;
  const participants = Array.isArray(body.participants) ? body.participants : null;
  const shares = body.shares_thb && typeof body.shares_thb === "object" ? body.shares_thb as Record<string, unknown> : null;
  const gahyunThb = shares ? money(shares.gahyun, true) : undefined;
  const minuThb = shares ? money(shares.minu, true) : undefined;
  const paths = Array.isArray(body.image_paths) ? body.image_paths : null;

  if (!purchasedAt || !itemName || customCategory === undefined || merchant === undefined || memo === undefined || !isExpenseCategory(body.category)
    || !isExpensePaymentMethod(body.payment_method) || amountThb === undefined || !Number.isFinite(rate) || rate <= 0
    || Math.round(rate * 1_000_000) !== rate * 1_000_000 || actualKrw === undefined || !rateDate
    || !isExpensePerson(payer) || !participants || participants.length < 1 || participants.length > 2
    || participants.some((person) => !isExpensePerson(person)) || new Set(participants).size !== participants.length
    || gahyunThb === undefined || minuThb === undefined || !paths || paths.length > 5
    || paths.some((path) => typeof path !== "string" || !IMAGE_PATH.test(path)) || new Set(paths).size !== paths.length
    || (body.payment_method !== "card" && actualKrw !== null)
    || (purchasedDate && rateDate && rateDate > bangkokDate(purchasedDate))
    || (customCategory !== null && body.category !== "other")) {
    return { error: "입력 내용을 확인해 주세요." } as const;
  }
  const selected = new Set<ExpensePerson>(participants as ExpensePerson[]);
  if ((!selected.has("gahyun") && gahyunThb !== 0) || (!selected.has("minu") && minuThb !== 0)
    || (selected.has("gahyun") && gahyunThb <= 0) || (selected.has("minu") && minuThb <= 0)
    || Math.round((gahyunThb + minuThb) * 100) !== Math.round(amountThb * 100)) {
    return { error: "비용 사용자별 분담액 합계가 결제 금액과 달라요." } as const;
  }

  const amountKrw = Math.round(amountThb * rate);
  if (amountKrw <= 0) return { error: "환산 금액을 확인해 주세요." } as const;
  const effectiveKrw = actualKrw ?? amountKrw;
  const krwShares = splitKrwByThb({ effectiveKrw, payer, totalThb: amountThb, gahyunThb });
  return {
    data: {
      purchased_at: new Date(purchasedAt).toISOString(), item_name: itemName, category: body.category,
      custom_category: customCategory,
      merchant, payment_method: body.payment_method, amount_thb: amountThb,
      exchange_rate_krw_per_thb: rate, exchange_rate_date: rateDate,
      exchange_rate_source: body.rate_manually_edited === true ? "manual_override" : "frankfurter",
      amount_krw: amountKrw, actual_amount_krw: actualKrw, payer,
      share_gahyun_thb: gahyunThb, share_minu_thb: minuThb,
      share_gahyun_krw: krwShares.gahyun, share_minu_krw: krwShares.minu,
      memo, image_paths: paths as string[],
    },
  } as const;
};

const removeStorage = async (paths: string[]) => {
  if (!paths.length) return null;
  const { error } = await supabase.storage.from("expense-images").remove(paths);
  return error;
};

const saveImages = async (expenseId: string, paths: string[]) => {
  if (!paths.length) return;
  const { error } = await supabase.from("expense_images").insert(
    paths.map((storage_path, sort_order) => ({ expense_id: expenseId, storage_path, sort_order })),
  );
  if (error) throw error;
};

export async function GET() {
  const { data, error } = await supabase.from("expenses").select(SELECT_EXPENSE).order("purchased_at", { ascending: false });
  if (error) {
    console.error("Expense list failed", error);
    return NextResponse.json({ error: "지출 내역을 불러오지 못했어요." }, { status: 500 });
  }
  return NextResponse.json({ data: (data ?? []).map((row) => toExpense(row as ExpenseRow)) });
}

export async function POST(request: Request) {
  let newPaths: string[] = [];
  let createdId: string | null = null;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "입력 내용을 확인해 주세요." }, { status: 400 });
    const input = parseInput(body as Record<string, unknown>);
    if (!input.data) return NextResponse.json({ error: input.error }, { status: 400 });
    const { image_paths, ...row } = input.data;
    newPaths = image_paths;
    const { data, error } = await supabase.from("expenses").insert(row).select("id").single();
    if (error) throw error;
    createdId = data.id;
    try {
      await saveImages(data.id, image_paths);
    } catch (error) {
      await supabase.from("expenses").delete().eq("id", data.id);
      throw error;
    }
    const saved = await supabase.from("expenses").select(SELECT_EXPENSE).eq("id", data.id).single();
    if (saved.error) throw saved.error;
    return NextResponse.json({ data: toExpense(saved.data as ExpenseRow) }, { status: 201 });
  } catch (error) {
    if (createdId) await supabase.from("expenses").delete().eq("id", createdId);
    if (newPaths.length) await removeStorage(newPaths);
    console.error("Expense create failed", error);
    return NextResponse.json({ error: "지출을 저장하지 못했어요." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !UUID_PATTERN.test(id)) return NextResponse.json({ error: "지출 ID를 확인해 주세요." }, { status: 400 });
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "입력 내용을 확인해 주세요." }, { status: 400 });
    const input = parseInput(body as Record<string, unknown>);
    if (!input.data) return NextResponse.json({ error: input.error }, { status: 400 });
    const current = await supabase.from("expenses").select("expense_images(storage_path)").eq("id", id).single();
    if (current.error) return NextResponse.json({ error: "지출 내역을 찾지 못했어요." }, { status: 404 });
    const oldPaths = (current.data.expense_images ?? []).map((image: { storage_path: string }) => image.storage_path);
    const { image_paths, ...row } = input.data;
    const { error } = await supabase.from("expenses").update({ ...row, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
    const deleted = await supabase.from("expense_images").delete().eq("expense_id", id);
    if (deleted.error) throw deleted.error;
    await saveImages(id, image_paths);
    const stalePaths = oldPaths.filter((path) => !image_paths.includes(path));
    if (stalePaths.length) {
      const cleanupError = await removeStorage(stalePaths);
      if (cleanupError) console.warn("Expense stale image cleanup failed", cleanupError);
    }
    const saved = await supabase.from("expenses").select(SELECT_EXPENSE).eq("id", id).single();
    if (saved.error) throw saved.error;
    return NextResponse.json({ data: toExpense(saved.data as ExpenseRow) });
  } catch (error) {
    console.error("Expense update failed", error);
    return NextResponse.json({ error: "지출을 수정하지 못했어요." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !UUID_PATTERN.test(id)) return NextResponse.json({ error: "지출 ID를 확인해 주세요." }, { status: 400 });
  try {
    const current = await supabase.from("expenses").select("id, expense_images(storage_path)").eq("id", id).single();
    if (current.error) return NextResponse.json({ error: "지출 내역을 찾지 못했어요." }, { status: 404 });
    const paths = (current.data.expense_images ?? []).map((image: { storage_path: string }) => image.storage_path);
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
    const cleanupError = await removeStorage(paths);
    if (cleanupError) console.warn("Expense image cleanup after delete failed", { id, cleanupError });
    return NextResponse.json({ data: { id: current.data.id, storage_cleanup_warning: Boolean(cleanupError) } });
  } catch (error) {
    console.error("Expense delete failed", error);
    return NextResponse.json({ error: "지출을 삭제하지 못했어요." }, { status: 500 });
  }
}
