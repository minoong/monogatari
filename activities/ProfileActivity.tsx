import { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";

export const ProfileActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "Profile" }}>
      <div className="flex flex-col flex-1 p-4 pb-20 items-center justify-center">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-1">User Profile</h2>
        <p className="text-gray-500">Welcome to your profile</p>
      </div>
      <BottomNav active="profile" />
    </AppScreen>
  );
};
