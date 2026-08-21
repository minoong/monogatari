"use client";

import React, { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@heroui/react";
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, X } from "lucide-react";
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogClose,
} from "@/components/ui/dialog";

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  title?: string;
}

export function ImageZoomModal({
  isOpen,
  onClose,
  src,
  alt = "확대 이미지",
  title,
}: ImageZoomModalProps) {
  const [rotation, setRotation] = useState(0);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setRotation(0);
    }
  }

  const handleStopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  const handleClose = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogBackdrop
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md"
          onClick={handleStopPropagation}
          onMouseDown={handleStopPropagation}
          onPointerDown={handleStopPropagation}
          onTouchStart={handleStopPropagation}
        />
        <DialogPopup
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-0 border-0 bg-transparent shadow-none outline-none focus:outline-none"
          onClick={handleStopPropagation}
          onMouseDown={handleStopPropagation}
          onPointerDown={handleStopPropagation}
          onTouchStart={handleStopPropagation}
        >
          {/* Header toolbar */}
          <div
            className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 to-transparent"
            onClick={handleStopPropagation}
            onMouseDown={handleStopPropagation}
            onPointerDown={handleStopPropagation}
            onTouchStart={handleStopPropagation}
          >
            {title ? (
              <h3 className="text-white text-base font-bold truncate max-w-[70%]">
                {title}
              </h3>
            ) : <div />}
            <DialogClose
              onClick={handleClose}
              onMouseDown={handleStopPropagation}
              onPointerDown={handleStopPropagation}
              onTouchStart={handleStopPropagation}
              aria-label="닫기"
              className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 active:scale-95"
            >
              <X className="size-5" />
            </DialogClose>
          </div>

          {/* Zoom Transform Canvas */}
          <TransformWrapper
            initialScale={1}
            minScale={0.8}
            maxScale={5}
            centerOnInit
            doubleClick={{ mode: "zoomIn" }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div
                  className="relative size-full flex items-center justify-center p-4"
                  onClick={handleStopPropagation}
                  onMouseDown={handleStopPropagation}
                  onPointerDown={handleStopPropagation}
                  onTouchStart={handleStopPropagation}
                >
                  <TransformComponent
                    wrapperClass="!w-full !h-full flex items-center justify-center"
                    contentClass="!w-full !h-full flex items-center justify-center"
                  >
                    <div className="relative max-h-[85vh] max-w-[95vw] w-auto h-auto flex items-center justify-center">
                      <img
                        src={src}
                        alt={alt}
                        className="max-h-[85vh] max-w-[95vw] object-contain rounded-lg shadow-2xl select-none transition-transform duration-300 ease-out"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      />
                    </div>
                  </TransformComponent>
                </div>

                {/* Bottom Control Buttons */}
                <div
                  className="absolute bottom-6 inset-x-0 z-20 flex justify-center items-center gap-2 pointer-events-none"
                  onClick={handleStopPropagation}
                  onMouseDown={handleStopPropagation}
                  onPointerDown={handleStopPropagation}
                  onTouchStart={handleStopPropagation}
                >
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10 shadow-lg pointer-events-auto">
                    <Button
                      aria-label="확대"
                      className="p-2 text-white/80 rounded-full"
                      isIconOnly
                      onPress={() => zoomIn()}
                      size="sm"
                      variant="ghost"
                    >
                      <ZoomIn className="size-5" />
                    </Button>
                    <Button
                      aria-label="축소"
                      className="p-2 text-white/80 rounded-full"
                      isIconOnly
                      onPress={() => zoomOut()}
                      size="sm"
                      variant="ghost"
                    >
                      <ZoomOut className="size-5" />
                    </Button>
                    <Button
                      aria-label="90도 회전"
                      className="p-2 text-white/80 rounded-full"
                      isIconOnly
                      onPress={() => setRotation((prev) => (prev + 90) % 360)}
                      size="sm"
                      variant="ghost"
                    >
                      <RotateCw className="size-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <Button
                      aria-label="원래 크기 및 방향으로"
                      className="p-2 text-white/80 rounded-full"
                      isIconOnly
                      onPress={() => {
                        setRotation(0);
                        resetTransform();
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    <Button
                      aria-label="모달 닫기"
                      className="p-2 text-white/80 rounded-full"
                      isIconOnly
                      onPress={() => handleClose()}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TransformWrapper>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
