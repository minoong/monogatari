"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FocusEvent, type ForwardRefExoticComponent, type HTMLAttributes, type ReactNode, type RefAttributes } from "react";
import { useReducedMotion } from "motion/react";
import { TextEffect } from "@/components/core/text-effect";
import { LinkIcon, type LinkIconHandle } from "@/components/ui/link";
import { MapPinIcon, type MapPinIconHandle } from "@/components/ui/map-pin";
import { cn } from "@/lib/utils";

export const drawerCancelButtonClass = "h-12 rounded-2xl bg-slate-100 text-base font-bold text-slate-800 hover:bg-slate-200 active:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400";
export const drawerPrimaryButtonClass = "h-12 rounded-2xl bg-blue-500 text-base font-bold text-white shadow-sm hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-200 disabled:text-white/80 disabled:shadow-none";
export const drawerDangerButtonClass = "h-12 rounded-2xl bg-red-500 text-base font-bold text-white shadow-sm hover:bg-red-600 active:bg-red-700 disabled:bg-red-200 disabled:text-white/80 disabled:shadow-none";
export const dialogPrimaryButtonClass = "h-[50px] rounded-[13px] bg-[#007aff] text-[17px] font-semibold text-white active:opacity-80 dark:bg-[#0a84ff]";
export const dialogSecondaryButtonClass = "h-[50px] rounded-[13px] bg-[#f2f2f7] text-[17px] font-semibold text-[#007aff] active:opacity-70 dark:bg-[#2c2c2e] dark:text-[#0a84ff]";
export const dialogIconButtonClass = "size-8 min-w-8 rounded-full text-[#8e8e93] active:opacity-60 dark:text-[#98989d]";
export const cardNavButtonClass =
  "!flex !h-auto min-h-0 w-full flex-col items-stretch justify-start gap-0 whitespace-normal text-left";
export const rowNavButtonClass =
  "!flex !h-auto min-h-0 w-full flex-row items-center justify-between gap-3 whitespace-normal text-left";
export const tileNavButtonClass =
  "!flex !h-auto min-h-0 w-full flex-col items-center justify-center gap-2 whitespace-normal";

export function DrawerIntro({ open, image, alt, title, description }: { open: boolean; image: string; alt: string; title?: string; description?: string }) {
  return <div className="flex flex-col items-center justify-center">
    <div className="relative my-1 h-32 w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
      <Image src={image} alt={alt} fill className="object-cover" sizes="280px" />
    </div>
    {title && <TextEffect as="p" per="char" preset="fade" trigger={open} className="mt-2 text-center text-sm font-medium text-slate-800">{title}</TextEffect>}
    {description && <TextEffect as="p" per="char" preset="fade" trigger={open} delay={0.15} className="mt-0.5 text-center text-xs text-slate-500">{description}</TextEffect>}
  </div>;
}

export interface DrawerAnimatedIconHandle { startAnimation: () => void; stopAnimation: () => void }
export type DrawerAnimatedIconComponent = ForwardRefExoticComponent<HTMLAttributes<HTMLDivElement> & { size?: number } & RefAttributes<DrawerAnimatedIconHandle>>;

function replayIcon(icon: DrawerAnimatedIconHandle | null) {
  icon?.stopAnimation();
  requestAnimationFrame(() => requestAnimationFrame(() => icon?.startAnimation()));
}

export function DrawerFieldLabel({ icon: Icon, active, interactionSignal, children, className }: { icon: DrawerAnimatedIconComponent; active: boolean; interactionSignal?: number; children: ReactNode; className?: string }) {
  const iconRef = useRef<DrawerAnimatedIconHandle>(null);
  const labelContentRef = useRef<HTMLSpanElement>(null);
  const [fieldFocused, setFieldFocused] = useState(false);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (fieldFocused && !reduceMotion) replayIcon(iconRef.current);
    else if (active && !reduceMotion) iconRef.current?.startAnimation();
    else iconRef.current?.stopAnimation();
  }, [active, fieldFocused, reduceMotion]);
  useEffect(() => {
    if (interactionSignal && !reduceMotion) replayIcon(iconRef.current);
  }, [interactionSignal, reduceMotion]);
  useEffect(() => {
    const isRelatedTarget = (target: EventTarget | null) => {
      const label = labelContentRef.current?.closest("label");
      const control = label?.control;
      const interactionScope = labelContentRef.current?.closest("[data-drawer-interactive-field]");
      return Boolean(target instanceof Node && (
        label?.contains(target) ||
        control === target ||
        control?.contains(target) ||
        interactionScope?.contains(target)
      ));
    };
    const updateFocus = () => setFieldFocused(isRelatedTarget(document.activeElement));
    const replayOnPress = (event: PointerEvent) => {
      if (isRelatedTarget(event.target) && !reduceMotion) replayIcon(iconRef.current);
    };
    document.addEventListener("focusin", updateFocus);
    document.addEventListener("focusout", updateFocus);
    document.addEventListener("pointerdown", replayOnPress);
    return () => {
      document.removeEventListener("focusin", updateFocus);
      document.removeEventListener("focusout", updateFocus);
      document.removeEventListener("pointerdown", replayOnPress);
    };
  }, [reduceMotion]);
  return <span ref={labelContentRef} className={cn("inline-flex items-center gap-2 text-sm font-bold text-slate-900", className)}>
    <Icon ref={iconRef} aria-hidden="true" size={16} />
    {children}
  </span>;
}

export function DrawerMapPinIcon({ active }: { active: boolean }) {
  const iconRef = useRef<MapPinIconHandle>(null);
  const hostRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (active && !reduceMotion) iconRef.current?.startAnimation();
    else iconRef.current?.stopAnimation();
  }, [active, reduceMotion]);

  useEffect(() => {
    const replay = (event: Event) => {
      const field = hostRef.current?.closest("[data-drawer-multi-field]");
      if (field?.contains(event.target as Node) && !reduceMotion) replayIcon(iconRef.current);
    };
    document.addEventListener("focusin", replay);
    document.addEventListener("pointerdown", replay);
    return () => {
      document.removeEventListener("focusin", replay);
      document.removeEventListener("pointerdown", replay);
    };
  }, [reduceMotion]);

  return <span ref={hostRef}><MapPinIcon ref={iconRef} aria-hidden="true" size={16} /></span>;
}

export function DrawerLinkIcon({ active }: { active: boolean }) {
  const iconRef = useRef<LinkIconHandle>(null);
  const hostRef = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (active && !reduceMotion) iconRef.current?.startAnimation();
    else iconRef.current?.stopAnimation();
  }, [active, reduceMotion]);

  useEffect(() => {
    const replay = (event: Event) => {
      const field = hostRef.current?.closest("[data-drawer-multi-field]");
      if (field?.contains(event.target as Node) && !reduceMotion) replayIcon(iconRef.current);
    };
    document.addEventListener("focusin", replay);
    document.addEventListener("pointerdown", replay);
    return () => {
      document.removeEventListener("focusin", replay);
      document.removeEventListener("pointerdown", replay);
    };
  }, [reduceMotion]);

  return <span ref={hostRef}><LinkIcon ref={iconRef} aria-hidden="true" size={16} /></span>;
}

export function scrollDrawerElementIntoView(target: HTMLElement) {
  const panel = target.closest("[data-slot=drawer-panel]") as HTMLElement | null;
  const popup = target.closest("[data-slot=drawer-popup]") as HTMLElement | null;
  const footer = popup?.querySelector("[data-slot=drawer-footer]") as HTMLElement | null;

  if (!panel) {
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }

  const viewport = window.visualViewport;
  const panelRect = panel.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const margin = 12;
  const keyboardTop = viewport
    ? viewport.height + viewport.offsetTop
    : window.innerHeight;
  const footerTop = footer?.getBoundingClientRect().top ?? panelRect.bottom;
  const visibleBottom = Math.min(footerTop, keyboardTop) - margin;

  if (targetRect.bottom > visibleBottom) {
    panel.scrollTop += targetRect.bottom - visibleBottom;
  } else if (targetRect.top < panelRect.top + margin) {
    panel.scrollTop -= panelRect.top + margin - targetRect.top;
  }
}

export function scrollDrawerFieldIntoView(event: FocusEvent<HTMLElement>) {
  const target = event.currentTarget;
  const run = () => scrollDrawerElementIntoView(target);

  run();
  requestAnimationFrame(() => {
    run();
    requestAnimationFrame(run);
  });
  [120, 320, 560, 820].forEach((delay) => {
    window.setTimeout(run, delay);
  });
}
