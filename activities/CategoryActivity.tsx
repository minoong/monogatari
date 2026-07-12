import { ActivityComponentType, useFlow, useActivity } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { motion } from "framer-motion";

type CategoryParams = {
  category: string;
};

export const CategoryActivity: ActivityComponentType<CategoryParams> = ({ params }) => {
  const { push } = useFlow();
  const { isTop } = useActivity();

  return (
    <AppScreen appBar={{ title: params.category }}>
      <div className="flex flex-col p-4">
        <h2 className="text-xl font-bold mb-4">{params.category} Items</h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <button
              key={item}
              onClick={() => push("DetailActivity", { title: `${params.category} Item ${item}`, id: item.toString() })}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-left active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <motion.span 
                layoutId={isTop ? `title-${item}` : undefined}
                className={`relative z-[9999] inline-block font-semibold ${params.category === 'Lifestyle' ? 'text-black dark:text-black text-lg' : ''}`}
                transition={{ duration: 0 }}
              >
                View {params.category} Item {item}
              </motion.span>
            </button>
          ))}
        </div>
      </div>
    </AppScreen>
  );
};
