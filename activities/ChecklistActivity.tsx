import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { triggerHapticFeedback } from "../components/BottomNav";
import { Bell, ChevronDown, Trash2 } from "lucide-react";
import { ChecklistDrawer } from "../components/checklist/ChecklistDrawer";
import { ChecklistDeleteDrawer } from "../components/checklist/ChecklistDeleteDrawer";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import NumberFlow from "@number-flow/react";
import { ActivityFetchLoader, useMinimumInitialLoading } from "../components/ui/activity-fetch-loader";
import NeumorphButton from "../components/ui/neumorph-button";
import {
  Tabs as AnimateTabs,
  TabsContent as AnimateTabsContent,
  TabsContents as AnimateTabsContents,
} from "../components/animate-ui/components/animate/tabs";
import { Chip, Tabs as HeroTabs } from "@heroui/react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useMotionValue, animate, useTransform, useReducedMotion } from "framer-motion";
import { RingChart } from "../components/ui/ring-chart";
import { useRef } from "react";
import {
  DynamicIslandProvider,
  DynamicIsland,
  SIZE_PRESETS,
  useDynamicIslandSize,
} from "../components/ui/dynamic-island";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { NativeHapticSwitch } from "../components/ui/native-haptic-switch";
import { CompactSegmentedTabsList } from "../components/ui/compact-segmented-tabs";
import {
  fetchChecklist,
  getChecklistBattleStats,
  getChecklistItemsForUser,
  isChecklistItemCompletedFor,
  type PreparationItem,
} from "../lib/checklist";

const avatarSources = {
  gahyun: "/avatars/gahyun.webp",
  minu: "/avatars/minu.webp",
} as const;

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timer);
  }, [value]);
  return <NumberFlow value={displayValue} />;
};

const ProgressIslandContent = ({
  rings,
  progress,
  gahyunProgress,
  minuProgress,
}: {
  rings: { progress: number; color: string }[];
  progress: number;
  gahyunProgress: number;
  minuProgress: number;
}) => {
  const { setSize, state } = useDynamicIslandSize();
  const isExpanded = state.size === SIZE_PRESETS.PROGRESS_EXPANDED;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const toggleExpand = () => {
    if (isExpanded) {
      setDetailsOpen(false);
      return;
    }

    setSize(SIZE_PRESETS.PROGRESS_EXPANDED);
    setDetailsOpen(true);
  };

  const handleDetailsExitComplete = () => {
    if (!detailsOpen && isExpanded) {
      setSize(SIZE_PRESETS.PROGRESS_COLLAPSED);
    }
  };

  return (
    <DynamicIsland id="progress-island">
      <button
        type="button"
        aria-controls="progress-island-content"
        aria-expanded={isExpanded}
        onClick={toggleExpand}
        className={cn(
          "flex h-full w-full min-h-0 flex-col items-stretch overflow-hidden rounded-[inherit] bg-transparent px-4 text-left outline-none transition-colors hover:bg-black/[0.02] active:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:hover:bg-white/[0.04] dark:active:bg-white/[0.06]",
          isExpanded ? "justify-start" : "justify-center",
        )}
      >
        <div className="flex w-full shrink-0 items-center gap-2.5">
          <RingChart rings={rings} size={40} strokeWidth={4.5} gap={1.5} className="shrink-0 [&_circle]:[filter:none]" />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              진행 상황
            </p>
            <p className="mt-0.5 text-[1.35rem] font-extrabold leading-none tracking-tight text-gray-900 dark:text-gray-100">
              <AnimatedNumber value={progress} />%
            </p>
          </div>
          <motion.div
            animate={{ rotate: prefersReducedMotion ? 0 : isExpanded ? 180 : 0 }}
            className="flex size-5 shrink-0 items-center justify-center text-neutral-400"
          >
            <ChevronDown aria-hidden="true" size={16} />
          </motion.div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence onExitComplete={handleDetailsExitComplete}>
          {detailsOpen && (
            <motion.div
              id="progress-island-content"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" },
              }}
              exit={{
                opacity: 0,
                transition: { duration: prefersReducedMotion ? 0 : 0.14, ease: "easeIn" },
              }}
              className="mt-2 flex w-full flex-col overflow-hidden pb-3"
            >
              <div className="flex w-full flex-col gap-3 border-t border-gray-100 pt-3 text-left dark:border-gray-800">
                {[
                  { id: "all", label: "전체", progress, text: "text-blue-500", bg: "bg-blue-500", avatar: null },
                  { id: "gahyun", label: "가현쨩", progress: gahyunProgress, text: "text-pink-500", bg: "bg-pink-500", avatar: "gahyun" as const },
                  { id: "minu", label: "미누쿤", progress: minuProgress, text: "text-emerald-500", bg: "bg-emerald-500", avatar: "minu" as const },
                ].map((item, i) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {item.avatar && (
                          <Avatar className="w-4 h-4">
                            <AvatarImage alt="" src={avatarSources[item.avatar]} />
                            <AvatarFallback className="text-[8px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{item.label[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <span className="font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                      </div>
                      <span className={`${item.text} font-bold flex items-center`}>
                        <AnimatedNumber value={item.progress} />%
                      </span>
                    </div>
                    <div
                      aria-label={`${item.label} 진행률`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={item.progress}
                      className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
                      role="progressbar"
                    >
                      <motion.div
                        className={`h-full ${item.bg} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.2 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </DynamicIsland>
  );
};

interface ToggleEntry {
  id: string;
  targetUser: string;
  desired: boolean;
  baseItems?: PreparationItem[];
  timer?: ReturnType<typeof setTimeout>;
  inFlight: boolean;
}

interface SwipeableItemProps {
  item: PreparationItem;
  targetUser: string;
  isHighlighted: boolean;
  onDelete: (id: string, title: string, assignees: string[], targetUser: string) => void;
  onToggleCheck: (id: string, targetUser: string, checked?: boolean) => void;
  onNudge: (target: string) => void;
}

const SwipeableItem = ({
  item,
  targetUser,
  isHighlighted,
  onDelete,
  onToggleCheck,
  onNudge,
}: SwipeableItemProps) => {
  const isChecked = item.completed_by.includes(targetUser);
  const otherUser = targetUser === "gahyun" ? "minu" : "gahyun";
  const otherUserLabel = otherUser === "gahyun" ? "가현쨩" : "미누쿤";
  const isShared =
    item.type === "master" ||
    item.assignees.includes("all") ||
    (item.assignees.includes(targetUser) && item.assignees.includes(otherUser));
  const isOtherUserChecked =
    item.completed_by.includes(otherUser) || item.completed_by.includes("all");
  const prefersReducedMotion = useReducedMotion();
  const [willDelete, setWillDelete] = useState(false);
  const [willNudge, setWillNudge] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const didDragRef = useRef(false);
  const x = useMotionValue(0);
  const rightBackgroundOpacity = useTransform(x, [0, -20], [0, 1]);
  const leftBackgroundOpacity = useTransform(x, [0, 20], [0, 1]);
  const itemRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pressStartTimeRef = useRef<number | null>(null);

  const isNudgeAllowed = !isChecked && item.type === "personal";
  const dragElastic = { left: 0.5, right: isNudgeAllowed ? 0.5 : 0 };

  const cancelHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPressing(false);
    setPressProgress(0);
    startPosRef.current = null;
    pressStartTimeRef.current = null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (didDragRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input")) return;

    cancelHold();
    setIsPressing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    pressStartTimeRef.current = performance.now();

    const HOLD_DURATION = 650;

    const updateProgress = () => {
      if (!pressStartTimeRef.current) return;
      const elapsed = performance.now() - pressStartTimeRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setPressProgress(progress);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    holdTimerRef.current = setTimeout(() => {
      triggerHapticFeedback(18);
      onToggleCheck(item.id, targetUser);
      cancelHold();
    }, HOLD_DURATION);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPosRef.current || !isPressing) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);

    if (dx > 8 || dy > 8) {
      cancelHold();
    }
  };

  const handlePointerUp = () => {
    if (!isPressing) return;
    const elapsed = pressStartTimeRef.current ? performance.now() - pressStartTimeRef.current : 0;
    cancelHold();

    if (elapsed < 550 && !didDragRef.current) {
      triggerHapticFeedback(5);
      toast("꾹 누르고 있으면 체크가 돼요!", {
        duration: 1500,
      });
    }
  };

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("checklist-item-visible");
        } else {
          el.classList.remove("checklist-item-visible");
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelHold();
    };
  }, []);

  return (
    <motion.div
      ref={itemRef}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
      className="checklist-item relative border-b border-gray-200 dark:border-white/10 last:border-b-0"
    >
      {/* Swipe Background (Trash on the right, Bell on the left) */}
      <div className="absolute inset-0 select-none pointer-events-none">
        {/* Left Side: Orange Bell background (revealed when dragging right) */}
        {isNudgeAllowed && (
          <motion.div 
            style={{ opacity: leftBackgroundOpacity }} 
            className="absolute inset-0 flex items-center justify-start gap-2 bg-amber-500 px-5 text-white"
            aria-hidden="true"
          >
            <motion.div animate={{ scale: willNudge ? 1.3 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Bell size={18} />
            </motion.div>
            <span className="text-sm font-semibold">알림</span>
          </motion.div>
        )}

        {/* Right Side: Red Trash background (revealed when dragging left) */}
        <motion.div 
          style={{ opacity: rightBackgroundOpacity }} 
          className="absolute inset-0 flex items-center justify-end gap-2 bg-red-500 px-5 text-white"
          aria-hidden="true"
        >
          <span className="text-sm font-semibold">삭제</span>
          <motion.div animate={{ scale: willDelete ? 1.3 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
            <Trash2 size={18} />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Foreground Swipeable Content */}
      <motion.div
        drag={prefersReducedMotion ? false : "x"}
        dragDirectionLock
        dragMomentum={false}
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={dragElastic}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelHold}
        onPointerLeave={cancelHold}
        onDrag={(e, info) => {
          didDragRef.current = true;
          cancelHold();
          // Left drag (delete)
          if (info.offset.x < -80 && !willDelete) {
            setWillDelete(true);
            triggerHapticFeedback(18);
          } else if (info.offset.x >= -80 && willDelete) {
            setWillDelete(false);
          }

          // Right drag (nudge)
          if (isNudgeAllowed) {
            if (info.offset.x > 80 && !willNudge) {
              setWillNudge(true);
              triggerHapticFeedback(12);
            } else if (info.offset.x <= 80 && willNudge) {
              setWillNudge(false);
            }
          }
        }}
        onDragEnd={(e, info) => {
          if (info.offset.x < -80) {
            animate(x, 0, {
              duration: prefersReducedMotion ? 0 : 0.2,
              ease: "easeOut",
              onComplete: () => {
                onDelete(item.id, item.title, item.assignees, targetUser);
                setWillDelete(false);
              }
            });
          } else if (isNudgeAllowed && info.offset.x > 80) {
            animate(x, 200, {
              duration: prefersReducedMotion ? 0 : 0.2,
              ease: "easeOut",
              onComplete: () => {
                onNudge(targetUser);
                animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
                setWillNudge(false);
              }
            });
          } else {
            setWillDelete(false);
            setWillNudge(false);
            animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
          }
          window.setTimeout(() => {
            didDragRef.current = false;
          }, prefersReducedMotion ? 0 : 120);
        }}
        className={`relative z-10 flex min-h-16 select-none items-center justify-between gap-3 px-4 py-3 touch-pan-y bg-white dark:bg-[#1C1C1E] transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-white/5 dark:active:bg-white/10 ${
          isHighlighted ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
        }`}
      >
        {/* Background Shinobu Hold Progress Gauge */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-0 overflow-hidden rounded-2xl border-r-2 border-amber-400/80 shadow-md"
          style={{
            width: `${pressProgress * 100}%`,
            opacity: pressProgress > 0 ? 1 : 0,
            transition: isPressing ? "none" : "width 0.15s ease-out, opacity 0.15s ease-out",
          }}
        >
          <div className="relative h-full w-[360px] min-w-full">
            <Image
              src="/shinobu-gauge.png"
              alt="시노부 게이지"
              fill
              className="object-cover object-[right_75%] opacity-90 contrast-105"
              sizes="400px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/50 mix-blend-multiply" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 py-1 z-10">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col items-start">
              <span
                className={`relative inline-block max-w-full break-words text-[16px] font-medium leading-6 tracking-tight transition-colors select-none ${
                  isChecked ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {item.title}
                <motion.svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 overflow-visible text-gray-400 dark:text-gray-500"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  initial={false}
                  animate={{ opacity: isChecked ? 1 : 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                >
                  <motion.path
                    d="M 0 10 C 12 2, 22 18, 35 10 S 58 2, 70 10 S 88 18, 100 10"
                    fill="none"
                    pathLength={1}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    initial={false}
                    animate={{ pathLength: isChecked ? 1 : 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeInOut" }}
                  />
                </motion.svg>
              </span>
              {isShared && (
                <div
                  aria-label={`${otherUserLabel} ${isOtherUserChecked ? "완료" : "미완료"}`}
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 text-[11px] font-semibold ${
                    isOtherUserChecked
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                  }`}
                >
                  <Avatar className="size-4">
                    <AvatarImage alt="" src={avatarSources[otherUser]} />
                    <AvatarFallback className="text-[8px]">
                      {otherUser === "gahyun" ? "G" : "M"}
                    </AvatarFallback>
                  </Avatar>
                  <span>{otherUserLabel} · {isOtherUserChecked ? "완료" : "대기"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ChecklistActivity: React.FC = () => {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [packingTab, setPackingTab] = useState("gahyun");
  const prefersReducedMotion = useReducedMotion();
  const locallyUpdatingKeys = useRef(new Set<string>());
  const toggleEntriesRef = useRef(new Map<string, ToggleEntry>());
  const [sortCompletedMap, setSortCompletedMap] = useState<Record<string, boolean>>({});
  const sortTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const mergePendingUpdates = (item: PreparationItem) => {
    return Array.from(toggleEntriesRef.current.values())
      .filter((entry) => entry.id === item.id)
      .reduce((current, entry) => {
        const completedBy = entry.desired
          ? Array.from(new Set([...current.completed_by, entry.targetUser]))
          : current.completed_by.filter((user) => user !== entry.targetUser);
        return { ...current, completed_by: completedBy };
      }, item);
  };


  const { data: items = [], isLoading: loading } = useQuery<PreparationItem[]>({
    queryKey: ["checklist"],
    queryFn: fetchChecklist,
  });
  const showInitialLoader = useMinimumInitialLoading(loading);

  useEffect(() => {
    const channel = supabase
      .channel('preparation_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'preparation_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const insertedItem = payload.new as PreparationItem;
            queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) =>
              old.some((item) => item.id === insertedItem.id) ? old : [insertedItem, ...old],
            );
            toast("새로운 준비물이 등록되었습니다.", {
              action: {
                label: "새로고침",
                onClick: () => queryClient.invalidateQueries({ queryKey: ["checklist"] }),
              },
              duration: 5000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as PreparationItem;
            const isLocalUpdate = Array.from(toggleEntriesRef.current.values()).some((entry) =>
              entry.id === updatedItem.id &&
              locallyUpdatingKeys.current.has(`${entry.targetUser}:${entry.id}`),
            );
            const mergedItem = mergePendingUpdates(updatedItem);

            queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) =>
              old.map((i) => (i.id === updatedItem.id ? mergedItem : i))
            );
            
            // Trigger highlight
            setHighlightedItemId(updatedItem.id);
            setTimeout(() => {
              setHighlightedItemId(null);
            }, 2000);
            
            if (!isLocalUpdate) {
              toast("준비물 항목이 업데이트되었습니다.", {
                duration: 3000,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as { id: string };
            for (const [key, entry] of toggleEntriesRef.current) {
              if (entry.id === deletedItem.id) {
                if (entry.timer) clearTimeout(entry.timer);
                toggleEntriesRef.current.delete(key);
                locallyUpdatingKeys.current.delete(key);
              }
            }
            queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) =>
              old.filter((i) => i.id !== deletedItem.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateOptimisticToggle = (id: string, targetUser: string, isChecked: boolean) => {
    queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) =>
      old.map((item) => {
        if (item.id !== id) return item;
        const completedBy = isChecked
          ? Array.from(new Set([...item.completed_by, targetUser]))
          : item.completed_by.filter((user) => user !== targetUser);
        return { ...item, completed_by: completedBy };
      }),
    );
  };

  const flushToggle = async (key: string) => {
    const entry = toggleEntriesRef.current.get(key);
    if (!entry || entry.inFlight) return;

    const item = queryClient
      .getQueryData<PreparationItem[]>(["checklist"])
      ?.find((candidate) => candidate.id === entry.id);
    if (!item) {
      toggleEntriesRef.current.delete(key);
      return;
    }

    entry.inFlight = true;
    locallyUpdatingKeys.current.add(key);
    const requestState = entry.desired;
    try {
      const response = await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          completed_by_user: entry.targetUser,
          completed: requestState,
        }),
      });
      if (!response.ok) throw new Error("Update failed");

      const payload = (await response.json()) as { data?: PreparationItem };
      const currentEntry = toggleEntriesRef.current.get(key);
      if (currentEntry && currentEntry.desired !== requestState) {
        if (payload.data) {
          queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) =>
            old.map((candidate) => (
              candidate.id === payload.data?.id ? mergePendingUpdates(payload.data) : candidate
            )),
          );
        }
        currentEntry.baseItems = queryClient.getQueryData<PreparationItem[]>(["checklist"]);
        currentEntry.inFlight = false;
        updateOptimisticToggle(currentEntry.id, currentEntry.targetUser, currentEntry.desired);
        locallyUpdatingKeys.current.delete(key);
        scheduleToggle(key);
        return;
      }

      if (payload.data) {
        queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) =>
          old.map((candidate) => (
            candidate.id === payload.data?.id ? mergePendingUpdates(payload.data) : candidate
          )),
        );
      }
      toggleEntriesRef.current.delete(key);
      locallyUpdatingKeys.current.delete(key);
    } catch {
      const currentEntry = toggleEntriesRef.current.get(key);
      if (currentEntry && currentEntry.desired !== requestState) {
        currentEntry.inFlight = false;
        locallyUpdatingKeys.current.delete(key);
        scheduleToggle(key);
        return;
      }
      if (currentEntry?.baseItems) {
        queryClient.setQueryData(["checklist"], currentEntry.baseItems);
      }
      toggleEntriesRef.current.delete(key);
      locallyUpdatingKeys.current.delete(key);
      toast.error("업데이트 실패");
    }
  };

  const scheduleToggle = (key: string) => {
    const entry = toggleEntriesRef.current.get(key);
    if (!entry) return;
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => {
      entry.timer = undefined;
      void flushToggle(key);
    }, 300);
  };

  const toggleCheck = (id: string, targetUser: string, requestedState?: boolean) => {
    const key = `${targetUser}:${id}`;
    const currentItems = queryClient.getQueryData<PreparationItem[]>(["checklist"]) ?? [];
    const currentItem = currentItems.find((item) => item.id === id);
    if (!currentItem) return;

    const entry = toggleEntriesRef.current.get(key) ?? {
      id,
      targetUser,
      desired: currentItem.completed_by.includes(targetUser),
      baseItems: currentItems,
      inFlight: false,
    };
    const nextState = requestedState ?? !currentItem.completed_by.includes(targetUser);
    entry.desired = nextState;
    if (!entry.baseItems) entry.baseItems = currentItems;
    toggleEntriesRef.current.set(key, entry);
    triggerHapticFeedback(10);

    const currentSortState = isSortCompletedFor(currentItem, targetUser);
    setSortCompletedMap((prev) => ({
      ...prev,
      [key]: currentSortState,
    }));

    updateOptimisticToggle(id, targetUser, entry.desired);
    scheduleToggle(key);

    const existingTimer = sortTimersRef.current.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      setSortCompletedMap((prev) => ({
        ...prev,
        [key]: nextState,
      }));
      sortTimersRef.current.delete(key);
    }, prefersReducedMotion ? 0 : 150);
    sortTimersRef.current.set(key, timer);
  };

  useEffect(() => {
    const entries = toggleEntriesRef.current;
    const sortTimers = sortTimersRef.current;
    return () => {
      for (const entry of entries.values()) {
        if (entry.timer) clearTimeout(entry.timer);
      }
      entries.clear();
      for (const timer of sortTimers.values()) {
        clearTimeout(timer);
      }
      sortTimers.clear();
    };
  }, []);

  const nudgeMutation = useMutation({
    mutationFn: async (target: string) => {
      const res = await fetch("/api/checklist/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      if (!res.ok) throw new Error("Nudge failed");
    },
    onSuccess: (_, variables) => {
      toast.success(`푸시 알림 전송 완료 (${variables})`, {
        description: "상대방에게 푸시 알림이 전송되었습니다.",
      });
    },
    onError: () => {
      toast.error("푸시 알림 전송에 실패했습니다.");
    },
  });

  const handleNudge = (target: string) => {
    nudgeMutation.mutate(target);
  };

  const deleteMutation = useMutation({
    mutationFn: async ({ id, assignees, targetUser }: { id: string, assignees: string[], targetUser: string }) => {
      const newAssignees = assignees.filter((a) => a !== targetUser && a !== "all");

      if (newAssignees.length === 0) {
        const res = await fetch(`/api/checklist?id=${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Delete failed");
      } else {
        const res = await fetch(`/api/checklist`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, assignees: newAssignees }),
        });
        if (!res.ok) throw new Error("Update failed");
      }
    },
    onMutate: async ({ id, targetUser }) => {
      await queryClient.cancelQueries({ queryKey: ["checklist"] });
      const previousItems = queryClient.getQueryData<PreparationItem[]>(["checklist"]);

      queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) => {
        return old.map((i) => {
          if (i.id === id) {
            const newAssignees = i.assignees.filter((a) => a !== targetUser && a !== "all");
            return { ...i, assignees: newAssignees };
          }
          return i;
        }).filter((i) => i.assignees.length > 0);
      });

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["checklist"], context.previousItems);
      }
      toast.error("항목 삭제에 실패했습니다.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
    },
    onSuccess: () => {
      toast.success("항목이 삭제되었습니다.");
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    assignees: string[];
    targetUser: string;
  } | null>(null);

  const handleDelete = (id: string, title: string, assignees: string[], targetUser: string) => {
    setDeleteTarget({ id, title, assignees, targetUser });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        setDeleteTarget(null);
      },
    });
  };



  const battleStats = getChecklistBattleStats(items);
  const gahyunItems = getChecklistItemsForUser(items, "gahyun");
  const minuItems = getChecklistItemsForUser(items, "minu");
  const isCompletedFor = isChecklistItemCompletedFor;

  const isSortCompletedFor = (item: PreparationItem, targetUser: string) => {
    const key = `${targetUser}:${item.id}`;
    if (key in sortCompletedMap) {
      return sortCompletedMap[key];
    }
    return isCompletedFor(item, targetUser);
  };

  const renderList = (list: PreparationItem[], targetUser: string) => {
    if (list.length === 0) {
      return <div className="text-sm text-gray-400 py-4 text-center">등록된 항목이 없습니다.</div>;
    }

    const sortedList = [
      ...list.filter((item) => !isSortCompletedFor(item, targetUser)),
      ...list.filter((item) => isSortCompletedFor(item, targetUser)),
    ];

    return (
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden mb-6">
        <AnimatePresence initial={false}>
          {sortedList.map((item) => {
            const isHighlighted = highlightedItemId === item.id;
            return (
              <SwipeableItem
                key={item.id}
                item={item}
                targetUser={targetUser}
                isHighlighted={isHighlighted}
                onDelete={handleDelete}
                onToggleCheck={toggleCheck}
                onNudge={handleNudge}
              />
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  const gahyunCheckedCount = battleStats.gahyun.completed;
  const minuCheckedCount = battleStats.minu.completed;
  const gahyunProgress = battleStats.gahyun.progress;
  const minuProgress = battleStats.minu.progress;
  const progress = battleStats.averageProgress;

  const rings = [
    { progress: progress, color: "#3b82f6" }, // blue-500
    { progress: gahyunProgress, color: "#ec4899" }, // pink-500
    { progress: minuProgress, color: "#10b981" }, // emerald-500
  ];

  return (
    <AppScreen appBar={{ title: "빠뜨린 거 없나 잘 체크해!" }}>
      <div className="flex flex-col min-h-full w-full bg-white dark:bg-black relative">

        <div className="py-4 pb-2 shrink-0 flex justify-center w-full">
          <DynamicIslandProvider initialSize={SIZE_PRESETS.PROGRESS_COLLAPSED}>
            <ProgressIslandContent rings={rings} progress={progress} gahyunProgress={gahyunProgress} minuProgress={minuProgress} />
          </DynamicIslandProvider>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))]">
          {showInitialLoader ? (
            <ActivityFetchLoader
              className="min-h-[calc(100dvh-15rem)]"
              messages={["준비물을 확인하고 있어…", "빠뜨린 건 없는지 살펴볼게…", "챙길 목록을 다시 맞추는 중이야…"]}
            />
          ) : (
            <>
              <HeroTabs
                selectedKey={packingTab}
                onSelectionChange={(key) => setPackingTab(String(key))}
                className="mt-2 w-full"
              >
                <CompactSegmentedTabsList
                  ariaLabel="짐싸기 담당자"
                  items={[
                    {
                      id: "gahyun",
                      label: (
                        <span className="flex w-full min-w-0 items-center gap-1.5">
                      <Avatar className="size-6">
                        <AvatarImage alt="" src={avatarSources.gahyun} />
                        <AvatarFallback className="bg-gray-200 text-[10px] text-gray-700 dark:bg-gray-700 dark:text-gray-300">G</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 truncate text-[11px] font-bold">가현쨩</span>
                      <Chip
                        aria-label={`가현쨩 ${gahyunItems.length}개 중 ${gahyunCheckedCount}개 완료`}
                        className="ml-auto !h-5 !min-h-5 min-w-10 shrink-0 justify-center border border-blue-200 bg-blue-50 px-1.5 tabular-nums dark:border-blue-400/20 dark:bg-blue-400/10"
                        color="accent"
                        size="sm"
                        variant="tertiary"
                      >
                        <Chip.Label className="text-[11px] font-bold text-blue-600 dark:text-blue-300">
                          {gahyunCheckedCount}/{gahyunItems.length}
                        </Chip.Label>
                      </Chip>
                        </span>
                      ),
                    },
                    {
                      id: "minu",
                      label: (
                        <span className="flex w-full min-w-0 items-center gap-1.5">
                      <Avatar className="size-6">
                        <AvatarImage alt="" src={avatarSources.minu} />
                        <AvatarFallback className="bg-gray-200 text-[10px] text-gray-700 dark:bg-gray-700 dark:text-gray-300">M</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 truncate text-[11px] font-bold">미누쿤</span>
                      <Chip
                        aria-label={`미누쿤 ${minuItems.length}개 중 ${minuCheckedCount}개 완료`}
                        className="ml-auto !h-5 !min-h-5 min-w-10 shrink-0 justify-center border border-blue-200 bg-blue-50 px-1.5 tabular-nums dark:border-blue-400/20 dark:bg-blue-400/10"
                        color="accent"
                        size="sm"
                        variant="tertiary"
                      >
                        <Chip.Label className="text-[11px] font-bold text-blue-600 dark:text-blue-300">
                          {minuCheckedCount}/{minuItems.length}
                        </Chip.Label>
                      </Chip>
                        </span>
                      ),
                    },
                  ]}
                />
              </HeroTabs>
              <AnimateTabs value={packingTab}>
                <AnimateTabsContents>
                  <AnimateTabsContent value="gahyun">
                    {renderList(gahyunItems, "gahyun")}
                  </AnimateTabsContent>
                  <AnimateTabsContent value="minu">
                    {renderList(minuItems, "minu")}
                  </AnimateTabsContent>
                </AnimateTabsContents>
              </AnimateTabs>
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="fixed right-6 z-50 h-14 w-14 bottom-[calc(5rem+max(env(safe-area-inset-bottom,0px),12px))]">
          <NeumorphButton
            aria-hidden="true"
            type="button"
            intent="primary"
            tabIndex={-1}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="pointer-events-none h-14 w-14 !rounded-full !p-0 flex items-center justify-center shadow-xl overflow-hidden border-2 border-white dark:border-gray-800"
          >
            <motion.div
              whileTap={{ scale: 0.85 }}
              className="relative h-14 w-14 shrink-0 pointer-events-none overflow-hidden rounded-full"
            >
              <Image
                src="/fab-sagiri.jpg"
                alt="준비물 추가"
                fill
                className="object-cover rounded-full"
                sizes="56px"
                priority
              />
            </motion.div>
          </NeumorphButton>
          <NativeHapticSwitch
            ariaLabel="준비물 추가"
            checked={drawerOpen}
            disabled={drawerOpen}
            onChange={() => {
              if (drawerOpen) return;
              triggerHapticFeedback(15);
              setDrawerOpen(true);
            }}
          />
        </div>

        <ChecklistDrawer
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open);
          }}
        />

        <ChecklistDeleteDrawer
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          itemTitle={deleteTarget?.title}
          onConfirmDelete={handleConfirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    </AppScreen>
  );
};
