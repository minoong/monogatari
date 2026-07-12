import { ActivityComponentType, useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";

export const HomeActivity: ActivityComponentType = () => {
  const { push } = useFlow();

  return (
    <AppScreen appBar={{ title: "Home" }}>
      <div className="flex flex-col flex-1 p-4 pb-20">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => push("CategoryActivity", { category: "Technology" })}
            className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl text-left font-semibold active:opacity-70 transition-opacity"
          >
            Technology
          </button>
          <button
            onClick={() => push("CategoryActivity", { category: "Lifestyle" })}
            className="p-4 bg-green-100 dark:bg-green-900 rounded-xl text-left font-semibold active:opacity-70 transition-opacity"
          >
            Lifestyle
          </button>
          <button
            onClick={() => push("CategoryActivity", { category: "Education" })}
            className="p-4 bg-purple-100 dark:bg-purple-900 rounded-xl text-left font-semibold active:opacity-70 transition-opacity"
          >
            Education
          </button>
        </div>
      </div>
      <BottomNav active="home" />
    </AppScreen>
  );
};
