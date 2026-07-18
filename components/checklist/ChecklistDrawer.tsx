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
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [targets, setTargets] = useState<{ gahyun: boolean; minu: boolean }>({
    gahyun: false,
    minu: false,
  });
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // 비동기적으로 초기화하여 cascading render 경고 우회
      const resetTimer = setTimeout(() => {
        setTitle("");
        setImportance("normal");
        setTargets({ gahyun: false, minu: false });
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

  // 대상자 체크 핸들러
  const handleTargetChange = (key: keyof typeof targets) => (checked: boolean) => {
    setTargets((prev) => ({ ...prev, [key]: checked }));
  };

  const isFormValid = title.trim() !== "" && (targets.gahyun || targets.minu);

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
          setTargets({ gahyun: false, minu: false });
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
    const assignees: string[] = [];
    
    if (targets.gahyun) assignees.push("gahyun");
    if (targets.minu) assignees.push("minu");

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
                onValueChange={(val) => setImportance(val as "high" | "normal" | "low")}
                className="flex flex-row gap-5 mt-1"
              >
                <Label className="flex items-center gap-2.5 cursor-pointer text-base">
                  <Radio value="high" className="scale-125" />
                  <Badge variant="high" className="text-xs px-3 py-1 h-auto">높음</Badge>
                </Label>
                <Label className="flex items-center gap-2.5 cursor-pointer text-base">
                  <Radio value="normal" className="scale-125" />
                  <Badge variant="normal" className="text-xs px-3 py-1 h-auto">보통</Badge>
                </Label>
                <Label className="flex items-center gap-2.5 cursor-pointer text-base">
                  <Radio value="low" className="scale-125" />
                  <Badge variant="low" className="text-xs px-3 py-1 h-auto">낮음</Badge>
                </Label>
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
              <div className="flex flex-row gap-6 mt-1">
                <Label className="flex items-center gap-3 cursor-pointer text-base font-medium">
                  <Checkbox
                    checked={targets.gahyun}
                    onCheckedChange={handleTargetChange("gahyun")}
                    className="scale-125"
                  />
                  <Avatar className="w-8 h-8 ring-2 ring-gray-100 dark:ring-gray-800">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">G</AvatarFallback>
                  </Avatar>
                  가현쨩
                </Label>
                <Label className="flex items-center gap-3 cursor-pointer text-base font-medium">
                  <Checkbox
                    checked={targets.minu}
                    onCheckedChange={handleTargetChange("minu")}
                    className="scale-125"
                  />
                  <Avatar className="w-8 h-8 ring-2 ring-gray-100 dark:ring-gray-800">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">M</AvatarFallback>
                  </Avatar>
                  미누쿤
                </Label>
              </div>
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
