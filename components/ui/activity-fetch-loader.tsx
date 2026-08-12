"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  DynamicContainer,
  DynamicIsland,
  DynamicIslandProvider,
  SIZE_PRESETS,
} from "@/components/ui/dynamic-island";

const LOADING_IMAGES = [
  { src: "/loading/fetch-01.jpg", width: 600, height: 338 },
  { src: "/loading/fetch-02.jpg", width: 600, height: 338 },
  { src: "/loading/fetch-03.jpg", width: 1024, height: 576 },
  { src: "/loading/fetch-04.jpg", width: 900, height: 675 },
  { src: "/loading/fetch-05.jpg", width: 1280, height: 720 },
  { src: "/loading/fetch-06.png", width: 800, height: 450 },
] as const;

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

export function ActivityFetchLoader({
  messages,
  ariaLabel = messages[0],
  className = "",
}: ActivityFetchLoaderProps) {
  const islandId = `activity-fetch-${useId().replaceAll(":", "")}`;
  const prefersReducedMotion = useReducedMotion();
  const [images, setImages] = useState<readonly (typeof LOADING_IMAGES)[number][]>(LOADING_IMAGES);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = images[imageIndex];
  const currentMessage = messages[imageIndex % messages.length];
  const displayRatio = imageIndex % 2 === 0 ? 16 / 9 : 4 / 3;
  const islandWidth = 340;
  const islandHeight = Math.round(islandWidth / displayRatio) + 66;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setImages(shuffle(LOADING_IMAGES));
      setImageIndex(0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setImageIndex((current) => (current + 1) % images.length);
    }, 400);
    return () => window.clearInterval(timer);
  }, [images.length, prefersReducedMotion]);

  return (
    <div
      aria-busy="true"
      aria-label={ariaLabel}
      aria-live="polite"
      className={`flex min-h-[calc(100dvh-10rem)] w-full items-center justify-center px-5 ${className}`}
      role="status"
    >
      <DynamicIslandProvider initialSize={SIZE_PRESETS.LONG}>
        <DynamicIsland
          id={islandId}
          animate={{
            borderRadius: 28,
            height: islandHeight,
            transition: { duration: 0.36, ease: "easeInOut" },
            width: islandWidth,
          }}
          style={{ maxWidth: "calc(100vw - 2.5rem)" }}
        >
          <DynamicContainer className="flex h-full w-full flex-col overflow-hidden">
            <div
              className="relative w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800"
              style={{ aspectRatio: displayRatio }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={currentImage.src}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0"
                  exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 1.04 }}
                  initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    priority
                    sizes="(max-width: 380px) calc(100vw - 40px), 340px"
                    src={currentImage.src}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex min-h-16 w-full items-center gap-3 px-4">
              <div className="relative min-w-0 flex-1 overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.p
                    key={currentMessage}
                    animate={{ opacity: 1, y: 0 }}
                    className="truncate text-sm font-extrabold text-slate-900 dark:text-white"
                    exit={prefersReducedMotion ? undefined : { opacity: 0, y: -5 }}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {currentMessage}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    animate={prefersReducedMotion ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    className="size-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
                    transition={{ duration: 0.9, delay: dot * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
            </div>
          </DynamicContainer>
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
