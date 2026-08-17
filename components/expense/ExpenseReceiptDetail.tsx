"use client";

import Image from "next/image";
import { useMemo, type ReactNode } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MorphingDialogClose, MorphingDialogDescription, MorphingDialogTitle } from "@/components/motion-primitives/morphing-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EXPENSE_PAYMENT_META,
  EXPENSE_PERSON_META,
  EXPENSE_PEOPLE,
  formatBangkokDate,
  formatBangkokTime,
  formatKrw,
  formatThb,
  getEffectiveKrw,
  getExpenseCategoryLabel,
  type Expense,
  type ExpensePerson,
} from "@/lib/expenses";
import { cn } from "@/lib/utils";

interface ExpenseReceiptDetailProps {
  expense: Expense;
  categoryColor: string;
  onDelete: () => void;
  onEdit: () => void;
}

export function ExpenseReceiptDetail({ expense, categoryColor, onDelete, onEdit }: ExpenseReceiptDetailProps) {
  const categoryLabel = getExpenseCategoryLabel(expense);
  const users = EXPENSE_PEOPLE.filter((person) => (person === "gahyun" ? expense.share_gahyun_thb > 0 : expense.share_minu_thb > 0));
  const receiptNo = expense.id.slice(0, 8).toUpperCase();

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-1 pb-2 pt-1">
        <article className="relative mx-auto w-full max-w-[340px] shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]">
          <MorphingDialogClose
            ariaLabel="상세 닫기"
            className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full border border-slate-300/80 bg-[#faf7f2]/90 font-mono text-xs font-bold text-slate-600 backdrop-blur-sm"
          />

          <ReceiptTearEdge flip />

          <div className="relative bg-[#faf7f2] px-5 pb-5 pt-6 text-slate-900">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #78716c 0px, transparent 1px, transparent 3px)",
              }}
            />

            {expense.images.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {expense.images.map((image, index) => (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-dashed border-slate-300 bg-white/70" key={image.id}>
                    <Image alt={index === 0 ? "영수증 사진" : `영수증 사진 ${index + 1}`} className="object-cover" fill sizes="64px" src={image.url} unoptimized />
                  </div>
                ))}
              </div>
            )}

            <header className="relative text-center">
              <MorphingDialogDescription disableLayoutAnimation className="sr-only">
                {expense.item_name} 지출 상세 영수증
              </MorphingDialogDescription>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">Monogatari Trip Receipt</p>
              <p className="mt-2 font-mono text-[11px] tabular-nums text-slate-500">NO. {receiptNo}</p>
              <p className="mt-3 text-sm font-extrabold tracking-tight text-slate-800">{expense.merchant ?? categoryLabel}</p>
              <MorphingDialogTitle>
                <h2 className="mt-1 break-words px-2 text-lg font-black leading-snug tracking-[-0.02em]">{expense.item_name}</h2>
              </MorphingDialogTitle>
              <p className="mt-2 font-mono text-[11px] tabular-nums text-slate-500">
                {formatBangkokDate(expense.purchased_at)} · {formatBangkokTime(expense.purchased_at)}
              </p>
            </header>

            <ReceiptRule className="my-4" />

            <div className="relative text-center">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Total Amount</p>
              <p className="mt-2 font-mono text-[38px] font-black leading-none tracking-[-0.04em] tabular-nums">{formatThb(expense.amount_thb)}</p>
              <p className="mt-2 font-mono text-sm font-bold tabular-nums text-slate-500">{formatKrw(getEffectiveKrw(expense))}</p>
              <span
                className="mt-3 inline-flex rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
              >
                {categoryLabel}
              </span>
            </div>

            <ReceiptRule className="my-4" />

            <section aria-label="구매 정보" className="relative space-y-2.5">
              <ReceiptRow label="구매 시각" value={`${formatBangkokDate(expense.purchased_at)} ${formatBangkokTime(expense.purchased_at)}`} />
              <ReceiptRow label="상호" value={expense.merchant ?? "기록 없음"} />
              <ReceiptRow label="결제 수단" value={EXPENSE_PAYMENT_META[expense.payment_method]} />
              <ReceiptRow label="적용 환율" value={`฿1 = ₩${expense.exchange_rate_krw_per_thb.toLocaleString()}`} />
              <p className="pt-0.5 text-center font-mono text-[10px] text-slate-400">{expense.exchange_rate_date} 기준</p>
            </section>

            <ReceiptRule className="my-4" />

            <section aria-label="함께 쓴 금액" className="relative space-y-2.5">
              <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Split Details</p>
              <ReceiptRow
                label="결제자"
                value={EXPENSE_PERSON_META[expense.payer].label}
                valueNode={<PersonValue person={expense.payer} />}
              />
              {users.map((person) => (
                <ReceiptShareRow expense={expense} key={person} person={person} />
              ))}
            </section>

            {expense.memo && (
              <>
                <ReceiptRule className="my-4" />
                <section aria-label="메모" className="relative">
                  <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Memo</p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-center text-xs leading-6 text-slate-700">{expense.memo}</p>
                </section>
              </>
            )}

            <ReceiptRule className="my-5" />

            <footer className="relative text-center">
              <ReceiptBarcode seed={expense.id} />
              <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-slate-500">Thank you</p>
              <p className="mt-1 font-mono text-[9px] text-slate-400">BANGKOK · THAILAND</p>
            </footer>
          </div>

          <ReceiptTearEdge />
        </article>
      </div>

      <div className="grid shrink-0 grid-cols-[44px_1fr_1fr] gap-2 border-t border-slate-200/80 bg-[#f3efe8] p-4 dark:border-slate-700 dark:bg-slate-900">
        <MorphingDialogClose ariaLabel="지출 삭제" className="static grid h-11 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-500" onClick={onDelete}>
          <Trash2 className="size-4" />
        </MorphingDialogClose>
        <MorphingDialogClose ariaLabel="상세 닫기" className="static grid h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          닫기
        </MorphingDialogClose>
        <MorphingDialogClose ariaLabel="지출 수정" className="static flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900" onClick={onEdit}>
          <Pencil className="size-4" />
          수정
        </MorphingDialogClose>
      </div>
    </div>
  );
}

function ReceiptTearEdge({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("block h-2.5 w-full text-[#faf7f2]", flip && "-scale-y-100")}
      preserveAspectRatio="none"
      viewBox="0 0 400 10"
    >
      <path
        d="M0,10 L8,0 L16,10 L24,0 L32,10 L40,0 L48,10 L56,0 L64,10 L72,0 L80,10 L88,0 L96,10 L104,0 L112,10 L120,0 L128,10 L136,0 L144,10 L152,0 L160,10 L168,0 L176,10 L184,0 L192,10 L200,0 L208,10 L216,0 L224,10 L232,0 L240,10 L248,0 L256,10 L264,0 L272,10 L280,0 L288,10 L296,0 L304,10 L312,0 L320,10 L328,0 L336,10 L344,0 L352,10 L360,0 L368,10 L376,0 L384,10 L392,0 L400,10 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ReceiptRule({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("border-t border-dashed border-slate-400/55", className)} />
  );
}

function ReceiptRow({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: ReactNode;
}) {
  return (
    <div className="flex items-end gap-1 font-mono text-[11px] leading-none text-slate-700">
      <span className="shrink-0 font-semibold text-slate-500">{label}</span>
      <span aria-hidden="true" className="mb-0.5 min-w-3 flex-1 border-b border-dotted border-slate-400/70" />
      {valueNode ?? <span className="max-w-[58%] shrink-0 text-right font-bold tabular-nums">{value}</span>}
    </div>
  );
}

function PersonValue({ person }: { person: ExpensePerson }) {
  const meta = EXPENSE_PERSON_META[person];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-bold">
      <Avatar className="!size-4" color={person === "gahyun" ? "accent" : "success"} size="sm">
        <AvatarImage alt="" src={meta.image} />
        <AvatarFallback>{person === "gahyun" ? "G" : "M"}</AvatarFallback>
      </Avatar>
      {meta.label}
    </span>
  );
}

function ReceiptShareRow({ expense, person }: { expense: Expense; person: ExpensePerson }) {
  const thb = person === "gahyun" ? expense.share_gahyun_thb : expense.share_minu_thb;
  const krw = person === "gahyun" ? expense.share_gahyun_krw : expense.share_minu_krw;
  return (
    <ReceiptRow
      label={EXPENSE_PERSON_META[person].label}
      valueNode={
        <span className="shrink-0 text-right font-bold tabular-nums">
          {formatThb(thb)}
          <span className="ml-1.5 text-[10px] font-semibold text-slate-400">{formatKrw(krw)}</span>
        </span>
      }
    />
  );
}

function ReceiptBarcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    return Array.from({ length: 48 }, (_, index) => {
      const value = (hash + index * 17) % 5;
      return { width: value === 0 ? 1 : value === 1 ? 2 : value === 2 ? 3 : value === 3 ? 1.5 : 2.5, tall: index % 4 !== 2 };
    });
  }, [seed]);

  return (
    <div aria-hidden="true" className="mx-auto flex h-11 max-w-[260px] items-end justify-center gap-px">
      {bars.map((bar, index) => (
        <span
          className="bg-slate-800"
          key={index}
          style={{ width: `${bar.width}px`, height: bar.tall ? "100%" : "72%" }}
        />
      ))}
    </div>
  );
}
