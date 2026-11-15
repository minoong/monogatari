"use client";

import { useStack } from "@stackflow/react";
import { useMemo } from "react";

import { useTrip } from "@/components/providers/trip-provider";
import { SlidingText } from "@/components/core/sliding-text";
import { resolveActivityAppBarTitle } from "@/lib/activity-app-bar-titles";

import styles from "./AppBarTitleAnimator.module.css";

function getTopVisibleActivity(
  activities: ReturnType<typeof useStack>["activities"],
) {
  for (let index = activities.length - 1; index >= 0; index -= 1) {
    const activity = activities[index];
    if (activity.transitionState === "exit-done") continue;
    return activity;
  }

  return null;
}

export function AppBarTitleAnimator() {
  const { activities } = useStack();
  const { trip } = useTrip();

  const title = useMemo(() => {
    const topActivity = getTopVisibleActivity(activities);
    if (!topActivity) return "";

    return resolveActivityAppBarTitle(topActivity.name, topActivity.params, trip.copy);
  }, [activities, trip.copy]);

  if (!title) {
    return null;
  }

  return (
    <div className={styles.host}>
      <SlidingText className={styles.text} value={title} />
    </div>
  );
}
