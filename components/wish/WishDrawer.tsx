"use client";

import { useEffect, useRef, useState, type FocusEvent, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import {
  Avatar,
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
import { Plus, X } from "lucide-react";
import { BoxIcon } from "@/components/ui/box";
import { FileTextIcon } from "@/components/ui/file-text";
import { GalleryThumbnailsIcon } from "@/components/ui/gallery-thumbnails";
import { HomeIcon } from "@/components/ui/home";
import { LayersIcon } from "@/components/ui/layers";
import { ScanTextIcon } from "@/components/ui/scan-text";
import { WalletIcon } from "@/components/ui/wallet";
import { toast } from "sonner";
import StatusButton from "@/components/animata/button/status-button";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { DrawerFieldLabel, DrawerIntro, DrawerLinkIcon, DrawerMapPinIcon, drawerCancelButtonClass, drawerPrimaryButtonClass, scrollDrawerFieldIntoView } from "@/components/ui/drawer-form";
import { CurrencyAmountField } from "@/components/ui/currency-amount-field";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { WishImagePicker, type WishImageDraft } from "@/components/wish/WishImagePicker";
import {
  DEFAULT_THB_TO_KRW_RATE,
  EXCHANGE_RATE_QUERY_KEY,
  convertKrwToThb,
  convertThbToKrw,
  fetchThbToKrwRate,
  toggleCurrencyAmount,
  toFiniteAmount,
  type InputCurrency,
} from "@/lib/exchange-rates";
import {
  isGoogleMapsUrl,
  normalizeExternalUrl,
  WISH_CATEGORY_SUGGESTIONS,
  WISH_TYPES,
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
  shopping: "굿즈 살 돈으로 모조리 담아버려!!!",
  restaurant: "와따시는 고무줄 바지만 챙겨왔다!!!",
  menu: "가현짱은 먹고싶어!!!",
  snack: "멍멍이 간식 달라능 🐶",
};

const isDiningType = (type: WishType) => type === "restaurant" || type === "menu";

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  preserveExif: false,
  useWebWorker: true,
  fileType: "image/jpeg",
};

export function WishDrawer({ open, initialType, onOpenChange, wish = null }: WishDrawerProps) {
  const queryClient = useQueryClient();
  const isEditing = wish !== null;
  const [type, setType] = useState<WishType>(wish?.type ?? initialType);
  const [title, setTitle] = useState(wish?.title ?? "");
  const [categories, setCategories] = useState<string[]>(wish?.categories ?? []);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [targetPrice, setTargetPrice] = useState(wish?.target_price_thb?.toString() ?? "");
  const [inputCurrency, setInputCurrency] = useState<InputCurrency>("THB");
  const [vendor, setVendor] = useState(wish?.vendor ?? "");
  const [memo, setMemo] = useState(wish?.memo ?? "");
  const [locations, setLocations] = useState<string[]>(wish?.locations ?? []);
  const [locationDraft, setLocationDraft] = useState("");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [links, setLinks] = useState<string[]>(wish?.links ?? []);
  const [linkDraft, setLinkDraft] = useState("");
  const [images, setImages] = useState<WishImageDraft[]>(() => (wish?.images ?? []).map((image) => ({ id: image.id, path: image.path, url: image.url })));
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [typeInteraction, setTypeInteraction] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFieldFocus = (event: FocusEvent<HTMLElement>) => scrollDrawerFieldIntoView(event);
  const { data: thbToKrwRate = DEFAULT_THB_TO_KRW_RATE } = useQuery({
    queryKey: EXCHANGE_RATE_QUERY_KEY,
    queryFn: fetchThbToKrwRate,
  });
  const numericInput = toFiniteAmount(Number(targetPrice) || 0);
  const isKrwInput = inputCurrency === "KRW";
  const targetPriceThb = isKrwInput ? convertKrwToThb(numericInput, thbToKrwRate) : numericInput;
  const targetPriceKrw = convertThbToKrw(targetPriceThb, thbToKrwRate);

  const toggleInputCurrency = () => {
    const { nextCurrency, nextAmount } = toggleCurrencyAmount(numericInput, thbToKrwRate, inputCurrency, targetPrice);
    setTargetPrice(nextAmount);
    setInputCurrency(nextCurrency);
  };
  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);
  useEffect(() => {
    if (!open) panelRef.current?.scrollTo({ top: 0 });
  }, [open]);

  const resetForm = () => {
    setType(initialType);
    setTitle("");
    setCategories([]);
    setCategoryDraft("");
    setTargetPrice("");
    setInputCurrency("THB");
    setVendor("");
    setMemo("");
    setLocations([]);
    setLocationDraft("");
    setLocationError(null);
    setLinks([]);
    setLinkDraft("");
    setImages([]);
    setSubmitError(null);
    setSuccess(false);
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
      const uploadedPaths: string[] = [];
      const imagePaths: string[] = [];
      try {
        for (const image of images) {
          if (image.path) { imagePaths.push(image.path); continue; }
          if (!image.file) continue;
          setIsCompressingImage(true);
          const compressedImage = await imageCompression(image.file, IMAGE_COMPRESSION_OPTIONS);
          const imageFormData = new FormData(); imageFormData.append("image", compressedImage);
          const imageResponse = await fetch("/api/wishes/image", { method: "POST", body: imageFormData });
          const imagePayload = await imageResponse.json();
          if (!imageResponse.ok) throw new Error(imagePayload.error ?? "이미지를 업로드하지 못했습니다.");
          uploadedPaths.push(imagePayload.data.path); imagePaths.push(imagePayload.data.path);
        }
      } catch (error) {
        if (uploadedPaths.length) await fetch("/api/wishes/image", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paths: uploadedPaths }) });
        throw error;
      } finally { setIsCompressingImage(false); }

      try {
        const response = await fetch(wish ? `/api/wishes?id=${wish.id}` : "/api/wishes", {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type,
            title,
            categories: submittedCategories,
            target_price_thb: isDiningType(type) ? null : (targetPrice.trim() ? targetPriceThb : ""),
            vendor,
            memo,
            locations: submittedLocations,
            links: submittedLinks,
            image_paths: imagePaths,
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? (isEditing ? "위시를 수정하지 못했습니다." : "위시를 등록하지 못했습니다."));
        }
        return payload.data;
      } catch (error) {
        if (uploadedPaths.length) await fetch("/api/wishes/image", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paths: uploadedPaths }) });
        throw error;
      }
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
      <DrawerPopup id="wish-drawer" variant="inset" showBar className="overflow-hidden">
        <Form ref={formRef} aria-label={isEditing ? "위시 편집" : "위시 등록"} className="flex min-h-0 w-full flex-1 flex-col overflow-hidden" onSubmit={handleSubmit} validationBehavior="native">
          <DrawerHeader className="px-6 pb-1 pt-6 text-center">
            <DrawerTitle>{isEditing ? "위시 편집" : "위시 등록"}</DrawerTitle>
          </DrawerHeader>

          <DrawerPanel
            ref={panelRef}
            scrollable={false}
            className="flex min-h-0 flex-1 touch-pan-y flex-col gap-5 overflow-y-auto overscroll-contain px-6 py-3 pb-6"
          >
            <DrawerIntro open={open} image="/drawer-wish-intro.gif" alt="위시 목록을 기록하는 캐릭터" title={isEditing ? "이 위시는 아직 완성되지 않았다… 다듬어라!" : "이 맛은… 위시에 등록해야만 하는 맛이다!"} />
            <div data-drawer-interactive-field className="flex flex-col gap-2" onPointerDownCapture={() => setTypeInteraction((value) => value + 1)}>
              <Label><DrawerFieldLabel icon={BoxIcon} active={open} interactionSignal={typeInteraction}>종류</DrawerFieldLabel></Label>
              <ListBox
                aria-label="위시 종류"
                className="w-full"
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
                {WISH_TYPES.map((itemType) => (
                  <ListBox.Item
                    key={itemType}
                    id={itemType}
                    textValue={WISH_TYPE_META[itemType].title}
                  >
                    <Avatar size="sm">
                      <Avatar.Fallback>{WISH_TYPE_META[itemType].icon}</Avatar.Fallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <Label>{WISH_TYPE_META[itemType].title}</Label>
                      <Description className="text-xs text-slate-500! dark:text-slate-400!">
                        {WISH_TYPE_DESCRIPTIONS[itemType]}
                      </Description>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </div>

            <TextField isRequired name="title" value={title} onChange={setTitle}>
              <Label><DrawerFieldLabel icon={ScanTextIcon} active={open}>{type === "restaurant" ? "식당 이름" : type === "menu" ? "메뉴 이름" : "이름"}</DrawerFieldLabel></Label>
              <Input autoComplete="off" onFocus={handleFieldFocus} placeholder={type === "shopping" ? "예: 야돔" : type === "snack" ? "예: 망고 쥬스" : type === "menu" ? "예: 팟타이" : "예: 팁싸마이"} />
              <FieldError />
            </TextField>

            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <TextField className="min-w-0 flex-1" name="categoryDraft" value={categoryDraft} onChange={setCategoryDraft}>
                  <Label><DrawerFieldLabel icon={LayersIcon} active={open}>카테고리 태그</DrawerFieldLabel></Label>
                  <Input
                    autoComplete="off"
                    maxLength={14}
                    onFocus={handleFieldFocus}
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

            {!isDiningType(type) && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="wish-target-price"><DrawerFieldLabel icon={WalletIcon} active={open}>현지 적정 가격</DrawerFieldLabel></Label>
                <CurrencyAmountField
                  amount={targetPrice}
                  convertedValue={isKrwInput ? targetPriceThb : targetPriceKrw}
                  currency={inputCurrency}
                  inputId="wish-target-price"
                  name="targetPrice"
                  onAmountChange={setTargetPrice}
                  onInputFocus={handleFieldFocus}
                  onToggle={toggleInputCurrency}
                  rateReady={thbToKrwRate > 0}
                />
                <p className="px-1 text-xs text-slate-400">가격을 모르면 비워 두어도 됩니다.</p>
                <p className="text-right text-[11px] text-slate-400">
                  1 THB = {Number.isFinite(thbToKrwRate) ? thbToKrwRate.toLocaleString("ko-KR") : "—"} KRW
                </p>
              </div>
            )}

            <TextField name="vendor" value={vendor} onChange={setVendor}>
              <Label><DrawerFieldLabel icon={HomeIcon} active={open}>{isDiningType(type) ? "식당 또는 지점" : "판매점"}</DrawerFieldLabel></Label>
              <Input onFocus={handleFieldFocus} autoComplete="off" placeholder={isDiningType(type) ? "예: 팁싸마이 프라투피" : "예: 세븐일레븐, 짜뚜짝 시장"} />
            </TextField>

            <div className="flex flex-col gap-6">
              <MultiValueField
                description="코노 바쇼와… 성지다! 좌표를 확보하라구, 오이!"
                draft={locationDraft}
                error={locationError}
                icon={<DrawerMapPinIcon active={open} />}
                items={locations}
                label="위치"
                maxLength={2048}
                onAdd={addLocation}
                onDraftChange={(value) => {
                  setLocationDraft(value);
                  if (locationError) setLocationError(null);
                }}
                onInputFocus={handleFieldFocus}
                onRemove={(keys) => setLocations((current) => current.filter((item) => !keys.has(item)))}
                placeholder="Google Maps 링크 붙여넣기"
              />
              <MultiValueField
                description="공식 링크를 놓치다니, 소레와 오타쿠 실격이라구!"
                draft={linkDraft}
                icon={<DrawerLinkIcon active={open} />}
                items={links}
                label="관련 링크"
                maxLength={500}
                onAdd={() => addListItem(linkDraft, links, setLinks, setLinkDraft, normalizeExternalUrl)}
                onDraftChange={setLinkDraft}
                onInputFocus={handleFieldFocus}
                onRemove={(keys) => setLinks((current) => current.filter((item) => !keys.has(item)))}
                placeholder="예: instagram.com/example"
              />
            </div>

            <div className="space-y-2"><DrawerFieldLabel icon={GalleryThumbnailsIcon} active={open}>사진</DrawerFieldLabel><WishImagePicker images={images} onChange={setImages} /></div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="wish-memo"><DrawerFieldLabel icon={FileTextIcon} active={open}>메모</DrawerFieldLabel></Label>
              <TextArea
                enterKeyHint="done"
                id="wish-memo"
                className="min-h-24"
                maxLength={500}
                onChange={(event) => setMemo(event.target.value)}
                onFocus={handleFieldFocus}
                placeholder="기억해 둘 팁이나 이유를 남겨 보세요."
                rows={4}
                value={memo}
              />
            </div>

            {submitError && <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{submitError}</p>}
          </DrawerPanel>

          <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            <Button
              fullWidth
              className={drawerCancelButtonClass}
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
                className={`pointer-events-none ${drawerPrimaryButtonClass}`}
                fullWidth
                idleText={isEditing ? "변경 저장" : "등록하기"}
                isDisabled={!title.trim() || success}
                loadingText={isCompressingImage ? "이미지 압축 중…" : "저장 중…"}
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
  onInputFocus?: (event: FocusEvent<HTMLElement>) => void;
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
  onInputFocus,
  onRemove,
  placeholder,
}: MultiValueFieldProps) {
  return (
    <div data-drawer-multi-field className="flex flex-col gap-3">
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
            onFocus={onInputFocus}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229) return;
              if (event.key === "Enter") {
                event.preventDefault();
                onAdd();
              }
            }}
            placeholder={placeholder}
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
