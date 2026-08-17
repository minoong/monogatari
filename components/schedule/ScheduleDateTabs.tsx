"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs } from "@heroui/react";
import { formatTripDate, type TripDate } from "@/lib/schedule";
import { cn } from "@/lib/utils";

interface ScheduleDateTabsProps {
  dates: TripDate[];
  activeDate: TripDate | null;
  today: string;
  onChange: (date: TripDate) => void;
}

export function ScheduleDateTabs({ dates, activeDate, today, onChange }: ScheduleDateTabsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);
  const prefersReducedMotion = useReducedMotion();
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
        <Tabs.ListContainer className="overflow-x-auto bg-transparent no-scrollbar">
          <Tabs.List className="mx-auto w-fit min-w-max justify-start gap-1 rounded-full !bg-slate-100 p-1 shadow-none dark:!bg-slate-900">
            {dates.map((date) => {
              const selected = date === activeDate;

              return (
                <Tabs.Tab
                  key={date}
                  id={date}
                  className={cn(
                    "relative z-0 min-w-20 px-4 py-2 text-sm font-bold transition-colors",
                    selected ? "text-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400",
                  )}
                >
                  {selected && (
                    <motion.span
                      aria-hidden="true"
                      layoutId="schedule-date-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-slate-900 shadow-sm dark:bg-white"
                      transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38, mass: 0.8 }}
                    />
                  )}
                  <span className="flex items-center justify-center gap-1.5">
                    {formatTripDate(date)}
                    {date === today && (
                      <span
                        aria-label="오늘"
                        role="img"
                        className={cn("size-1.5 rounded-full", selected ? "bg-blue-400 dark:bg-blue-500" : "bg-blue-500")}
                      />
                    )}
                  </span>
                </Tabs.Tab>
              );
            })}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  );
}
