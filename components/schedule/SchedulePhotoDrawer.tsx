"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import imageCompression from "browser-image-compression";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Label, TextArea } from "@heroui/react";
import StatusButton from "@/components/animata/button/status-button";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { FileTextIcon } from "@/components/ui/file-text";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { WishImagePicker, type WishImageDraft } from "@/components/wish/WishImagePicker";
import { DrawerFieldLabel, DrawerIntro, drawerCancelButtonClass, drawerPrimaryButtonClass } from "@/components/ui/drawer-form";
import type { ScheduleItem } from "@/lib/schedule";

const compression = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  preserveExif: false,
  useWebWorker: true,
  fileType: "image/jpeg",
};

const toDrafts = (item: ScheduleItem | null): WishImageDraft[] =>
  item?.tripImages?.map((image) => ({ id: image.id, path: image.path, url: image.url })) ?? [];

export function SchedulePhotoDrawer({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ScheduleItem | null;
}) {
  const client = useQueryClient();
  const formRef = useRef<HTMLFormElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [images, setImages] = useState<WishImageDraft[]>(() => toDrafts(item));
  const [tripMemo, setTripMemo] = useState(item?.trip_memo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const save = useMutation({
    mutationFn: async () => {
      if (!item) throw new Error("일정을 찾지 못했어요.");
      const uploaded: string[] = [];
      const paths: string[] = [];

      try {
        for (const image of images) {
          if (image.path) {
            paths.push(image.path);
            continue;
          }
          if (!image.file) continue;

          setCompressing(true);
          const file = await imageCompression(image.file, compression);
          const form = new FormData();
          form.append("image", file);
          const response = await fetch("/api/schedule/image", { method: "POST", body: form });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error ?? "사진을 업로드하지 못했어요.");
          uploaded.push(payload.data.path);
          paths.push(payload.data.path);
        }
      } catch (cause) {
        if (uploaded.length) {
          await fetch("/api/schedule/image", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: uploaded }),
          });
        }
        throw cause;
      } finally {
        setCompressing(false);
      }

      const response = await fetch(`/api/schedule?id=${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_date: item.schedule_date,
          start_time: item.start_time,
          title: item.title,
          subtitle: item.subtitle,
          google_maps_url: item.google_maps_url,
          trip_image_paths: paths,
          trip_memo: tripMemo,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        if (uploaded.length) {
          await fetch("/api/schedule/image", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: uploaded }),
          });
        }
        throw new Error(payload.error ?? "사진을 저장하지 못했어요.");
      }
      return payload.data as ScheduleItem;
    },
    onSuccess: async () => {
      setSuccess(true);
      await client.invalidateQueries({ queryKey: ["schedule"] });
      closeTimerRef.current = setTimeout(() => onOpenChange(false), 800);
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : "잠시 후 다시 시도해 주세요."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!item || images.length === 0) return;
    setError(null);
    save.mutate();
  };

  const busy = save.isPending || compressing;
  const canSubmit = Boolean(item) && images.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup id="schedule-photo-drawer" variant="inset" showBar className="overflow-hidden">
        <form ref={formRef} className="flex min-h-0 w-full flex-1 flex-col overflow-hidden" onSubmit={submit}>
          <DrawerHeader className="px-6 pb-1 pt-6 text-center">
            <DrawerTitle>사진 올리기</DrawerTitle>
          </DrawerHeader>
          <DrawerPanel scrollable={false} className="flex min-h-0 flex-1 touch-pan-y flex-col gap-4 overflow-y-auto overscroll-contain px-6 py-3">
            <DrawerIntro
              open={open}
              image="/drawer-schedule-photo-intro.jpg"
              alt="카메라를 들고 있는 캐릭터"
              imageClassName="h-44"
              title="증거로 다 기록하고 있으니까, 여행 사진을 빠짐없이 올려 두세요!"
            />
            {item ? (
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.title}</p>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor={item ? `schedule-trip-memo-${item.id}` : "schedule-trip-memo"}>
                <DrawerFieldLabel icon={FileTextIcon} active={open}>
                  소감
                </DrawerFieldLabel>
              </Label>
              <TextArea
                enterKeyHint="done"
                id={item ? `schedule-trip-memo-${item.id}` : "schedule-trip-memo"}
                className="min-h-28 scroll-mb-28"
                maxLength={500}
                onChange={(event) => setTripMemo(event.target.value)}
                placeholder="그 순간 기분이나 일기를 남겨 보세요."
                rows={5}
                value={tripMemo}
              />
            </div>
            <WishImagePicker
              images={images}
              inputId={item ? `schedule-trip-photos-${item.id}` : "schedule-trip-photos"}
              itemLabel="여행 사진"
              label="여행 사진"
              onChange={setImages}
            />
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          </DrawerPanel>
          <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <Button
              className={drawerCancelButtonClass}
              fullWidth
              isDisabled={busy || success}
              onPress={() => {
                triggerHapticFeedback(10);
                onOpenChange(false);
              }}
              size="lg"
              type="button"
            >
              취소
            </Button>
            <div className="relative h-12 min-w-0">
              <StatusButton
                aria-hidden="true"
                className={`pointer-events-none ${drawerPrimaryButtonClass}`}
                fullWidth
                idleText="저장"
                isDisabled={!canSubmit || success}
                loadingText={compressing ? "사진 압축 중…" : "저장 중…"}
                size="lg"
                status={busy ? "loading" : success ? "success" : "idle"}
                successText="저장 완료!"
                type="submit"
              />
              <NativeHapticSwitch
                ariaLabel="여행 사진 저장"
                checked={false}
                disabled={!canSubmit || busy || success}
                onChange={() => {
                  triggerHapticFeedback(15);
                  formRef.current?.requestSubmit();
                }}
              />
            </div>
          </DrawerFooter>
        </form>
      </DrawerPopup>
    </Drawer>
  );
}
