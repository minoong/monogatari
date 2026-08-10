"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFlow } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Tabs } from "@heroui/react";
import { CalendarDays, ChevronLeft, MapPin, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { BottomNav, triggerHapticFeedback } from "@/components/BottomNav";
import { ScheduleDrawer } from "@/components/schedule/ScheduleDrawer";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogPopup, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [deleting, setDeleting] = useState<ScheduleItem | null>(null);
  const [detail, setDetail] = useState<ScheduleItem | null>(null);
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
  const openCreate = () => { setEditing(null); setDrawerOpen(true); };

  return (
    <AppScreen appBar={{ title: "4일간의 일정표", renderLeft: () => <button type="button" aria-label="홈으로 돌아가기" className="grid size-10 place-items-center rounded-full transition active:bg-slate-100 dark:active:bg-slate-800" onClick={() => replace("HomeActivity", {}, { animate: false })}><ChevronLeft className="size-5" /></button> }}>
      <main className="min-h-full bg-slate-50 pb-[calc(6rem+max(env(safe-area-inset-bottom,0px),12px))] dark:bg-slate-950">
        <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-slate-50/90 px-4 pt-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
          <Tabs
            aria-label="일정 날짜"
            selectedKey={activeDate ?? undefined}
            onSelectionChange={(key) => setFilter(String(key))}
            className="w-full"
          >
            <Tabs.ListContainer>
              <Tabs.List className="w-max min-w-full justify-start gap-1">
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
        <section className="mx-auto w-full max-w-lg px-4 py-5">
          {isLoading && <TimelineSkeleton />}
          {isError && <div className="rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-900"><p className="font-bold">일정을 불러오지 못했어요.</p><button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white" onClick={() => refetch()}><RefreshCw className="size-4" /> 다시 시도</button></div>}
          {!isLoading && !isError && items.length === 0 && <div className="rounded-3xl border border-dashed p-10 text-center"><CalendarDays className="mx-auto size-8 text-slate-400" /><p className="mt-3 font-bold">아직 일정이 없어요</p><button className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white" onClick={openCreate}>첫 일정 등록</button></div>}
          {!isLoading && !isError && <div className="relative"><aside aria-label="가현짱과 미누쿤의 여행 타임라인" className="pointer-events-none absolute bottom-0 left-0 top-0 w-11"><div className="sticky top-5 flex -space-x-2"><Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950"><AvatarImage alt="가현짱" src="/avatars/gahyun.webp" /><AvatarFallback>가</AvatarFallback></Avatar><Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950"><AvatarImage alt="미누쿤" src="/avatars/minu.webp" /><AvatarFallback>미</AvatarFallback></Avatar></div></aside><div className="ml-12 space-y-8">{grouped.map((group) => <section key={group.date}><div className="mb-4 flex items-center gap-2"><span className="text-sm font-extrabold text-slate-900 dark:text-white">{formatLongTripDate(group.date)}</span>{group.date === today && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">오늘</span>}</div><div className="space-y-3">{group.items.map((item) => <ScheduleCard key={item.id} item={item} current={currentKeys.has(item.id)} cardRef={currentKeys.has(item.id) ? activeRef : undefined} onDetail={() => setDetail(item)} onEdit={() => { setEditing(item); setDrawerOpen(true); }} onDelete={() => setDeleting(item)} />)}</div></section>)}</div></div>}
        </section>
      </main>
      <button aria-label="일정 등록" className="fixed bottom-[calc(5rem+max(env(safe-area-inset-bottom,0px),12px))] right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-slate-900 px-5 font-bold text-white shadow-xl active:scale-95 dark:bg-white dark:text-slate-900" onClick={() => { triggerHapticFeedback(10); openCreate(); }}><Plus className="size-5" /> 등록</button>
      <ScheduleDrawer key={`${drawerOpen}-${editing?.id ?? "new"}`} open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) setEditing(null); }} item={editing} />
      <ScheduleDetail item={detail} onClose={() => setDetail(null)} onEdit={() => { if (detail) { setEditing(detail); setDrawerOpen(true); setDetail(null); } }} />
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}><AlertDialogPopup><AlertDialogHeader><AlertDialogTitle>일정을 삭제할까요?</AlertDialogTitle><AlertDialogDescription><strong>{deleting?.title}</strong> 일정과 연결된 사진도 함께 삭제됩니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="grid grid-cols-2"><button className="h-11 rounded-xl bg-slate-100 font-bold" disabled={remove.isPending} onClick={() => setDeleting(null)}>취소</button><button className="h-11 rounded-xl bg-red-500 font-bold text-white" disabled={!deleting || remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>{remove.isPending ? "삭제 중…" : "삭제"}</button></AlertDialogFooter></AlertDialogPopup></AlertDialog>
      <BottomNav active="schedule" />
    </AppScreen>
  );
};

function ScheduleCard({ item, current, cardRef, onDetail, onEdit, onDelete }: { item: ScheduleItem; current: boolean; cardRef?: React.Ref<HTMLDivElement>; onDetail: () => void; onEdit: () => void; onDelete: () => void }) { return <div ref={cardRef} className="relative grid grid-cols-[44px_1fr] gap-3"><div className="relative pt-3 text-right text-xs font-extrabold tabular-nums text-slate-500">{item.start_time}<span className={cn("absolute right-[-19px] top-4 size-3 rounded-full border-[3px] border-slate-50 dark:border-slate-950", current ? "bg-blue-500 motion-safe:animate-ping" : "bg-slate-300 dark:bg-slate-700")} /><span className="absolute right-[-15px] top-4 size-1 rounded-full bg-white dark:bg-slate-950" /></div><article className={cn("group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-slate-900", current ? "border-blue-400 ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-500/20" : "border-slate-200 dark:border-slate-800")}><button className="absolute inset-0 z-0" aria-label={`${item.title} 자세히 보기`} onClick={onDetail} /><div className="relative z-10 flex gap-3 pointer-events-none"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate font-extrabold text-slate-900 dark:text-white">{item.title}</h2>{current && <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-extrabold text-white">지금</span>}</div>{item.subtitle && <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-500 dark:text-slate-400">{item.subtitle}</p>}</div>{item.images[0] && <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100" style={{ backgroundImage: `url(${item.images[0].url})`, backgroundSize: "cover", backgroundPosition: "center" }}>{item.images.length > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">+{item.images.length - 1}</span>}</div>}</div><div className="relative z-10 mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-2 dark:border-slate-800"><button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" onClick={onEdit} aria-label={`${item.title} 편집`}><Pencil className="size-3.5" /></button>{item.google_maps_url && <a className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" href={item.google_maps_url} target="_blank" rel="noreferrer" aria-label={`${item.title} Google Maps 열기`}><MapPin className="size-3.5" /></a>}<button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10" onClick={onDelete} aria-label={`${item.title} 삭제`}><Trash2 className="size-3.5" /></button></div></article></div>; }
function ScheduleDetail({ item, onClose, onEdit }: { item: ScheduleItem | null; onClose: () => void; onEdit: () => void }) { if (!item) return null; return <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-4 backdrop-blur-sm sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label={`${item.title} 상세`}><section className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-blue-600">{item.start_time}</p><h2 className="mt-1 text-xl font-extrabold">{item.title}</h2></div><button onClick={onClose} className="rounded-full bg-slate-100 p-2 dark:bg-slate-800" aria-label="닫기"><X className="size-4" /></button></div>{item.subtitle && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{item.subtitle}</p>}{item.images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-2">{item.images.map((image, index) => <div key={image.id} aria-label={`${item.title} 사진 ${index + 1}`} className="aspect-square rounded-2xl bg-slate-100" style={{ backgroundImage: `url(${image.url})`, backgroundSize: "cover", backgroundPosition: "center" }} />)}</div>}<div className="mt-5 flex gap-2"><button className="flex-1 rounded-xl bg-slate-100 py-3 font-bold dark:bg-slate-800" onClick={onClose}>닫기</button><button className="flex-1 rounded-xl bg-slate-900 py-3 font-bold text-white dark:bg-white dark:text-slate-900" onClick={onEdit}>수정</button></div></section></div>; }
function TimelineSkeleton() { return <div className="ml-12 space-y-5 animate-pulse">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div>; }
