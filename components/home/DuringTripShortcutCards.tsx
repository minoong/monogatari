"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightLeft, CalendarDays, ChevronRight, Languages, Receipt } from "lucide-react";
import { useExchangeRates } from "@/lib/exchange-rates";
import { getUpcomingSchedulePreview, type ScheduleItem } from "@/lib/schedule";
import { cn } from "@/lib/utils";

type DuringTripShortcutCardsProps = {
  onOpenSchedule: () => void;
  onOpenDictionary: () => void;
  onOpenExpense: () => void;
  onOpenExchange: () => void;
};

type ShortcutTileProps = {
  title: string;
  description: string;
  icon: ReactNode;
  iconWrapClassName: string;
  surfaceClassName: string;
  onPress: () => void;
};

function ShortcutTile({
  title,
  description,
  icon,
  iconWrapClassName,
  surfaceClassName,
  onPress,
}: ShortcutTileProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "group relative flex min-h-[118px] w-full flex-col justify-between overflow-hidden rounded-[22px] p-4 text-left shadow-[0_12px_32px_-18px_rgba(15,23,42,0.35)] ring-1 ring-black/[0.04] transition-transform active:scale-[0.98] dark:ring-white/10",
        surfaceClassName,
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/[0.04]",
          iconWrapClassName,
        )}
      >
        {icon}
      </div>
      <div className="relative z-[1]">
        <p className="text-[15px] font-bold tracking-[-0.02em] text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ChevronRight
        aria-hidden
        className="absolute right-3.5 top-3.5 size-4 text-slate-300 transition-transform group-active:translate-x-0.5 dark:text-slate-600"
      />
    </button>
  );
}

type ShortcutRowProps = {
  title: string;
  description: string;
  icon: ReactNode;
  iconWrapClassName: string;
  surfaceClassName: string;
  onPress: () => void;
};

function ShortcutRow({
  title,
  description,
  icon,
  iconWrapClassName,
  surfaceClassName,
  onPress,
}: ShortcutRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "group flex w-full items-center gap-3.5 overflow-hidden rounded-[22px] px-4 py-4 text-left shadow-[0_12px_32px_-18px_rgba(15,23,42,0.28)] ring-1 ring-black/[0.04] transition-transform active:scale-[0.99] dark:ring-white/10",
        surfaceClassName,
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-md ring-1 ring-black/[0.04]",
          iconWrapClassName,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-bold tracking-[-0.02em] text-slate-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <ChevronRight
        aria-hidden
        className="size-5 shrink-0 text-slate-300 transition-transform group-active:translate-x-0.5 dark:text-slate-600"
      />
    </button>
  );
}

const fetchSchedule = async (): Promise<ScheduleItem[]> => {
  const response = await fetch("/api/schedule");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "일정을 불러오지 못했어요.");
  return payload.data;
};

export function DuringTripShortcutCards({
  onOpenSchedule,
  onOpenDictionary,
  onOpenExpense,
  onOpenExchange,
}: DuringTripShortcutCardsProps) {
  const { data: exchangeData } = useExchangeRates();
  const { data: scheduleItems = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });
  const thbRate = exchangeData?.THB ?? 42.8;
  const exchangePreview = `100바트 ≈ ${Math.round(thbRate * 100).toLocaleString("ko-KR")}원`;
  const schedulePreview = getUpcomingSchedulePreview(scheduleItems) ?? "타임라인 보기";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <ShortcutTile
          title="오늘의 일정"
          description={schedulePreview}
          icon={<CalendarDays className="size-5 text-sky-600 dark:text-sky-300" strokeWidth={2.2} />}
          iconWrapClassName="bg-white/80 dark:bg-sky-950/50"
          surfaceClassName="bg-gradient-to-br from-sky-100 via-white to-blue-50 dark:from-sky-950/80 dark:via-slate-900 dark:to-blue-950/60"
          onPress={onOpenSchedule}
        />
        <ShortcutTile
          title="태국어 회화"
          description="발음 · 크게 보기"
          icon={<Languages className="size-5 text-amber-700 dark:text-amber-300" strokeWidth={2.2} />}
          iconWrapClassName="bg-white/80 dark:bg-amber-950/40"
          surfaceClassName="bg-gradient-to-br from-amber-100 via-white to-orange-50 dark:from-amber-950/70 dark:via-slate-900 dark:to-orange-950/50"
          onPress={onOpenDictionary}
        />
      </div>

      <ShortcutRow
        title="여행 가계부"
        description="지출 등록 · 통계 · 자동 정산"
        icon={<Receipt className="size-5 text-white" strokeWidth={2.2} />}
        iconWrapClassName="bg-gradient-to-br from-violet-500 to-indigo-600 shadow-violet-500/30"
        surfaceClassName="bg-gradient-to-r from-white via-violet-50/70 to-indigo-50/80 dark:from-slate-900 dark:via-violet-950/30 dark:to-indigo-950/20"
        onPress={onOpenExpense}
      />

      <ShortcutRow
        title="빠른 환율 계산"
        description={exchangePreview}
        icon={<ArrowRightLeft className="size-5 text-white" strokeWidth={2.2} />}
        iconWrapClassName="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
        surfaceClassName="bg-gradient-to-r from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30"
        onPress={onOpenExchange}
      />
    </div>
  );
}
