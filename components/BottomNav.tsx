import React from "react";
import { useFlow } from "@stackflow/react";

interface BottomNavProps {
  active: "home" | "search" | "profile";
}

export const BottomNav: React.FC<BottomNavProps> = ({ active }) => {
  const { replace } = useFlow();

  const handleNav = (target: "HomeActivity" | "SearchActivity" | "ProfileActivity") => {
    replace(target, {}, { animate: false });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-4 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => handleNav("HomeActivity")}
        className={`flex flex-col items-center justify-center w-16 h-full active:scale-90 transition-transform ${active === "home" ? "text-blue-500" : "text-gray-400"}`}
        style={{ touchAction: 'manipulation' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-[10px] mt-1 font-medium">Home</span>
      </button>
      
      <button 
        onClick={() => handleNav("SearchActivity")}
        className={`flex flex-col items-center justify-center w-16 h-full active:scale-90 transition-transform ${active === "search" ? "text-blue-500" : "text-gray-400"}`}
        style={{ touchAction: 'manipulation' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-[10px] mt-1 font-medium">Search</span>
      </button>

      <button 
        onClick={() => handleNav("ProfileActivity")}
        className={`flex flex-col items-center justify-center w-16 h-full active:scale-90 transition-transform ${active === "profile" ? "text-blue-500" : "text-gray-400"}`}
        style={{ touchAction: 'manipulation' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-[10px] mt-1 font-medium">Profile</span>
      </button>
    </div>
  );
};
