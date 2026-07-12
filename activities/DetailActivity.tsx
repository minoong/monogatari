import { ActivityComponentType, useActivity } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { motion } from "framer-motion";

type DetailParams = {
  title: string;
  id: string;
};

export const DetailActivity: ActivityComponentType<DetailParams> = ({ params }) => {
  const { isTop } = useActivity();

  return (
    <AppScreen 
      appBar={{ 
        title: (
          <motion.span 
            layoutId={isTop ? `title-${params.id}` : undefined}
            className="relative z-[9999] inline-block font-bold"
          >
            {params.title}
          </motion.span>
        ) 
      }}
    >
      <div className="flex flex-col p-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Item ID: {params.id}</p>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              This is the deep detail view. We are now 3 levels deep into the stack!
            </p>
            <p>
              Notice how the title animated from the card to the header, and how you can simply swipe back or press the back button in the App Bar to go to the previous screen.
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
};
