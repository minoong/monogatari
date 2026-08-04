"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { triggerHapticFeedback } from "@/components/BottomNav";
import {
  Drawer,
  DrawerDescription,
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
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup id="checklist-delete-drawer" variant="inset" showBar data-theme="light">
        <div className="flex min-h-0 w-full flex-1 flex-col bg-popover">
          <DrawerHeader className="px-6 pb-2 pt-6 text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={20} />
              </div>
              <DrawerTitle className="text-lg font-bold text-gray-900">
                준비물 삭제
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-sm text-gray-600 pt-2">
              <span className="font-bold text-gray-900">‘{itemTitle || "선택한 항목"}’</span> 준비물을 정말 삭제하시겠습니까?
            </DrawerDescription>
          </DrawerHeader>

          <DrawerPanel className="px-6 py-4">
            <p className="text-xs text-gray-500">
              삭제된 준비물은 목록에서 제거되며, 다시 복구할 수 없습니다.
            </p>
          </DrawerPanel>

          <DrawerFooter
            variant="bare"
            className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4"
          >
            <Button
              fullWidth
              className="h-12 rounded-2xl text-base font-semibold"
              isDisabled={isDeleting}
              size="lg"
              variant="secondary"
              onPress={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              fullWidth
              className="h-12 rounded-2xl bg-red-500 font-semibold text-white hover:bg-red-600 active:bg-red-700"
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
