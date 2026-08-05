'use client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';
import React, { useState, useEffect, Children } from 'react';

export type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
};

export function TextLoop({
  children,
  className,
  interval = 2.5,
  transition = {
    type: 'spring',
    stiffness: 900,
    damping: 80,
    mass: 10,
  },
  variants,
  onIndexChange,
  trigger = true,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    if (!trigger) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        onIndexChange?.(nextIndex);
        return nextIndex;
      });
    }, interval * 1000);

    return () => clearInterval(intervalId);
  }, [items.length, interval, onIndexChange, trigger]);

  const motionVariants: Variants = variants || {
    initial: {
      y: 20,
      rotateX: 90,
      opacity: 0,
      filter: 'blur(4px)',
    },
    animate: {
      y: 0,
      rotateX: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: {
      y: -20,
      rotateX: -90,
      opacity: 0,
      filter: 'blur(4px)',
    },
  };

  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div
          key={currentIndex}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={transition}
          variants={motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
