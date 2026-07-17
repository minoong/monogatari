import React, { useState } from "react";
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerPopup variant="inset" showBar>
        <DrawerHeader className="text-center">
          <DrawerTitle>준비물 추가</DrawerTitle>
          <DrawerDescription>새로운 여행 준비물을 등록하세요.</DrawerDescription>
        </DrawerHeader>

        <DrawerPanel className="px-6 py-4 flex flex-col gap-6">
          {/* 제목 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              placeholder="예) 보조배터리 챙기기"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 중요도 */}
          <div className="flex flex-col gap-2">
            <Label>중요도</Label>
            <RadioGroup
              value={importance}
              onValueChange={(val) => setImportance(val as "high" | "normal" | "low")}
              className="flex flex-row gap-4"
            >
              <Label className="flex items-center gap-2 cursor-pointer">
                <Radio value="high" />
                <Badge variant="high">높음</Badge>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Radio value="normal" />
                <Badge variant="normal">보통</Badge>
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Radio value="low" />
                <Badge variant="low">낮음</Badge>
              </Label>
            </RadioGroup>
          </div>

          {/* 대상자 */}
          <div className="flex flex-col gap-2">
            <Label>대상자 (최소 1명 선택)</Label>
            <div className="flex flex-row gap-4">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={targets.gahyun}
                  onCheckedChange={handleTargetChange("gahyun")}
                />
                가현쨩
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={targets.minu}
                  onCheckedChange={handleTargetChange("minu")}
                />
                미누쿤
              </Label>
            </div>
          </div>
        </DrawerPanel>

        <DrawerFooter className="flex-row gap-3 justify-center mt-2 px-6 pb-6">
          <DrawerClose render={<NeumorphButton intent="secondary" className="flex-1">취소</NeumorphButton>} />
          <StatusButton
            intent="primary"
            className="flex-1"
            disabled={!isFormValid}
            onClick={handleSubmit}
            status={addMutation.isPending ? "loading" : success ? "success" : "idle"}
          />
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
