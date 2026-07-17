import React, { useState, useEffect } from "react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { BottomNav } from "../components/BottomNav";
import { Plus, Bell } from "lucide-react";
import { ChecklistDrawer } from "../components/checklist/ChecklistDrawer";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import NumberFlow from "@number-flow/react";
import { Skeleton } from "../components/ui/skeleton";

interface PreparationItem {
  id: string;
  title: string;
  type: "master" | "personal";
  assignees: string[];
  completed_by: string[];
  importance: "high" | "normal" | "low";
}

export const ChecklistActivity: React.FC = () => {
  const [items, setItems] = useState<PreparationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/checklist");
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();

    const channel = supabase
      .channel('preparation_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'preparation_items' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast("새로운 준비물이 등록되었습니다.", {
              action: {
                label: "새로고침",
                onClick: () => fetchItems(),
              },
              duration: 5000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as PreparationItem;
            setItems((prev) =>
              prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
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
            setItems((prev) => prev.filter((i) => i.id !== deletedItem.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleCheck = async (id: string, isChecked: boolean, targetUser: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    // Optimistic UI update
    let newCompletedBy = [...item.completed_by];
    if (isChecked) {
      if (!newCompletedBy.includes(targetUser)) newCompletedBy.push(targetUser);
    } else {
      newCompletedBy = newCompletedBy.filter((u) => u !== targetUser);
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed_by: newCompletedBy } : i))
    );

    // API update
    await fetch("/api/checklist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed_by: newCompletedBy }),
    });
  };

  const handleNudge = async (target: string) => {
    try {
      await fetch("/api/checklist/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      toast.success(`푸시 알림 전송 완료 (${target})`);
    } catch {
      toast.error("푸시 알림 전송에 실패했습니다.");
    }
  };

  const masterItems = items.filter((i) => i.type === "master");
  const gahyunItems = items.filter((i) => i.type === "personal" && i.assignees.includes("gahyun"));
  const minuItems = items.filter((i) => i.type === "personal" && i.assignees.includes("minu"));

  const renderList = (list: PreparationItem[], targetUser: string) => {
    if (list.length === 0) {
      return <div className="text-sm text-gray-400 py-4 text-center">등록된 항목이 없습니다.</div>;
    }

    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-6">
        {list.map((item, idx) => {
          const isChecked = item.completed_by.includes(targetUser);
          const isHighlighted = highlightedItemId === item.id;
          
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between gap-3 p-4 active:bg-gray-100 dark:active:bg-gray-800 transition-colors duration-500 ${
                idx !== list.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""
              } ${isHighlighted ? "bg-yellow-100 dark:bg-yellow-900/50" : ""}`}
            >
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => toggleCheck(item.id, e.target.checked, targetUser)}
                  className="w-6 h-6 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`text-[16px] transition-all ${
                    isChecked ? "text-gray-400 line-through" : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {item.title}
                  {item.importance === "high" && <span className="ml-2 text-xs text-red-500 font-bold">중요</span>}
                </span>
              </label>
              {!isChecked && item.type === "personal" && (
                <button
                  onClick={() => handleNudge(targetUser)}
                  className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-full transition-colors"
                  aria-label="재촉하기"
                >
                  <Bell size={20} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const totalItemsCount = masterItems.length + gahyunItems.length + minuItems.length;
  const totalCheckedCount =
    masterItems.filter((i) => i.completed_by.includes("all")).length +
    gahyunItems.filter((i) => i.completed_by.includes("gahyun")).length +
    minuItems.filter((i) => i.completed_by.includes("minu")).length;
  
  const progress = totalItemsCount === 0 ? 0 : Math.round((totalCheckedCount / totalItemsCount) * 100);

  return (
    <AppScreen appBar={{ title: "여행 준비물 체크리스트" }}>
      <div className="flex flex-col h-[calc(100dvh-64px)] bg-white dark:bg-black relative">
        <div className="p-6 pb-2 border-b">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-bold">전체 준비 진행률</h2>
            <span className="text-blue-600 font-bold flex items-center">
              <NumberFlow value={progress} />%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
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
              <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-3">마스터 체크리스트 (공통)</h3>
              {renderList(masterItems, "all")}

              <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-3">가현쨩 짐싸기</h3>
              {renderList(gahyunItems, "gahyun")}

              <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-3">미누쿤 짐싸기</h3>
              {renderList(minuItems, "minu")}
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          className="fixed right-6 w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center hover:bg-blue-700 transition-colors z-50"
          style={{ bottom: "calc(88px + env(safe-area-inset-bottom))" }}
          onClick={() => setDrawerOpen(true)}
        >
          <Plus size={24} />
        </button>

        <ChecklistDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onSuccess={fetchItems}
        />
      </div>
      <BottomNav active="checklist" />
    </AppScreen>
  );
};
