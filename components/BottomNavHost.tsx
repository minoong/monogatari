"use client";

import { useMemo } from "react";
import { useStack } from "@stackflow/react";

import { BottomNav, type BottomNavItem } from "@/components/BottomNav";

const ACTIVITY_TO_NAV: Record<string, BottomNavItem> = {
  HomeActivity: "home",
  ScheduleActivity: "schedule",
  DiscoverActivity: "wish",
  ChecklistActivity: "checklist",
  UtilsActivity: "utils",
};

function getTopVisibleActivityName(
  activities: ReturnType<typeof useStack>["activities"],
) {
  for (let index = activities.length - 1; index >= 0; index -= 1) {
    const activity = activities[index];
    if (activity.transitionState === "exit-done") continue;
    return activity.name;
  }

  return null;
}

const bottomNavHostState = {
  lastActive: "home" as BottomNavItem,
};

function resolveBottomNavActive(activeNav: BottomNavItem | null): BottomNavItem {
  if (activeNav) {
    bottomNavHostState.lastActive = activeNav;
  }

  return activeNav ?? bottomNavHostState.lastActive;
}

export function BottomNavHost() {
  const { activities } = useStack();
  const topActivity = useMemo(() => getTopVisibleActivityName(activities), [activities]);
  const activeNav = topActivity ? ACTIVITY_TO_NAV[topActivity] : null;

  return (
    <BottomNav
      active={resolveBottomNavActive(activeNav)}
      visible={Boolean(activeNav)}
    />
  );
}
