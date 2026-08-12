"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { ActivityIcon, type ActivityIconHandle } from "@/components/ui/activity";
import { cn } from "@/lib/utils";

export const drawerCancelButtonClass = "h-12 rounded-2xl bg-slate-100 text-base font-bold text-slate-800 hover:bg-slate-200 active:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400";
export const drawerPrimaryButtonClass = "h-12 rounded-2xl bg-blue-500 text-base font-bold text-white shadow-sm hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-200 disabled:text-white/80 disabled:shadow-none";
export const drawerDangerButtonClass = "h-12 rounded-2xl bg-red-500 text-base font-bold text-white shadow-sm hover:bg-red-600 active:bg-red-700 disabled:bg-red-200 disabled:text-white/80 disabled:shadow-none";

export function DrawerIntro({ open, image, alt, title, description }: { open: boolean; image: string; alt: string; title: string; description: string }) {
  const iconRef = useRef<ActivityIconHandle>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (open && !reduceMotion) iconRef.current?.startAnimation();
  }, [open, reduceMotion]);

  return <div className="flex flex-col items-center justify-center">
    <div className="relative my-1 h-32 w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
      <Image src={image} alt={alt} fill className="object-cover" sizes="280px" />
    </div>
    <p className="mt-2 flex items-center gap-1.5 text-center text-sm font-medium text-slate-800"><ActivityIcon ref={iconRef} aria-hidden="true" className="text-blue-500" size={16} />{title}</p>
    <p className="mt-0.5 text-center text-xs text-slate-500">{description}</p>
  </div>;
}

export function DrawerFieldLabel({ icon: Icon, children, className }: { icon: LucideIcon; children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return <span className={cn("inline-flex items-center gap-2 text-sm font-bold text-slate-900", className)}>
    <motion.span initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.22, ease: "easeOut" }} className="text-blue-500"><Icon className="size-4" /></motion.span>
    {children}
  </span>;
}
