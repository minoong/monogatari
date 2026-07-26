"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  Tag,
  TagGroup,
  TextArea,
  TextField,
  type Key,
} from "@heroui/react";
import { ImagePlus, MapPin, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { WISH_CATEGORY_SUGGESTIONS, WISH_TYPE_META, type WishItem, type WishType } from "@/lib/wishes";

interface WishDrawerProps {
  open: boolean;
  initialType: WishType;
  onOpenChange: (open: boolean) => void;
}

export function WishDrawer({ open, initialType, onOpenChange }: WishDrawerProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<WishType>(initialType);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [vendor, setVendor] = useState("");
  const [memo, setMemo] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setType(initialType);
    setTitle("");
    setCategories([]);
    setCategoryDraft("");
    setTargetPrice("");
    setVendor("");
    setMemo("");
    setMapQuery("");
    setImage(null);
    setSubmitError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const addCategory = (value = categoryDraft) => {
    const nextCategory = value.trim();
    if (!nextCategory || categories.includes(nextCategory)) return categories;
    const nextCategories = [...categories, nextCategory];
    setCategories(nextCategories);
    setCategoryDraft("");
    return nextCategories;
  };

  const removeCategories = (keys: Set<Key>) => {
    setCategories((current) => current.filter((category) => !keys.has(category)));
  };

  const createMutation = useMutation({
    mutationFn: async (submittedCategories: string[]): Promise<WishItem> => {
      let imagePath: string | null = null;

      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);
        const imageResponse = await fetch("/api/wishes/image", { method: "POST", body: imageFormData });
        const imagePayload = await imageResponse.json();
        if (!imageResponse.ok) throw new Error(imagePayload.error ?? "이미지를 업로드하지 못했습니다.");
        imagePath = imagePayload.data.path;
      }

      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          categories: submittedCategories,
          target_price_thb: type === "restaurant" ? null : targetPrice,
          vendor,
          memo,
          map_query: type === "restaurant" ? mapQuery : null,
          image_path: imagePath,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "위시를 등록하지 못했습니다.");
      return payload.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wishes"] });
      toast.success("위시에 추가했어요.");
      handleOpenChange(false);
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || createMutation.isPending) return;
    setSubmitError(null);
    const submittedCategories = categoryDraft.trim() ? addCategory() : categories;
    createMutation.mutate(submittedCategories);
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerPopup id="wish-drawer" variant="inset" showBar>
        <Form aria-label="위시 등록" className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} validationBehavior="native">
          <DrawerHeader className="px-6 pb-4 text-left">
            <DrawerTitle>위시 등록</DrawerTitle>
            <DrawerDescription>여행 중 사고 싶거나 먹고 싶은 것을 가볍게 담아 두세요.</DrawerDescription>
          </DrawerHeader>

          <DrawerPanel className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-4">
            <RadioGroup
              name="type"
              orientation="horizontal"
              value={type}
              onChange={(value) => {
                setType(value as WishType);
                setCategories([]);
                setCategoryDraft("");
              }}
            >
              <Label>종류</Label>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {(Object.keys(WISH_TYPE_META) as WishType[]).map((itemType) => (
                  <Radio key={itemType} value={itemType}>
                    <Radio.Content className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-center text-xs">
                      <Radio.Control><Radio.Indicator /></Radio.Control>
                      <span>{WISH_TYPE_META[itemType].icon}</span>
                      <span>{WISH_TYPE_META[itemType].title.replace(" 정보", "")}</span>
                    </Radio.Content>
                  </Radio>
                ))}
              </div>
            </RadioGroup>

            <TextField isRequired name="title" value={title} onChange={setTitle}>
              <Label>{type === "restaurant" ? "식당 이름" : "이름"}</Label>
              <Input autoComplete="off" placeholder={type === "shopping" ? "예: 야돔" : type === "snack" ? "예: 망고 쥬스" : "예: 팁싸마이"} />
              <FieldError />
            </TextField>

            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <TextField className="min-w-0 flex-1" name="categoryDraft" value={categoryDraft} onChange={setCategoryDraft}>
                  <Label>카테고리 태그</Label>
                  <Input
                    autoComplete="off"
                    maxLength={14}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addCategory();
                      }
                    }}
                    placeholder="입력 후 Enter"
                  />
                </TextField>
                <Button
                  aria-label="카테고리 태그 추가"
                  isDisabled={!categoryDraft.trim()}
                  onPress={() => addCategory()}
                  type="button"
                  variant="secondary"
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              {categories.length > 0 && (
                <TagGroup aria-label="선택한 카테고리" onRemove={removeCategories} size="sm" variant="surface">
                  <TagGroup.List>
                    {categories.map((category) => (
                      <Tag key={category} id={category} textValue={category}>{category}</Tag>
                    ))}
                  </TagGroup.List>
                </TagGroup>
              )}

              <div>
                <p className="mb-2 text-xs font-medium text-gray-500">추천 태그</p>
                <div className="flex flex-wrap gap-2">
                  {WISH_CATEGORY_SUGGESTIONS[type].map((suggestion) => {
                    const isSelected = categories.includes(suggestion);
                    return (
                      <button
                        key={suggestion}
                        className={`min-h-8 rounded-full border px-3 text-xs font-semibold transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
                            : "border-gray-200 bg-white text-gray-500 hover:border-blue-300 dark:border-gray-700 dark:bg-white/5"
                        }`}
                        disabled={isSelected}
                        onClick={() => addCategory(suggestion)}
                        type="button"
                      >
                        {isSelected ? "✓ " : "+ "}{suggestion}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-400">여러 개 선택 가능 · 태그당 최대 14자</p>
              </div>
            </div>

            {type !== "restaurant" && (
              <TextField name="targetPrice" type="number" value={targetPrice} onChange={setTargetPrice}>
                <Label>현지 적정 가격 (THB)</Label>
                <Input inputMode="decimal" min={0} placeholder="예: 120" type="number" />
                <Description>가격을 모르면 비워 두어도 됩니다.</Description>
              </TextField>
            )}

            <TextField name="vendor" value={vendor} onChange={setVendor}>
              <Label>{type === "restaurant" ? "식당 또는 지점" : "판매점"}</Label>
              <Input autoComplete="off" placeholder={type === "restaurant" ? "예: 팁싸마이 프라투피" : "예: 세븐일레븐, 짜뚜짝 시장"} />
            </TextField>

            {type === "restaurant" && (
              <TextField name="mapQuery" value={mapQuery} onChange={setMapQuery}>
                <Label><MapPin className="mr-1 inline size-4" />길찾기 장소 또는 주소</Label>
                <Input autoComplete="off" placeholder="예: Thipsamai Pad Thai, Bangkok" />
                <Description>입력하면 카드에서 Google Maps 길찾기를 열 수 있어요.</Description>
              </TextField>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="wish-image">이미지</Label>
              <label htmlFor="wish-image" className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 text-sm text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-white/5 dark:hover:bg-white/10">
                <ImagePlus className="size-5" />
                <span>{image ? image.name : "JPG, PNG, WEBP · 최대 5MB"}</span>
              </label>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                id="wish-image"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                type="file"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="wish-memo">메모</Label>
              <TextArea id="wish-memo" maxLength={500} onChange={(event) => setMemo(event.target.value)} placeholder="기억해 둘 팁이나 이유를 남겨 보세요." value={memo} />
            </div>

            {submitError && <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{submitError}</p>}
          </DrawerPanel>

          <DrawerFooter className="grid grid-cols-2 gap-3 border-t border-border px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <Button isDisabled={createMutation.isPending} onPress={() => handleOpenChange(false)} type="button" variant="secondary">취소</Button>
            <Button isPending={createMutation.isPending} type="submit">
              {({ isPending }) => <><Upload className="size-4" />{isPending ? "등록 중" : "등록"}</>}
            </Button>
          </DrawerFooter>
        </Form>
      </DrawerPopup>
    </Drawer>
  );
}
