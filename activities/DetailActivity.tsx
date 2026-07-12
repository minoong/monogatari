import { AppScreen } from "@stackflow/plugin-basic-ui";

type DetailParams = {
  title: string;
  id: string;
};

export const DetailActivity: React.FC<any> = ({ params }: any) => {
  const title = params.title as string;
  const id = params.id as string;

  return (
    <AppScreen appBar={{ title }}>
      <div className="flex flex-col p-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-4">Item ID: {id}</p>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              This is the deep detail view. We are now 3 levels deep into the stack!
            </p>
            <p>
              You can simply swipe back or press the back button in the App Bar to go to the previous screen.
            </p>
          </div>
        </div>
      </div>
    </AppScreen>
  );
};
