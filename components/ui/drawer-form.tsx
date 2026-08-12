"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ForwardRefExoticComponent, type HTMLAttributes, type ReactNode, type RefAttributes } from "react";
import { useReducedMotion } from "motion/react";
import { ActivityIcon, type ActivityIconHandle } from "@/components/ui/activity";
import { LinkIcon, type LinkIconHandle } from "@/components/ui/link";
import { MapPinIcon, type MapPinIconHandle } from "@/components/ui/map-pin";
import { cn } from "@/lib/utils";

export const drawerCancelButtonClass = "h-12 rounded-2xl bg-slate-100 text-base font-bold text-slate-800 hover:bg-slate-200 active:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400";
export const drawerPrimaryButtonClass = "h-12 rounded-2xl bg-blue-500 text-base font-bold text-white shadow-sm hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-200 disabled:text-white/80 disabled:shadow-none";
export const drawerDangerButtonClass = "h-12 rounded-2xl bg-red-500 text-base font-bold text-white shadow-sm hover:bg-red-600 active:bg-red-700 disabled:bg-red-200 disabled:text-white/80 disabled:shadow-none";

export function DrawerIntro({ open, image, alt, title, description }: { open: boolean; image: string; alt: string; title?: string; description?: string }) {
  const iconRef = useRef<ActivityIconHandle>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open && !reduceMotion) iconRef.current?.startAnimation();
  }, [open, reduceMotion]);

  return <div className="flex flex-col items-center justify-center">
    <div className="relative my-1 h-32 w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
      <Image src={image} alt={alt} fill className="object-cover" sizes="280px" />
    </div>
    {title && <p className="mt-2 flex items-center gap-1.5 text-center text-sm font-medium text-slate-800"><ActivityIcon ref={iconRef} aria-hidden="true" size={16} />{title}</p>}
    {description && <p className="mt-0.5 text-center text-xs text-slate-500">{description}</p>}
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
