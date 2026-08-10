"use client";

import { useRef, useState, type FormEvent } from "react";
import { Picker } from "@gfazioli/mantine-picker";
import { MantineProvider } from "@mantine/core";
import imageCompression from "browser-image-compression";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Label, TextArea } from "@heroui/react";
import { CalendarDays, ChevronRight, Clock3, Link2 } from "lucide-react";
import { TripDateCalendarSheet } from "@/components/schedule/TripDateCalendarSheet";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { WishImagePicker, type WishImageDraft } from "@/components/wish/WishImagePicker";
import {
  formatLongTripDate,
  isGoogleMapsUrl,
  normalizeExternalUrl,
  TRIP_DATES,
  type ScheduleItem,
  type TripDate,
} from "@/lib/schedule";

const hours = Array.from({ length: 12 }, (_, value) =>
  String(value + 1).padStart(2, "0"),
);
const minutes = Array.from({ length: 60 }, (_, value) =>
  String(value).padStart(2, "0"),
);
const timePickerProps = {
  w: 58,
  withDividers: false,
  withHighlight: false,
  loop: true,
  maxRotation: 90,
  itemHeight: 38,
  visibleItems: 5,
  withMask: false,
  preventPageScroll: true,
  hapticFeedback: true,
} as const;
const compression = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  preserveExif: false,
  useWebWorker: true,
  fileType: "image/jpeg",
};

export function ScheduleDrawer({
  open,
  onOpenChange,
  item = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ScheduleItem | null;
}) {
  const client = useQueryClient();
  const editing = Boolean(item);
  const [date, setDate] = useState<TripDate>(item?.schedule_date ?? TRIP_DATES[0]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const initialHour = Number(item?.start_time.slice(0, 2) ?? "09");
  const [hour, setHour] = useState(String(initialHour % 12 || 12).padStart(2, "0"));
  const [minute, setMinute] = useState(item?.start_time.slice(3, 5) ?? "00");
  const [amPm, setAmPm] = useState<"am" | "pm">(initialHour >= 12 ? "pm" : "am");
  const [title, setTitle] = useState(item?.title ?? "");
  const [subtitle, setSubtitle] = useState(item?.subtitle ?? "");
  const [mapUrl, setMapUrl] = useState(item?.google_maps_url ?? "");
  const [images, setImages] = useState<WishImageDraft[]>(
    () => item?.images.map((image) => ({ id: image.id, path: image.path, url: image.url })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const save = useMutation({
    mutationFn: async () => {
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

      const response = await fetch(item ? `/api/schedule?id=${item.id}` : "/api/schedule", {
        method: item ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schedule_date: date,
          start_time: `${String((Number(hour) % 12) + (amPm === "pm" ? 12 : 0)).padStart(2, "0")}:${minute}`,
          title,
          subtitle,
          google_maps_url: mapUrl.trim() ? normalizeExternalUrl(mapUrl.trim()) : null,
          image_paths: paths,
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
        throw new Error(payload.error ?? "일정을 저장하지 못했어요.");
      }
      return payload.data as ScheduleItem;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["schedule"] });
      onOpenChange(false);
    },
    onError: (cause) =>
      setError(cause instanceof Error ? cause.message : "잠시 후 다시 시도해 주세요."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = mapUrl.trim() ? normalizeExternalUrl(mapUrl.trim()) : "";
    if (!title.trim()) return setError("일정 제목을 입력해 주세요.");
    if (normalized && !isGoogleMapsUrl(normalized)) return setError("Google Maps 링크를 입력해 주세요.");
    setError(null);
    save.mutate();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup id="schedule-drawer" variant="inset" showBar>
        <form ref={formRef} className="flex min-h-0 flex-1 flex-col" onSubmit={submit}>
          <DrawerHeader className="px-6 pb-3">
            <DrawerTitle>{editing ? "일정 수정" : "일정 등록"}</DrawerTitle>
            <DrawerDescription>시간과 장소 사진을 함께 기록해 두세요.</DrawerDescription>
          </DrawerHeader>
          <DrawerPanel className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-4">
            <section>
              <Label className="mb-2 flex items-center gap-2"><CalendarDays className="size-4" /> 날짜</Label>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-900"
                onClick={() => setCalendarOpen(true)}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><CalendarDays className="size-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-400">여행 날짜</span><span className="mt-0.5 block font-extrabold text-slate-900 dark:text-white">{formatLongTripDate(date)}</span></span>
                <ChevronRight className="size-4 shrink-0 text-slate-400" />
              </button>
            </section>

            <section>
              <Label className="mb-2 flex items-center gap-2"><Clock3 className="size-4" /> 시간</Label>
              <MantineProvider>
                <div
                  data-base-ui-swipe-ignore
                  className="touch-none rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-center gap-0">
                    <Picker
                      {...timePickerProps}
                      rotateY={-10}
                      value={hour}
                      data={hours}
                      onChange={(value) => setHour(String(value))}
                      label="시"
                      size="lg"
                    />
                    <span aria-hidden className="text-lg font-extrabold text-slate-400">:</span>
                    <Picker
                      {...timePickerProps}
                      rotateY={10}
                      value={minute}
                      data={minutes}
                      onChange={(value) => setMinute(String(value))}
                      label="분"
                      size="lg"
                    />
                    <Picker
                      {...timePickerProps}
                      rotateY={10}
                      data={["am", "pm"]}
                      loop={false}
                      value={amPm}
                      onChange={(value) => setAmPm(value as "am" | "pm")}
                      label="오전 또는 오후"
                      size="lg"
                    />
                  </div>
                </div>
              </MantineProvider>
            </section>

            <div className="grid gap-2"><Label htmlFor="schedule-title">제목</Label><Input id="schedule-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="예: 호텔 체크인" /></div>
            <div className="grid gap-2"><Label htmlFor="schedule-subtitle">서브타이틀</Label><TextArea id="schedule-subtitle" value={subtitle} onChange={(event) => setSubtitle(event.target.value)} maxLength={500} placeholder="메모나 이동 정보" /></div>
            <div className="grid gap-2"><Label htmlFor="schedule-map" className="flex items-center gap-2"><Link2 className="size-4" /> Google Maps 링크</Label><Input id="schedule-map" value={mapUrl} onChange={(event) => setMapUrl(event.target.value)} placeholder="https://maps.app.goo.gl/..." /></div>
            <WishImagePicker images={images} onChange={setImages} />
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          </DrawerPanel>
          <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <Button fullWidth className="h-12 rounded-2xl text-base" isDisabled={save.isPending || compressing} onPress={() => onOpenChange(false)} size="lg" type="button" variant="secondary">취소</Button>
            <Button fullWidth className="h-12 rounded-2xl text-base" isDisabled={!title.trim() || save.isPending || compressing} size="lg" type="submit">{compressing ? "사진 압축 중…" : save.isPending ? "저장 중…" : editing ? "변경 저장" : "등록하기"}</Button>
          </DrawerFooter>
        </form>
      </DrawerPopup>
      <TripDateCalendarSheet open={calendarOpen} value={date} mode="editor" onConfirm={(value) => { if (value) setDate(value); }} onOpenChange={setCalendarOpen} />
    </Drawer>
  );
}
