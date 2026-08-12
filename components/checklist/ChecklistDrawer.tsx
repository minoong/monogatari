"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import StatusButton from "@/components/animata/button/status-button";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { DrawerFieldLabel, drawerCancelButtonClass, drawerPrimaryButtonClass } from "@/components/ui/drawer-form";
import { PackageCheck, UsersRound } from "lucide-react";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";

interface ChecklistDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const targetOptions = [
  { value: "gahyun", label: "가현쨩", initials: "G", image: "/avatars/gahyun.webp", color: "accent" as const },
  { value: "minu", label: "미누쿤", initials: "M", image: "/avatars/minu.webp", color: "success" as const },
];

export function ChecklistDrawer({ open, onOpenChange }: ChecklistDrawerProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [targets, setTargets] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetForm = () => {
    setTitle("");
    setTargets([]);
    setSubmitError(null);
    setSuccess(false);
  };

  useEffect(() => {
    if (!open) return;

    const resetTimer = setTimeout(resetForm, 0);

    return () => {
      clearTimeout(resetTimer);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [open]);

  const addMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      type: string;
      assignees: string[];
      importance: "high" | "normal" | "low";
    }) => {
      const response = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("준비물을 등록하지 못했습니다.");
      return response.json();
    },
    onSuccess: async () => {
      setSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ["checklist"] });
      closeTimerRef.current = setTimeout(() => onOpenChange(false), 800);
    },
    onError: (error) => {
      setSubmitError(
        error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.",
      );
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (addMutation.isPending) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle || targets.length === 0) return;

    setSubmitError(null);
    addMutation.mutate({
      title: trimmedTitle,
      type: "personal",
      assignees: targets,
      importance: "normal",
    });
  };

  const handleCancel = () => {
    if (!addMutation.isPending) onOpenChange(false);
  };

  const canSubmit = title.trim().length > 0 && targets.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup id="checklist-drawer" variant="inset" showBar data-theme="light" className="overflow-hidden rounded-2xl">
        <Form
          ref={formRef}
          aria-label="준비물 추가"
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-b-2xl bg-popover"
          onSubmit={handleSubmit}
          validationBehavior="native"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <div>
              <DrawerHeader className="px-6 pb-1 pt-6 text-center">
                <DrawerTitle className="text-xl font-bold text-gray-900">
                  준비물 추가
                </DrawerTitle>
              </DrawerHeader>
            </div>

            <DrawerPanel className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-6 py-3">
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-44 w-full max-w-[280px] overflow-hidden rounded-2xl border border-gray-100 shadow-sm my-1">
                  <Image
                    src="/ruka-add.jpg"
                    alt="루카 이미지"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 280px, 280px"
                  />
                </div>
                <p className="mt-2 text-center text-sm font-medium text-gray-800">
                  증거로 다 기록하고 있으니까, 챙길 물건을 확실하게 적어둬요!
                </p>
                <p className="mt-0.5 text-center text-xs text-gray-500">
                  나중에 깜빡했다고 거짓말해도 소용없다고요!
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <TextField
                  fullWidth
                  isRequired
                  name="title"
                  value={title}
                  onChange={setTitle}
                >
                  <Label><DrawerFieldLabel icon={PackageCheck}>준비물 이름</DrawerFieldLabel></Label>
                  <Input
                    ref={inputRef}
                    autoComplete="off"
                    placeholder="예: 보조배터리…"
                  />
                  <Description className="text-xs text-gray-500">짧고 알아보기 쉬운 이름이 좋아요.</Description>
                </TextField>

                <CheckboxGroup
                  className="gap-2"
                  isRequired
                  name="targets"
                  value={targets}
                  onChange={setTargets}
                >
                  <Label><DrawerFieldLabel icon={UsersRound}>담당자</DrawerFieldLabel></Label>
                  <Description className="text-xs text-gray-500">한 명 이상 선택해 주세요.</Description>
                  <div className="flex flex-row flex-wrap gap-x-6 gap-y-3 pt-1">
                    {targetOptions.map((target) => (
                      <Checkbox key={target.value} value={target.value}>
                        <Checkbox.Content>
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Avatar color={target.color} size="sm">
                            <AvatarImage alt="" src={target.image} />
                            <AvatarFallback>{target.initials}</AvatarFallback>
                          </Avatar>
                          <span>{target.label}</span>
                        </Checkbox.Content>
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxGroup>
              </div>

              {submitError ? (
                <p
                  role="alert"
                  className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
                >
                  {submitError}
                </p>
              ) : null}
            </DrawerPanel>

            <div>
              <DrawerFooter
                variant="bare"
                className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 rounded-b-2xl"
              >
                <Button
                  fullWidth
                  className={drawerCancelButtonClass}
                  isDisabled={addMutation.isPending}
                  size="lg"
                  type="button"
                  onPress={() => {
                    triggerHapticFeedback(10);
                    handleCancel();
                  }}
                >
                  취소
                </Button>
                <div className="relative h-12 min-w-0">
                  <StatusButton
                    aria-hidden="true"
                    className={`pointer-events-none ${drawerPrimaryButtonClass}`}
                    fullWidth
                    isDisabled={!canSubmit || success}
                    idleText="추가하기"
                    size="lg"
                    loadingText="등록 중…"
                    status={
                      addMutation.isPending
                        ? "loading"
                        : success
                          ? "success"
                          : "idle"
                    }
                    type="submit"
                  />
                  <NativeHapticSwitch
                    ariaLabel="준비물 등록하기"
                    checked={false}
                    disabled={!canSubmit || addMutation.isPending || success}
                    onChange={() => {
                      triggerHapticFeedback(15);
                      formRef.current?.requestSubmit();
                    }}
                  />
                </div>
              </DrawerFooter>
            </div>
          </div>
        </Form>
      </DrawerPopup>
    </Drawer>
  );
}
