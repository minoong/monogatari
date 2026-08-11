"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Button, Tabs } from "@heroui/react";
import { ArrowUpRight, CalendarDays, ChevronLeft, Pencil, Plus, RefreshCw, Trash2, ZoomIn } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ScheduleDrawer } from "@/components/schedule/ScheduleDrawer";
import { Timeline, type TimelineEntry } from "@/components/ui/timeline";
import { ClockIcon } from "@/components/ui/clock-icon";
import { MapPinIcon } from "@/components/ui/map-pin-icon";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { WishImageGallery } from "@/components/wish/WishImageGallery";
import { ImageZoomModal } from "@/components/ui/image-zoom-modal";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogPopup, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MorphingDialog, MorphingDialogClose, MorphingDialogContainer, MorphingDialogContent, MorphingDialogDescription, MorphingDialogImage, MorphingDialogTitle, MorphingDialogTrigger } from "@/components/motion-primitives/morphing-dialog";
import { formatLongTripDate, formatTripDate, isTripDate, type ScheduleItem, type TripDate } from "@/lib/schedule";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Filter = TripDate | null;

const fetchSchedule = async (): Promise<ScheduleItem[]> => {
  const response = await fetch("/api/schedule");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "일정을 불러오지 못했어요.");
  return payload.data;
};

const bangkokParts = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
}).formatToParts(new Date()).reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {});

export const ScheduleActivity: React.FC = () => {
  const { replace } = useFlow();
  const client = useQueryClient();
  const now = bangkokParts();
  const today = `${now.year}-${now.month}-${now.day}`;
  const [filter, setFilter] = useState<Filter>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSession, setDrawerSession] = useState(0);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [deleting, setDeleting] = useState<ScheduleItem | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const didScroll = useRef(false);
  const { data: items = [], isLoading, isError, refetch } = useQuery({ queryKey: ["schedule"], queryFn: fetchSchedule });

  const tabDates = useMemo(() => Array.from(new Set(items.map((item) => item.schedule_date))).sort(), [items]);
  const activeDate = filter && tabDates.includes(filter) ? filter : tabDates.find((date) => date === today) ?? tabDates[0] ?? null;

  useEffect(() => {
    const channel = supabase.channel("schedule_items_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "schedule_items" }, () => client.invalidateQueries({ queryKey: ["schedule"] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [client]);

  const currentKeys = useMemo(() => {
    if (!isTripDate(today)) return new Set<string>();
    const currentTime = `${now.hour}:${now.minute}`;
    const current = items.filter((item) => item.schedule_date === today && item.start_time <= currentTime).map((item) => item.start_time).sort().at(-1);
    return new Set(items.filter((item) => item.schedule_date === today && item.start_time === current).map((item) => item.id));
  }, [items, now.hour, now.minute, today]);

  useEffect(() => {
    if (!didScroll.current && currentKeys.size && activeRef.current) {
      didScroll.current = true;
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentKeys]);

  const grouped = useMemo(
    () => (activeDate ? [{ date: activeDate, items: items.filter((item) => item.schedule_date === activeDate) }] : []),
    [activeDate, items],
  );
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/schedule?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "일정을 삭제하지 못했어요.");
    },
    onSuccess: async () => { setDeleting(null); await client.invalidateQueries({ queryKey: ["schedule"] }); },
  });
  const openCreate = () => { setEditing(null); setDrawerSession((current) => current + 1); setDrawerOpen(true); };
  const openEdit = (item: ScheduleItem) => { setEditing(item); setDrawerSession((current) => current + 1); setDrawerOpen(true); };

  return (
    <AppScreen appBar={{ title: "4일간의 일정표", renderLeft: () => <button type="button" aria-label="홈으로 돌아가기" className="grid size-10 place-items-center rounded-full transition active:bg-slate-100 dark:active:bg-slate-800" onClick={() => replace("HomeActivity", {}, { animate: false })}><ChevronLeft className="size-5" /></button> }}>
      <main className="min-h-full overflow-x-clip bg-slate-50 pb-[calc(6rem+max(env(safe-area-inset-bottom,0px),12px))] dark:bg-slate-950">
        <div className="sticky top-0 z-30 px-4 pt-3">
          <Tabs aria-label="일정 날짜" selectedKey={activeDate ?? undefined} onSelectionChange={(key) => setFilter(String(key) as TripDate)} className="w-full">
            <Tabs.ListContainer className="overflow-x-auto bg-transparent no-scrollbar">
              <Tabs.List className="min-w-max justify-start gap-1 rounded-full !bg-slate-100 p-1 shadow-none dark:!bg-slate-900">
                {tabDates.map((date) => (
                  <Tabs.Tab key={date} id={date} className="min-w-20 px-4 py-2 text-sm font-bold text-slate-500 data-[selected=true]:text-white">
                    {formatTripDate(date)}
                    <Tabs.Indicator className="rounded-full bg-slate-900 dark:bg-white" />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </div>
        <section className="mx-auto w-full max-w-lg overflow-x-clip px-4 py-5">
          {isLoading && <TimelineSkeleton />}
          {isError && <div className="rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-900"><p className="font-bold">일정을 불러오지 못했어요.</p><button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white" onClick={() => refetch()}><RefreshCw className="size-4" /> 다시 시도</button></div>}
          {!isLoading && !isError && items.length === 0 && <div className="rounded-3xl border border-dashed p-10 text-center"><CalendarDays className="mx-auto size-8 text-slate-400" /><p className="mt-3 font-bold">아직 일정이 없어요</p><button className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white" onClick={openCreate}>첫 일정 등록</button></div>}
          {!isLoading && !isError && grouped.map((group) => <section key={group.date}><div className="mb-4 flex items-center gap-2"><span className="text-sm font-extrabold text-slate-900 dark:text-white">{formatLongTripDate(group.date)}</span>{group.date === today && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">오늘</span>}</div><Timeline railContent={<><Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950"><AvatarImage alt="가현짱" src="/avatars/gahyun.webp" /><AvatarFallback>가</AvatarFallback></Avatar><Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950"><AvatarImage alt="미누쿤" src="/avatars/minu.webp" /><AvatarFallback>미</AvatarFallback></Avatar></>} data={group.items.map((item): TimelineEntry => ({ id: item.id, title: item.start_time, current: currentKeys.has(item.id), content: <ScheduleCard item={item} current={currentKeys.has(item.id)} cardRef={currentKeys.has(item.id) ? activeRef : undefined} onEdit={() => openEdit(item)} onDelete={() => setDeleting(item)} /> }))} /></section>)}
        </section>
      </main>
      <div className="fixed bottom-[calc(5rem+max(env(safe-area-inset-bottom,0px),12px))] right-5 z-40 h-14 min-w-14">
        <Button aria-label="일정 등록" className="h-full w-full rounded-full px-5 shadow-xl" onPress={openCreate}><Plus className="size-5" /><span className="font-bold">등록</span></Button>
        <NativeHapticSwitch ariaLabel="일정 등록" checked={drawerOpen} onChange={openCreate} />
      </div>
      <ScheduleDrawer key={drawerSession} open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) setEditing(null); }} item={editing} />
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}><AlertDialogPopup><AlertDialogHeader><AlertDialogTitle>일정을 삭제할까요?</AlertDialogTitle><AlertDialogDescription><strong>{deleting?.title}</strong> 일정과 연결된 사진도 함께 삭제됩니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="grid grid-cols-2"><button className="h-11 rounded-xl bg-slate-100 font-bold" disabled={remove.isPending} onClick={() => setDeleting(null)}>취소</button><button className="h-11 rounded-xl bg-red-500 font-bold text-white" disabled={!deleting || remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>{remove.isPending ? "삭제 중…" : "삭제"}</button></AlertDialogFooter></AlertDialogPopup></AlertDialog>
      <BottomNav active="schedule" />
    </AppScreen>
  );
};

function ScheduleCard({ item, current, cardRef, onEdit, onDelete }: { item: ScheduleItem; current: boolean; cardRef?: React.Ref<HTMLDivElement>; onEdit: () => void; onDelete: () => void }) {
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);

  return <div ref={cardRef} className="min-w-0">
    <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.45 }}>
      <article className={cn("relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-slate-900", current ? "border-blue-400 ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-500/20" : "border-slate-200 dark:border-slate-800")}>
        <MorphingDialogTrigger ariaLabel={`${item.title} 자세히 보기`} className="group block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <div className="flex min-w-0 gap-3 transition group-hover:bg-slate-50 group-active:bg-slate-100 dark:group-hover:bg-slate-800"><div className="min-w-0 flex-1"><div className="flex min-w-0 items-start gap-2"><MorphingDialogTitle className="min-w-0 flex-1"><h2 className="break-words font-extrabold leading-snug text-slate-900 dark:text-white">{item.title}</h2></MorphingDialogTitle>{current && <span className="mt-0.5 shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-extrabold text-white">지금</span>}</div>{item.subtitle && <ScheduleSubtitle subtitle={item.subtitle} />}</div>{item.images[0] && <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">{<MorphingDialogImage alt="" className="size-full object-cover" src={item.images[0].url} />}{item.images.length > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">+{item.images.length - 1}</span>}</div>}</div>
        </MorphingDialogTrigger>
        {item.google_maps_url && <div className="mt-2 flex h-5 items-center justify-end"><a aria-label={`${item.title} Google Maps 열기`} href={item.google_maps_url} target="_blank" rel="noreferrer" className="inline-flex size-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"><MapPinIcon size={18} /></a></div>}
      </article>

      <MorphingDialogContainer>
        <MorphingDialogContent className="relative mx-4 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
          <MorphingDialogClose className="right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur" />
          <div className="flex-1 overflow-y-auto"><div className="relative"><WishImageGallery images={item.images} title={item.title} onImagePress={(index) => { setZoomImageIndex(index); setZoomModalOpen(true); }} />{item.images.length > 0 && <button type="button" onClick={() => { setZoomImageIndex(0); setZoomModalOpen(true); }} className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-md"><ZoomIn className="size-3.5" /><span>탭하여 확대</span></button>}</div><div className="px-5 py-4"><p className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400"><ClockIcon animateOnMount className="text-slate-500 dark:text-slate-400" size={17} />{item.start_time}</p><MorphingDialogTitle><h2 className="mt-1 text-xl font-extrabold leading-snug text-slate-900 dark:text-white">{item.title}</h2></MorphingDialogTitle><MorphingDialogDescription disableLayoutAnimation className="mt-3">{item.subtitle && <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item.subtitle}</p>}{item.google_maps_url && <a href={item.google_maps_url} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"><span className="flex items-center gap-2"><MapPinIcon animateOnMount className="text-slate-500 dark:text-slate-400" size={18} />Google Maps 열기</span><ArrowUpRight className="size-4" /></a>}</MorphingDialogDescription></div></div>
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"><div className="flex items-center gap-2"><button aria-label={`${item.title} 삭제`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400" onClick={onDelete} type="button"><Trash2 className="size-4.5" /></button><MorphingDialogClose ariaLabel="다이얼로그 닫기" className="static flex h-11 flex-1 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">닫기</MorphingDialogClose><MorphingDialogClose ariaLabel={`${item.title} 편집`} className="static flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 font-bold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900" onClick={onEdit}><Pencil className="size-4" />편집</MorphingDialogClose></div></div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
      {item.images[zoomImageIndex] && <ImageZoomModal isOpen={zoomModalOpen} onClose={() => setZoomModalOpen(false)} src={item.images[zoomImageIndex].url} title={item.title} />}
    </MorphingDialog>
  </div>;
}
function ScheduleSubtitle({ subtitle }: { subtitle: string }) {
  return <p className="mt-1 line-clamp-3 break-words whitespace-pre-wrap text-sm leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>;
}
function TimelineSkeleton() { return <div className="ml-12 space-y-5 animate-pulse">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>; }
