import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";
import { motion, Variants } from "framer-motion";

export const HomeActivity: React.FC<any> = () => {
  const { push } = useFlow();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, x: 50 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AppScreen appBar={{ title: "Home" }}>
      <div className="flex flex-col flex-1 p-4 pb-20">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <motion.div 
          className="flex flex-col gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.button
            variants={item}
            onClick={() => push("CategoryActivity", { category: "Technology" })}
            className="p-4 bg-blue-100 dark:bg-blue-900 rounded-xl text-left font-semibold active:opacity-70 transition-opacity"
          >
            Technology
          </motion.button>
          <motion.button
            variants={item}
            onClick={() => push("CategoryActivity", { category: "Lifestyle" })}
            className="p-4 bg-green-100 dark:bg-green-900 rounded-xl text-left font-semibold active:opacity-70 transition-opacity"
          >
            Lifestyle
          </motion.button>
          <motion.button
            variants={item}
            onClick={() => push("CategoryActivity", { category: "Education" })}
            className="p-4 bg-purple-100 dark:bg-purple-900 rounded-xl text-left font-semibold active:opacity-70 transition-opacity"
          >
            Education
          </motion.button>
        </motion.div>
      </div>
      <BottomNav active="home" />
    </AppScreen>
  );
};
