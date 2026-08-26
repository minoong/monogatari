"use client";

import { useEffect, useRef } from "react";
import { Tabs } from "@heroui/react";
import { formatTripDate, type TripDate } from "@/lib/schedule";

interface ScheduleDateTabsProps {
  dates: TripDate[];
  activeDate: TripDate | null;
  today: string;
  onChange: (date: TripDate) => void;
}

export function ScheduleDateTabs({ dates, activeDate, today, onChange }: ScheduleDateTabsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);
  const activeIndex = activeDate ? dates.indexOf(activeDate) : -1;

  // 마운트 시에는 "지금" 일정 자동 스크롤과 부딪히므로 사용자가 날짜를 바꿀 때만 탭을 따라간다.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (activeIndex < 0) return;
    const tab = rootRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex];
    tab?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeIndex]);

  return (
    <div ref={rootRef}>
      <Tabs
        aria-label="일정 날짜"
        className="w-full"
        selectedKey={activeDate ?? undefined}
        onSelectionChange={(key) => onChange(String(key) as TripDate)}
      >
        <Tabs.ListContainer className="overflow-x-auto bg-transparent p-0 no-scrollbar">
          <Tabs.List
            aria-label="일정 날짜"
            className="mx-auto flex w-fit min-w-max gap-1 rounded-xl bg-slate-100 p-1 shadow-none ring-1 ring-inset ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800"
          >
            {dates.map((date) => (
              <Tabs.Tab
                key={date}
                id={date}
                className="group relative z-0 !h-7 !min-h-7 min-w-16 self-center rounded-lg px-2 text-xs font-bold text-slate-500 data-[selected=true]:text-slate-950 dark:text-slate-400 dark:data-[selected=true]:text-white"
              >
                <span className="flex items-center justify-center gap-1.5">
                  {formatTripDate(date)}
                  {dates.includes(today) && date === today && (
                    <span
                      aria-label="오늘"
                      role="img"
                      className="size-1.5 rounded-full bg-blue-500"
                    />
                  )}
                </span>
                <Tabs.Indicator className="-z-10 rounded-lg bg-white shadow-[0_2px_5px_rgba(15,23,42,0.14)] ring-1 ring-inset ring-slate-200/80 dark:bg-slate-700 dark:ring-slate-600" />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  );
}
