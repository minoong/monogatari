"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextField,
} from "@heroui/react";
import StatusButton from "@/components/animata/button/status-button";
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
  label: string;
  description: string;
}> = [
  { value: "high", label: "높음", description: "꼭 챙겨야 해요" },
  { value: "normal", label: "보통", description: "일반 준비물이에요" },
  { value: "low", label: "낮음", description: "여유가 되면 챙겨요" },
];

const targetOptions = [
  { value: "gahyun", label: "가현쨩" },
  { value: "minu", label: "미누쿤" },
];

export function ChecklistDrawer({ open, onOpenChange }: ChecklistDrawerProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState<Importance>("normal");
  const [targets, setTargets] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup variant="inset" showBar>
        <Form
          aria-label="준비물 추가"
          className="flex min-h-0 w-full flex-1 flex-col"
          data-theme="light"
          onSubmit={handleSubmit}
          validationBehavior="native"
        >
          <DrawerHeader className="px-6 pb-4 text-left">
            <DrawerTitle>준비물 추가</DrawerTitle>
            <DrawerDescription className="text-pretty">
              무엇을 누가 챙길지 정해 두면 여행 준비가 한결 가벼워져요.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerPanel className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain px-6 py-5">
            <TextField
              fullWidth
              isRequired
              name="title"
              value={title}
              validate={(value) =>
                value.trim() ? null : "준비물 이름을 입력해 주세요."
              }
              onChange={setTitle}
            >
              <Label>준비물 이름</Label>
              <Input
                ref={inputRef}
                autoComplete="off"
                placeholder="예: 보조배터리…"
              />
              <Description>짧고 알아보기 쉬운 이름이 좋아요.</Description>
              <FieldError />
            </TextField>

            <RadioGroup
              isRequired
              name="importance"
              value={importance}
              onChange={(value) => setImportance(value as Importance)}
            >
              <Label>중요도</Label>
              <Description>준비 순서를 정할 때 사용해요.</Description>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {importanceOptions.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    <Radio.Content className="flex h-full min-h-20 w-full flex-col items-start justify-between gap-2 rounded-2xl border border-border bg-surface p-3 transition-colors data-[selected=true]:border-accent data-[selected=true]:bg-accent/10">
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      <span className="flex flex-col text-left">
                        <span className="text-sm font-semibold">{option.label}</span>
                        <span className="text-xs leading-4 text-muted">
                          {option.description}
                        </span>
                      </span>
                    </Radio.Content>
                  </Radio>
                ))}
              </div>
            </RadioGroup>

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
                      {target.label}
                    </Checkbox.Content>
                  </Checkbox>
                ))}
              </div>
              <FieldError>담당자를 한 명 이상 선택해 주세요.</FieldError>
            </CheckboxGroup>

            {submitError ? (
              <p
                role="alert"
                className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger"
              >
                {submitError}
              </p>
            ) : null}
          </DrawerPanel>

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
              isDisabled={success}
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
        </Form>
      </DrawerPopup>
    </Drawer>
  );
}
