import { useFlow, useActivity } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";

type CategoryParams = {
  category: string;
};

export const CategoryActivity: React.FC<any> = ({ params }: any) => {
  const { push } = useFlow();
  const { isTop } = useActivity();
  const category = params.category as string;

  return (
    <AppScreen appBar={{ title: category }}>
      <div className="flex flex-col p-4">
        <h2 className="text-xl font-bold mb-4">{params.category} Items</h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <button
              key={item}
              onClick={() => push("DetailActivity", { title: `${category} Item ${item}`, id: item.toString() })}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-left active:bg-gray-100 dark:active:bg-gray-800 transition-colors"
            >
              <span className={`inline-block font-semibold ${category === 'Lifestyle' ? 'text-black dark:text-black text-lg' : ''}`}>
                View {category} Item {item}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppScreen>
  );
};
