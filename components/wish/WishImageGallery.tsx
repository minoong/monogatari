"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useId } from "react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { WishImage } from "@/lib/wishes";

export function WishImageGallery({ images, title, onImagePress }: { images: WishImage[]; title: string; onImagePress: (index: number) => void }) {
  const galleryId = useId().replaceAll(":", "");
  if (!images.length) return <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400"><span aria-hidden="true">🖼️</span></div>;
  if (images.length === 1) return <button className="block h-56 w-full" onClick={() => onImagePress(0)} type="button"><Image alt={`${title} 이미지`} className="h-56 w-full object-cover" height={448} width={768} src={images[0].url} unoptimized /></button>;
  const previousClass = `wish-gallery-prev-${galleryId}`;
  const nextClass = `wish-gallery-next-${galleryId}`;

  return (
    <div className="wish-image-gallery relative h-56">
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation={{ prevEl: `.${previousClass}`, nextEl: `.${nextClass}` }}
        pagination={{ clickable: true }}
        className="h-56"
        a11y={{ prevSlideMessage: "이전 사진", nextSlideMessage: "다음 사진", paginationBulletMessage: "사진 {{index}}로 이동" }}
      >
        {images.map((image, index) => <SwiperSlide key={image.id}><button className="block h-56 w-full" onClick={() => onImagePress(index)} type="button"><Image alt={`${title} 이미지 ${index + 1}`} className="h-56 w-full object-cover" height={448} width={768} src={image.url} unoptimized /></button></SwiperSlide>)}
      </Swiper>
      <button aria-label="이전 사진" className={`wish-gallery-control wish-gallery-prev ${previousClass}`} type="button"><ChevronLeft aria-hidden="true" className="size-4" strokeWidth={2.5} /></button>
      <button aria-label="다음 사진" className={`wish-gallery-control wish-gallery-next ${nextClass}`} type="button"><ChevronRight aria-hidden="true" className="size-4" strokeWidth={2.5} /></button>
    </div>
  );
}
