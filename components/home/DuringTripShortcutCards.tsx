"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { ExpenseShortcutAmounts } from "@/components/expense/animated-expense-amount";
import { useExchangeRates } from "@/lib/exchange-rates";
import { getExpenseShortcutAmounts, type Expense } from "@/lib/expenses";
import { UTILITY_CARDS } from "@/lib/utility-cards";

type DuringTripShortcutCardsProps = {
  onOpenExpense: () => void;
  onOpenExchange: () => void;
};

const expenseUtilityCard = UTILITY_CARDS.find((card) => card.activity === "ExpenseActivity")!;
const exchangeUtilityCard = UTILITY_CARDS.find((card) => card.activity === "ExchangeActivity")!;

type ShortcutRowProps = {
  title: string;
  imageSrc: string;
  description: ReactNode;
  onPress: () => void;
};

function ShortcutRow({ title, imageSrc, description, onPress }: ShortcutRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="group flex w-full items-center gap-3.5 overflow-hidden rounded-3xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-slate-200/80 transition-transform active:scale-[0.99] dark:bg-slate-900 dark:ring-slate-800"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 shadow-md dark:border-slate-800">
        <Image src={imageSrc} alt={title} fill sizes="56px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-base font-bold text-[#00256C] dark:text-cyan-300">{title}</p>
        <div className="mt-0.5 min-w-0 text-sm text-slate-500 dark:text-slate-400">{description}</div>
      </div>
      <ChevronRight
        aria-hidden
        className="size-5 shrink-0 text-slate-400 transition-transform group-active:translate-x-0.5"
      />
    </button>
  );
}

const fetchExpenses = async (): Promise<Expense[]> => {
  const response = await fetch("/api/expenses");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "지출을 불러오지 못했어요.");
  return payload.data;
};

export function DuringTripShortcutCards({ onOpenExpense, onOpenExchange }: DuringTripShortcutCardsProps) {
  const { data: exchangeData } = useExchangeRates();
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });
  const thbRate = exchangeData?.THB ?? 42.8;
  const exchangePreview = `실시간 · ฿10 ≈ ₩${Math.round(thbRate * 10).toLocaleString("ko-KR")}`;
  const expenseAmounts = useMemo(() => getExpenseShortcutAmounts(expenses), [expenses]);

  return (
    <div className="flex flex-col gap-3">
      <ShortcutRow
        title={expenseUtilityCard.title}
        imageSrc={expenseUtilityCard.imageSrc}
        description={<ExpenseShortcutAmounts todayKrw={expenseAmounts.todayKrw} totalKrw={expenseAmounts.totalKrw} />}
        onPress={onOpenExpense}
      />

      <ShortcutRow
        title={exchangeUtilityCard.title}
        imageSrc={exchangeUtilityCard.imageSrc}
        description={exchangePreview}
        onPress={onOpenExchange}
      />
    </div>
  );
}
