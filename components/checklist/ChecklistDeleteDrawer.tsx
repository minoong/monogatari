"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { josa } from "es-hangul";
import { triggerHapticFeedback } from "@/components/BottomNav";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ChecklistDeleteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTitle?: string;
  onConfirmDelete: () => void;
  isDeleting?: boolean;
}

export function ChecklistDeleteDrawer({
  open,
  onOpenChange,
  itemTitle,
  onConfirmDelete,
  isDeleting,
}: ChecklistDeleteDrawerProps) {
  const targetTitle = itemTitle || "선택한 항목";
  const particle = josa(targetTitle, "을/를").slice(targetTitle.length);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup id="checklist-delete-drawer" variant="inset" showBar data-theme="light" className="overflow-hidden rounded-2xl">
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-b-2xl bg-popover">
          <DrawerHeader className="px-6 pb-1 pt-6 text-center">
            <DrawerTitle className="flex items-center justify-center gap-2 text-xl font-bold text-gray-900">
              <Trash2 className="size-5 text-red-500" /> 준비물 삭제
            </DrawerTitle>
          </DrawerHeader>

          <DrawerPanel className="flex flex-col items-center justify-center px-6 py-2">
            <div className="relative h-44 w-full max-w-[280px] overflow-hidden rounded-2xl border border-gray-100 shadow-sm my-2">
              <Image
                src="/nino-delete.png"
                alt="삭제 확인 이미지"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 280px, 280px"
              />
            </div>
            <p className="mt-3 text-center text-base font-medium text-gray-800">
              정말 <span className="font-bold text-gray-900">「{targetTitle}」</span>{particle} 지워버릴 셈이야?
            </p>
            <p className="mt-1 text-center text-xs text-gray-500">
              한 번 지우면 절대 안 되돌려줄 거거든? 나중에 딴소리하기 없기야!
            </p>
          </DrawerPanel>

          <DrawerFooter
            variant="bare"
            className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 rounded-b-2xl"
          >
            <Button
              fullWidth
              className="h-12 rounded-2xl bg-gray-100 text-base font-bold text-gray-800 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              isDisabled={isDeleting}
              size="lg"
              onPress={() => {
                triggerHapticFeedback(10);
                onOpenChange(false);
              }}
            >
              취소
            </Button>
            <Button
              fullWidth
              className="h-12 rounded-2xl bg-red-500 text-base font-bold text-white hover:bg-red-600 active:bg-red-700 shadow-sm"
              isDisabled={isDeleting}
              size="lg"
              onPress={() => {
                triggerHapticFeedback(15);
                onConfirmDelete();
              }}
            >
              {isDeleting ? "삭제 중…" : "삭제하기"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerPopup>
    </Drawer>
  );
}
