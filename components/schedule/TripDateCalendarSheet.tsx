"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button as HeroButton } from "@heroui/react";
import { ChevronLeft } from "lucide-react";
import { ko } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { DrawerIntro, drawerCancelButtonClass, drawerPrimaryButtonClass } from "@/components/ui/drawer-form";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { TripDate } from "@/lib/schedule";

type TripDateCalendarSheetProps = {
  open: boolean;
  value: TripDate | null;
  mode: "filter" | "editor";
  /** 여행 첫날과 마지막 날. 달력 범위와 일정 날짜 강조 표시에 쓴다. */
  tripStartDate: TripDate;
  tripEndDate: TripDate;
  onConfirm: (value: TripDate | null) => void;
  onOpenChange: (open: boolean) => void;
};

const dateFromValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const formatDateValue = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(date);

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);

const differenceInMonths = (start: Date, end: Date) =>
  (end.getFullYear() - start.getFullYear()) * 12 +
  end.getMonth() -
  start.getMonth();

/** 여행 기간의 앞뒤 12개월을 보여주는 월 목록과 위치 계산 도구. */
const createMonthRange = (startDate: TripDate, endDate: TripDate) => {
  const tripMonth = dateFromValue(startDate);
  const firstMonth = addMonths(tripMonth, -12);
  const lastMonth = addMonths(dateFromValue(endDate), 12);
  const months = Array.from(
    { length: differenceInMonths(firstMonth, lastMonth) + 1 },
    (_, index) => addMonths(firstMonth, index),
  );
  const getMonthIndex = (value: TripDate | null) => {
    const month = value ? dateFromValue(value) : tripMonth;
    return Math.max(0, Math.min(months.length - 1, differenceInMonths(firstMonth, month)));
  };
  const getMonthSize = (index: number) => {
    const month = months[index];
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const weeks = Math.ceil((month.getDay() + days) / 7);
    return 152 + weeks * 40;
  };
  const getMonthOffset = (index: number) =>
    months.slice(0, index).reduce((offset, _month, monthIndex) => offset + getMonthSize(monthIndex), 0);
  return { months, getMonthIndex, getMonthSize, getMonthOffset };
};

type MonthRange = ReturnType<typeof createMonthRange>;

export function TripDateCalendarSheet({
  open,
  value,
  mode,
  tripStartDate,
  tripEndDate,
  onConfirm,
  onOpenChange,
}: TripDateCalendarSheetProps) {
  const range = useMemo(() => createMonthRange(tripStartDate, tripEndDate), [tripStartDate, tripEndDate]);
  const [draft, setDraft] = useState<TripDate | null>(value);
  const [visibleMonth, setVisibleMonth] = useState(
    range.months[range.getMonthIndex(value)],
  );
  const [todayJumpRequest, setTodayJumpRequest] = useState(0);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      openerRef.current = document.activeElement as HTMLElement | null;
      setDraft(value);
      setVisibleMonth(range.months[range.getMonthIndex(value)]);
    }

    if (!open && wasOpenRef.current) {
      requestAnimationFrame(() => openerRef.current?.focus());
    }

    wasOpenRef.current = open;
  }, [open, value, range]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setDraft(value);
    onOpenChange(nextOpen);
  };

  const confirm = (nextValue: TripDate | null = draft) => {
    onConfirm(nextValue);
    onOpenChange(false);
  };

  const selectToday = () => {
    const today = formatDateValue(new Date());
    setDraft(today);
    setVisibleMonth(range.months[range.getMonthIndex(today)]);
    setTodayJumpRequest((request) => request + 1);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerPopup
        variant="inset"
        showBar
        className="h-[calc(100dvh-4rem)] overflow-hidden sm:mx-auto sm:max-w-lg"
      >
        <DrawerHeader className="shrink-0 border-b px-5 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <HeroButton
              aria-label="날짜 선택 닫기"
              className="grid size-9 min-w-9 shrink-0 place-items-center rounded-full text-muted-foreground"
              isIconOnly
              onPress={() => handleOpenChange(false)}
              size="sm"
              variant="ghost"
            >
              <ChevronLeft className="size-5" />
            </HeroButton>
            <DrawerTitle className="min-w-0 flex-1">날짜 선택</DrawerTitle>
            <HeroButton
              className="h-8 rounded-full px-3 text-sm"
              onPress={selectToday}
              size="sm"
              variant="secondary"
            >
              오늘
            </HeroButton>
            <span
              aria-live="polite"
              className="inline-flex h-8 shrink-0 items-center rounded-full border border-border bg-muted px-3 text-sm font-bold text-foreground"
            >
              {formatMonth(visibleMonth)}
            </span>
          </div>
          <div className="mt-3 px-1">
            <DrawerIntro open={open} image="/drawer-calendar-intro.jpg" alt="달력을 확인하는 두 사람" />
          </div>
        </DrawerHeader>

        <DrawerPanel
          scrollable={false}
          className="min-h-0 flex-1 overflow-hidden p-0"
        >
          {open && (
            <VirtualMonthList
              key={value ?? "all"}
              range={range}
              highlightStart={tripStartDate}
              highlightEnd={tripEndDate}
              selected={draft}
              initialValue={value}
              todayJumpRequest={todayJumpRequest}
              onSelect={setDraft}
              onVisibleMonthChange={setVisibleMonth}
            />
          )}
        </DrawerPanel>

        <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
          <HeroButton
            fullWidth
            className={drawerCancelButtonClass}
            onPress={() => mode === "filter" ? confirm(null) : handleOpenChange(false)}
            size="lg"
            type="button"
          >
            {mode === "filter" ? "전체 일정 보기" : "취소"}
          </HeroButton>
          <HeroButton
            fullWidth
            className={drawerPrimaryButtonClass}
            isDisabled={!draft}
            onPress={() => confirm()}
            size="lg"
            type="button"
          >
            선택하기
          </HeroButton>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

function VirtualMonthList({
  range,
  highlightStart,
  highlightEnd,
  selected,
  initialValue,
  todayJumpRequest,
  onSelect,
  onVisibleMonthChange,
}: {
  range: MonthRange;
  highlightStart: TripDate;
  highlightEnd: TripDate;
  selected: TripDate | null;
  initialValue: TripDate | null;
  todayJumpRequest: number;
  onSelect: (value: TripDate) => void;
  onVisibleMonthChange: (month: Date) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { months, getMonthIndex, getMonthSize, getMonthOffset } = range;
  const initialMonthIndex = getMonthIndex(initialValue);
  // TanStack Virtual exposes imperative functions by design; React Compiler
  // correctly leaves this component un-memoized.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: months.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: getMonthSize,
    initialOffset: getMonthOffset(initialMonthIndex),
    overscan: 2,
  });
  const virtualMonths = virtualizer.getVirtualItems();
  const visibleMonthIndex =
    virtualMonths.find(
      (item) => item.end > (virtualizer.scrollOffset ?? 0) + 80,
    )?.index ?? initialMonthIndex;

  useEffect(() => {
    if (!todayJumpRequest) return;
    const today = formatDateValue(new Date());
    virtualizer.scrollToIndex(getMonthIndex(today), {
      align: "start",
      behavior: "smooth",
    });
  }, [todayJumpRequest, virtualizer, getMonthIndex]);

  useEffect(() => {
    onVisibleMonthChange(months[visibleMonthIndex]);
  }, [onVisibleMonthChange, visibleMonthIndex, months]);

  return (
    <div
      ref={scrollRef}
      className="h-full touch-pan-y overflow-y-auto overscroll-contain px-4"
      aria-label="여행 날짜 월별 목록"
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualMonths.map((virtualMonth) => {
          const month = months[virtualMonth.index];
          return (
            <section
              key={`${month.getFullYear()}-${month.getMonth()}`}
              className="absolute left-0 top-0 w-full pb-10 pt-7"
              style={{ transform: `translateY(${virtualMonth.start}px)` }}
              aria-labelledby={`trip-month-${virtualMonth.index}`}
            >
              <h3
                id={`trip-month-${virtualMonth.index}`}
                className="mb-4 px-2 text-lg font-extrabold text-foreground"
              >
                {formatMonth(month)}
              </h3>
              <Calendar
                mode="single"
                month={month}
                startMonth={month}
                endMonth={month}
                hideNavigation
                locale={ko}
                showOutsideDays={false}
                selected={selected ? dateFromValue(selected) : undefined}
                modifiers={{
                  tripSchedule: (date) =>
                    formatDateValue(date) >= highlightStart &&
                    formatDateValue(date) <= highlightEnd,
                }}
                modifiersClassNames={{
                  selected:
                    "[&>button]:!bg-[#ec4899] [&>button]:!text-white [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:start-1/2 [&>button]:after:size-1.5 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-white [&>button]:after:content-['']",
                  tripSchedule:
                    "[&>button]:!font-extrabold [&>button]:!text-[#ec4899] [&>button]:after:absolute [&>button]:after:bottom-1 [&>button]:after:start-1/2 [&>button]:after:size-1 [&>button]:after:-translate-x-1/2 [&>button]:after:rounded-full [&>button]:after:bg-[#ec4899] [&>button]:after:content-[''] dark:[&>button]:!text-[#f472b6] [&[data-selected]>button]:!bg-[#ec4899] [&[data-selected]>button]:!text-white [&[data-selected]>button]:after:bg-white",
                }}
                onSelect={(date) => {
                  if (!date) return;
                  const nextValue = formatDateValue(date);
                  onSelect(nextValue);
                }}
                className="mx-auto w-full [--cell-size:2.5rem]"
                classNames={{
                  month_caption: "hidden",
                  nav: "hidden",
                  months: "w-full",
                  month: "mx-auto w-fit",
                }}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}
