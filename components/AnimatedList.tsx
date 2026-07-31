import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

interface AnimatedListProps<T> {
  items: T[];
  getItemKey: (item: T) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

const AnimatedList = <T,>({
  items,
  getItemKey,
  renderItem,
  className,
}: AnimatedListProps<T>) => (
  <div className={className}>
    <AnimatePresence initial={false} mode="popLayout">
      {items.map((item, index) => (
        <motion.div
          key={getItemKey(item)}
          layout="position"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.2) }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default AnimatedList;
