"use client";

import type { ReactNode } from "react";
import { Tabs } from "@heroui/react";
import { cn } from "@/lib/utils";

type CompactSegmentedTab = {
  id: string;
  label: ReactNode;
};

type CompactSegmentedTabsListProps = {
  items: CompactSegmentedTab[];
  ariaLabel: string;
  className?: string;
  listClassName?: string;
};

export function CompactSegmentedTabsList({ items, ariaLabel, className, listClassName }: CompactSegmentedTabsListProps) {
  return (
    <Tabs.ListContainer className={cn("bg-transparent p-0", className)}>
      <Tabs.List aria-label={ariaLabel} className={cn("grid h-9 w-full grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 shadow-none ring-1 ring-inset ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800", listClassName)}>
        {items.map((item) => (
          <Tabs.Tab
            id={item.id}
            key={item.id}
            className="group relative z-0 !h-7 !min-h-7 min-w-0 self-center rounded-lg px-1.5 text-xs font-bold text-slate-500 data-[selected=true]:text-slate-950 dark:text-slate-400 dark:data-[selected=true]:text-white"
          >
            {item.label}
            <Tabs.Indicator className="-z-10 rounded-lg bg-white shadow-[0_2px_5px_rgba(15,23,42,0.14)] ring-1 ring-inset ring-slate-200/80 dark:bg-slate-700 dark:ring-slate-600" />
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.ListContainer>
  );
}
