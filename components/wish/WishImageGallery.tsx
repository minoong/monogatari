"use client";

import Image from "next/image";
import { Pagination, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { WishImage } from "@/lib/wishes";

export function WishImageGallery({ images, title, onImagePress }: { images: WishImage[]; title: string; onImagePress: (index: number) => void }) {
  if (!images.length) return <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400"><span aria-hidden="true">🖼️</span></div>;
  if (images.length === 1) return <button className="block h-56 w-full" onClick={() => onImagePress(0)} type="button"><Image alt={`${title} 이미지`} className="h-56 w-full object-cover" height={448} width={768} src={images[0].url} unoptimized /></button>;

  return (
    <div className="wish-image-gallery relative h-56">
      <Swiper
        modules={[Pagination, A11y]}
        slidesPerView="auto"
        spaceBetween={10}
        pagination={{ type: "fraction" }}
        className="h-56"
        a11y={{ prevSlideMessage: "이전 사진", nextSlideMessage: "다음 사진", paginationBulletMessage: "사진 {{index}}로 이동" }}
      >
        {images.map((image, index) => <SwiperSlide className="!w-[88%] overflow-hidden rounded-2xl" key={image.id}><button className="block h-56 w-full" onClick={() => onImagePress(index)} type="button"><Image alt={`${title} 이미지 ${index + 1}`} className="h-56 w-full object-cover" height={448} width={768} src={image.url} unoptimized /></button></SwiperSlide>)}
      </Swiper>
    </div>
  );
}
