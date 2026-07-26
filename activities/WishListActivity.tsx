/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ArrowUpRight, Image as ImageIcon, MapPin, Plus, RefreshCw, Store, Tag } from "lucide-react";
import { Button } from "@heroui/react";
import { WishDrawer } from "@/components/wish/WishDrawer";
import { buildGoogleMapsDirectionsUrl, formatThaiBaht, isWishType, WISH_TYPE_META, type WishItem, type WishType } from "@/lib/wishes";

interface WishListActivityProps { params: { type?: string } }

const fetchWishes = async (type: WishType): Promise<WishItem[]> => {
  const response = await fetch(`/api/wishes?type=${type}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "위시를 불러오지 못했습니다.");
  return payload.data;
};

export const WishListActivity: React.FC<WishListActivityProps> = ({ params }) => {
  const type = isWishType(params.type) ? params.type : "shopping";
  const meta = WISH_TYPE_META[type];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: wishes = [], isError, isLoading, refetch } = useQuery({ queryKey: ["wishes", type], queryFn: () => fetchWishes(type) });

  return (
    <AppScreen appBar={{ title: meta.title }}>
      <main className="min-h-[calc(100dvh-64px)] bg-slate-50 pb-[calc(6rem+env(safe-area-inset-bottom))] dark:bg-slate-950">
        <section className="mx-auto flex w-full max-w-lg flex-col gap-4 px-5 pt-5">
          <header className={`rounded-3xl bg-gradient-to-br ${meta.accent} px-5 py-5 text-white shadow-lg shadow-slate-200/70 dark:shadow-none`}>
            <p className="text-2xl" aria-hidden="true">{meta.icon}</p>
            <h1 className="mt-2 text-xl font-extrabold">{meta.title}</h1>
            <p className="mt-1 text-sm text-white/80">{meta.description}</p>
          </header>

          {isLoading && Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-3xl bg-white dark:bg-white/5" />)}
          {isError && <div className="rounded-3xl border border-red-100 bg-white px-5 py-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900"><p className="font-semibold text-slate-800 dark:text-slate-100">위시를 불러오지 못했어요.</p><p className="mt-1 text-sm text-slate-500">데이터베이스 설정과 네트워크를 확인해 주세요.</p><Button className="mt-4" variant="secondary" onPress={() => refetch()}><RefreshCw className="size-4" /> 다시 시도</Button></div>}
          {!isLoading && !isError && wishes.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900"><span className="text-4xl" aria-hidden="true">{meta.icon}</span><h2 className="mt-3 font-bold text-slate-800 dark:text-slate-100">아직 담긴 항목이 없어요</h2><p className="mt-1 text-sm leading-6 text-slate-500">{meta.emptyMessage}</p><Button className="mt-5" onPress={() => setDrawerOpen(true)}><Plus className="size-4" /> 등록하기</Button></div>}
          {!isLoading && !isError && wishes.map((wish) => <WishCard key={wish.id} type={type} wish={wish} />)}
        </section>
        <Button aria-label={`${meta.title} 등록`} className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-5 z-40 h-14 min-w-14 rounded-full px-5 shadow-xl" onPress={() => setDrawerOpen(true)}><Plus className="size-5" /><span className="font-bold">등록</span></Button>
      </main>
      <WishDrawer initialType={type} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </AppScreen>
  );
};

function WishCard({ wish, type }: { wish: WishItem; type: WishType }) {
  const price = formatThaiBaht(wish.target_price_thb);
  const hasMap = type === "restaurant" && Boolean(wish.map_query);
  return <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex gap-4 p-4"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">{wish.image_url ? <img alt="" className="size-full object-cover" src={wish.image_url} /> : <ImageIcon aria-hidden="true" className="size-6" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="truncate font-bold text-slate-900 dark:text-white">{wish.title}</h2>{price && <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">฿ {price}</span>}</div>{wish.category && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Tag className="size-3" />{wish.category}</p>}{wish.vendor && <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Store className="size-3" />{wish.vendor}</p>}{wish.memo && <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-300">{wish.memo}</p>}</div></div>{hasMap && <a className="flex min-h-12 items-center justify-center gap-1 border-t border-slate-100 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-50 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-blue-400/10" href={buildGoogleMapsDirectionsUrl(wish.map_query!)} rel="noreferrer" target="_blank"><MapPin className="size-4" /> 경로 찾기 <ArrowUpRight className="size-3.5" /></a>}</article>;
}
