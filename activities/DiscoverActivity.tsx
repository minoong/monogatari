import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ArrowRight, Plus, RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";
import { BottomNav, triggerHapticFeedback } from "@/components/BottomNav";
import { WishDrawer } from "@/components/wish/WishDrawer";
import { WISH_TYPES, WISH_TYPE_META, type WishItem, type WishType } from "@/lib/wishes";

const fetchWishes = async (): Promise<WishItem[]> => {
  const response = await fetch("/api/wishes");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "위시를 불러오지 못했습니다.");
  return payload.data;
};

export const DiscoverActivity: React.FC = () => {
  const { push } = useFlow();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSession, setDrawerSession] = useState(0);
  const { data: wishes = [], isError, isLoading, refetch } = useQuery({ queryKey: ["wishes"], queryFn: fetchWishes });
  const openList = (type: WishType) => { triggerHapticFeedback(); push("WishListActivity", { type }); };
  const openCreateDrawer = () => {
    triggerHapticFeedback();
    setDrawerSession((current) => current + 1);
    setDrawerOpen(true);
  };

  return (
    <AppScreen appBar={{ title: "위시" }}>
      <main className="min-h-[calc(100dvh-64px)] bg-slate-50 pb-[calc(6rem+env(safe-area-inset-bottom))] dark:bg-slate-950">
        <section className="mx-auto w-full max-w-lg px-5 pt-6">
          <header className="mb-5"><p className="text-sm font-semibold text-blue-600">TRIP WISH</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">이번 여행의 작은 위시들</h1><p className="mt-2 text-sm leading-6 text-slate-500">사고 싶은 것, 먹고 싶은 것, 가 보고 싶은 곳을 한곳에 모아 보세요.</p></header>
          {isError ? <div className="rounded-3xl border border-red-100 bg-white px-5 py-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900"><p className="font-semibold text-slate-800 dark:text-slate-100">위시를 불러오지 못했어요.</p><p className="mt-1 text-sm text-slate-500">데이터베이스 설정을 확인한 뒤 다시 시도해 주세요.</p><Button className="mt-4" variant="secondary" onPress={() => refetch()}><RefreshCw className="size-4" /> 다시 시도</Button></div> : <div className="flex flex-col gap-4">{WISH_TYPES.map((type) => {
            const meta = WISH_TYPE_META[type];
            const items = wishes.filter((wish) => wish.type === type);
            return <button key={type} className="group w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition-transform active:scale-[0.985] dark:bg-slate-900 dark:ring-slate-800" onClick={() => openList(type)} type="button"><div className="flex items-start gap-4"><span className={`flex size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.accent} text-2xl shadow-md`}>{meta.icon}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900 dark:text-white">{meta.title}</h2><p className="mt-0.5 text-xs text-slate-500">{items.length}개 등록됨</p></div><ArrowRight aria-hidden="true" className="size-5 text-slate-400 transition-transform group-hover:translate-x-0.5" /></div>{isLoading ? <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /> : items.length > 0 ? <p className="mt-3 truncate text-sm text-slate-600 dark:text-slate-300"><span className="font-medium">최근</span> · {items.slice(0, 2).map((item) => item.title).join(" · ")}</p> : <p className="mt-3 text-sm text-slate-500">{meta.emptyMessage}</p>}</div></div>{!isLoading && items.length === 0 && <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600"><Plus className="size-4" /> 등록하기</span>}</button>;
          })}</div>}
        </section>
        <Button
          aria-label="위시 등록"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-40 h-14 min-w-14 rounded-full px-5 shadow-xl"
          onPress={openCreateDrawer}
        >
          <Plus className="size-5" />
          <span className="font-bold">등록</span>
        </Button>
      </main>
      <WishDrawer
        key={drawerSession}
        initialType="shopping"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <BottomNav active="wish" />
    </AppScreen>
  );
};
