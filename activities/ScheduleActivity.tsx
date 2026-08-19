"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@heroui/react";
import { CalendarDays, Plus, RefreshCw } from "lucide-react";
import ClickSpark from "@/components/ClickSpark";
import { BottomNav } from "@/components/BottomNav";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { ScheduleDateTabs } from "@/components/schedule/ScheduleDateTabs";
import { ScheduleDrawer } from "@/components/schedule/ScheduleDrawer";
import { ScheduleTimeline, type ScheduleTimelineEntry } from "@/components/schedule/ScheduleTimeline";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { ActivityFetchLoader, useMinimumInitialLoading } from "@/components/ui/activity-fetch-loader";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogPopup, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatLongTripDate, isTripDate, type ScheduleItem, type TripDate } from "@/lib/schedule";
import { findScrollContainer } from "@/lib/scroll-container";
import { supabase } from "@/lib/supabase";

gsap.registerPlugin(useGSAP);

type Filter = TripDate | null;

const FAB_COMPACT_SCROLL_PX = 80;

const STAGGER_PARENT = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const STAGGER_CHILD = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
};

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
  const client = useQueryClient();
  const now = bangkokParts();
  const today = `${now.year}-${now.month}-${now.day}`;
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<Filter>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSession, setDrawerSession] = useState(0);
  const [editing, setEditing] = useState<ScheduleItem | null>(null);
  const [deleting, setDeleting] = useState<ScheduleItem | null>(null);
  const [fabCompact, setFabCompact] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const didScroll = useRef(false);
  const { data: items = [], isLoading, isError, refetch } = useQuery({ queryKey: ["schedule"], queryFn: fetchSchedule });
  const showInitialLoader = useMinimumInitialLoading(isLoading);

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
    if (didScroll.current || !currentKeys.size) return;
    didScroll.current = true;
    // 타임라인 등장 스태거가 끝난 뒤에 위치를 잡아야 최종 좌표로 스크롤된다.
    const timer = window.setTimeout(() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 480);
    return () => window.clearTimeout(timer);
  }, [currentKeys]);

  // Stackflow 스크롤 컨테이너는 마운트 시점에 확정되지 않으므로 캡처 단계에서 받아 처리한다.
  useEffect(() => {
    let frame = 0;

    const onScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !mainRef.current || !target.contains(mainRef.current)) return;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setFabCompact(target.scrollTop > FAB_COMPACT_SCROLL_PX);
      });
    };

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion || !fabRef.current) return;
    gsap.from(fabRef.current, { scale: 0.4, autoAlpha: 0, duration: 0.5, ease: "back.out(1.7)", clearProps: "opacity,visibility,transform" });
  }, { dependencies: [] });

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
  // 날짜를 바꾸면 이전 날짜에서 내려둔 스크롤이 그대로 남아 새 타임라인 중간이 보인다.
  const selectDate = (date: TripDate) => {
    setFilter(date);
    const scroller = findScrollContainer(mainRef.current);
    if (scroller) scroller.scrollTop = 0;
  };
  const openCreate = () => { setEditing(null); setDrawerSession((current) => current + 1); setDrawerOpen(true); };
  const openEdit = (item: ScheduleItem) => { setEditing(item); setDrawerSession((current) => current + 1); setDrawerOpen(true); };

  return (
    <AppScreen appBar={{ title: "일정, 제대로 따라와!" }}>
      <main ref={mainRef} className="min-h-full w-full max-w-full bg-gradient-to-b from-slate-50 to-white pb-[calc(6rem+max(env(safe-area-inset-bottom,0px),12px))] dark:from-slate-950 dark:to-slate-950">
        {!showInitialLoader && (
          <div className="sticky top-0 z-30 bg-slate-50/85 px-4 pb-2 pt-3 backdrop-blur-xl dark:bg-slate-950/85">
            <ScheduleDateTabs activeDate={activeDate} dates={tabDates} today={today} onChange={selectDate} />
          </div>
        )}
        {showInitialLoader ? (
          <ActivityFetchLoader messages={["일정을 확인하고 있어…", "시간표를 맞춰 보는 중이야…", "빠진 일정은 없는지 살펴볼게…"]} />
        ) : (
          <section className="mx-auto w-full min-w-0 max-w-lg overflow-x-clip px-4 py-5">
            {isError && (
              <motion.div className="rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-900" initial="hidden" animate="visible" variants={STAGGER_PARENT}>
                <motion.p className="font-bold" variants={STAGGER_CHILD}>일정을 불러오지 못했어요.</motion.p>
                <motion.button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900" variants={STAGGER_CHILD} onClick={() => refetch()}><RefreshCw className="size-4" /> 다시 시도</motion.button>
              </motion.div>
            )}
            {!isLoading && !isError && items.length === 0 && (
              <motion.div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700" initial="hidden" animate="visible" variants={STAGGER_PARENT}>
                <motion.div variants={STAGGER_CHILD}><CalendarDays className="mx-auto size-8 text-slate-400" /></motion.div>
                <motion.p className="mt-3 font-bold" variants={STAGGER_CHILD}>아직 일정이 없어요</motion.p>
                <motion.button className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900" variants={STAGGER_CHILD} onClick={openCreate}>첫 일정 등록</motion.button>
              </motion.div>
            )}
            {!isLoading && !isError && (
              <AnimatePresence initial={false} mode="wait">
                {grouped.map((group) => (
                  <motion.section
                    key={group.date}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: prefersReducedMotion ? 0.12 : 0.26, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">{formatLongTripDate(group.date)}</span>
                      {group.date === today && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">오늘</span>}
                    </div>
                    <ScheduleTimeline
                      railContent={<>
                        <Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950"><AvatarImage alt="가현짱" src="/avatars/gahyun.webp" /><AvatarFallback>가</AvatarFallback></Avatar>
                        <Avatar className="size-7 border-2 border-white shadow-sm dark:border-slate-950"><AvatarImage alt="미누쿤" src="/avatars/minu.webp" /><AvatarFallback>미</AvatarFallback></Avatar>
                      </>}
                      entries={group.items.map((item): ScheduleTimelineEntry => ({
                        id: item.id,
                        time: item.start_time,
                        current: currentKeys.has(item.id),
                        content: <ScheduleCard item={item} current={currentKeys.has(item.id)} showTime={false} cardRef={currentKeys.has(item.id) ? activeRef : undefined} onEdit={() => openEdit(item)} onDelete={() => setDeleting(item)} />,
                      }))}
                    />
                  </motion.section>
                ))}
              </AnimatePresence>
            )}
          </section>
        )}
      </main>
      <div ref={fabRef} className="fixed bottom-[calc(5rem+max(env(safe-area-inset-bottom,0px),12px))] right-5 z-40 h-14 min-w-14">
        <motion.div
          className="relative h-full w-full"
          animate={{ scale: fabCompact && !prefersReducedMotion ? 0.9 : 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <ClickSpark sparkColor="#60a5fa" sparkCount={10} sparkRadius={22}>
            <Button aria-label="일정 등록" className="h-full w-full rounded-full px-5 shadow-xl" onPress={openCreate}>
              <Plus className="size-5" />
              <motion.span
                className="inline-block overflow-hidden whitespace-nowrap font-bold"
                animate={{ maxWidth: fabCompact ? 0 : 44, opacity: fabCompact ? 0 : 1, marginLeft: fabCompact ? 0 : 2 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                등록
              </motion.span>
            </Button>
            <NativeHapticSwitch ariaLabel="일정 등록" checked={drawerOpen} onChange={openCreate} />
          </ClickSpark>
        </motion.div>
      </div>
      <ScheduleDrawer key={drawerSession} open={drawerOpen} onOpenChange={(open) => { setDrawerOpen(open); if (!open) setEditing(null); }} item={editing} />
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}><AlertDialogPopup><AlertDialogHeader><AlertDialogTitle>일정을 삭제할까요?</AlertDialogTitle><AlertDialogDescription><strong>{deleting?.title}</strong> 일정과 연결된 사진도 함께 삭제됩니다.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="grid grid-cols-2"><button className="h-11 rounded-xl bg-slate-100 font-bold" disabled={remove.isPending} onClick={() => setDeleting(null)}>취소</button><button className="h-11 rounded-xl bg-red-500 font-bold text-white" disabled={!deleting || remove.isPending} onClick={() => deleting && remove.mutate(deleting.id)}>{remove.isPending ? "삭제 중…" : "삭제"}</button></AlertDialogFooter></AlertDialogPopup></AlertDialog>
      <BottomNav active="schedule" />
    </AppScreen>
  );
};
