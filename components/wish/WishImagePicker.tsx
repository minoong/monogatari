"use client";

import Image from "next/image";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Plus, Upload, X } from "lucide-react";
import { useEffect, useRef } from "react";

export type WishImageDraft = { id: string; path?: string; url: string; file?: File };

interface WishImagePickerProps {
  images: WishImageDraft[];
  onChange: (images: WishImageDraft[]) => void;
  inputId?: string;
  label?: string;
  description?: string;
  itemLabel?: string;
}

const MAX_IMAGES = 5;

export function WishImagePicker({
  images,
  onChange,
  inputId = "wish-images",
  label = "이미지",
  description = "첫 사진이 대표 이미지예요 · 드래그해서 순서를 바꿀 수 있어요.",
  itemLabel = "이미지",
}: WishImagePickerProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const objectUrlsRef = useRef(new Set<string>());
  useEffect(() => {
    const currentUrls = new Set(images.filter((image) => image.file).map((image) => image.url));
    objectUrlsRef.current.forEach((url) => { if (!currentUrls.has(url)) URL.revokeObjectURL(url); });
    objectUrlsRef.current = currentUrls;
  }, [images]);
  useEffect(() => () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const accepted = Array.from(files).filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024).slice(0, remaining);
    if (!accepted.length) return;
    onChange([...images, ...accepted.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }))]);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((image) => image.id === active.id);
    const newIndex = images.findIndex((image) => image.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) onChange(arrayMove(images, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p><p className="mt-0.5 text-xs text-slate-400">{description}</p></div>
        <span className="shrink-0 text-xs font-bold tabular-nums text-blue-600">{images.length}/{MAX_IMAGES}</span>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={images.map((image) => image.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => <SortableImage key={image.id} image={image} index={index} itemLabel={itemLabel} onRemove={() => onChange(images.filter((item) => item.id !== image.id))} />)}
            {images.length < MAX_IMAGES && (
              <label htmlFor={inputId} className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-white/5">
                {images.length ? <Plus className="size-5 text-blue-500" /> : <ImagePlus className="size-6 text-blue-500" />}
                <span className="text-xs font-semibold">이미지 추가</span>
              </label>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <label htmlFor={inputId} className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-200">
        <Upload className="size-4 text-blue-500" /> 사진 선택 <span className="ml-auto text-xs font-normal text-slate-400">JPG, PNG, WEBP · 사진당 최대 5MB</span>
      </label>
      <input accept="image/jpeg,image/png,image/webp" className="sr-only" id={inputId} multiple onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} type="file" />
    </div>
  );
}

function SortableImage({ image, index, itemLabel, onRemove }: { image: WishImageDraft; index: number; itemLabel: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const { onMouseDown, onTouchStart, ...listenerProps } = listeners ?? {};
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`relative aspect-square overflow-hidden rounded-2xl border bg-slate-100 ${isDragging ? "z-10 scale-105 opacity-70 shadow-xl" : "border-slate-200 dark:border-slate-700"}`}>
    <Image alt={index === 0 ? `대표 ${itemLabel}` : `${itemLabel} ${index + 1}`} className="object-cover" fill sizes="33vw" src={image.url} unoptimized />
    {index === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">대표</span>}
    <button aria-label={`${itemLabel} ${index + 1} 삭제`} className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-black/65 text-white" onClick={onRemove} type="button"><X className="size-4" /></button>
    <button
      aria-label={`${itemLabel} ${index + 1} 순서 변경`}
      className="absolute bottom-1.5 right-1.5 flex size-8 touch-none items-center justify-center rounded-full bg-black/65 text-white select-none [-webkit-touch-callout:none]"
      type="button"
      {...attributes}
      {...listenerProps}
      onMouseDown={(event) => { onMouseDown?.(event); event.stopPropagation(); }}
      onTouchStart={(event) => { onTouchStart?.(event); event.stopPropagation(); }}
    ><GripVertical className="size-4" /></button>
  </div>;
}
