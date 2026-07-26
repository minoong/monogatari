"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NumberFlow from "@number-flow/react";
import {
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Tag,
  TagGroup,
  TextArea,
  TextField,
  type Key,
} from "@heroui/react";
import { ImagePlus, Link2, MapPin, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import StatusButton from "@/components/animata/button/status-button";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  DEFAULT_THB_TO_KRW_RATE,
  EXCHANGE_RATE_QUERY_KEY,
  fetchThbToKrwRate,
} from "@/lib/exchange-rates";
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
  wish?: WishItem | null;
}

const WISH_TYPE_DESCRIPTIONS: Record<WishType, string> = {
  shopping: "사고 싶은 물건과 적정 가격을 기록해요.",
  snack: "먹어 보고 싶은 간식과 디저트를 모아요.",
  restaurant: "가 보고 싶은 식당과 위치를 저장해요.",
};

export function WishDrawer({ open, initialType, onOpenChange, wish = null }: WishDrawerProps) {
  const queryClient = useQueryClient();
  const isEditing = wish !== null;
  const [type, setType] = useState<WishType>(wish?.type ?? initialType);
  const [title, setTitle] = useState(wish?.title ?? "");
  const [categories, setCategories] = useState<string[]>(wish?.categories ?? []);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [targetPrice, setTargetPrice] = useState(wish?.target_price_thb?.toString() ?? "");
  const [vendor, setVendor] = useState(wish?.vendor ?? "");
  const [memo, setMemo] = useState(wish?.memo ?? "");
  const [locations, setLocations] = useState<string[]>(wish?.locations ?? []);
  const [locationDraft, setLocationDraft] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>(wish?.links ?? []);
  const [linkDraft, setLinkDraft] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imagePreviewUrl = useMemo(() => image ? URL.createObjectURL(image) : null, [image]);
  const { data: thbToKrwRate = DEFAULT_THB_TO_KRW_RATE } = useQuery({
    queryKey: EXCHANGE_RATE_QUERY_KEY,
    queryFn: fetchThbToKrwRate,
  });
  const targetPriceValue = Number(targetPrice) || 0;
  const targetPriceKrw = Math.round(targetPriceValue * thbToKrwRate);
  const displayedImageUrl = imagePreviewUrl ?? (!imageRemoved ? wish?.image_url : null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
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
    setImageRemoved(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
    setSubmitError(null);
    setSuccess(false);
  };

  const clearImage = () => {
    setImage(null);
    setImageRemoved(true);
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

  const saveMutation = useMutation({
    mutationFn: async ({
      submittedCategories,
      submittedLocations,
      submittedLinks,
    }: {
      submittedCategories: string[];
      submittedLocations: string[];
      submittedLinks: string[];
    }): Promise<WishItem> => {
      let imagePath = imageRemoved ? null : wish?.image_path ?? null;

      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("image", image);
        const imageResponse = await fetch("/api/wishes/image", { method: "POST", body: imageFormData });
        const imagePayload = await imageResponse.json();
        if (!imageResponse.ok) throw new Error(imagePayload.error ?? "이미지를 업로드하지 못했습니다.");
        imagePath = imagePayload.data.path;
      }

      const response = await fetch(wish ? `/api/wishes?id=${wish.id}` : "/api/wishes", {
        method: isEditing ? "PATCH" : "POST",
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
      if (!response.ok) {
        throw new Error(payload.error ?? (isEditing ? "위시를 수정하지 못했습니다." : "위시를 등록하지 못했습니다."));
      }
      return payload.data;
    },
    onSuccess: async () => {
      setSuccess(true);
      await queryClient.invalidateQueries({ queryKey: ["wishes"] });
      toast.success(isEditing ? "위시를 수정했어요." : "위시에 추가했어요.");
      closeTimerRef.current = setTimeout(() => handleOpenChange(false), 800);
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || saveMutation.isPending) return;
    setSubmitError(null);
    const submittedCategories = categoryDraft.trim() ? addCategory() : categories;
    const submittedLocations = locationDraft.trim() ? addLocation() : locations;
    if (!submittedLocations) return;
    const submittedLinks = linkDraft.trim()
      ? addListItem(linkDraft, links, setLinks, setLinkDraft, normalizeExternalUrl)
      : links;
    saveMutation.mutate({ submittedCategories, submittedLocations, submittedLinks });
  };

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerPopup id="wish-drawer" variant="inset" showBar>
        <Form ref={formRef} aria-label={isEditing ? "위시 편집" : "위시 등록"} className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} validationBehavior="native">
          <DrawerHeader className="px-6 pb-4 text-left">
            <DrawerTitle>{isEditing ? "위시 편집" : "위시 등록"}</DrawerTitle>
            <DrawerDescription>
              {isEditing ? "저장한 정보와 이미지를 필요한 만큼 수정하세요." : "여행 중 사고 싶거나 먹고 싶은 것을 가볍게 담아 두세요."}
            </DrawerDescription>
          </DrawerHeader>

          <DrawerPanel className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-2">
              <Label>종류</Label>
              <ListBox
                aria-label="위시 종류"
                className="w-full rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-white/5"
                disallowEmptySelection
                selectedKeys={new Set([type])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  if (keys === "all") return;
                  const selectedType = Array.from(keys)[0] as WishType | undefined;
                  if (!selectedType || selectedType === type) return;
                  setType(selectedType);
                  setCategories([]);
                  setCategoryDraft("");
                }}
              >
                {(Object.keys(WISH_TYPE_META) as WishType[]).map((itemType) => (
                  <ListBox.Item
                    key={itemType}
                    id={itemType}
                    textValue={WISH_TYPE_META[itemType].title}
                    className="group min-h-14 cursor-pointer rounded-xl px-3 py-2.5 outline-none transition-colors data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[selected=true]:bg-blue-50 dark:data-[selected=true]:bg-blue-500/10"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl group-data-[selected=true]:bg-white dark:bg-white/10 dark:group-data-[selected=true]:bg-blue-500/15">
                      {WISH_TYPE_META[itemType].icon}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <Label className="font-semibold text-slate-800 group-data-[selected=true]:text-blue-700 dark:text-slate-100 dark:group-data-[selected=true]:text-blue-300">
                        {WISH_TYPE_META[itemType].title}
                      </Label>
                      <Description className="truncate text-xs text-slate-500">
                        {WISH_TYPE_DESCRIPTIONS[itemType]}
                      </Description>
                    </span>
                    <ListBox.ItemIndicator className="ms-auto text-blue-600 dark:text-blue-300" />
                  </ListBox.Item>
                ))}
              </ListBox>
            </div>

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
                      if (event.nativeEvent.isComposing || event.keyCode === 229) return;
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
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="wish-target-price">현지 적정 가격</Label>
                  <InputGroup className="h-12 rounded-2xl">
                    <InputGroupAddon>
                      <InputGroupText className="text-base font-bold text-slate-500">฿</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="wish-target-price"
                      inputMode="decimal"
                      min={0}
                      name="targetPrice"
                      onChange={(event) => setTargetPrice(event.target.value)}
                      placeholder="0"
                      style={{
                        fontVariantNumeric: "tabular-nums",
                        textAlign: "right",
                      }}
                      type="number"
                      value={targetPrice}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText className="font-semibold">THB</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  <p className="px-1 text-xs text-slate-400">가격을 모르면 비워 두어도 됩니다.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                  <PricePreview
                    currency="KRW"
                    label="대한민국 원"
                    symbol="₩"
                    value={targetPriceKrw}
                  />
                </div>
                <p className="text-right text-[11px] text-slate-400">
                  1 THB = {thbToKrwRate.toLocaleString("ko-KR")} KRW
                </p>
              </div>
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
                  {displayedImageUrl ? (
                    <>
                      <Image
                        alt={image ? "선택한 위시 이미지 미리보기" : "저장된 위시 이미지"}
                        className="object-contain p-1"
                        fill
                        sizes="112px"
                        src={displayedImageUrl}
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
                    {displayedImageUrl ? "이미지 변경" : "이미지 선택"}
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
                onChange={(event) => {
                  setImage(event.target.files?.[0] ?? null);
                  setImageRemoved(false);
                }}
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

          <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <Button
              fullWidth
              className="h-12 rounded-2xl text-base"
              isDisabled={saveMutation.isPending}
              onPress={() => handleOpenChange(false)}
              size="lg"
              type="button"
              variant="secondary"
            >
              취소
            </Button>
            <div className="relative h-12 min-w-0">
              <StatusButton
                aria-hidden="true"
                className="pointer-events-none h-12 rounded-2xl text-base"
                fullWidth
                idleText={isEditing ? "변경 저장" : "등록하기"}
                isDisabled={!title.trim() || success}
                loadingText="저장 중…"
                size="lg"
                status={saveMutation.isPending ? "loading" : success ? "success" : "idle"}
                successText={isEditing ? "수정 완료!" : "등록 완료!"}
                type="submit"
              />
              <NativeHapticSwitch
                ariaLabel={isEditing ? "위시 변경 저장" : "위시 등록하기"}
                checked={false}
                disabled={!title.trim() || saveMutation.isPending || success}
                onChange={() => {
                  triggerHapticFeedback(15);
                  formRef.current?.requestSubmit();
                }}
              />
            </div>
          </DrawerFooter>
        </Form>
      </DrawerPopup>
    </Drawer>
  );
}

function PricePreview({
  currency,
  label,
  symbol,
  value,
}: {
  currency: string;
  label: string;
  symbol: string;
  value: number;
}) {
  const valueTextSize = getPriceTextSize(value);

  return (
    <div className="flex min-w-0 flex-col" data-price-preview={currency}>
      <span className="text-[11px] font-medium text-slate-400">{label} ({currency})</span>
      <span
        className={`mt-1 flex min-w-0 items-center justify-end gap-1 overflow-hidden font-bold tabular-nums text-slate-800 dark:text-slate-100 ${valueTextSize}`}
        data-price-value
      >
        <span className="text-slate-400">{symbol}</span>
        <NumberFlow
          className="min-w-0"
          format={{ maximumFractionDigits: 0 }}
          value={value}
        />
      </span>
    </div>
  );
}

function getPriceTextSize(value: number) {
  const digitCount = Math.trunc(Math.abs(value)).toString().length;
  if (digitCount > 15) return "text-xs";
  if (digitCount > 12) return "text-sm";
  if (digitCount > 9) return "text-base";
  if (digitCount > 6) return "text-lg";
  return "text-2xl";
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
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
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
        <ul aria-label={`등록한 ${label}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          {items.map((item, index) => (
            <li
              key={item}
              className="flex min-h-12 min-w-0 items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0 dark:border-slate-800"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                {icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-slate-400">
                  {label} {index + 1}
                </span>
                <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200" title={item}>
                  {formatLinkLabel(item)}
                </span>
              </span>
              <button
                aria-label={`${label} ${index + 1} 삭제`}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-red-500/10"
                onClick={() => onRemove(new Set([item]))}
                type="button"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatLinkLabel(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
}
