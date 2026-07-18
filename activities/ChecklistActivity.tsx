import React, { useState, useEffect } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav, triggerHapticFeedback } from "../components/BottomNav";
import { Plus, Bell, ChevronDown, Trash2 } from "lucide-react";
import { ChecklistDrawer } from "../components/checklist/ChecklistDrawer";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import NumberFlow from "@number-flow/react";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import NeumorphButton from "../components/ui/neumorph-button";
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from "framer-motion";
import { RingChart } from "../components/ui/ring-chart";
import { useRef } from "react";
import {
  DynamicIslandProvider,
  DynamicIsland,
  SIZE_PRESETS,
  useDynamicIslandSize,
} from "../components/ui/dynamic-island";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

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

  const toggleExpand = () => {
    if (isExpanded) {
      setSize(SIZE_PRESETS.PROGRESS_COLLAPSED);
    } else {
      setSize(SIZE_PRESETS.PROGRESS_EXPANDED);
    }
  };

  return (
    <DynamicIsland id="progress-island">
      <div 
        onClick={toggleExpand} 
        className="w-full h-full flex flex-col p-4 cursor-pointer relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full h-[52px]">
          <div className="flex items-center gap-3">
            <RingChart rings={rings} size={52} strokeWidth={6} gap={2.5} />
            <div className="text-left flex flex-col justify-center">
              <h2 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">진행 상황</h2>
              <span className="text-gray-900 dark:text-gray-100 font-extrabold flex items-center text-xl tracking-tight leading-none">
                <AnimatedNumber value={progress} />%
              </span>
            </div>
          </div>
          
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown size={20} className="text-neutral-500" />
          </motion.div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
                exit: {
                  opacity: 0,
                  transition: {
                    duration: 0.1
                  }
                },
              }}
              className="w-full flex flex-col mt-4 overflow-hidden"
            >
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3 w-full text-left">
                {[
                  { label: "전체", progress, text: "text-blue-500", bg: "bg-blue-500", avatar: null },
                  { label: "가현쨩", progress: gahyunProgress, text: "text-pink-500", bg: "bg-pink-500", avatar: "G" },
                  { label: "미누쿤", progress: minuProgress, text: "text-emerald-500", bg: "bg-emerald-500", avatar: "M" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: 10, transition: { duration: 0.1 } },
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-1"
                  >
                    <div className="flex justify-between items-center text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {item.avatar && (
                          <Avatar className="w-4 h-4">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-[8px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{item.avatar}</AvatarFallback>
                          </Avatar>
                        )}
                        <span className="font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                      </div>
                      <span className={`${item.text} font-bold flex items-center`}>
                        <AnimatedNumber value={item.progress} />%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${item.bg} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DynamicIsland>
  );
};



interface PreparationItem {
  id: string;
  title: string;
  type: "master" | "personal";
  assignees: string[];
  completed_by: string[];
  importance: "high" | "normal" | "low";
}

interface SwipeableItemProps {
  item: PreparationItem;
  targetUser: string;
  isHighlighted: boolean;
  onDelete: (id: string, assignees: string[], targetUser: string) => void;
  onToggleCheck: (id: string, checked: boolean, targetUser: string) => void;
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
  const [willDelete, setWillDelete] = useState(false);
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [0, -20], [0, 1]);
  const itemRef = useRef<HTMLDivElement>(null);

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
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={itemRef}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ overflow: "hidden" }}
      className="checklist-item relative border-b border-gray-200 dark:border-white/10 last:border-b-0"
    >
      {/* Background Trash Icon */}
      <motion.div style={{ opacity: backgroundOpacity }} className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 text-white">
        <motion.div animate={{ scale: willDelete ? 1.3 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
          <Trash2 size={24} />
        </motion.div>
      </motion.div>
      
      {/* Foreground Swipeable Content */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0 }}
        onDrag={(e, info) => {
          if (info.offset.x < -80 && !willDelete) {
            setWillDelete(true);
            triggerHapticFeedback();
          } else if (info.offset.x >= -80 && willDelete) {
            setWillDelete(false);
            triggerHapticFeedback();
          }
        }}
        onDragEnd={(e, info) => {
          if (info.offset.x < -80) {
            triggerHapticFeedback();
            animate(x, -500, {
              duration: 0.25,
              ease: "easeOut",
              onComplete: () => {
                onDelete(item.id, item.assignees, targetUser);
              }
            });
          } else {
            setWillDelete(false);
          }
        }}
        className={`relative z-10 flex items-center justify-between gap-3 p-4 bg-white dark:bg-[#1C1C1E] transition-colors ${
          isHighlighted ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
        }`}
      >
        <label className="flex items-center gap-3 flex-1 cursor-pointer py-1">
          <div className="flex-shrink-0 relative w-6 h-6">
            <div
              className="absolute inset-0 z-10"
              onClick={() => {
                triggerHapticFeedback();
                onToggleCheck(item.id, !isChecked, targetUser);
              }}
              dangerouslySetInnerHTML={{
                __html: `<input type="checkbox" switch ${isChecked ? "checked" : ""} class="absolute inset-0 opacity-[0.01] cursor-pointer w-full h-full" style="-webkit-tap-highlight-color: transparent;" />`
              }}
            />
            <motion.div
              animate={{
                scale: isChecked ? [1, 0.8, 1.1, 1] : 1,
                backgroundColor: isChecked ? "#3b82f6" : "transparent",
                borderColor: isChecked ? "#3b82f6" : "#d1d5db"
              }}
              transition={{ duration: 0.3 }}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center dark:border-gray-600"
            >
              {isChecked && (
                <motion.svg
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              )}
            </motion.div>
          </div>
          <div className="flex items-center flex-1 gap-2 flex-wrap">
            <span
              className={`text-[16px] font-medium tracking-tight transition-all ${
                isChecked ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-800 dark:text-gray-100"
              }`}
            >
              {item.title}
            </span>
            <Badge variant={item.importance as "high" | "normal" | "low"} className="px-1.5 py-0 h-5 text-[11px] font-medium rounded-md">
              {item.importance === "high" ? "높음" : item.importance === "low" ? "낮음" : "보통"}
            </Badge>
          </div>
        </label>
        {!isChecked && item.type === "personal" && (
          <button
            onClick={() => onNudge(targetUser)}
            className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-full transition-colors flex-shrink-0"
            aria-label="재촉하기"
          >
            <Bell size={20} />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};

export const ChecklistActivity: React.FC = () => {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);


  const { data: items = [], isLoading: loading } = useQuery<PreparationItem[]>({
    queryKey: ["checklist"],
    queryFn: async () => {
      const res = await fetch("/api/checklist");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data || [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('preparation_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'preparation_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({ queryKey: ["checklist"] });
            toast("새로운 준비물이 등록되었습니다.", {
              action: {
                label: "새로고침",
                onClick: () => queryClient.invalidateQueries({ queryKey: ["checklist"] }),
              },
              duration: 5000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as PreparationItem;
            queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) =>
              old.map((i) => (i.id === updatedItem.id ? updatedItem : i))
            );
            
            // Trigger highlight
            setHighlightedItemId(updatedItem.id);
            setTimeout(() => {
              setHighlightedItemId(null);
            }, 2000);
            
            toast("준비물 항목이 업데이트되었습니다.", {
              duration: 3000,
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old as { id: string };
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

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isChecked, targetUser }: { id: string; isChecked: boolean; targetUser: string }) => {
      const item = items.find((i) => i.id === id);
      if (!item) throw new Error("Item not found");

      let newCompletedBy = [...item.completed_by];
      if (isChecked) {
        if (!newCompletedBy.includes(targetUser)) newCompletedBy.push(targetUser);
      } else {
        newCompletedBy = newCompletedBy.filter((u) => u !== targetUser);
      }

      const res = await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed_by: newCompletedBy }),
      });
      if (!res.ok) throw new Error("Update failed");
      return { id, newCompletedBy };
    },
    onMutate: async ({ id, isChecked, targetUser }) => {
      await queryClient.cancelQueries({ queryKey: ["checklist"] });
      const previousItems = queryClient.getQueryData<PreparationItem[]>(["checklist"]);

      queryClient.setQueryData<PreparationItem[]>(["checklist"], (old = []) => {
        return old.map((i) => {
          if (i.id === id) {
            let newCompletedBy = [...i.completed_by];
            if (isChecked) {
              if (!newCompletedBy.includes(targetUser)) newCompletedBy.push(targetUser);
            } else {
              newCompletedBy = newCompletedBy.filter((u) => u !== targetUser);
            }
            return { ...i, completed_by: newCompletedBy };
          }
          return i;
        });
      });

      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["checklist"], context.previousItems);
      }
      toast.error("업데이트 실패");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
    },
  });

  const toggleCheck = (id: string, isChecked: boolean, targetUser: string) => {
    toggleMutation.mutate({ id, isChecked, targetUser });
  };

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

  const handleDelete = (id: string, assignees: string[], targetUser: string) => {
    deleteMutation.mutate({ id, assignees, targetUser });
  };



  const gahyunItems = items.filter((i) => i.assignees.includes("gahyun") || i.type === "master" || i.assignees.includes("all"));
  const minuItems = items.filter((i) => i.assignees.includes("minu") || i.type === "master" || i.assignees.includes("all"));

  const renderList = (list: PreparationItem[], targetUser: string) => {
    if (list.length === 0) {
      return <div className="text-sm text-gray-400 py-4 text-center">등록된 항목이 없습니다.</div>;
    }

    return (
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden mb-6">
        <AnimatePresence initial={false}>
          {list.map((item) => {
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

  const gahyunCheckedCount = gahyunItems.filter((i) => i.completed_by.includes("gahyun") || i.completed_by.includes("all")).length;
  const minuCheckedCount = minuItems.filter((i) => i.completed_by.includes("minu") || i.completed_by.includes("all")).length;

  const totalItemsCount = gahyunItems.length + minuItems.length;
  const totalCheckedCount = gahyunCheckedCount + minuCheckedCount;
  
  const progress = totalItemsCount === 0 ? 0 : Math.round((totalCheckedCount / totalItemsCount) * 100);
  const gahyunProgress = gahyunItems.length === 0 ? 0 : Math.round((gahyunCheckedCount / gahyunItems.length) * 100);
  const minuProgress = minuItems.length === 0 ? 0 : Math.round((minuCheckedCount / minuItems.length) * 100);

  const rings = [
    { progress: progress, color: "#3b82f6" }, // blue-500
    { progress: gahyunProgress, color: "#ec4899" }, // pink-500
    { progress: minuProgress, color: "#10b981" }, // emerald-500
  ];

  return (
    <AppScreen appBar={{ title: "여행 준비물 체크리스트" }}>
      <div className="flex flex-col h-[calc(100dvh-64px)] bg-white dark:bg-black relative">

        <div className="py-4 pb-2 shrink-0 flex justify-center w-full">
          <DynamicIslandProvider initialSize={SIZE_PRESETS.PROGRESS_COLLAPSED}>
            <ProgressIslandContent rings={rings} progress={progress} gahyunProgress={gahyunProgress} minuProgress={minuProgress} />
          </DynamicIslandProvider>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {loading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3 mt-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">G</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">가현쨩 짐싸기</h3>
              </div>
              {renderList(gahyunItems, "gahyun")}

              <div className="flex items-center gap-2 mb-3 mt-6">
                <Avatar className="w-5 h-5">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">M</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm">미누쿤 짐싸기</h3>
              </div>
              {renderList(minuItems, "minu")}
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <NeumorphButton
          intent="primary"
          className="fixed right-6 w-14 h-14 !rounded-full !p-0 z-50 flex items-center justify-center shadow-xl"
          style={{ bottom: "calc(88px + env(safe-area-inset-bottom))" }}
          onClick={() => {
            if (drawerOpen) return;
            setRotation((prev) => prev + 90);
            setTimeout(() => {
              setDrawerOpen(true);
            }, 150);
          }}
        >
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <Plus size={24} />
          </motion.div>
        </NeumorphButton>

        <ChecklistDrawer
          open={drawerOpen}
          onOpenChange={(open) => {
            if (!open && drawerOpen) {
              setRotation((prev) => prev - 90);
            }
            setDrawerOpen(open);
          }}
        />
      </div>
      <BottomNav active="checklist" />
    </AppScreen>
  );
};
