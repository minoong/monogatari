import React from "react";
import { useFlow } from "@stackflow/react";
import {
  Calendar,
  ClipboardCheck,
  Heart,
  Home,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export type BottomNavItem = "home" | "schedule" | "wish" | "checklist" | "utils";

interface BottomNavProps {
  active: BottomNavItem;
}

type NavItem = {
  name: BottomNavItem;
  label: string;
  activity: "HomeActivity" | "ScheduleActivity" | "DiscoverActivity" | "ChecklistActivity" | "UtilsActivity";
  icon: LucideIcon;
};

const NAV_ITEMS: readonly NavItem[] = [
  { name: "home", label: "홈", activity: "HomeActivity", icon: Home },
  { name: "schedule", label: "일정", activity: "ScheduleActivity", icon: Calendar },
  { name: "wish", label: "위시", activity: "DiscoverActivity", icon: Heart },
  { name: "checklist", label: "준비", activity: "ChecklistActivity", icon: ClipboardCheck },
  { name: "utils", label: "유틸", activity: "UtilsActivity", icon: LayoutGrid },
];

export const triggerHapticFeedback = (duration = 15) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

export const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { replace } = useFlow();

  const handleNav = (item: NavItem) => {
    if (active === item.name) return;
    triggerHapticFeedback();
    replace(item.activity, {}, { animate: false });
  };

  return (
    <nav
      aria-label="하단 내비게이션"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/90"
    >
      <div className="mx-auto flex h-[50px] max-w-lg items-center justify-around px-1 pt-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.name;

          return (
            <button
              key={item.name}
              type="button"
              aria-current={isActive ? "page" : undefined}
              aria-label={`${item.label}${isActive ? ", 현재 화면" : ""}`}
              onClick={() => handleNav(item)}
              className={`flex flex-1 min-w-12 select-none flex-col items-center justify-center gap-0.5 rounded-xl outline-none transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "text-blue-500 font-bold"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={21} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 2.3 : 1.8} aria-hidden="true" />
              <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
