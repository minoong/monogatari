import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ChecklistDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ChecklistDrawer({ open, onOpenChange, onSuccess }: ChecklistDrawerProps) {
  const [title, setTitle] = useState("");
  const [importance, setImportance] = useState<"high" | "normal" | "low">("normal");
  const [targets, setTargets] = useState<{ master: boolean; gahyun: boolean; minu: boolean }>({
    master: false,
    gahyun: false,
    minu: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 대상자 체크 핸들러
  const handleTargetChange = (key: keyof typeof targets) => (checked: boolean) => {
    setTargets((prev) => ({ ...prev, [key]: checked }));
  };

  const isFormValid =
    title.trim().length > 0 &&
    (targets.master || targets.gahyun || targets.minu);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setLoading(true);

    try {
      const isMaster = targets.master;
      const type = isMaster ? "master" : "personal";
      const assignees = isMaster ? ["all"] : [];
      
      if (!isMaster) {
        if (targets.gahyun) assignees.push("gahyun");
        if (targets.minu) assignees.push("minu");
      }

      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          type,
          assignees,
          importance,
        }),
      });

      if (!res.ok) throw new Error("Failed to register item");

      setSuccess(true);
      onSuccess();

      // 성공 메시지 표시 후 닫기 및 초기화
      setTimeout(() => {
        onOpenChange(false);
        // Reset form
        setTimeout(() => {
          setTitle("");
          setImportance("normal");
          setTargets({ master: false, gahyun: false, minu: false });
          setSuccess(false);
        }, 300); // 닫히는 애니메이션 시간 대기
      }, 1000);
    } catch (error) {
      console.error(error);
      alert("등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
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
                <Radio value="high" /> 높음
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Radio value="normal" /> 보통
              </Label>
              <Label className="flex items-center gap-2 cursor-pointer">
                <Radio value="low" /> 낮음
              </Label>
            </RadioGroup>
          </div>

          {/* 대상자 */}
          <div className="flex flex-col gap-2">
            <Label>대상자 (최소 1명 선택)</Label>
            <div className="flex flex-row gap-4">
              <Label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={targets.master}
                  onCheckedChange={handleTargetChange("master")}
                />
                공통 (마스터)
              </Label>
              {!targets.master && (
                <>
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
                </>
              )}
            </div>
            {targets.master && (
              <p className="text-xs text-gray-500">
                공통 선택 시 개별 할당은 무시됩니다.
              </p>
            )}
          </div>
        </DrawerPanel>

        <DrawerFooter className="flex-row gap-3 justify-center mt-2 px-6 pb-6">
          <DrawerClose render={<Button variant="outline" className="flex-1">취소</Button>} />
          <Button
            className="flex-1 transition-all"
            disabled={!isFormValid || loading || success}
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner className="w-4 h-4" /> 처리 중...
              </div>
            ) : success ? (
              "등록 완료!"
            ) : (
              "등록하기"
            )}
          </Button>
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
