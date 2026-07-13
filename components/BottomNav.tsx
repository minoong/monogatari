import React from "react";
import { useFlow } from "@stackflow/react";
import { motion } from "framer-motion";

interface BottomNavProps {
  active: "home" | "schedule" | "checklist" | "dictionary";
}

export const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { replace } = useFlow();

  const handleNav = (target: "HomeActivity" | "ScheduleActivity" | "ChecklistActivity" | "DictionaryActivity") => {
    replace(target, {}, { animate: false });
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center px-4 h-16">
        <motion.button 
          whileTap={{ scale: 0.75 }}
          onClick={() => handleNav("HomeActivity")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-transform ${active === "home" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] mt-1 font-medium">홈</span>
        </motion.button>
        
        <motion.button 
          whileTap={{ scale: 0.75 }}
          onClick={() => handleNav("ScheduleActivity")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-transform ${active === "schedule" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl">📅</span>
          <span className="text-[10px] mt-1 font-medium">일정표</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.75 }}
          onClick={() => handleNav("ChecklistActivity")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-transform ${active === "checklist" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl">📝</span>
          <span className="text-[10px] mt-1 font-medium">준비물</span>
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.75 }}
          onClick={() => handleNav("DictionaryActivity")}
          className={`flex flex-col items-center justify-center w-16 h-full transition-transform ${active === "dictionary" ? "text-blue-500" : "text-gray-400"}`}
          style={{ touchAction: 'manipulation' }}
        >
          <span className="text-xl">🗣️</span>
          <span className="text-[10px] mt-1 font-medium">회화</span>
        </motion.button>
      </div>
    </div>
  );
};
