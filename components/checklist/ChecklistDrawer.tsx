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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, Radio, CheckboxGroup, Checkbox } from "@heroui/react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";
import { TextEffect } from "@/components/core/text-effect";

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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={open ? "visible" : "hidden"}
            className="flex flex-col gap-8"
          >
            {/* 제목 */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Label htmlFor="title" className="text-base font-bold text-gray-700 dark:text-gray-300">
                <TextEffect
                  per="line"
                  as="span"
                  segmentWrapperClassName="overflow-hidden block"
                  variants={{
                    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } },
                    item: {
                      hidden: { opacity: 0, y: 40 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    },
                  }}
                >
                  제목
                </TextEffect>
              </Label>
              <Input
                id="title"
                ref={inputRef}
                placeholder="예) 보조배터리 챙기기"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-14 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 [&>[data-slot=input]]:h-full [&>[data-slot=input]]:text-lg [&>[data-slot=input]]:px-4 [&>[data-slot=input]]:leading-normal"
              />
            </motion.div>

            {/* 중요도 */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Label className="text-base font-bold text-gray-700 dark:text-gray-300">
                <TextEffect
                  per="line"
                  as="span"
                  segmentWrapperClassName="overflow-hidden block"
                  variants={{
                    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } },
                    item: {
                      hidden: { opacity: 0, y: 40 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    },
                  }}
                >
                  중요도
                </TextEffect>
              </Label>
              <RadioGroup
                value={importance}
                onChange={(val) => setImportance(val as "high" | "normal" | "low")}
                orientation="horizontal"
                className="gap-5 mt-1"
              >
                <Radio value="high" className="group">
                  <Radio.Content className="flex items-center gap-2.5 cursor-pointer text-base select-none">
                    <Radio.Control className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background outline-none transition-colors group-data-[selected=true]:border-transparent group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-ring">
                      <Radio.Indicator className="scale-0 transition-transform duration-200 ease-out group-data-[selected=true]:scale-100 absolute -inset-px flex items-center justify-center rounded-full bg-primary after:content-[''] after:size-1.5 after:rounded-full after:bg-white" />
                    </Radio.Control>
                    <Badge variant="high" className="text-xs px-3 py-1 h-auto select-none">높음</Badge>
                  </Radio.Content>
                </Radio>
                <Radio value="normal" className="group">
                  <Radio.Content className="flex items-center gap-2.5 cursor-pointer text-base select-none">
                    <Radio.Control className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background outline-none transition-colors group-data-[selected=true]:border-transparent group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-ring">
                      <Radio.Indicator className="scale-0 transition-transform duration-200 ease-out group-data-[selected=true]:scale-100 absolute -inset-px flex items-center justify-center rounded-full bg-primary after:content-[''] after:size-1.5 after:rounded-full after:bg-white" />
                    </Radio.Control>
                    <Badge variant="normal" className="text-xs px-3 py-1 h-auto select-none">보통</Badge>
                  </Radio.Content>
                </Radio>
                <Radio value="low" className="group">
                  <Radio.Content className="flex items-center gap-2.5 cursor-pointer text-base select-none">
                    <Radio.Control className="relative inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-input bg-background outline-none transition-colors group-data-[selected=true]:border-transparent group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-ring">
                      <Radio.Indicator className="scale-0 transition-transform duration-200 ease-out group-data-[selected=true]:scale-100 absolute -inset-px flex items-center justify-center rounded-full bg-primary after:content-[''] after:size-1.5 after:rounded-full after:bg-white" />
                    </Radio.Control>
                    <Badge variant="low" className="text-xs px-3 py-1 h-auto select-none">낮음</Badge>
                  </Radio.Content>
                </Radio>
              </RadioGroup>
            </motion.div>

            {/* 대상자 */}
            <motion.div variants={itemVariants} className="flex flex-col gap-3">
              <Label className="text-base font-bold text-gray-700 dark:text-gray-300">
                <TextEffect
                  per="line"
                  as="span"
                  segmentWrapperClassName="overflow-hidden block"
                  variants={{
                    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } },
                    item: {
                      hidden: { opacity: 0, y: 40 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    },
                  }}
                >
                  대상자 (최소 1명 선택)
                </TextEffect>
              </Label>
              <CheckboxGroup
                value={targets}
                onChange={setTargets}
                className="flex flex-row gap-6 mt-1"
              >
                <Checkbox value="gahyun" className="group">
                  <Checkbox.Content className="flex items-center gap-3 cursor-pointer text-base font-medium select-none">
                    <Checkbox.Control className="relative inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-input bg-background outline-none transition-colors group-data-[selected=true]:bg-primary group-data-[selected=true]:border-transparent group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-ring">
                      <Checkbox.Indicator className="scale-0 transition-transform duration-200 ease-out group-data-[selected=true]:scale-100 absolute -inset-px flex items-center justify-center bg-primary text-white">
                        <svg
                          aria-hidden="true"
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
                        </svg>
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <div className="flex items-center gap-3 font-medium text-base select-none">
                      <Avatar className="w-8 h-8 ring-2 ring-gray-100 dark:ring-gray-800">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">G</AvatarFallback>
                      </Avatar>
                      가현쨩
                    </div>
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox value="minu" className="group">
                  <Checkbox.Content className="flex items-center gap-3 cursor-pointer text-base font-medium select-none">
                    <Checkbox.Control className="relative inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-input bg-background outline-none transition-colors group-data-[selected=true]:bg-primary group-data-[selected=true]:border-transparent group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-offset-2 group-data-[focus-visible=true]:ring-ring">
                      <Checkbox.Indicator className="scale-0 transition-transform duration-200 ease-out group-data-[selected=true]:scale-100 absolute -inset-px flex items-center justify-center bg-primary text-white">
                        <svg
                          aria-hidden="true"
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
                        </svg>
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <div className="flex items-center gap-3 font-medium text-base select-none">
                      <Avatar className="w-8 h-8 ring-2 ring-gray-100 dark:ring-gray-800">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">M</AvatarFallback>
                      </Avatar>
                      미누쿤
                    </div>
                  </Checkbox.Content>
                </Checkbox>
              </CheckboxGroup>
            </motion.div>
          </motion.div>
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
