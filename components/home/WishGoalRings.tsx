"use client";

import { motion } from "motion/react";
import { RingChart } from "@/components/ui/ring-chart";
import { WishTypeIcon } from "@/components/wish/WishTypeIcon";
import {
  getWishProgress,
  WISH_RING_COLORS,
  WISH_TYPE_META,
  WISH_TYPES,
  type WishItem,
  type WishType,
} from "@/lib/wishes";
import { cn } from "@/lib/utils";

type WishGoalRingsProps = {
  wishes: WishItem[];
  className?: string;
  onTypePress?: (type: WishType) => void;
};

const RING_TRACK_COLORS: Record<WishType, string> = {
  shopping: "rgba(139, 92, 246, 0.16)",
  restaurant: "rgba(244, 63, 94, 0.16)",
  menu: "rgba(249, 115, 22, 0.16)",
  snack: "rgba(251, 191, 36, 0.16)",
};

export function WishGoalRings({ wishes, className, onTypePress }: WishGoalRingsProps) {
  const overall = getWishProgress(wishes);
  const rings = [...WISH_TYPES].reverse().map((type) => ({
    progress: getWishProgress(wishes, type).progress,
    color: WISH_RING_COLORS[type],
    trackColor: RING_TRACK_COLORS[type],
  }));

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[32px] bg-white p-6 text-slate-900",
        "shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.06),transparent_55%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_55%)]"
      />

      <div className="relative flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-white/45">
            Wish Goals
          </p>
          <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            위시 목표 달성
          </h3>
        </div>
        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tabular-nums text-slate-600 ring-1 ring-slate-200/80 dark:bg-white/8 dark:text-white/70 dark:ring-white/10">
          {overall.completed}/{overall.total}
        </p>
      </div>

      <div className="relative mx-auto mt-2 flex w-full max-w-[240px] flex-col items-center">
        <div className="relative grid place-items-center" style={{ width: 212, height: 212 }}>
          <RingChart gap={5} rings={rings} size={212} strokeWidth={9} />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-baseline gap-0.5"
              initial={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-[3.25rem] font-black leading-none tabular-nums tracking-tighter text-slate-900 dark:text-white">
                {overall.progress}
              </span>
              <span className="pb-1.5 text-xl font-bold text-slate-300 dark:text-white/35">%</span>
            </motion.div>
          </div>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-white/50">
          전체 <span className="font-bold text-slate-800 tabular-nums dark:text-white/80">{overall.completed}</span>개 달성
        </p>
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-2.5">
        {WISH_TYPES.map((type, index) => {
          const progress = getWishProgress(wishes, type);
          const meta = WISH_TYPE_META[type];
          const color = WISH_RING_COLORS[type];

          return (
            <motion.button
              key={type}
              animate={{ opacity: 1, y: 0 }}
              className="group flex flex-col gap-3 rounded-[20px] bg-slate-50 p-3.5 text-left ring-1 ring-slate-100 transition-colors hover:bg-slate-100/80 active:bg-slate-100 dark:bg-white/[0.06] dark:ring-white/8 dark:hover:bg-white/10 dark:active:bg-white/[0.14]"
              initial={{ opacity: 0, y: 8 }}
              onClick={() => onTypePress?.(type)}
              transition={{ delay: 0.05 * index, duration: 0.35 }}
              type="button"
            >
              <div className="flex items-start justify-between gap-2">
                <WishTypeIcon
                  className={cn("size-10 bg-gradient-to-br shadow-sm ring-1 ring-black/5", meta.accent)}
                  iconClassName="text-white"
                  size={18}
                  tone="dark"
                  type={type}
                />
                <div className="text-right">
                  <p className="text-lg font-black leading-none tabular-nums text-slate-900 dark:text-white">
                    {progress.completed}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold tabular-nums text-slate-400 dark:text-white/40">
                    / {progress.total}
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-slate-800 dark:text-white/90">{meta.title}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}55` }}
                  />
                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                    <motion.div
                      animate={{ width: `${progress.progress}%` }}
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      style={{ backgroundColor: color }}
                      transition={{ delay: 0.2 + index * 0.06, duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                  <span className="shrink-0 text-[10px] font-bold tabular-nums text-slate-400 dark:text-white/45">
                    {progress.progress}%
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
