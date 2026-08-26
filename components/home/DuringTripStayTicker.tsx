"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type HTMLAttributes, type RefAttributes } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@heroui/react";
import { X } from "lucide-react";
import {
  dismissDuringTripStayTicker,
  getDuringTripStayTickerInfo,
  isDuringTripStayTickerDismissed,
  type DuringTripStayTickerInfo,
} from "@/lib/accommodations";
import { formatTripDate, getFirstScheduleOnDate, type ScheduleItem, type TripDate } from "@/lib/schedule";
import { ArrowRightIcon } from "@/components/ui/arrow-right";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { HomeIcon } from "@/components/ui/home";

const TICKER_INTERVAL_MS = 3_600;
const ICON_REPLAY_INTERVAL = 3_200;

type StaySlide = {
  id: "stay";
  kind: "stay";
  dateLabel: string;
  checkoutCity: string;
  checkoutTime: string;
  checkinCity: string | null;
  checkinTime: string | null;
};

type ScheduleSlide = {
  id: "schedule";
  kind: "schedule";
  dateLabel: string;
  time: string;
  title: string;
};

type TickerSlide = StaySlide | ScheduleSlide;

type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type AnimatedIconComponent = ComponentType<
  HTMLAttributes<HTMLDivElement> & { size?: number } & RefAttributes<AnimatedIconHandle>
>;

const TICKER_ICONS = {
  home: HomeIcon,
  calendar: CalendarDaysIcon,
  arrow: ArrowRightIcon,
} satisfies Record<string, AnimatedIconComponent>;

const fetchSchedule = async (): Promise<ScheduleItem[]> => {
  const response = await fetch("/api/schedule");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "일정을 불러오지 못했어요.");
  return payload.data;
};

const buildTickerSlides = (info: DuringTripStayTickerInfo, scheduleItems: ScheduleItem[]): TickerSlide[] => {
  const slides: TickerSlide[] = [
    {
      id: "stay",
      kind: "stay",
      dateLabel: formatTripDate(info.tripDate as TripDate),
      checkoutCity: info.currentStay.city,
      checkoutTime: info.checkoutTime,
      checkinCity: info.nextStay?.city ?? null,
      checkinTime: info.nextCheckInTime,
    },
  ];
  const firstSchedule = getFirstScheduleOnDate(scheduleItems, info.tripDate as TripDate);

  if (firstSchedule) {
    slides.push({
      id: "schedule",
      kind: "schedule",
      dateLabel: formatTripDate(info.tripDate as TripDate),
      time: firstSchedule.start_time,
      title: firstSchedule.title,
    });
  }

  return slides;
};

function TickerAnimatedIcon({
  icon,
  replayKey,
  autoPlay = true,
  className,
  size = 17,
}: {
  icon: keyof typeof TICKER_ICONS;
  replayKey: string;
  autoPlay?: boolean;
  className?: string;
  size?: number;
}) {
  const animationRef = useRef<AnimatedIconHandle>(null);
  const Icon = TICKER_ICONS[icon];

  useEffect(() => {
    if (!autoPlay) return;

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
  }, [autoPlay, icon, replayKey]);

  return <Icon ref={animationRef} aria-hidden className={className} size={size} />;
}

function TickerDateLabel({ children }: { children: string }) {
  return <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-400">{children}</span>;
}

function StayMoment({ city, label, time }: { city: string; label: string; time: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="shrink-0 text-[10px] font-bold text-slate-600">{label}</span>
      <span className="shrink-0 text-xs font-bold text-slate-900">{city}</span>
      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900">{time}</span>
    </span>
  );
}

function TickerSlideContent({
  autoPlay,
  replayKey,
  slide,
}: {
  autoPlay: boolean;
  replayKey: string;
  slide: TickerSlide;
}) {
  if (slide.kind === "stay") {
    return (
      <>
        <TickerDateLabel>{slide.dateLabel}</TickerDateLabel>
        <div className="flex size-[17px] shrink-0 items-center justify-center" aria-hidden="true">
          <TickerAnimatedIcon autoPlay={autoPlay} className="text-sky-500" icon="home" replayKey={replayKey} size={17} />
        </div>
        <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
          <StayMoment city={slide.checkoutCity} label="체크아웃" time={slide.checkoutTime} />
          {slide.checkinCity && slide.checkinTime ? (
            <>
              <div className="flex size-3 shrink-0 items-center justify-center" aria-hidden="true">
                <TickerAnimatedIcon autoPlay={autoPlay} className="text-slate-300" icon="arrow" replayKey={replayKey} size={12} />
              </div>
              <StayMoment city={slide.checkinCity} label="체크인" time={slide.checkinTime} />
            </>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <TickerDateLabel>{slide.dateLabel}</TickerDateLabel>
      <div className="flex size-[17px] shrink-0 items-center justify-center" aria-hidden="true">
        <TickerAnimatedIcon autoPlay={autoPlay} className="text-sky-500" icon="calendar" replayKey={replayKey} size={17} />
      </div>
      <span className="shrink-0 text-xs font-bold tabular-nums text-sky-600">{slide.time}</span>
      <span className="min-w-0 truncate text-xs font-bold text-slate-900">{slide.title}</span>
    </>
  );
}

export function DuringTripStayTicker() {
  const [info, setInfo] = useState<DuringTripStayTickerInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const tripDateRef = useRef<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { data: scheduleItems = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });

  const sync = useCallback(() => {
    const nextInfo = getDuringTripStayTickerInfo();
    if (nextInfo?.tripDate !== tripDateRef.current) {
      tripDateRef.current = nextInfo?.tripDate ?? null;
      setCurrentIndex(0);
    }
    setInfo(nextInfo);
    setDismissed(nextInfo ? isDuringTripStayTickerDismissed(nextInfo.tripDate) : false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 클라이언트 전용이라 마운트 직후 1회 동기화가 필요하다.
    sync();
    const interval = window.setInterval(sync, 60_000);
    return () => window.clearInterval(interval);
  }, [sync]);

  const slides = useMemo(
    () => (info ? buildTickerSlides(info, scheduleItems) : []),
    [info, scheduleItems],
  );

  useEffect(() => {
    if (slides.length < 2 || prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % slides.length);
    }, TICKER_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [slides, prefersReducedMotion]);

  const handleDismiss = () => {
    if (!info) return;
    dismissDuringTripStayTicker(info.tripDate);
    setDismissed(true);
  };

  if (!info || dismissed) return null;

  const slide = slides[currentIndex % slides.length] ?? slides[0];

  return (
    <section
      className="flex h-12 w-full min-w-0 items-center gap-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)]"
      aria-label="숙소 전환 및 다음날 일정 안내"
      aria-live="polite"
    >
      <div className="relative h-7 min-w-0 w-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`${slide.id}-${currentIndex}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
            transition={{ duration: prefersReducedMotion ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex min-w-0 items-center gap-1.5 overflow-hidden"
          >
            <TickerSlideContent
              autoPlay={!prefersReducedMotion}
              replayKey={`${slide.id}-${currentIndex}`}
              slide={slide}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <Button
        aria-label="오늘 숙소 일정 안내 닫기"
        className="!size-7 !min-h-7 !min-w-7 shrink-0 text-slate-400 hover:text-slate-600"
        isIconOnly
        onPress={handleDismiss}
        size="sm"
        variant="ghost"
      >
        <X size={14} aria-hidden="true" />
      </Button>
    </section>
  );
}
