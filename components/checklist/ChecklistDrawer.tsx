import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Drawer,
  DrawerPanel,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerPopup,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import NeumorphButton from "../ui/neumorph-button";
import StatusButton from "../animata/button/status-button";
import { RadioGroup, Radio, CheckboxGroup, Checkbox, Input, Form, TextField, Label } from "@heroui/react";
import { motion } from "framer-motion";

interface ChecklistDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChecklistDrawer({ open, onOpenChange }: ChecklistDrawerProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState<"high" | "normal" | "low">("normal");
  const [targets, setTargets] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // 비동기적으로 초기화하여 cascading render 경고 우회
      const resetTimer = setTimeout(() => {
        setTitle("");
        setImportance("normal");
        setTargets([]);
        setSuccess(false);
      }, 0);

      // 드로워가 올라오는 애니메이션 시간을 고려하여 포커스
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 500);

      return () => {
        clearTimeout(resetTimer);
        clearTimeout(focusTimer);
      };
    }
  }, [open]);

  const isFormValid = title.trim() !== "" && targets.length > 0;

  const addMutation = useMutation({
    mutationFn: async (payload: { title: string; type: string; assignees: string[]; importance: string }) => {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to register item");
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      
      // 성공 메시지 표시 후 닫기 및 초기화
      setTimeout(() => {
        onOpenChange(false);
        // Reset form
        setTimeout(() => {
          setTitle("");
          setImportance("normal");
          setTargets([]);
          setSuccess(false);
        }, 300); // 닫히는 애니메이션 시간 대기
      }, 1000);
    },
    onError: (err) => {
      console.error(err);
      alert("등록에 실패했습니다.");
    },
  });

  const handleSubmit = () => {
    if (!isFormValid) return;

    const type = "personal";
    const assignees = targets;

    addMutation.mutate({ title, type, assignees, importance });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
    },
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup variant="inset" showBar>
        <DrawerHeader className="text-center">
          <DrawerTitle>준비물 추가</DrawerTitle>
          <DrawerDescription>새로운 여행 준비물을 등록하세요.</DrawerDescription>
        </DrawerHeader>

        <DrawerPanel className="px-6 py-6 flex flex-col gap-8">
          <Form onSubmit={handleSubmit} className="w-full">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              className="flex flex-col gap-8 w-full"
            >
              {/* 제목 */}
              <motion.div variants={itemVariants} className="w-full">
                <TextField isRequired name="title" className="w-full flex flex-col gap-3">
                  <Label className="text-base font-bold text-gray-700 dark:text-gray-300">제목</Label>
                  <Input
                    ref={inputRef}
                    placeholder="예) 보조배터리 챙기기"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </TextField>
              </motion.div>

              {/* 중요도 */}
              <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full">
                <Label className="text-base font-bold text-gray-700 dark:text-gray-300">중요도</Label>
                <RadioGroup
                  value={importance}
                  onChange={(val: string) => setImportance(val as "high" | "normal" | "low")}
                  orientation="horizontal"
                  className="gap-5 mt-1"
                >
                  <div className="flex flex-row gap-5">
                    <Radio value="high">
                      <Radio.Content>
                        <Radio.Control>
                          <Radio.Indicator />
                        </Radio.Control>
                        높음
                      </Radio.Content>
                    </Radio>
                    <Radio value="normal">
                      <Radio.Content>
                        <Radio.Control>
                          <Radio.Indicator />
                        </Radio.Control>
                        보통
                      </Radio.Content>
                    </Radio>
                    <Radio value="low">
                      <Radio.Content>
                        <Radio.Control>
                          <Radio.Indicator />
                        </Radio.Control>
                        낮음
                      </Radio.Content>
                    </Radio>
                  </div>
                </RadioGroup>
              </motion.div>

              {/* 대상자 */}
              <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full">
                <Label className="text-base font-bold text-gray-700 dark:text-gray-300">대상자 (최소 1명 선택)</Label>
                <CheckboxGroup
                  value={targets}
                  onChange={(val: string[]) => setTargets(val)}
                  className="mt-1"
                >
                  <div className="flex flex-row gap-6">
                    <Checkbox value="gahyun">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        가현쨩
                      </Checkbox.Content>
                    </Checkbox>
                    <Checkbox value="minu">
                      <Checkbox.Content>
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        미누쿤
                      </Checkbox.Content>
                    </Checkbox>
                  </div>
                </CheckboxGroup>
              </motion.div>
            </motion.div>
          </Form>
        </DrawerPanel>

        <DrawerFooter className="flex-row gap-4 justify-center mt-4 px-6 pb-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ type: "spring" as const, stiffness: 300, damping: 24, delay: 0.35 }}
            className="flex w-full gap-4"
          >
            <DrawerClose render={<NeumorphButton intent="secondary" className="flex-1 h-14 text-lg rounded-xl">취소</NeumorphButton>} />
            <StatusButton
              intent="primary"
              className="flex-1 h-14 text-lg rounded-xl"
              disabled={!isFormValid}
              onClick={handleSubmit}
              status={addMutation.isPending ? "loading" : success ? "success" : "idle"}
            />
          </motion.div>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
