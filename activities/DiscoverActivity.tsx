import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ArrowRight, Plus, RefreshCw } from "lucide-react";
import { Button } from "@heroui/react";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { WishDrawer } from "@/components/wish/WishDrawer";
import { ActivityRegisterFab } from "@/components/ui/activity-register-fab";
import { ActivityFetchLoader, useMinimumInitialLoading } from "@/components/ui/activity-fetch-loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cardNavButtonClass } from "@/components/ui/drawer-form";
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
  const mainRef = useRef<HTMLElement>(null);
  const { data: wishes = [], isError, isLoading, refetch } = useQuery({ queryKey: ["wishes"], queryFn: fetchWishes });
  const showInitialLoader = useMinimumInitialLoading(isLoading);
  const openList = (type: WishType) => { triggerHapticFeedback(); push("WishListActivity", { type }); };
  const openCreateDrawer = () => {
    triggerHapticFeedback();
    setDrawerSession((current) => current + 1);
    setDrawerOpen(true);
  };

  return (
    <AppScreen appBar={{ title: "원하는 건 확실히 골라!" }}>
      <main ref={mainRef} className="min-h-full w-full bg-white pb-[calc(4rem+max(env(safe-area-inset-bottom,0px),12px))] dark:bg-slate-950">
        {showInitialLoader ? (
          <ActivityFetchLoader messages={["위시를 확인하고 있어…", "원하는 걸 모아 보는 중이야…", "뭘 골랐는지 살펴볼게…"]} />
        ) : <section className="mx-auto w-full max-w-lg px-5 pt-6">
          <header className="mb-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <span className="flex items-center -space-x-2">
                <Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950">
                  <AvatarImage alt="가현쨩" src="/avatars/gahyun.webp" />
                  <AvatarFallback>가</AvatarFallback>
                </Avatar>
                <Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950">
                  <AvatarImage alt="미누쿤" src="/avatars/minu.webp" />
                  <AvatarFallback>미</AvatarFallback>
                </Avatar>
              </span>
              <span>의 위시 리스트!!</span>
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">원하는 건 전부 적어 둬</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">사고 싶은 거든 먹고 싶은 거든, 나중에 딴소리하지 말고 지금 확실히 골라.</p>
          </header>
          {isError ? (
            <div className="rounded-3xl border border-red-100 bg-white px-5 py-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900">
              <p className="font-semibold text-slate-800 dark:text-slate-100">위시를 불러오지 못했어요.</p>
              <p className="mt-1 text-sm text-slate-500">데이터베이스 설정을 확인한 뒤 다시 시도해 주세요.</p>
              <Button className="mt-4" variant="secondary" onPress={() => refetch()}>
                <RefreshCw className="size-4" /> 다시 시도
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {WISH_TYPES.map((type) => {
                const meta = WISH_TYPE_META[type];
                const items = wishes.filter((wish) => wish.type === type);

                return (
                  <Button
                    key={type}
                    className={`group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 ${cardNavButtonClass}`}
                    fullWidth
                    onPress={() => openList(type)}
                    variant="secondary"
                  >
                    <div className="flex w-full items-start gap-4">
                      <span className={`flex size-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.accent} text-2xl shadow-md`}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="font-bold text-slate-900 dark:text-white">{meta.title}</h2>
                            <p className="mt-0.5 text-xs text-slate-500">{items.length}개 등록됨</p>
                          </div>
                          <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        {items.length > 0 ? (
                          <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                            <span className="shrink-0 font-medium">최근</span>
                            <span className="shrink-0 text-slate-400">·</span>
                            <span className="truncate font-medium text-slate-700 dark:text-slate-200">{items[0].title}</span>
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-slate-500">{meta.emptyMessage}</p>
                        )}
                      </div>
                    </div>
                    {items.length === 0 && (
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                        <Plus className="size-4" /> 등록하기
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </section>}
        <ActivityRegisterFab
          ariaLabel="위시 등록"
          drawerOpen={drawerOpen}
          onPress={openCreateDrawer}
          placement="above-bottom-nav"
          scrollAnchorRef={mainRef}
        />
      </main>
      <WishDrawer
        key={drawerSession}
        initialType="shopping"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </AppScreen>
  );
};
