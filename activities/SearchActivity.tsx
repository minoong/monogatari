import { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";

export const SearchActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "Search" }}>
      <div className="flex flex-col flex-1 p-4 pb-20">
        <h2 className="text-xl font-bold mb-4">Search</h2>
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search for anything..." 
            className="bg-transparent outline-none flex-1"
          />
        </div>
      </div>
      <BottomNav active="search" />
    </AppScreen>
  );
};
