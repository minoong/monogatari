"use client";

import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CalendarDays, Check, ChevronLeft, List } from "lucide-react";
import { ko } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  isTripDate,
  TRIP_END_DATE,
  TRIP_START_DATE,
  type TripDate,
} from "@/lib/schedule";

type TripDateCalendarSheetProps = {
  open: boolean;
  value: TripDate | null;
  mode: "filter" | "editor";
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

const formatSelectedDate = (value: TripDate | null) => {
  if (!value) return "날짜를 선택해 주세요";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(dateFromValue(value));
};

const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);

const differenceInMonths = (start: Date, end: Date) =>
  (end.getFullYear() - start.getFullYear()) * 12 +
  end.getMonth() -
  start.getMonth();

const TRIP_MONTH = dateFromValue(TRIP_START_DATE);
const FIRST_MONTH = addMonths(TRIP_MONTH, -12);
const LAST_MONTH = addMonths(dateFromValue(TRIP_END_DATE), 12);
const MONTHS = Array.from(
  { length: differenceInMonths(FIRST_MONTH, LAST_MONTH) + 1 },
  (_, index) => addMonths(FIRST_MONTH, index),
);

const getMonthIndex = (value: TripDate | null) => {
  const month = value ? dateFromValue(value) : TRIP_MONTH;
  return Math.max(
    0,
    Math.min(MONTHS.length - 1, differenceInMonths(FIRST_MONTH, month)),
  );
};

const getMonthSize = (index: number) => {
  const month = MONTHS[index];
  const days = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const weeks = Math.ceil((month.getDay() + days) / 7);
  return 152 + weeks * 40;
};

const getMonthOffset = (index: number) =>
  MONTHS.slice(0, index).reduce(
    (offset, _month, monthIndex) => offset + getMonthSize(monthIndex),
    0,
  );

export function TripDateCalendarSheet({
  open,
  value,
  mode,
  onConfirm,
  onOpenChange,
}: TripDateCalendarSheetProps) {
  const [draft, setDraft] = useState<TripDate | null>(value);
  const [visibleMonth, setVisibleMonth] = useState(
    MONTHS[getMonthIndex(value)],
  );
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      openerRef.current = document.activeElement as HTMLElement | null;
      setDraft(value);
      setVisibleMonth(MONTHS[getMonthIndex(value)]);
    }

    if (!open && wasOpenRef.current) {
      requestAnimationFrame(() => openerRef.current?.focus());
    }

    wasOpenRef.current = open;
  }, [open, value]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setDraft(value);
    onOpenChange(nextOpen);
  };

  const confirm = (nextValue: TripDate | null = draft) => {
    onConfirm(nextValue);
    onOpenChange(false);
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
            <button
              type="button"
              aria-label="날짜 선택 닫기"
              className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted active:scale-95"
              onClick={() => handleOpenChange(false)}
            >
              <ChevronLeft className="size-5" />
            </button>
            <DrawerTitle className="min-w-0 flex-1">날짜 선택</DrawerTitle>
            <span
              aria-live="polite"
              className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
            >
              {formatMonth(visibleMonth)}
            </span>
          </div>
          <DrawerDescription className="pl-12">
            여행 일정이 있는 날짜만 선택할 수 있어요.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel
          scrollable={false}
          className="min-h-0 flex-1 overflow-hidden p-0"
        >
          {open && (
            <VirtualMonthList
              key={value ?? "all"}
              selected={draft}
              initialValue={value}
              onSelect={setDraft}
              onVisibleMonthChange={setVisibleMonth}
            />
          )}
        </DrawerPanel>

        <DrawerFooter className="shrink-0 gap-3 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:flex-row">
          {mode === "filter" && (
            <Button
              type="button"
              variant="outline"
              className="h-12 flex-1"
              onClick={() => confirm(null)}
            >
              <List className="size-4" />
              전체 일정 보기
            </Button>
          )}
          <Button
            type="button"
            className="h-12 flex-1"
            disabled={!draft}
            onClick={() => confirm()}
          >
            {draft ? (
              <>
                <Check className="size-4" />
                {formatSelectedDate(draft)} 선택
              </>
            ) : (
              <>
                <CalendarDays className="size-4" />
                날짜를 선택해 주세요
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}

function VirtualMonthList({
  selected,
  initialValue,
  onSelect,
  onVisibleMonthChange,
}: {
  selected: TripDate | null;
  initialValue: TripDate | null;
  onSelect: (value: TripDate) => void;
  onVisibleMonthChange: (month: Date) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialMonthIndex = getMonthIndex(initialValue);
  // TanStack Virtual exposes imperative functions by design; React Compiler
  // correctly leaves this component un-memoized.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: MONTHS.length,
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
    onVisibleMonthChange(MONTHS[visibleMonthIndex]);
  }, [onVisibleMonthChange, visibleMonthIndex]);

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
          const month = MONTHS[virtualMonth.index];
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
                disabled={(date) => !isTripDate(formatDateValue(date))}
                onSelect={(date) => {
                  if (!date) return;
                  const nextValue = formatDateValue(date);
                  if (isTripDate(nextValue)) onSelect(nextValue);
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
