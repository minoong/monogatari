"use client";

import { Check, ChevronDown, PlaneTakeoff } from "lucide-react";
import { useState } from "react";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { useTrip } from "@/components/providers/trip-provider";
import { Drawer, DrawerHeader, DrawerPanel, DrawerPopup, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { getTripPhase, type TripConfig, type TripPhase } from "@/lib/trips";

const PHASE_STYLE: Record<TripPhase, { label: string; className: string }> = {
  before: { label: "여행 전", className: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  during: { label: "여행 중", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  after: { label: "추억", className: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300" },
};

const formatRange = (trip: TripConfig) => {
  const [startYear, startMonth, startDay] = trip.startDate.split("-").map(Number);
  const [, endMonth, endDay] = trip.endDate.split("-").map(Number);
  const end = endMonth === startMonth ? `${endDay}` : `${endMonth}.${endDay}`;
  return `${startYear}.${startMonth}.${startDay} – ${end}`;
};

/** 출발 전이면 D-day, 아니면 null. */
const getDDay = (trip: TripConfig, now: Date) => {
  const days = Math.ceil((new Date(trip.phaseStartsAt).getTime() - now.getTime()) / 86_400_000);
  return days > 0 ? `D-${days}` : null;
};

/** 항공편이 있으면 출발-도착 공항, 없으면 도시 목록. */
const getRouteLabel = (trip: TripConfig) => {
  const outbound = trip.flights.find((flight) => flight.id === "outbound");
  if (outbound) return `${outbound.departure.code} → ${outbound.arrival.code}`;
  return trip.weatherPlaces.map((place) => place.label).join(" · ");
};

/** 앱바 오른쪽에 두는 작은 버튼. 현재 여행의 국기를 보여주고, 눌러서 다른 여행으로 바꾼다. */
export function TripSwitcherButton({ className }: { className?: string }) {
  const { trip } = useTrip();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-label={`${trip.shortName} 여행 선택`}
        className={cn(
          "mr-2 flex h-9 items-center gap-0.5 rounded-full bg-slate-100 pl-2.5 pr-1.5 text-lg leading-none transition-transform active:scale-90 motion-reduce:transition-none dark:bg-white/10",
          className,
        )}
        onClick={() => {
          triggerHapticFeedback(10);
          setOpen(true);
        }}
        type="button"
      >
        <span aria-hidden>{trip.flag}</span>
        <ChevronDown aria-hidden className="size-3.5 text-slate-400" />
      </button>
      <TripSwitcherDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}

export function TripSwitcherDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { trip: activeTrip, trips, setTripSlug } = useTrip();
  const now = new Date();
  // 가까운 여행이 위로 오도록 최신 순서.
  const ordered = [...trips].reverse();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup variant="inset" showBar className="overflow-hidden">
        <DrawerHeader className="px-4 pb-1 pt-5 text-center sm:px-6 sm:pt-6">
          <DrawerTitle>어느 여행을 볼까요?</DrawerTitle>
        </DrawerHeader>
        <DrawerPanel scrollable={false} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-6 pt-3 sm:px-6">
          {ordered.map((trip) => (
            <TripTicket
              key={trip.id}
              now={now}
              onSelect={() => {
                triggerHapticFeedback(14);
                setTripSlug(trip.slug);
                onOpenChange(false);
              }}
              selected={trip.id === activeTrip.id}
              trip={trip}
            />
          ))}
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
}

function TripTicket({ trip, selected, now, onSelect }: { trip: TripConfig; selected: boolean; now: Date; onSelect: () => void }) {
  const phase = getTripPhase(trip, now);
  const style = PHASE_STYLE[phase];
  const dDay = phase === "before" ? getDDay(trip, now) : null;

  return (
    <button
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full min-w-0 overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-[transform,box-shadow] active:scale-[0.985] motion-reduce:transition-none dark:bg-slate-900",
        !selected && "border-slate-200 dark:border-slate-700",
      )}
      onClick={onSelect}
      style={selected ? { borderColor: trip.theme.accent, boxShadow: `0 0 0 3px ${trip.theme.accent}33` } : undefined}
      type="button"
    >
      {/* 왼쪽 스텁: 국기와 도시 */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-1 px-2 py-5" style={{ backgroundColor: trip.theme.tint }}>
        <span aria-hidden className="text-3xl leading-none">{trip.flag}</span>
        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{trip.shortName}</span>
        <span className="text-[10px] font-semibold tracking-wide text-slate-400">{trip.currency.code}</span>
      </div>

      {/* 티켓 절취선과 홈 */}
      <div aria-hidden className="relative w-0 shrink-0 border-l-2 border-dashed border-slate-200 dark:border-slate-700">
        <span className="absolute -left-[9px] -top-[9px] size-4 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950" />
        <span className="absolute -bottom-[9px] -left-[9px] size-4 rounded-full border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold", style.className)}>{style.label}</span>
          {dDay && <span className="text-[11px] font-extrabold tabular-nums text-sky-600 dark:text-sky-300">{dDay}</span>}
          {selected && <Check aria-label="선택됨" className="ml-auto size-4 shrink-0" style={{ color: trip.theme.accent }} />}
        </div>
        <p className="truncate text-[15px] font-extrabold tracking-[-0.01em] text-slate-900 dark:text-white">{trip.name}</p>
        <div className="flex min-w-0 flex-col gap-1 text-[11px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
          <span className="whitespace-nowrap">{formatRange(trip)}</span>
          <span className="flex min-w-0 items-center gap-1.5">
            <PlaneTakeoff aria-hidden className="size-3 shrink-0" />
            <span className="truncate">{getRouteLabel(trip)}</span>
          </span>
        </div>
      </div>
    </button>
  );
}
