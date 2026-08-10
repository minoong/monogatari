"use client";

import { useEffect, useRef, useState } from "react";
import { Picker } from "@gfazioli/mantine-picker";
import { MantineProvider } from "@mantine/core";
import { Check, ChevronLeft, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { TRIP_START_DATE, type TripDate } from "@/lib/schedule";

type TripDateCalendarSheetProps = {
  open: boolean;
  value: TripDate | null;
  mode: "filter" | "editor";
  onConfirm: (value: TripDate | null) => void;
  onOpenChange: (open: boolean) => void;
};

type DateParts = {
  year: string;
  month: string;
  day: string;
};

const MONTHS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
const YEARS = Array.from({ length: 61 }, (_, index) => String(1970 + index));

const pickerProps = {
  withDividers: false,
  withHighlight: false,
  loop: true,
  maxRotation: 90,
  itemHeight: 38,
  visibleItems: 5,
  withMask: false,
  cylinderRadius: 3,
  preventPageScroll: true,
  hapticFeedback: true,
} as const;

const datePartsFromValue = (value: TripDate | null): DateParts => {
  const fallback = TRIP_START_DATE;
  const [year = "2026", month = "08", day = "29"] = (value ?? fallback).split("-");
  return { year, month, day };
};

const daysInMonth = (year: string, month: string) =>
  new Date(Number(year), Number(month), 0).getDate();

const daysFor = (year: string, month: string) =>
  Array.from({ length: daysInMonth(year, month) }, (_, index) =>
    String(index + 1).padStart(2, "0"),
  );

const formatSelectedDate = (parts: DateParts) => {
  const date = new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day), 12);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
};

const dateValue = (parts: DateParts): TripDate =>
  `${parts.year}-${parts.month}-${parts.day}`;

const clampDay = (parts: DateParts, changes: Partial<DateParts>): DateParts => {
  const next = { ...parts, ...changes };
  return {
    ...next,
    day: String(Math.min(Number(next.day), daysInMonth(next.year, next.month))).padStart(2, "0"),
  };
};

export function TripDateCalendarSheet({
  open,
  value,
  mode,
  onConfirm,
  onOpenChange,
}: TripDateCalendarSheetProps) {
  const [draft, setDraft] = useState<DateParts>(() => datePartsFromValue(value));
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const yearOptions = YEARS.includes(draft.year)
    ? YEARS
    : [...YEARS, draft.year].sort((a, b) => Number(a) - Number(b));

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      openerRef.current = document.activeElement as HTMLElement | null;
      setDraft(datePartsFromValue(value));
    }

    if (!open && wasOpenRef.current) {
      requestAnimationFrame(() => openerRef.current?.focus());
    }

    wasOpenRef.current = open;
  }, [open, value]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setDraft(datePartsFromValue(value));
    onOpenChange(nextOpen);
  };

  const confirm = (nextValue: TripDate | null = dateValue(draft)) => {
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
          </div>
          <DrawerDescription className="pl-12">
            원하는 날짜를 선택해 일정을 등록할 수 있어요.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel scrollable={false} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-8">
          <MantineProvider>
            <div
              data-base-ui-swipe-ignore
              className="touch-none rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center justify-center gap-0" aria-label="날짜 휠 선택기">
                <Picker
                  {...pickerProps}
                  w={62}
                  rotateY={-10}
                  value={draft.day}
                  data={daysFor(draft.year, draft.month)}
                  onChange={(day) => setDraft((current) => ({ ...current, day: String(day) }))}
                  label="일"
                  size="lg"
                />
                <Picker
                  {...pickerProps}
                  w={76}
                  value={draft.month}
                  data={MONTHS}
                  renderItem={(month) => `${Number(month)}월`}
                  onChange={(month) => setDraft((current) => clampDay(current, { month: String(month) }))}
                  label="월"
                  size="lg"
                />
                <Picker
                  {...pickerProps}
                  w={72}
                  rotateY={10}
                  value={draft.year}
                  data={yearOptions}
                  renderItem={(year) => `${year}년`}
                  onChange={(year) => setDraft((current) => clampDay(current, { year: String(year) }))}
                  label="연도"
                  size="lg"
                />
              </div>
            </div>
          </MantineProvider>
        </DrawerPanel>

        <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-1 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
          {mode === "filter" && (
            <Button type="button" variant="outline" className="h-12 w-full rounded-2xl text-base" onClick={() => confirm(null)}>
              <List className="size-4" />
              전체 일정 보기
            </Button>
          )}
          <Button type="button" className="h-12 w-full rounded-2xl text-base" onClick={() => confirm()}>
            <Check className="size-4" />
            {formatSelectedDate(draft)} 선택
          </Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
