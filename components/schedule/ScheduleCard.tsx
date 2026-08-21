"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Pencil, Trash2, ZoomIn } from "lucide-react";
import { Button } from "@heroui/react";
import ElectricBorder from "@/components/ElectricBorder";
import { ClockIcon } from "@/components/ui/clock-icon";
import { MapPinIcon } from "@/components/ui/map-pin-icon";
import { ImageZoomModal } from "@/components/ui/image-zoom-modal";
import { WishImageGallery } from "@/components/wish/WishImageGallery";
import { MorphingDialog, MorphingDialogClose, MorphingDialogContainer, MorphingDialogContent, MorphingDialogDescription, MorphingDialogImage, MorphingDialogTitle, MorphingDialogTrigger } from "@/components/motion-primitives/morphing-dialog";
import type { ScheduleItem } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const CURRENT_ACCENT = "#3b82f6";

interface ScheduleCardProps {
  item: ScheduleItem;
  current: boolean;
  cardRef?: React.Ref<HTMLDivElement>;
  onEdit: () => void;
  onDelete: () => void;
  /** 타임라인 좌측에 시간이 있으면 카드 안 시간은 숨긴다. */
  showTime?: boolean;
}

export function ScheduleCard({ item, current, cardRef, onEdit, onDelete, showTime = true }: ScheduleCardProps) {
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const electric = current && !prefersReducedMotion;

  const card = (
    <motion.article
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-white shadow-[0_14px_30px_-24px_rgba(15,23,42,0.5)] dark:bg-slate-900",
        current
          ? "border-blue-300 dark:border-blue-500/60"
          : "border-slate-200 dark:border-slate-800",
        !current && "opacity-95",
      )}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 520, damping: 32 }}
    >
      <MorphingDialogTrigger
        ariaLabel={`${item.title} 자세히 보기`}
        className={cn("group block w-full rounded-3xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500", item.google_maps_url ? "pb-11" : "pb-4", showTime ? "min-h-28" : "min-h-24")}
      >
        <div className="flex min-w-0 gap-3.5">
          <div className="min-w-0 flex-1">
            {showTime && (
              <div className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums text-slate-400 dark:text-slate-500">
                <ClockIcon aria-hidden="true" className="text-slate-400 dark:text-slate-500" size={13} />
                {item.start_time}
              </div>
            )}
            <div className={cn("flex min-w-0 items-start gap-2", showTime ? "mt-1" : "mt-0")}>
              <MorphingDialogTitle className="min-w-0 flex-1">
                <h2 className="break-words font-extrabold leading-snug text-slate-900 dark:text-white">{item.title}</h2>
              </MorphingDialogTitle>
              {current && (
                <motion.span
                  className="mt-0.5 shrink-0 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm"
                  initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 480, damping: 22, delay: 0.15 }}
                >
                  지금
                </motion.span>
              )}
            </div>
            {item.subtitle && <p className="mt-1.5 line-clamp-3 break-words whitespace-pre-wrap text-sm leading-5 text-slate-500 dark:text-slate-400">{item.subtitle}</p>}
          </div>
          {item.images[0] && (
            <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
              <MorphingDialogImage alt="" className="size-full object-cover" src={item.images[0].url} />
              {item.images.length > 1 && <span className="absolute bottom-1 right-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">+{item.images.length - 1}</span>}
            </div>
          )}
        </div>
      </MorphingDialogTrigger>
      {item.google_maps_url && (
        <a
          aria-label={`${item.title} Google Maps 열기`}
          href={item.google_maps_url}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-3 right-4 z-10 inline-flex size-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <MapPinIcon size={18} />
        </a>
      )}
    </motion.article>
  );

  return (
    <div ref={cardRef} className="min-w-0">
      <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.45 }}>
        {electric ? (
          <ElectricBorder borderRadius={24} chaos={0.08} color={CURRENT_ACCENT} speed={0.9}>
            {card}
          </ElectricBorder>
        ) : (
          <div className={cn(current && "rounded-3xl ring-2 ring-blue-200 dark:ring-blue-500/30")}>{card}</div>
        )}

        <MorphingDialogContainer>
          <MorphingDialogContent className="relative mx-4 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <MorphingDialogClose className="right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur" />
            <div className="flex-1 overflow-y-auto">
              <div className="relative">
                <WishImageGallery images={item.images} title={item.title} onImagePress={(index) => { setZoomImageIndex(index); setZoomModalOpen(true); }} />
                {item.images.length > 0 && (
                  <Button className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md" onPress={() => { setZoomImageIndex(0); setZoomModalOpen(true); }} size="sm">
                    <ZoomIn className="size-3.5" /><span>탭하여 확대</span>
                  </Button>
                )}
              </div>
              <div className="px-5 py-4">
                <p className="flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <ClockIcon animateOnMount className="text-slate-500 dark:text-slate-400" size={17} />{item.start_time}
                </p>
                <MorphingDialogTitle><h2 className="mt-1 text-xl font-extrabold leading-snug text-slate-900 dark:text-white">{item.title}</h2></MorphingDialogTitle>
                <MorphingDialogDescription disableLayoutAnimation className="mt-3">
                  {item.subtitle && <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item.subtitle}</p>}
                  {item.google_maps_url && (
                    <a href={item.google_maps_url} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-2"><MapPinIcon animateOnMount className="text-slate-500 dark:text-slate-400" size={18} />Google Maps 열기</span>
                      <ArrowUpRight className="size-4" />
                    </a>
                  )}
                </MorphingDialogDescription>
              </div>
            </div>
            <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Button aria-label={`${item.title} 삭제`} className="flex h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400" isIconOnly onPress={onDelete} size="lg" variant="ghost"><Trash2 className="size-4.5" /></Button>
                <MorphingDialogClose ariaLabel="다이얼로그 닫기" className="static flex h-11 flex-1 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">닫기</MorphingDialogClose>
                <MorphingDialogClose ariaLabel={`${item.title} 편집`} className="static flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 font-bold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900" onClick={onEdit}><Pencil className="size-4" />편집</MorphingDialogClose>
              </div>
            </div>
          </MorphingDialogContent>
        </MorphingDialogContainer>
        {item.images[zoomImageIndex] && <ImageZoomModal isOpen={zoomModalOpen} onClose={() => setZoomModalOpen(false)} src={item.images[zoomImageIndex].url} title={item.title} />}
      </MorphingDialog>
    </div>
  );
}
