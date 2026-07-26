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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:border-gray-800 dark:bg-black/95"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around px-2">
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
              className={`flex min-h-11 min-w-11 flex-1 select-none flex-col items-center justify-center gap-1 rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset ${
                isActive
                  ? "text-blue-500"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <Icon size={22} fill={isActive ? "currentColor" : "none"} aria-hidden="true" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
