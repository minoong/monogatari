"use client";

import { useStack } from "@stackflow/react";

import { BottomNav, type BottomNavItem } from "@/components/BottomNav";

const ACTIVITY_TO_NAV: Record<string, BottomNavItem> = {
  HomeActivity: "home",
  ScheduleActivity: "schedule",
  DiscoverActivity: "wish",
  ChecklistActivity: "checklist",
  UtilsActivity: "utils",
};

const TAB_ACTIVITIES = new Set(Object.keys(ACTIVITY_TO_NAV));

export function BottomNavHost() {
  const { activities } = useStack();
  const topActivity = activities.at(-1)?.name;

  if (!topActivity || !TAB_ACTIVITIES.has(topActivity)) {
    return null;
  }

  return <BottomNav active={ACTIVITY_TO_NAV[topActivity]} />;
}
