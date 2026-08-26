"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { getTodayScheduleFocus, type ScheduleItem } from "@/lib/schedule";
import { CalendarDaysIcon, type CalendarDaysIconHandle } from "@/components/ui/calendar-days";
import { cn } from "@/lib/utils";

const ICON_REPLAY_INTERVAL = 3_200;
const SYNC_INTERVAL_MS = 60_000;

const fetchSchedule = async (): Promise<ScheduleItem[]> => {
  const response = await fetch("/api/schedule");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "일정을 불러오지 못했어요.");
  return payload.data;
};

function ScheduleRow({
  label,
  time,
  title,
  emphasized = false,
}: {
  label: string;
  time: string;
  title: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="w-7 shrink-0 text-[10px] font-bold text-slate-500">{label}</span>
      <span className={cn("shrink-0 text-xs font-bold tabular-nums", emphasized ? "text-sky-600" : "text-slate-900")}>
        {time}
      </span>
      <span className="min-w-0 truncate text-xs font-bold text-slate-900">{title}</span>
    </div>
  );
}

export function DuringTripScheduleFloatingBar({ onOpenSchedule }: { onOpenSchedule: () => void }) {
  const animationRef = useRef<CalendarDaysIconHandle>(null);
  const prefersReducedMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const { data: scheduleItems = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  const focus = useMemo(() => getTodayScheduleFocus(scheduleItems, now), [now, scheduleItems]);

  const syncNow = useCallback(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Bangkok 시각 기준 일정 포커스는 마운트 직후 1회 동기화가 필요하다.
    syncNow();
    const interval = window.setInterval(syncNow, SYNC_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [syncNow]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    let frameId = 0;
    const playAnimation = () => {
      animationRef.current?.stopAnimation();
      frameId = window.requestAnimationFrame(() => animationRef.current?.startAnimation());
    };

    playAnimation();
    const intervalId = window.setInterval(playAnimation, ICON_REPLAY_INTERVAL);
    return () => {
      window.clearInterval(intervalId);
      window.cancelAnimationFrame(frameId);
    };
  }, [prefersReducedMotion, focus?.date]);

  if (!focus || (!focus.current && !focus.next)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: prefersReducedMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none fixed inset-x-4 right-20 z-[60] bottom-[calc(4.75rem+max(env(safe-area-inset-bottom,0px),12px))]"
      >
        <button
          type="button"
          onClick={onOpenSchedule}
          className="pointer-events-auto flex w-full items-center gap-2.5 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 text-left shadow-[0_14px_34px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-transform active:scale-[0.99]"
          aria-label="오늘 일정 보기"
        >
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <span className="text-[10px] font-semibold tabular-nums text-slate-400">{focus.dateLabel}</span>
            <div className="flex size-[17px] items-center justify-center" aria-hidden="true">
              <CalendarDaysIcon ref={animationRef} className="text-sky-500" size={17} />
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            {focus.current ? (
              <ScheduleRow emphasized label="지금" time={focus.current.start_time} title={focus.current.title} />
            ) : null}
            {focus.next ? (
              <ScheduleRow
                label="다음"
                time={focus.nextIsTomorrow ? `다음 날 ${focus.next.start_time}` : focus.next.start_time}
                title={focus.next.title}
              />
            ) : null}
          </div>

          <ChevronRight className="size-4 shrink-0 text-slate-300" aria-hidden="true" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
