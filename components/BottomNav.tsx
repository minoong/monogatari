import React from "react";
import { useFlow } from "@stackflow/react";
import { motion } from "framer-motion";
import { Home, Calendar, ClipboardCheck, MessageCircle } from "lucide-react";

interface BottomNavProps {
  active: "home" | "schedule" | "checklist" | "dictionary";
}

export const triggerHapticFeedback = () => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(15);
  } else {
    // iOS PWA switch haptic hack using linked name & htmlFor
    const label = document.getElementById("ios-haptic-label");
    if (label) {
      label.click();
    }
  }
};

export const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { replace } = useFlow();

  const handleNav = (
    target: "HomeActivity" | "ScheduleActivity" | "ChecklistActivity" | "DictionaryActivity",
    name: "home" | "schedule" | "checklist" | "dictionary"
  ) => {
    if (active === name) return; // 중복 탭 방지
    triggerHapticFeedback();
    replace(target, {}, { animate: false });
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* iOS PWA Haptic Feedback Workaround Target */}
      <label
        id="ios-haptic-label"
        htmlFor="ios-haptic-input"
        style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, width: "1px", height: "1px" }}
      >
        <input
          type="checkbox"
          // @ts-expect-error: React typings do not support the standard switch attribute for checkboxes
          switch={true}
          id="ios-haptic-input"
          name="ios-haptic-input"
        />
      </label>

      <div className="flex justify-around items-center px-4 h-16">
        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={() => handleNav("HomeActivity", "home")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active === "home" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <Home 
            size={22} 
            fill={active === "home" ? "currentColor" : "none"} 
            className="transition-all duration-200" 
          />
          <span className="text-[10px] mt-1 font-medium">홈</span>
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={() => handleNav("ScheduleActivity", "schedule")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active === "schedule" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <Calendar 
            size={22} 
            fill={active === "schedule" ? "currentColor" : "none"} 
            className="transition-all duration-200" 
          />
          <span className="text-[10px] mt-1 font-medium">일정표</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={() => handleNav("ChecklistActivity", "checklist")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active === "checklist" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <ClipboardCheck 
            size={22} 
            fill={active === "checklist" ? "currentColor" : "none"} 
            className="transition-all duration-200" 
          />
          <span className="text-[10px] mt-1 font-medium">준비물</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.85 }}
          onClick={() => handleNav("DictionaryActivity", "dictionary")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${active === "dictionary" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <MessageCircle 
            size={22} 
            fill={active === "dictionary" ? "currentColor" : "none"} 
            className="transition-all duration-200" 
          />
          <span className="text-[10px] mt-1 font-medium">회화</span>
        </motion.button>
      </div>
    </div>
  );
};
