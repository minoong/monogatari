"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  DynamicContainer,
  DynamicDescription,
  DynamicDiv,
  DynamicIsland,
  DynamicIslandProvider,
  DynamicTitle,
  SIZE_PRESETS,
  type SizePresets,
  useDynamicIslandSize,
} from "@/components/ui/dynamic-island";

const LOADING_IMAGES = [
  "/loading/fetch-01.jpg",
  "/loading/fetch-02.jpg",
  "/loading/fetch-03.jpg",
  "/loading/fetch-04.jpg",
  "/loading/fetch-05.jpg",
  "/loading/fetch-06.png",
] as const;

const LOADING_STATES: SizePresets[] = ["large", "tall", "long", "medium", "compact"];

const shuffle = <T,>(items: readonly T[]) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
};

interface ActivityFetchLoaderProps {
  messages: readonly string[];
  ariaLabel?: string;
  className?: string;
}

function LoadingIslandContent({
  images,
  messages,
}: {
  images: readonly string[];
  messages: readonly string[];
}) {
  const { state, setSize } = useDynamicIslandSize();
  const prefersReducedMotion = useReducedMotion();
  const [contentIndex, setContentIndex] = useState(0);
  const currentImage = images[contentIndex % images.length];
  const currentMessage = messages[contentIndex % messages.length];

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setTimeout(() => {
      const currentStateIndex = LOADING_STATES.indexOf(state.size);
      const nextState = LOADING_STATES[(currentStateIndex + 1) % LOADING_STATES.length];
      setContentIndex((current) => current + 1);
      setSize(nextState);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, setSize, state.size]);

  const renderImage = (className: string, sizes: string) => (
    <DynamicDiv className={className}>
      <Image alt="" className="object-cover" fill priority sizes={sizes} src={currentImage} />
    </DynamicDiv>
  );

  switch (state.size) {
    case "compact":
      return (
        <DynamicContainer className="flex h-full w-full items-center justify-between px-4">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin text-slate-500" />
          <DynamicDescription className="truncate text-sm font-bold text-slate-900 dark:text-white">
            불러오는 중
          </DynamicDescription>
        </DynamicContainer>
      );
    case "large":
    case "long":
      return (
        <DynamicContainer className="flex h-full w-full items-center gap-3 px-2.5 py-2">
          {renderImage("relative size-16 shrink-0 overflow-hidden rounded-full", "64px")}
          <DynamicTitle className="min-w-0 flex-1 truncate pr-3 text-sm font-extrabold text-slate-900 dark:text-white">
            {currentMessage}
          </DynamicTitle>
        </DynamicContainer>
      );
    case "tall":
    case "medium":
      return (
        <DynamicContainer className="relative h-full w-full overflow-hidden">
          {renderImage("absolute inset-0", "(max-width: 410px) calc(100vw - 40px), 371px")}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-5 pb-4 pt-12">
            <DynamicTitle className="truncate text-base font-extrabold text-white">
              {currentMessage}
            </DynamicTitle>
            <DynamicDescription className="mt-1 text-xs font-semibold text-white/70">
              잠깐만 기다려 줘
            </DynamicDescription>
          </div>
        </DynamicContainer>
      );
    default:
      return null;
  }
}

export function ActivityFetchLoader({
  messages,
  ariaLabel = messages[0],
  className = "",
}: ActivityFetchLoaderProps) {
  const islandId = `activity-fetch-${useId().replaceAll(":", "")}`;
  const [images, setImages] = useState<readonly string[]>(LOADING_IMAGES);

  useEffect(() => {
    const timer = window.setTimeout(() => setImages(shuffle(LOADING_IMAGES)), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      aria-busy="true"
      aria-label={ariaLabel}
      aria-live="polite"
      className={`flex min-h-[calc(100dvh-10rem)] w-full items-center justify-center px-5 ${className}`}
      role="status"
    >
      <DynamicIslandProvider initialSize={SIZE_PRESETS.LARGE}>
        <DynamicIsland id={islandId}>
          <LoadingIslandContent images={images} messages={messages} />
        </DynamicIsland>
      </DynamicIslandProvider>
    </div>
  );
}

export function useMinimumInitialLoading(isLoading: boolean, minimumMs = 800) {
  const [initiallyLoading] = useState(isLoading);
  const [minimumElapsed, setMinimumElapsed] = useState(false);

  useEffect(() => {
    if (!initiallyLoading) return;
    const timer = window.setTimeout(() => setMinimumElapsed(true), minimumMs);
    return () => window.clearTimeout(timer);
  }, [initiallyLoading, minimumMs]);

  return initiallyLoading && (isLoading || !minimumElapsed);
}
