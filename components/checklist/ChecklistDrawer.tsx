"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextField,
} from "@heroui/react";
import StatusButton from "@/components/animata/button/status-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImportanceChip } from "@/components/ui/chip";
import {
  Drawer,
  DrawerDescription,
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

type Importance = "high" | "normal" | "low";

const importanceOptions: Array<{
  value: Importance;
}> = [
  { value: "high" },
  { value: "normal" },
  { value: "low" },
];

const targetOptions = [
  { value: "gahyun", label: "가현쨩", initials: "G", image: "/avatars/gahyun.webp", color: "accent" as const },
  { value: "minu", label: "미누쿤", initials: "M", image: "/avatars/minu.webp", color: "success" as const },
];

const drawerContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.08, staggerChildren: 0.08 },
  },
  reduced: { opacity: 1 },
};

const drawerItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" as const },
  },
  reduced: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export function ChecklistDrawer({ open, onOpenChange }: ChecklistDrawerProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState<Importance>("normal");
  const [targets, setTargets] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const resetForm = () => {
    setTitle("");
    setImportance("normal");
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
      importance: Importance;
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
      importance,
    });
  };

  const handleCancel = () => {
    if (!addMutation.isPending) onOpenChange(false);
  };

  const canSubmit = title.trim().length > 0 && targets.length > 0;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup id="checklist-drawer" variant="inset" showBar>
        <Form
          aria-label="준비물 추가"
          className="flex min-h-0 w-full flex-1 flex-col"
          data-theme="light"
          onSubmit={handleSubmit}
          validationBehavior="native"
        >
          <motion.div
            initial="hidden"
            animate={prefersReducedMotion ? "reduced" : "visible"}
            variants={drawerContentVariants}
            className="flex min-h-0 w-full flex-1 flex-col"
          >
            <motion.div variants={drawerItemVariants}>
              <DrawerHeader className="px-6 pb-4 text-left">
                <DrawerTitle>준비물 추가</DrawerTitle>
                <DrawerDescription className="text-pretty">
                  무엇을 누가 챙길지 정해 두면 여행 준비가 한결 가벼워져요.
                </DrawerDescription>
              </DrawerHeader>
            </motion.div>

            <DrawerPanel className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain px-6 py-5">
              <motion.div variants={drawerItemVariants}>
                <TextField
                  fullWidth
                  isRequired
                  name="title"
                  value={title}
                  onChange={setTitle}
                >
                  <Label>준비물 이름</Label>
                  <Input
                    ref={inputRef}
                    autoComplete="off"
                    placeholder="예: 보조배터리…"
                  />
                  <Description>짧고 알아보기 쉬운 이름이 좋아요.</Description>
                </TextField>
              </motion.div>

              <motion.div variants={drawerItemVariants} className="flex flex-col gap-3">
                <Label>중요도</Label>
                <Description>준비 순서를 정할 때 사용해요.</Description>
                <RadioGroup
                  className="pt-1"
                  isRequired
                  name="importance"
                  orientation="horizontal"
                  value={importance}
                  onChange={(value) => setImportance(value as Importance)}
                >
                  {importanceOptions.map((option) => (
                    <Radio key={option.value} value={option.value}>
                      <Radio.Content className="flex items-center gap-2">
                        <Radio.Control>
                          <Radio.Indicator />
                        </Radio.Control>
                        <ImportanceChip importance={option.value} />
                      </Radio.Content>
                    </Radio>
                  ))}
                </RadioGroup>
              </motion.div>

              <motion.div variants={drawerItemVariants}>
                <CheckboxGroup
                  className="gap-3"
                  isRequired
                  name="targets"
                  value={targets}
                  onChange={setTargets}
                >
                  <Label>담당자</Label>
                  <Description>한 명 이상 선택해 주세요.</Description>
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
              </motion.div>

              {submitError ? (
                <motion.p
                  variants={drawerItemVariants}
                  role="alert"
                  className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
                >
                  {submitError}
                </motion.p>
              ) : null}
            </DrawerPanel>

            <motion.div variants={drawerItemVariants}>
              <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
                <Button
                  fullWidth
                  className="h-12 rounded-2xl text-base"
                  isDisabled={addMutation.isPending}
                  size="lg"
                  type="button"
                  variant="secondary"
                  onPress={handleCancel}
                >
                  취소
                </Button>
                <StatusButton
                  className="h-12 rounded-2xl text-base"
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
              </DrawerFooter>
            </motion.div>
          </motion.div>
        </Form>
      </DrawerPopup>
    </Drawer>
  );
}
