"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { clearAppCache } from "@/lib/clear-app-cache";

type ClearCacheStatus = "idle" | "loading" | "success";

const CACHE_BUTTON_CLASS =
  "!h-auto min-h-0 w-full justify-center rounded-xl bg-white px-4 py-3.5 text-[17px] font-normal text-[#FF3B30] shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-800";

export function ClearCacheUtilityCard() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ClearCacheStatus>("idle");

  const handleClear = async () => {
    if (status !== "idle") return;

    setStatus("loading");

    try {
      await clearAppCache();
      queryClient.clear();

      setStatus("success");
      triggerHapticFeedback(18);

      await new Promise((resolve) => window.setTimeout(resolve, 900));
      setStatus("idle");
    } catch {
      triggerHapticFeedback(8);
      toast.error("캐시를 지우지 못했어요. 다시 시도해 주세요.");
      setStatus("idle");
    }
  };

  return (
    <section className="flex shrink-0 flex-col gap-2 pb-2">
      <Button
        fullWidth
        className={CACHE_BUTTON_CLASS}
        isPending={status === "loading"}
        onPress={() => {
          triggerHapticFeedback(15);
          void handleClear();
        }}
        variant="secondary"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2"
            exit={{ opacity: 0, y: 15 }}
            initial={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.075 }}
          >
            {status === "loading" ? (
              <>
                <CircleDashed className="size-4 animate-spin" />
                지우는 중…
              </>
            ) : status === "success" ? (
              <>
                <motion.span
                  animate={{ scale: 1 }}
                  initial={{ scale: 0 }}
                  transition={{ delay: 0.075, type: "spring" }}
                >
                  <CheckCircle2 className="size-4" />
                </motion.span>
                완료
              </>
            ) : (
              "캐시 지우기"
            )}
          </motion.span>
        </AnimatePresence>
      </Button>
      <p className="px-3 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
        임시 데이터를 지워요. 지출·일정·위시 기록은 그대로 남아요.
      </p>
    </section>
  );
}
