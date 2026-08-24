"use client";

import { useCallback, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useStack } from "@stackflow/react";
import { ChevronRight } from "lucide-react";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { useFabEnterAnimation } from "@/components/ui/activity-register-fab";
import { useExchangeRates } from "@/lib/exchange-rates";
import { UTILITY_CARDS, type UtilityActivity } from "@/lib/utility-cards";
import { cn } from "@/lib/utils";

const FAB_IMAGE_SRC = "/home/quick-menu-fab.jpg";
const TRIGGER_SIZE = 48;
const PANEL_WIDTH = 272;
const BLOB_LIFT = 50;
const FILTER_HEIGHT = 280;
const PANEL_OPEN_HEIGHT = 220;

/** skiper46: `{ type: "spring", stiffness: 300, damping: 30 }` */
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
/** Open: lift first, then size. Close: size first, then drop. */
const OPEN_TRANSITION = {
  ...SPRING,
  delay: 0.15,
  bottom: { ...SPRING, delay: 0 },
};
const CLOSE_TRANSITION = {
  ...SPRING,
  delay: 0,
  bottom: { ...SPRING, delay: 0.15 },
};

const TAP_SPRING = { type: "spring" as const, stiffness: 500, damping: 28 };
const subscribeNoop = () => () => {};

function isHomeActivityOnTop(activities: ReturnType<typeof useStack>["activities"]) {
  for (let index = activities.length - 1; index >= 0; index -= 1) {
    const activity = activities[index];
    if (activity.transitionState === "exit-done") continue;
    return activity.name === "HomeActivity";
  }
  return false;
}

function useSvgFilterUrl(filterId: string) {
  return useSyncExternalStore(
    subscribeNoop,
    () => `url("${window.location.href.split("#")[0]}#${filterId}")`,
    () => `url(#${filterId})`,
  );
}

function GooeyFilter({ filterId }: { filterId: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      width="0"
      height="0"
      className="pointer-events-none absolute"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter
          id={filterId}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
          filterUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={4.4} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}

type HomeQuickGooeyMenuProps = {
  onNavigate: (activity: UtilityActivity) => void;
};

type UtilityMenuItemProps = {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  onPress: () => void;
  reduceMotion: boolean | null;
};

function UtilityMenuItem({ title, subtitle, imageSrc, imageAlt, onPress, reduceMotion }: UtilityMenuItemProps) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={TAP_SPRING}
      className="flex w-full origin-center items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-slate-50"
    >
      <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-slate-200/90 shadow-sm ring-1 ring-black/[0.03]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="44px"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold leading-snug tracking-[-0.02em] text-slate-900">{title}</p>
        <p className="mt-0.5 truncate text-[11px] font-semibold text-cyan-700">{subtitle}</p>
      </div>
      <ChevronRight
        aria-hidden
        className="size-4 shrink-0 text-slate-300"
      />
    </motion.button>
  );
}

export function HomeQuickGooeyMenu({ onNavigate }: HomeQuickGooeyMenuProps) {
  const reactId = useId();
  const filterId = `home-gooey-${reactId.replace(/:/g, "")}`;
  const { activities } = useStack();
  const homeOnTop = useMemo(() => isHomeActivityOnTop(activities), [activities]);
  const fabRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [fabPressed, setFabPressed] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const filterUrl = useSvgFilterUrl(filterId);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const { data: exchangeData } = useExchangeRates();
  const thbRate = exchangeData?.THB ?? 42.8;
  useFabEnterAnimation(fabRef, homeOnTop);

  const close = useCallback(() => setOpen(false), []);

  const toggle = useCallback(() => {
    triggerHapticFeedback(10);
    setOpen((prev) => !prev);
  }, []);

  const handleNavigate = (activity: UtilityActivity) => {
    triggerHapticFeedback(10);
    close();
    onNavigate(activity);
  };

  const getSubtitle = (activity: UtilityActivity, meta: string) => {
    if (activity === "ExchangeActivity") {
      return `฿100 ≈ ₩${Math.round(thbRate * 100).toLocaleString("ko-KR")}`;
    }
    return meta;
  };

  const blockThrough = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const panelShape = {
    initial: { bottom: 0, width: TRIGGER_SIZE, height: TRIGGER_SIZE, borderRadius: TRIGGER_SIZE / 2 },
    animate: {
      bottom: BLOB_LIFT,
      width: PANEL_WIDTH,
      height: PANEL_OPEN_HEIGHT,
      borderRadius: 10,
      transition: prefersReducedMotion ? { duration: 0 } : OPEN_TRANSITION,
    },
    exit: {
      bottom: 0,
      width: TRIGGER_SIZE,
      height: TRIGGER_SIZE,
      borderRadius: TRIGGER_SIZE / 2,
      transition: prefersReducedMotion ? { duration: 0 } : CLOSE_TRANSITION,
    },
  };

  const menu = (
    <>
      {open ? (
        <div
          aria-hidden
          className="fixed inset-0 z-[60]"
          onPointerDown={blockThrough}
          onPointerUp={blockThrough}
          onClick={(event) => {
            blockThrough(event);
            close();
          }}
        />
      ) : null}

      <div
        ref={fabRef}
        className="pointer-events-none fixed right-5 z-[70] bottom-[calc(5rem+max(env(safe-area-inset-bottom,0px),12px))]"
      >
        <GooeyFilter filterId={filterId} />

        <div className="relative size-12">
          <div
            className="pointer-events-none absolute right-0 bottom-0 overflow-visible"
            style={{
              width: PANEL_WIDTH,
              height: FILTER_HEIGHT,
              filter: filterUrl,
              WebkitFilter: filterUrl,
              transform: "translateZ(0)",
              willChange: "filter",
              isolation: "isolate",
            }}
          >
            <AnimatePresence>
              {open && (
                <motion.div
                  key="gooey-blob"
                  className="absolute right-0 bottom-0 bg-white"
                  initial={panelShape.initial}
                  animate={panelShape.animate}
                  exit={panelShape.exit}
                />
              )}
            </AnimatePresence>

            <motion.div
              className="absolute right-0 bottom-0 size-12 rounded-full bg-white"
              aria-hidden="true"
              animate={{ scale: fabPressed && !prefersReducedMotion ? 0.88 : 1 }}
              transition={TAP_SPRING}
            />
          </div>

          <AnimatePresence>
            {open && (
              <motion.div
                key="gooey-content"
                className="pointer-events-auto absolute right-0 bottom-0 z-[5] overflow-hidden"
                initial={panelShape.initial}
                animate={panelShape.animate}
                exit={panelShape.exit}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <motion.div
                  className="grid w-[272px] gap-0.5 p-2"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: prefersReducedMotion ? { duration: 0 } : SPRING,
                  }}
                  exit={{
                    opacity: 0,
                    transition: prefersReducedMotion ? { duration: 0 } : { ...SPRING, delay: 0 },
                  }}
                >
                  {UTILITY_CARDS.map((card) => (
                    <UtilityMenuItem
                      key={card.activity}
                      title={card.title}
                      subtitle={getSubtitle(card.activity, card.meta)}
                      imageSrc={card.imageSrc}
                      imageAlt={card.title}
                      onPress={() => handleNavigate(card.activity)}
                      reduceMotion={prefersReducedMotion}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            aria-expanded={open}
            aria-label={open ? "빠른 메뉴 닫기" : "빠른 메뉴 열기"}
            onClick={toggle}
            onPointerDown={() => setFabPressed(true)}
            onPointerUp={() => setFabPressed(false)}
            onPointerCancel={() => setFabPressed(false)}
            onPointerLeave={() => setFabPressed(false)}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
            transition={TAP_SPRING}
            className={cn(
              "pointer-events-auto absolute inset-0 z-10 size-12 cursor-pointer overflow-hidden rounded-full",
              "ring-1 ring-slate-200/80",
            )}
          >
            <Image
              src={FAB_IMAGE_SRC}
              alt=""
              width={TRIGGER_SIZE}
              height={TRIGGER_SIZE}
              className="size-full object-cover"
              priority
            />
          </motion.button>
        </div>
      </div>
    </>
  );

  if (!homeOnTop) {
    return null;
  }

  if (!mounted) {
    return menu;
  }

  return createPortal(menu, document.body);
}
