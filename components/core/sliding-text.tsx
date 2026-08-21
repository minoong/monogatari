"use client";

import { motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { SLIDING_LINE_HEIGHT, SLIDING_SPRING } from "@/components/core/sliding-number";
import {
  clearAppBarTitleQueue,
  collapseAppBarTitleQueueToLatest,
  getAppBarTitleQueueSnapshot,
  peekAppBarTitleQueue,
  shiftAppBarTitleQueue,
  subscribeAppBarTitleQueue,
} from "@/lib/app-bar-title-queue";
import { cn } from "@/lib/utils";

type SlidingTextProps = React.HTMLAttributes<HTMLSpanElement> & {
  value: string;
};

type Slide = {
  catchUp: boolean;
  from: string;
  id: number;
  to: string;
};

const CATCH_UP_SPRING = {
  type: "spring",
  stiffness: 340,
  damping: 30,
  mass: 0.4,
} as const;

export const SlidingText = React.forwardRef<HTMLSpanElement, SlidingTextProps>(
  ({ value, className, ...props }, ref) => {
    const reduceMotion = useReducedMotion();
    const animationIdRef = useRef(0);
    const [displayed, setDisplayed] = useState(value);
    const [slide, setSlide] = useState<Slide | null>(null);

    const queueSnapshot = useSyncExternalStore(
      subscribeAppBarTitleQueue,
      getAppBarTitleQueueSnapshot,
      () => ({ queue: [], version: 0 }),
    );

    const startSlide = useCallback((from: string, to: string, catchUp = false) => {
      animationIdRef.current += 1;
      setSlide({ catchUp, from, id: animationIdRef.current, to });
    }, []);

    const resolveTarget = useCallback(() => {
      if (queueSnapshot.queue.length > 1) {
        return collapseAppBarTitleQueueToLatest();
      }

      return peekAppBarTitleQueue();
    }, [queueSnapshot.queue.length]);

    const pumpOrCatchUp = useCallback(() => {
      const target = resolveTarget();
      if (!target) return;

      if (slide) {
        if (slide.to === target) return;

        startSlide(slide.to, target, true);
        return;
      }

      if (target === displayed) {
        shiftAppBarTitleQueue();
        return;
      }

      startSlide(displayed, target, queueSnapshot.queue.length > 1);
    }, [displayed, queueSnapshot.queue.length, resolveTarget, slide, startSlide]);

    useLayoutEffect(() => {
      if (!reduceMotion) return;

      clearAppBarTitleQueue();
      setDisplayed(value);
      setSlide(null);
    }, [reduceMotion, value]);

    useLayoutEffect(() => {
      if (reduceMotion) return;

      pumpOrCatchUp();
    }, [pumpOrCatchUp, queueSnapshot.version, reduceMotion]);

    useLayoutEffect(() => {
      if (reduceMotion || slide || peekAppBarTitleQueue()) return;
      if (value === displayed) return;

      startSlide(displayed, value);
    }, [displayed, reduceMotion, slide, startSlide, value]);

    const handleComplete = useCallback((completed: Slide) => {
      setDisplayed(completed.to);
      shiftAppBarTitleQueue();
      setSlide(null);
    }, []);

    if (reduceMotion) {
      return (
        <span
          ref={ref}
          className={cn("block w-full truncate text-center leading-none", className)}
          {...props}
        >
          {value}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn("relative block w-full overflow-hidden leading-none", className)}
        style={{ height: `${SLIDING_LINE_HEIGHT}em` }}
        {...props}
      >
        {slide ? (
          <motion.span
            key={slide.id}
            className="absolute inset-x-0 top-0 flex flex-col items-center"
            initial={{ y: 0 }}
            animate={{ y: `-${SLIDING_LINE_HEIGHT}em` }}
            transition={slide.catchUp ? CATCH_UP_SPRING : SLIDING_SPRING}
            onAnimationComplete={() => {
              if (slide) handleComplete(slide);
            }}
          >
            <span
              className="flex w-full items-center justify-center truncate"
              style={{ height: `${SLIDING_LINE_HEIGHT}em` }}
            >
              {slide.from}
            </span>
            <span
              className="flex w-full items-center justify-center truncate"
              style={{ height: `${SLIDING_LINE_HEIGHT}em` }}
            >
              {slide.to}
            </span>
          </motion.span>
        ) : (
          <span
            className="absolute inset-x-0 top-0 flex w-full items-center justify-center truncate"
            style={{ height: `${SLIDING_LINE_HEIGHT}em` }}
          >
            {displayed}
          </span>
        )}
        <span className="sr-only">{value}</span>
      </span>
    );
  },
);

SlidingText.displayName = "SlidingText";
