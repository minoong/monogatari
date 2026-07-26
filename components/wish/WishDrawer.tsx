"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
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
import { ImagePlus, Link2, MapPin, Plus, Upload, X } from "lucide-react";
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
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  isGoogleMapsUrl,
  normalizeExternalUrl,
  WISH_CATEGORY_SUGGESTIONS,
  WISH_TYPE_META,
  type WishItem,
  type WishType,
} from "@/lib/wishes";

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
  const [locations, setLocations] = useState<string[]>([]);
  const [locationDraft, setLocationDraft] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>([]);
  const [linkDraft, setLinkDraft] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewUrl = useMemo(() => image ? URL.createObjectURL(image) : null, [image]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const resetForm = () => {
    setType(initialType);
    setTitle("");
    setCategories([]);
    setCategoryDraft("");
    setTargetPrice("");
    setVendor("");
    setMemo("");
    setLocations([]);
    setLocationDraft("");
    setLocationError(null);
    setLinks([]);
    setLinkDraft("");
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setSubmitError(null);
  };

  const clearImage = () => {
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
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

  const addLocation = () => {
    const normalizedLocation = normalizeExternalUrl(locationDraft.trim());
    if (!isGoogleMapsUrl(normalizedLocation)) {
      setLocationError("Google Maps에서 복사한 링크를 입력해 주세요.");
      return null;
    }

    setLocationError(null);
    return addListItem(
      normalizedLocation,
      locations,
      setLocations,
      setLocationDraft,
    );
  };

  const addListItem = (
    draft: string,
    items: string[],
    setItems: (items: string[]) => void,
    setDraft: (value: string) => void,
    transform: (value: string) => string = (value) => value,
  ) => {
    const nextItem = transform(draft.trim());
    if (!nextItem || items.includes(nextItem)) return items;
    const nextItems = [...items, nextItem];
    setItems(nextItems);
    setDraft("");
    return nextItems;
  };

  const createMutation = useMutation({
    mutationFn: async ({
      submittedCategories,
      submittedLocations,
      submittedLinks,
    }: {
      submittedCategories: string[];
      submittedLocations: string[];
      submittedLinks: string[];
    }): Promise<WishItem> => {
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
          locations: submittedLocations,
          links: submittedLinks,
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
    const submittedLocations = locationDraft.trim() ? addLocation() : locations;
    if (!submittedLocations) return;
    const submittedLinks = linkDraft.trim()
      ? addListItem(linkDraft, links, setLinks, setLinkDraft, normalizeExternalUrl)
      : links;
    createMutation.mutate({ submittedCategories, submittedLocations, submittedLinks });
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

            <div className="flex flex-col gap-5 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
              <MultiValueField
                description="Google Maps에서 장소의 공유 링크를 복사해 추가해 주세요."
                draft={locationDraft}
                error={locationError}
                icon={<MapPin className="size-4" />}
                items={locations}
                label="위치"
                maxLength={2048}
                onAdd={addLocation}
                onDraftChange={(value) => {
                  setLocationDraft(value);
                  if (locationError) setLocationError(null);
                }}
                onRemove={(keys) => setLocations((current) => current.filter((item) => !keys.has(item)))}
                placeholder="Google Maps 링크 붙여넣기"
              />
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <MultiValueField
                description="공식 홈페이지, 메뉴, SNS 등 관련 링크를 따로 모아 둘 수 있어요."
                draft={linkDraft}
                icon={<Link2 className="size-4" />}
                items={links}
                label="관련 링크"
                maxLength={500}
                onAdd={() => addListItem(linkDraft, links, setLinks, setLinkDraft, normalizeExternalUrl)}
                onDraftChange={setLinkDraft}
                onRemove={(keys) => setLinks((current) => current.filter((item) => !keys.has(item)))}
                placeholder="예: instagram.com/example"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="wish-image">이미지</Label>
              <div className="flex items-stretch gap-3">
                <AspectRatio
                  className="w-28 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  ratio={1}
                >
                  {imagePreviewUrl ? (
                    <>
                      <Image
                        alt="선택한 위시 이미지 미리보기"
                        className="object-contain p-1"
                        fill
                        sizes="112px"
                        src={imagePreviewUrl}
                        unoptimized
                      />
                      <button
                        aria-label="선택한 이미지 삭제"
                        className="absolute right-1.5 top-1.5 z-10 flex size-7 items-center justify-center rounded-full bg-black/65 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/80"
                        onClick={clearImage}
                        type="button"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-slate-400">
                      <ImagePlus className="size-6" />
                      <span className="text-[11px] font-medium">미리보기</span>
                    </div>
                  )}
                </AspectRatio>

                <label
                  htmlFor="wish-image"
                  className="flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 transition-colors hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-white/5 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <Upload className="size-4 text-blue-500" />
                    {image ? "이미지 변경" : "이미지 선택"}
                  </span>
                  <span className="mt-1 truncate text-xs text-slate-500">
                    {image?.name ?? "JPG, PNG, WEBP"}
                  </span>
                  <span className="mt-0.5 text-[11px] text-slate-400">최대 5MB</span>
                </label>
              </div>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                id="wish-image"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                ref={imageInputRef}
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

interface MultiValueFieldProps {
  description: string;
  draft: string;
  error?: string | null;
  icon: ReactNode;
  items: string[];
  label: string;
  maxLength: number;
  onAdd: () => void;
  onDraftChange: (value: string) => void;
  onRemove: (keys: Set<Key>) => void;
  placeholder: string;
}

function MultiValueField({
  description,
  draft,
  error,
  icon,
  items,
  label,
  maxLength,
  onAdd,
  onDraftChange,
  onRemove,
  placeholder,
}: MultiValueFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {icon}
          <span>{label}</span>
          {items.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              {items.length}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <div className="flex items-end gap-2">
        <TextField className="min-w-0 flex-1" value={draft} onChange={onDraftChange}>
          <Input
            aria-label={`${label} 입력`}
            autoComplete="off"
            maxLength={maxLength}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onAdd();
              }
            }}
            placeholder={placeholder}
            variant="secondary"
          />
        </TextField>
        <Button
          aria-label={`${label} 추가`}
          isDisabled={!draft.trim()}
          onPress={onAdd}
          type="button"
          variant="secondary"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {error && <p role="alert" className="text-xs font-medium text-danger">{error}</p>}
      {items.length > 0 && (
        <TagGroup aria-label={`등록한 ${label}`} onRemove={onRemove} size="sm" variant="surface">
          <TagGroup.List>
            {items.map((item) => (
              <Tag key={item} id={item} textValue={item}>
                <span className="max-w-60 truncate">{item}</span>
              </Tag>
            ))}
          </TagGroup.List>
        </TagGroup>
      )}
    </div>
  );
}
