"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useFlow } from "@stackflow/react";
import { motion } from "motion/react";
import { CalendarDaysIcon, type CalendarDaysIconHandle } from "@/components/ui/calendar-days";
import { ClipboardCheckIcon, type ClipboardCheckIconHandle } from "@/components/ui/clipboard-check";
import { HeartIcon, type HeartIconHandle } from "@/components/ui/heart";
import { HomeIcon, type HomeIconHandle } from "@/components/ui/home";
import { LayoutGridIcon, type LayoutGridIconHandle } from "@/components/ui/layout-grid";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { scrollActiveScreenToTop } from "@/lib/scroll-to-top";
import { cn } from "@/lib/utils";

export type BottomNavItem = "home" | "schedule" | "wish" | "checklist" | "utils";

interface BottomNavProps {
  active: BottomNavItem;
}

type NavIconHandle =
  | HomeIconHandle
  | CalendarDaysIconHandle
  | HeartIconHandle
  | ClipboardCheckIconHandle
  | LayoutGridIconHandle;

type NavItem = {
  name: BottomNavItem;
  label: string;
  activity: "HomeActivity" | "ScheduleActivity" | "DiscoverActivity" | "ChecklistActivity" | "UtilsActivity";
};

const NAV_ITEMS: readonly NavItem[] = [
  { name: "home", label: "홈", activity: "HomeActivity" },
  { name: "schedule", label: "일정", activity: "ScheduleActivity" },
  { name: "wish", label: "위시", activity: "DiscoverActivity" },
  { name: "checklist", label: "준비", activity: "ChecklistActivity" },
  { name: "utils", label: "유틸", activity: "UtilsActivity" },
];

const ICON_SIZE = 21;
const NAV_ENTER_DELAY_S = 0.45;

const bottomNavState = {
  hasEntered: false,
  iconsAnimated: false,
};
const iconRefs: Array<NavIconHandle | null> = [];

function playEnterIconAnimations() {
  if (bottomNavState.iconsAnimated) return;

  bottomNavState.iconsAnimated = true;
  NAV_ITEMS.forEach((_, index) => {
    iconRefs[index]?.startAnimation();
  });
}

export const triggerHapticFeedback = (duration = 15) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

export const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { replace } = useFlow();
  const shouldEnter = !bottomNavState.hasEntered;

  const handleNavEnterComplete = useCallback(() => {
    bottomNavState.hasEntered = true;
    playEnterIconAnimations();
  }, []);

  const handleNav = (item: NavItem, index: number) => {
    triggerHapticFeedback(10);
    iconRefs[index]?.startAnimation();

    if (active === item.name) {
      scrollActiveScreenToTop();
      return;
    }

    replace(item.activity, {}, { animate: false });
  };

  return (
    <motion.nav
      animate={{ y: 0, opacity: 1 }}
      aria-label="하단 내비게이션"
      className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-[24px] border-t border-slate-200/70 bg-white/95 pb-[max(env(safe-area-inset-bottom,0px),12px)] shadow-[0_-8px_32px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95 dark:shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.45)]"
      initial={shouldEnter ? { y: 40, opacity: 0 } : false}
      onAnimationComplete={shouldEnter ? handleNavEnterComplete : undefined}
      transition={
        shouldEnter
          ? { type: "spring", stiffness: 340, damping: 30, mass: 0.9, delay: NAV_ENTER_DELAY_S }
          : { duration: 0 }
      }
    >
      <div className="mx-auto flex h-[50px] max-w-lg items-stretch justify-around px-1 pt-1">
        {NAV_ITEMS.map((item, index) => (
          <NavTab
            active={active}
            index={index}
            item={item}
            key={item.name}
            onNavigate={handleNav}
            shouldEnter={shouldEnter}
          />
        ))}
      </div>
    </motion.nav>
  );
};

function NavTab({
  active,
  index,
  item,
  onNavigate,
  shouldEnter,
}: {
  active: BottomNavItem;
  index: number;
  item: NavItem;
  onNavigate: (item: NavItem, index: number) => void;
  shouldEnter: boolean;
}) {
  const isActive = active === item.name;
  const [pressed, setPressed] = useState(false);

  const releasePress = useCallback(() => {
    setPressed(false);
  }, []);

  const handlePressNavigate = useCallback(() => {
    setPressed(false);
    onNavigate(item, index);
  }, [index, item, onNavigate]);

  return (
    <motion.div
      animate={shouldEnter ? { y: 0, opacity: 1 } : undefined}
      className="relative flex min-h-12 min-w-12 flex-1 items-center justify-center"
      initial={shouldEnter ? { y: 18, opacity: 0 } : false}
      transition={
        shouldEnter
          ? {
              type: "spring",
              stiffness: 400,
              damping: 28,
              delay: NAV_ENTER_DELAY_S + 0.1,
            }
          : { duration: 0 }
      }
    >
      <NativeHapticSwitch
        ariaLabel={item.label}
        checked={isActive}
        onChange={handlePressNavigate}
        onPointerCancel={releasePress}
        onPointerDown={() => setPressed(true)}
        onPointerLeave={releasePress}
        onPointerUp={releasePress}
      />
      <motion.div
        animate={{
          scale: pressed ? 0.94 : 1,
        }}
        className={cn(
          "relative flex flex-col items-center gap-0.5 px-3.5 py-2",
          isActive
            ? "font-bold text-blue-500"
            : "text-slate-400 dark:text-slate-500",
        )}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.span
          aria-hidden
          animate={{
            opacity: pressed ? 1 : 0,
            scale: pressed ? 1 : 0.92,
          }}
          className="pointer-events-none absolute inset-0 rounded-[14px] bg-slate-200/80 dark:bg-slate-700/75"
          transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="pointer-events-none relative z-10 flex flex-col items-center gap-0.5">
          <NavIconWithRef index={index} isActive={isActive} item={item} />
          <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NavIconWithRef({
  item,
  index,
  isActive,
}: {
  item: NavItem;
  index: number;
  isActive: boolean;
}) {
  const ref = useRef<NavIconHandle>(null);
  const iconClassName = cn(
    "pointer-events-none",
    isActive ? "text-blue-500 [&_svg]:stroke-[2.35]" : "text-current",
  );

  useLayoutEffect(() => {
    iconRefs[index] = ref.current;
    return () => {
      iconRefs[index] = null;
    };
  }, [index]);

  switch (item.name) {
    case "home":
      return <HomeIcon ref={ref} className={iconClassName} size={ICON_SIZE} />;
    case "schedule":
      return <CalendarDaysIcon ref={ref} className={iconClassName} size={ICON_SIZE} />;
    case "wish":
      return <HeartIcon ref={ref} className={iconClassName} size={ICON_SIZE} />;
    case "checklist":
      return <ClipboardCheckIcon ref={ref} className={iconClassName} size={ICON_SIZE} />;
    case "utils":
      return <LayoutGridIcon ref={ref} className={iconClassName} size={ICON_SIZE} />;
  }
}
