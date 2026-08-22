"use client";

import { motion } from "motion/react";
import { Button } from "@heroui/react";
import { AnimatedContent } from "@/components/ui/animated-content";
import { SparklesIcon } from "@/components/ui/lucide-animated/sparkles";
import { CheckIcon } from "@/components/ui/lucide-animated/check";
import {
  getWishProgress,
  WISH_TYPES,
  type WishItem,
  type WishType,
} from "@/lib/wishes";
import { cn } from "@/lib/utils";

type PostTripWishRecapProps = {
  wishes: WishItem[];
  onOpenDiscover: () => void;
  onOpenType: (type: WishType, filter?: "pending") => void;
};

export function PostTripWishRecap({ wishes, onOpenDiscover, onOpenType }: PostTripWishRecapProps) {
  const overall = getWishProgress(wishes);
  const pendingCount = overall.total - overall.completed;
  const pendingType =
    WISH_TYPES.find((type) => getWishProgress(wishes, type).completed < getWishProgress(wishes, type).total)
    ?? "shopping";

  return (
    <div className="flex flex-col gap-3">
      <AnimatedContent delay={0.08} direction="vertical" distance={20} duration={0.5}>
        <Button
          className={cn(
            "group !h-auto min-h-0 w-full items-center justify-between gap-4 rounded-[24px] border-0 bg-gradient-to-r from-[#00256C] to-[#0a4da8] p-4 text-left text-white shadow-lg",
            "[--button-bg:transparent] hover:[--button-bg:transparent] active:[--button-bg-pressed:transparent]",
          )}
          fullWidth
          onPress={onOpenDiscover}
          variant="ghost"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <SparklesIcon className="text-amber-200" size={18} />
              <h3 className="font-bold">위시 달성률 보기</h3>
            </div>
            <p className="mt-1 text-sm text-white/75 tabular-nums">
              전체 {overall.completed}/{overall.total}개 완료
            </p>
          </div>
          <motion.span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/12"
            whileHover={{ x: 2 }}
          >
            →
          </motion.span>
        </Button>
      </AnimatedContent>

      {pendingCount > 0 && (
        <AnimatedContent delay={0.14} direction="vertical" distance={20} duration={0.5}>
          <Button
            className={cn(
              "group !h-auto min-h-0 w-full items-center justify-between gap-4 rounded-[24px] border border-amber-200/70 bg-amber-50 p-4 text-left dark:border-amber-900/40 dark:bg-amber-950/25",
              "[--button-bg:transparent] hover:[--button-bg:transparent] active:[--button-bg-pressed:transparent]",
            )}
            fullWidth
            onPress={() => onOpenType(pendingType, "pending")}
            variant="ghost"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CheckIcon className="text-amber-600 dark:text-amber-300" size={18} />
                <h3 className="font-bold text-amber-950 dark:text-amber-50">못 한 것만 보기</h3>
              </div>
              <p className="mt-1 text-sm text-amber-800/85 dark:text-amber-100/75">
                아직 {pendingCount}개가 남아 있어요
              </p>
            </div>
            <span className="rounded-full bg-amber-200/80 px-2.5 py-1 text-xs font-extrabold tabular-nums text-amber-950 dark:bg-amber-500/20 dark:text-amber-100">
              {pendingCount}
            </span>
          </Button>
        </AnimatedContent>
      )}
    </div>
  );
}
