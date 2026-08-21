"use client";

import { useGSAP } from "@gsap/react";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { AlertCircle, Camera, Check, GripVertical, Images, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { triggerHapticFeedback } from "@/components/BottomNav";
import ClickSpark from "@/components/ClickSpark";
import ElectricBorder from "@/components/ElectricBorder";
import { Button } from "@heroui/react";
import { DrawerFieldLabel, drawerPrimaryButtonClass } from "@/components/ui/drawer-form";
import { ScanTextIcon, type ScanTextIconHandle } from "@/components/ui/scan-text";
import { cn } from "@/lib/utils";
import {
  ACCEPT_IMAGE_INPUT,
  createLocalImageId,
  isAcceptedImageFile,
  rejectImageFileReason,
} from "@/lib/image-upload";
import type { WishImageDraft } from "@/components/wish/WishImagePicker";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export type ReceiptScanStatus = "idle" | "scanning" | "success" | "error";

interface ExpenseReceiptPickerProps {
  active: boolean;
  disabled?: boolean;
  images: WishImageDraft[];
  onChange: (images: WishImageDraft[]) => void;
  onScan: () => void;
  scanStatus: ReceiptScanStatus;
}

const MAX_IMAGES = 5;
const THUMB_SIZE_CLASS = "h-[88px] w-[88px] shrink-0";
const SPRING = { type: "spring" as const, stiffness: 420, damping: 28, mass: 0.85 };

const STATUS_COPY: Record<ReceiptScanStatus, string> = {
  idle: "영수증 스캔",
  scanning: "스캔 중…",
  success: "스캔 완료",
  error: "스캔 실패",
};

const BORDER_COLOR: Record<ReceiptScanStatus, string | null> = {
  idle: null,
  scanning: "#3b82f6",
  success: "#22c55e",
  error: "#ef4444",
};

export function ExpenseReceiptPicker({
  active,
  disabled = false,
  images,
  onChange,
  onScan,
  scanStatus,
}: ExpenseReceiptPickerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<ScanTextIconHandle>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const albumInputId = `${inputId}-album`;
  const cameraInputDomId = `${inputId}-camera`;
  const objectUrlsRef = useRef(new Set<string>());
  const prevCountRef = useRef(images.length);
  const [newImageId, setNewImageId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const scanning = scanStatus === "scanning";
  const empty = images.length === 0;
  const borderColor = BORDER_COLOR[scanStatus];
  const showElectricBorder = borderColor !== null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  useEffect(() => {
    const currentUrls = new Set(images.filter((image) => image.file).map((image) => image.url));
    objectUrlsRef.current.forEach((url) => { if (!currentUrls.has(url)) URL.revokeObjectURL(url); });
    objectUrlsRef.current = currentUrls;
  }, [images]);
  useEffect(() => () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  // 드로어 열릴 때 섹션 등장
  useGSAP(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion || !active) return;
    gsap.fromTo(
      section,
      { autoAlpha: 0, y: 28, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out" },
    );
  }, { dependencies: [active, reduceMotion] });

  // 뷰파인더 코너 숨쉬기 (빈 상태)
  useGSAP(() => {
    const corners = cornersRef.current;
    if (!corners || reduceMotion || !active || !empty) return;
    gsap.fromTo(
      corners.querySelectorAll("[data-corner]"),
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.45, stagger: 0.07, ease: "back.out(2.2)", delay: 0.15 },
    );
    const tween = gsap.to(corners.querySelectorAll("[data-corner]"), {
      opacity: 0.45,
      duration: 1.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      stagger: { each: 0.12, from: "random" },
    });
    return () => { tween.kill(); };
  }, { dependencies: [active, empty, reduceMotion] });

  // 스캔 빔
  useGSAP(() => {
    const beam = beamRef.current;
    const frame = frameRef.current;
    if (!beam || !frame || reduceMotion || !scanning) {
      gsap.set(beam, { autoAlpha: 0, y: 0 });
      return;
    }
    const height = Math.max(frame.offsetHeight - 32, 40);
    gsap.set(beam, { autoAlpha: 1, y: 0, boxShadow: "0 0 24px rgba(59,130,246,0.55)" });
    const tween = gsap.to(beam, {
      y: height,
      duration: 0.95,
      ease: "power2.inOut",
      repeat: -1,
      yoyo: true,
    });
    return () => { tween.kill(); };
  }, { dependencies: [scanning, reduceMotion, images.length, empty], scope: frameRef });

  // 성공 버스트 / 실패 흔들림
  useGSAP(() => {
    const section = sectionRef.current;
    if (!section || reduceMotion) return;
    if (scanStatus === "success") {
      triggerHapticFeedback(18);
      gsap.fromTo(section, { scale: 1 }, { scale: 1.02, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" });
    }
    if (scanStatus === "error") {
      triggerHapticFeedback(24);
      gsap.fromTo(section, { x: 0 }, { x: -8, duration: 0.06, repeat: 5, yoyo: true, ease: "power2.inOut", onComplete: () => { gsap.set(section, { x: 0 }); } });
    }
  }, { dependencies: [scanStatus, reduceMotion] });

  useEffect(() => {
    if (reduceMotion || scanStatus === "idle") {
      iconRef.current?.stopAnimation();
      return;
    }
    iconRef.current?.startAnimation();
    if (scanStatus !== "scanning") return;
    const timer = window.setInterval(() => iconRef.current?.startAnimation(), 900);
    return () => window.clearInterval(timer);
  }, [reduceMotion, scanStatus]);

  // 사진 업로드 감지
  useEffect(() => {
    if (images.length <= prevCountRef.current) {
      prevCountRef.current = images.length;
      return;
    }
    const added = images[images.length - 1];
    prevCountRef.current = images.length;
    setNewImageId(added.id);
    triggerHapticFeedback(10);
    const timer = window.setTimeout(() => setNewImageId(null), 900);
    return () => window.clearTimeout(timer);
  }, [images]);

  const addFiles = (files: FileList | null) => {
    if (!files || disabled) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`영수증은 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
      return;
    }

    const candidates = Array.from(files).slice(0, remaining);
    const accepted: File[] = [];
    let firstRejectReason: string | null = null;

    candidates.forEach((file) => {
      if (isAcceptedImageFile(file)) {
        accepted.push(file);
        return;
      }
      firstRejectReason ??= rejectImageFileReason(file);
    });

    if (!accepted.length) {
      toast.error(firstRejectReason ?? "올릴 수 있는 사진이 없어요.");
      return;
    }

    onChange([
      ...images,
      ...accepted.map((file) => ({
        id: createLocalImageId(),
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const openAlbumPicker = () => {
    if (disabled) return;
    albumInputRef.current?.click();
  };

  const openCameraPicker = () => {
    if (disabled) return;
    cameraInputRef.current?.click();
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((image) => image.id === active.id);
    const newIndex = images.findIndex((image) => image.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) onChange(arrayMove(images, oldIndex, newIndex));
  };

  const card = (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-white/5">
      <AnimatePresence mode="wait">
        {empty ? (
          <motion.div
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            initial={{ opacity: 0, scale: 0.94 }}
            key="empty"
            ref={frameRef}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-xl border border-dashed border-slate-200 bg-white px-4 py-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <ScanCorners ref={cornersRef} />
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex flex-col items-center text-center"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              transition={{ ...SPRING, delay: 0.08 }}
            >
              <motion.span
                animate={{ scale: 1, rotate: 0 }}
                className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:ring-blue-500/20"
                initial={reduceMotion ? false : { scale: 0.5, rotate: -12 }}
                transition={{ ...SPRING, delay: 0.12 }}
              >
                <ScanTextIcon ref={iconRef} className="flex" size={22} />
              </motion.span>
              <p className="mt-3 text-[15px] font-bold text-slate-900 dark:text-slate-50">영수증을 스캔해요</p>
              <p className="mt-1 max-w-[260px] text-xs leading-5 text-slate-400">찍거나 고르면 금액·상호·날짜를 채워요</p>
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 grid w-full grid-cols-2 gap-2"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                transition={{ ...SPRING, delay: 0.18 }}
              >
                <Button
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-blue-500 text-sm font-bold text-white shadow-sm shadow-blue-500/25"
                  fullWidth
                  onPress={openCameraPicker}
                  size="md"
                >
                  <Camera className="size-4" strokeWidth={1.75} />
                  촬영
                </Button>
                <Button
                  className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  fullWidth
                  onPress={openAlbumPicker}
                  size="md"
                  variant="secondary"
                >
                  <Images className="size-4" strokeWidth={1.75} />
                  앨범
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 24 }}
            key="filled"
            transition={SPRING}
            className="space-y-2"
          >
            <div ref={frameRef} className="relative overflow-hidden rounded-xl bg-white p-2 dark:bg-slate-900">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map((image) => image.id)} strategy={horizontalListSortingStrategy}>
                  <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {images.map((image, index) => (
                      <SortableThumb
                        image={image}
                        index={index}
                        isNew={image.id === newImageId}
                        isScanTarget={index === 0}
                        key={image.id}
                        onRemove={() => onChange(images.filter((item) => item.id !== image.id))}
                        reduceMotion={reduceMotion}
                        scanning={scanning}
                        scanStatus={scanStatus}
                      />
                    ))}
                    {images.length < MAX_IMAGES && (
                      <motion.button
                        animate={{ opacity: 1, scale: 1 }}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                        transition={{ ...SPRING, delay: 0.1 }}
                        className={cn(
                          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-white/5",
                          THUMB_SIZE_CLASS,
                        )}
                        onClick={openAlbumPicker}
                        type="button"
                        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                      >
                        <Plus className="size-5 text-blue-500" />
                        <span className="text-[11px] font-semibold">추가</span>
                      </motion.button>
                    )}
                  </div>
                </SortableContext>
              </DndContext>

              <ScanBeamOverlay beamRef={beamRef} scanning={scanning} />

              <AnimatePresence>
                {scanning && <ScanDataLines reduceMotion={reduceMotion} />}
              </AnimatePresence>

              <AnimatePresence>
                {scanStatus === "success" && !reduceMotion && <SuccessFlash />}
              </AnimatePresence>
            </div>

            <ClickSpark sparkColor={scanStatus === "error" ? "#fca5a5" : "#93c5fd"} sparkCount={scanStatus === "success" ? 14 : 10} sparkRadius={20}>
              <Button
                aria-busy={scanning}
                aria-label={STATUS_COPY[scanStatus]}
                className={cn(
                  "relative min-h-12 w-full gap-2 overflow-hidden rounded-2xl text-base font-bold",
                  scanStatus === "success" && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                  scanStatus === "error" && "bg-red-500 text-white shadow-lg shadow-red-500/30",
                  scanning && "bg-blue-500 text-white shadow-lg shadow-blue-500/30",
                  scanStatus === "idle" && drawerPrimaryButtonClass,
                )}
                fullWidth
                isDisabled={disabled || scanning || scanStatus === "success" || scanStatus === "error"}
                onPress={() => {
                  triggerHapticFeedback(10);
                  onScan();
                }}
                size="lg"
              >
                <StatusIcon scanStatus={scanStatus} scanning={scanning} />
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                    initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    key={scanStatus}
                    transition={{ duration: 0.22 }}
                  >
                    {STATUS_COPY[scanStatus]}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </ClickSpark>

            <motion.p
              animate={{ opacity: 1 }}
              className="px-1 text-center text-[11px] leading-4 text-slate-400"
              initial={reduceMotion ? false : { opacity: 0 }}
              transition={{ delay: 0.15 }}
            >
              맨 앞 사진이 스캔 대상 · 최대 {MAX_IMAGES}장
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className="shrink-0 space-y-2" ref={sectionRef}>
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between gap-2 px-0.5"
        initial={reduceMotion ? false : { opacity: 0, x: -12 }}
        transition={{ ...SPRING, delay: 0.05 }}
      >
        <DrawerFieldLabel icon={ScanTextIcon} active={active}>영수증 스캔</DrawerFieldLabel>
        <motion.span
          animate={{ scale: 1 }}
          className="text-xs font-semibold tabular-nums text-slate-400"
          initial={reduceMotion ? false : { scale: 0.8 }}
          key={images.length}
          transition={SPRING}
        >
          {images.length}/{MAX_IMAGES}
        </motion.span>
      </motion.div>

      {showElectricBorder && borderColor ? (
        <ElectricBorder
          borderRadius={16}
          chaos={scanning ? 0.16 : scanStatus === "error" ? 0.18 : 0.1}
          color={borderColor}
          speed={scanning ? 1.6 : scanStatus === "error" ? 1.8 : 1.1}
        >
          {card}
        </ElectricBorder>
      ) : (
        card
      )}

      <input
        accept={ACCEPT_IMAGE_INPUT}
        capture="environment"
        className="sr-only"
        id={cameraInputDomId}
        onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }}
        ref={cameraInputRef}
        type="file"
      />
      <input
        accept={ACCEPT_IMAGE_INPUT}
        className="sr-only"
        id={albumInputId}
        multiple
        onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }}
        ref={albumInputRef}
        type="file"
      />
    </section>
  );
}

const ScanCorners = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => (
  <div ref={ref} className="pointer-events-none absolute inset-0">
    <span aria-hidden="true" className="absolute left-3 top-3 size-5 rounded-tl-md border-l-2 border-t-2 border-blue-400/80" data-corner />
    <span aria-hidden="true" className="absolute right-3 top-3 size-5 rounded-tr-md border-r-2 border-t-2 border-blue-400/80" data-corner />
    <span aria-hidden="true" className="absolute bottom-3 left-3 size-5 rounded-bl-md border-b-2 border-l-2 border-blue-400/80" data-corner />
    <span aria-hidden="true" className="absolute bottom-3 right-3 size-5 rounded-br-md border-b-2 border-r-2 border-blue-400/80" data-corner />
  </div>
);

function ScanBeamOverlay({ beamRef, scanning }: { beamRef: React.RefObject<HTMLDivElement | null>; scanning: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-2 z-10 overflow-hidden rounded-lg">
      <div
        ref={beamRef}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px] opacity-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.6)]"
      />
      <AnimatePresence>
        {scanning && (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-500/5"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScanDataLines({ reduceMotion }: { reduceMotion: boolean | null }) {
  if (reduceMotion) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-2 z-20 overflow-hidden rounded-lg">
      {[0, 1, 2, 3].map((line) => (
        <motion.div
          animate={{ top: ["8%", "88%"], opacity: [0, 0.7, 0] }}
          className="absolute inset-x-3 h-px bg-blue-400/50"
          initial={{ top: "8%", opacity: 0 }}
          key={line}
          transition={{ duration: 1.1, repeat: Infinity, delay: line * 0.22, ease: "linear", type: "tween" }}
        />
      ))}
    </div>
  );
}

function SuccessFlash() {
  return (
    <motion.div
      animate={{ opacity: [0, 0.55, 0], scale: [0.85, 1.05, 1.15] }}
      className="pointer-events-none absolute inset-0 z-30 rounded-xl bg-emerald-400/25"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.55, ease: "easeOut", type: "tween" }}
    />
  );
}

function StatusIcon({ scanStatus, scanning }: { scanStatus: ReceiptScanStatus; scanning: boolean }) {
  if (scanning) return <Loader2 aria-hidden="true" className="size-4 animate-spin" />;
  if (scanStatus === "success") {
    return (
      <motion.span animate={{ scale: 1, rotate: 0 }} initial={{ scale: 0, rotate: -180 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
        <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
      </motion.span>
    );
  }
  if (scanStatus === "error") {
    return (
      <motion.span animate={{ scale: 1, x: 0 }} initial={{ scale: 0.5, x: -4 }} transition={{ type: "spring", stiffness: 600, damping: 18 }}>
        <AlertCircle aria-hidden="true" className="size-4" strokeWidth={2.25} />
      </motion.span>
    );
  }
  return <ScanTextIcon className="flex" size={16} />;
}

function SortableThumb({
  image,
  index,
  isNew,
  isScanTarget,
  onRemove,
  reduceMotion,
  scanning,
  scanStatus,
}: {
  image: WishImageDraft;
  index: number;
  isNew: boolean;
  isScanTarget: boolean;
  onRemove: () => void;
  reduceMotion: boolean | null;
  scanning: boolean;
  scanStatus: ReceiptScanStatus;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const { onMouseDown, onTouchStart, ...listenerProps } = listeners ?? {};

  return (
    <div
      ref={setNodeRef}
      className={THUMB_SIZE_CLASS}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <motion.div
        animate={{
          opacity: 1,
          scale: isDragging ? 1.04 : 1,
          y: 0,
        }}
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl bg-slate-100",
          isScanTarget
            ? scanStatus === "error"
              ? "border-2 border-red-500"
              : scanStatus === "success"
                ? "border-2 border-emerald-500"
                : "border-2 border-blue-500"
            : "border border-slate-200 dark:border-slate-700",
          isDragging && "z-10 shadow-lg",
        )}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.65, y: 16 }}
        transition={isNew ? { ...SPRING, duration: 0.55 } : SPRING}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
      <Image alt={isScanTarget ? "스캔 대상 영수증" : `영수증 ${index + 1}`} className="object-cover" fill sizes="88px" src={image.url} unoptimized />
      {isScanTarget && (
        <motion.span
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white",
            scanStatus === "error" ? "bg-red-600" : scanStatus === "success" ? "bg-emerald-600" : "bg-blue-600",
          )}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.5 }}
          transition={SPRING}
        >
          {scanStatus === "error" ? "실패" : scanStatus === "success" ? "완료" : "스캔"}
        </motion.span>
      )}
      {isNew && !reduceMotion && (
        <motion.div
          animate={{ opacity: 0, scale: 1.2 }}
          className="pointer-events-none absolute inset-0 rounded-[10px] border-2 border-blue-400/80"
          initial={{ opacity: 0.9, scale: 0.95 }}
          transition={{ duration: 0.65, ease: "easeOut", type: "tween" }}
        />
      )}
      {isNew && !reduceMotion && (
        <motion.div
          animate={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 bg-blue-400/30"
          initial={{ opacity: 0.7 }}
          transition={{ duration: 0.7, type: "tween" }}
        />
      )}
      {scanning && isScanTarget && !reduceMotion && (
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          className="pointer-events-none absolute inset-0 bg-blue-500/20"
          transition={{ duration: 0.8, repeat: Infinity, type: "tween" }}
        />
      )}
      <Button
        aria-label={`영수증 ${index + 1} 삭제`}
        className="absolute right-1 top-1 flex size-6 min-w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        isIconOnly
        onPress={onRemove}
        size="sm"
        variant="ghost"
      >
        <X className="size-3.5" strokeWidth={2.25} />
      </Button>
      <button
        aria-label={`영수증 ${index + 1} 순서 변경`}
        className="absolute bottom-1 right-1 flex size-7 touch-none items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm select-none [-webkit-touch-callout:none]"
        type="button"
        {...attributes}
        {...listenerProps}
        onMouseDown={(event) => { onMouseDown?.(event); event.stopPropagation(); }}
        onTouchStart={(event) => { onTouchStart?.(event); event.stopPropagation(); }}
      >
        <GripVertical className="size-3.5" />
      </button>
      </motion.div>
    </div>
  );
}
