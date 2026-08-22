import React, { useDeferredValue, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ArrowUpRight, Image as ImageIcon, Link2, MapPin, Pencil, Plus, RefreshCw, RotateCcw, Trash2, ZoomIn } from "lucide-react";
import { Button, Chip, Description, Label, ListBox } from "@heroui/react";
import { toast } from "sonner";
import { ExpenseCurrencyPair } from "@/components/expense/currency-display";
import { WishDrawer } from "@/components/wish/WishDrawer";
import { WishImageGallery } from "@/components/wish/WishImageGallery";
import { ActivityRegisterFab } from "@/components/ui/activity-register-fab";
import { ImageZoomModal } from "@/components/ui/image-zoom-modal";
import { GooeyInput } from "@/components/ui/gooey-input";
import { ActivityFetchLoader, useMinimumInitialLoading } from "@/components/ui/activity-fetch-loader";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import { drawerCancelButtonClass, drawerDangerButtonClass, dialogFooterPrimaryButtonClass, dialogFooterSecondaryButtonClass, filterChipButtonClass, filterChipSelectedClass, filterChipUnselectedClass } from "@/components/ui/drawer-form";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DEFAULT_THB_TO_KRW_RATE,
  EXCHANGE_RATE_QUERY_KEY,
  fetchThbToKrwRate,
} from "@/lib/exchange-rates";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog";
import {
  getWishProgress,
  isWishCompletionFilter,
  isWishType,
  WISH_TYPE_META,
  type WishCompletionFilter,
  type WishItem,
  type WishType,
} from "@/lib/wishes";
import { WishCompletionToggle } from "@/components/wish/WishCompletionToggle";
import { WishTypeIcon } from "@/components/wish/WishTypeIcon";
import { useWishCompletionMutation } from "@/components/wish/use-wish-completion";

interface WishListActivityProps { params: { type?: string; filter?: string } }

const fetchWishes = async (type: WishType): Promise<WishItem[]> => {
  const response = await fetch(`/api/wishes?type=${type}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "위시를 불러오지 못했습니다.");
  return payload.data;
};

const WISH_LOADING_MESSAGES: Record<WishType, readonly string[]> = {
  shopping: ["쇼핑 목록을 정리하고 있어…", "사고 싶은 걸 모아 보는 중이야…", "장바구니를 다시 확인할게…"],
  restaurant: ["맛집 목록을 확인하고 있어…", "먹고 싶은 곳을 찾는 중이야…", "맛집 기록을 펼쳐 볼게…"],
  menu: ["먹을 메뉴를 확인하고 있어…", "메뉴를 하나씩 살펴보는 중이야…", "뭘 먹을지 다시 확인할게…"],
  snack: ["간식 목록을 확인하고 있어…", "달콤한 걸 모아 보는 중이야…", "간식 기록을 펼쳐 볼게…"],
};

export const WishListActivity: React.FC<WishListActivityProps> = ({ params }) => {
  const queryClient = useQueryClient();
  const type = isWishType(params.type) ? params.type : "shopping";
  const meta = WISH_TYPE_META[type];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSession, setDrawerSession] = useState(0);
  const [editingWish, setEditingWish] = useState<WishItem | null>(null);
  const [deletingWish, setDeletingWish] = useState<WishItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [completionFilter, setCompletionFilter] = useState<WishCompletionFilter>(() =>
    isWishCompletionFilter(params.filter) ? params.filter : "all",
  );
  const completionMutation = useWishCompletionMutation();
  const mainRef = useRef<HTMLElement>(null);
  const { data: wishes = [], isError, isLoading, refetch } = useQuery({ queryKey: ["wishes", type], queryFn: () => fetchWishes(type) });
  const showInitialLoader = useMinimumInitialLoading(isLoading);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    wishes.forEach((wish) => {
      wish.categories.forEach((cat) => {
        if (cat.trim()) categoriesSet.add(cat.trim());
      });
    });
    return ["전체", ...Array.from(categoriesSet)];
  }, [wishes]);

  const handleCategoryToggle = (cat: string) => {
    triggerHapticFeedback(10);
    if (cat === "전체") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const filteredWishes = useMemo(
    () =>
      wishes.filter((wish) => {
        const matchesSearch = wishMatchesSearch(wish, deferredSearchQuery);
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.some((selectedCat) => wish.categories.includes(selectedCat));
        const matchesCompletion =
          completionFilter === "all"
            ? true
            : completionFilter === "completed"
              ? wish.is_completed
              : !wish.is_completed;
        return matchesSearch && matchesCategory && matchesCompletion;
      }),
    [completionFilter, deferredSearchQuery, selectedCategories, wishes],
  );
  const { data: thbToKrwRate = DEFAULT_THB_TO_KRW_RATE } = useQuery({
    queryKey: EXCHANGE_RATE_QUERY_KEY,
    queryFn: fetchThbToKrwRate,
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/wishes?id=${id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "위시를 삭제하지 못했습니다.");
      return payload.data;
    },
    onSuccess: async () => {
      setDeletingWish(null);
      await queryClient.invalidateQueries({ queryKey: ["wishes"] });
      toast.success("위시에서 삭제했어요.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."),
  });

  const openCreateDrawer = () => {
    setEditingWish(null);
    setDrawerSession((current) => current + 1);
    setDrawerOpen(true);
  };
  const resetSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
  };

  return (
    <AppScreen appBar={{ title: meta.activityTitle }}>
      <main ref={mainRef} className="min-h-full w-full bg-white pb-12 dark:bg-slate-950">
        {showInitialLoader ? (
          <ActivityFetchLoader messages={WISH_LOADING_MESSAGES[type]} />
        ) : <section className="mx-auto flex w-full max-w-lg flex-col gap-4 px-5 pt-5">
          <div
            aria-label={`${meta.title} 검색 및 필터`}
            className="sticky top-0 z-30 -mx-2 flex min-h-14 items-center justify-center px-2 py-2"
            data-slot="wish-filter-toolbar"
            role="search"
          >
            <GooeyInput
              className="w-full"
              fullWidthOnExpand
              onOpenChange={setSearchOpen}
              onValueChange={setSearchQuery}
              open={searchOpen}
              placeholder=""
              value={searchQuery}
            />
          </div>

          {/* Category Filter Chips & Status Bar */}
          {!isLoading && !isError && wishes.length > 0 && (
            <div className="-mt-1 flex flex-col gap-3">
              <div className="-mx-5 flex items-center gap-1.5 overflow-x-auto px-5 no-scrollbar py-0.5">
                {([
                  { id: "all", label: "전체" },
                  { id: "pending", label: "미완료" },
                  { id: "completed", label: "완료" },
                ] as const).map((filter) => {
                  const isSelected = completionFilter === filter.id;
                  return (
                    <Button
                      key={filter.id}
                      className={cn(
                        filterChipButtonClass,
                        isSelected ? filterChipSelectedClass : filterChipUnselectedClass,
                      )}
                      onPress={() => {
                        triggerHapticFeedback(10);
                        setCompletionFilter(filter.id);
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      {filter.label}
                    </Button>
                  );
                })}
              </div>

              {/* Category Filter Chips (Multi-Select) */}
              {availableCategories.length > 1 && (
                <div className="-mx-5 flex items-center gap-1.5 overflow-x-auto px-5 no-scrollbar py-0.5">
                  {availableCategories.map((cat) => {
                    const isSelected =
                      cat === "전체"
                        ? selectedCategories.length === 0
                        : selectedCategories.includes(cat);
                    return (
                      <Button
                        key={cat}
                        className={cn(
                          filterChipButtonClass,
                          isSelected ? filterChipSelectedClass : filterChipUnselectedClass,
                        )}
                        onPress={() => handleCategoryToggle(cat)}
                        size="sm"
                        variant="ghost"
                      >
                        {cat}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Result Count & Clear Status */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>
                    {searchQuery || selectedCategories.length > 0 ? "검색/필터 결과" : "전체"}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {filteredWishes.length}건
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    · {getWishProgress(wishes).completed}/{wishes.length} 완료
                  </span>
                  {(searchQuery || selectedCategories.length > 0 || completionFilter !== "all") && (
                    <span className="text-[11px] text-slate-400">
                      (총 {wishes.length}건)
                    </span>
                  )}
                </div>

                {(searchQuery || selectedCategories.length > 0 || completionFilter !== "all") && (
                  <Button
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400"
                    onPress={() => {
                      triggerHapticFeedback(10);
                      setSearchQuery("");
                      setSelectedCategories([]);
                      setCompletionFilter("all");
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    <RotateCcw className="size-3" />
                    필터 초기화
                  </Button>
                )}
              </div>
            </div>
          )}

          <header className={`rounded-[28px] bg-gradient-to-br ${meta.accent} px-5 py-5 text-white shadow-lg shadow-slate-200/70 dark:shadow-none`}>
            <WishTypeIcon
              className="size-12 bg-white/15 shadow-inner"
              iconClassName="text-white"
              size={24}
              type={type}
            />
            <h1 className="mt-3 text-xl font-extrabold tracking-tight">{meta.activityTitle}</h1>
            <p className="mt-1.5 text-sm leading-6 text-white/82">{meta.description}</p>
            {wishes.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-white/75">
                  <span>달성률</span>
                  <span className="tabular-nums">{getWishProgress(wishes).completed}/{wishes.length}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-[width] duration-700"
                    style={{ width: `${getWishProgress(wishes).progress}%` }}
                  />
                </div>
              </div>
            )}
          </header>

          {isError && <div className="rounded-3xl border border-red-100 bg-white px-5 py-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900"><p className="font-semibold text-slate-800 dark:text-slate-100">위시를 불러오지 못했어요.</p><p className="mt-1 text-sm text-slate-500">데이터베이스 설정과 네트워크를 확인해 주세요.</p><Button className="mt-4" variant="secondary" onPress={() => refetch()}><RefreshCw className="size-4" /> 다시 시도</Button></div>}
          {!isLoading && !isError && wishes.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <WishTypeIcon className={cn("size-14 bg-gradient-to-br shadow-md", meta.accent)} iconClassName="text-white" size={26} tone="dark" type={type} />
              <h2 className="mt-4 font-bold text-slate-800 dark:text-slate-100">아직 담긴 항목이 없어요</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{meta.emptyMessage}</p>
              <Button className="mt-5" onPress={openCreateDrawer}><Plus className="size-4" /> 등록하기</Button>
            </div>
          )}
          {!isLoading && !isError && wishes.length > 0 && filteredWishes.length === 0 && (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <span className="text-3xl" aria-hidden="true">🔎</span>
              <h2 className="mt-3 font-bold text-slate-800 dark:text-slate-100">검색 결과가 없어요</h2>
              <p className="mt-1 text-sm text-slate-500">다른 이름이나 카테고리로 찾아보세요.</p>
              <Button className="mt-4" variant="secondary" onPress={resetSearch}>검색 초기화</Button>
            </div>
          )}
          {!isLoading && !isError && filteredWishes.length > 0 && (
            <ListBox
              aria-label={`${meta.title} 목록`}
              className="-mx-5 flex w-auto flex-col gap-2.5 p-2"
              selectionMode="none"
            >
              {filteredWishes.map((wish) => (
                <WishListItem
                  key={wish.id}
                  completionPending={
                    completionMutation.isPending && completionMutation.variables?.id === wish.id
                  }
                  onCompletionChange={(is_completed) =>
                    completionMutation.mutate({ id: wish.id, is_completed })
                  }
                  onDelete={() => setDeletingWish(wish)}
                  onEdit={() => {
                    setEditingWish(wish);
                    setDrawerSession((current) => current + 1);
                    setDrawerOpen(true);
                  }}
                  thbToKrwRate={thbToKrwRate}
                  type={type}
                  wish={wish}
                />
              ))}
            </ListBox>
          )}
        </section>}
        <ActivityRegisterFab
          ariaLabel={`${meta.title} 등록`}
          drawerOpen={drawerOpen}
          onPress={openCreateDrawer}
          scrollAnchorRef={mainRef}
        />
      </main>
      <WishDrawer key={drawerSession} initialType={type} open={drawerOpen} wish={editingWish} onOpenChange={(open) => {
        setDrawerOpen(open);
        if (!open) setEditingWish(null);
      }} />
      <AlertDialog
        open={deletingWish !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDeletingWish(null);
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 sm:mx-0 dark:bg-red-500/10 dark:text-red-300">
              <Trash2 className="size-5" />
            </div>
            <AlertDialogTitle>위시에서 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="font-semibold text-slate-700 dark:text-slate-200">{deletingWish?.title}</strong>
              을(를) 삭제하면 다시 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2">
            <Button
              fullWidth
              className={drawerCancelButtonClass}
              isDisabled={deleteMutation.isPending}
              onPress={() => setDeletingWish(null)}
              size="lg"
            >
              취소
            </Button>
            <Button
              fullWidth
              className={drawerDangerButtonClass}
              isDisabled={!deletingWish || deleteMutation.isPending}
              onPress={() => deletingWish && deleteMutation.mutate(deletingWish.id)}
              size="lg"
            >
              {deleteMutation.isPending ? "삭제 중…" : "삭제"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </AppScreen>
  );
};

function wishMatchesSearch(wish: WishItem, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  if (!normalizedQuery) return true;

  return [
    wish.title,
    wish.vendor,
    wish.memo,
    ...wish.categories,
  ].some((value) => value?.toLocaleLowerCase("ko-KR").includes(normalizedQuery));
}

function WishListItem({
  wish,
  type,
  thbToKrwRate,
  onDelete,
  onEdit,
  onCompletionChange,
  completionPending,
}: {
  wish: WishItem;
  type: WishType;
  thbToKrwRate: number;
  onDelete: () => void;
  onEdit: () => void;
  onCompletionChange: (is_completed: boolean) => void;
  completionPending: boolean;
}) {
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const priceKrw = wish.target_price_thb === null
    ? null
    : Math.round(wish.target_price_thb * thbToKrwRate);
  const hasPrice = wish.target_price_thb !== null && priceKrw !== null;
  const detailLine = [wish.vendor, wish.memo].filter(Boolean).join(" · ");

  const stopTogglePropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <ListBox.Item
      className="!flex overflow-hidden rounded-[20px] border border-slate-200/90 bg-white px-0 py-0 shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
      id={wish.id}
      textValue={wish.title}
    >
      <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.45 }}>
        <div className="flex w-full items-center gap-3 py-3 pl-3 pr-4">
          <div
            className="shrink-0"
            onClick={stopTogglePropagation}
            onMouseDown={stopTogglePropagation}
            onPointerDown={stopTogglePropagation}
          >
            <WishCompletionToggle
              completed={wish.is_completed}
              disabled={completionPending}
              onToggle={onCompletionChange}
              size="sm"
              type={type}
            />
          </div>

          <MorphingDialogTrigger
            ariaLabel={`${wish.title} 자세히 보기`}
            className="group flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/70"
          >
            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700">
              {wish.images[0] ? (
                <>
                  <MorphingDialogImage alt="" className="size-full object-cover" src={wish.images[0].url} />
                  {wish.images.length > 1 && (
                    <span className="absolute bottom-1 right-1 rounded-full border border-white/30 bg-slate-950/75 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-sm backdrop-blur-sm">
                      +{wish.images.length - 1}
                    </span>
                  )}
                </>
              ) : (
                <ImageIcon aria-hidden="true" className="size-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <MorphingDialogTitle>
                <Label className="w-full truncate text-[15px] font-extrabold tracking-[-0.01em] text-slate-900 dark:text-white">
                  {wish.title}
                </Label>
              </MorphingDialogTitle>

              {detailLine && (
                <Description className="mt-1 line-clamp-1 text-[11px] font-semibold text-slate-500! dark:text-slate-400!">
                  {detailLine}
                </Description>
              )}

              {wish.categories.length > 0 && (
                <div className="mt-1.5 flex min-w-0 items-center gap-1 overflow-hidden">
                  {wish.categories.slice(0, 2).map((category) => (
                    <Chip key={category} color="accent" size="sm" variant="soft">
                      {category}
                    </Chip>
                  ))}
                  {wish.categories.length > 2 && (
                    <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                      +{wish.categories.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {hasPrice && (
              <div className="flex shrink-0 self-stretch flex-col items-end py-0.5 text-right">
                <ExpenseCurrencyPair krw={priceKrw} thb={wish.target_price_thb!} />
              </div>
            )}
          </MorphingDialogTrigger>
        </div>

        <MorphingDialogContainer>
        <MorphingDialogContent className="relative mx-4 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
          <MorphingDialogClose className="right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur" />
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="relative">
              <WishImageGallery images={wish.images} title={wish.title} onImagePress={(index) => { setZoomImageIndex(index); setZoomModalOpen(true); }} />
              {wish.images.length > 0 && <Button className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-md" onPress={() => { setZoomImageIndex(0); setZoomModalOpen(true); }} size="sm"><ZoomIn className="size-3.5" /><span>탭하여 확대</span></Button>}
            </div>

            <div className="px-5 py-4">
              {/* Category Chips */}
              {wish.categories.length > 0 && (
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {wish.categories.map((category) => (
                    <Chip key={category} color="accent" size="sm" variant="soft">
                      {category}
                    </Chip>
                  ))}
                </div>
              )}

              {/* Product Title */}
              <MorphingDialogTitle>
                <h2 className="text-xl font-extrabold leading-snug text-slate-900 dark:text-white">
                  {wish.title}
                </h2>
              </MorphingDialogTitle>

              {/* Price Section */}
              {hasPrice && (
                <div className="mt-2 flex justify-end">
                  <ExpenseCurrencyPair
                    krw={priceKrw}
                    mainSize="hero"
                    secondarySize="secondary"
                    thb={wish.target_price_thb!}
                  />
                </div>
              )}

              {/* Product Details & Specs Section */}
              <MorphingDialogDescription disableLayoutAnimation className="mt-3 flex flex-col gap-2.5">
                {wish.vendor && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100/60 dark:border-slate-800/60">
                    <span className="text-xs font-semibold text-slate-400">
                      {type === "restaurant" || type === "menu" ? "식당 · 지점" : "판매처"}
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {wish.vendor}
                    </span>
                  </div>
                )}

                {wish.locations.length > 0 && (
                  <DetailLinkGroup
                    icon={<MapPin className="size-3.5" />}
                    isMap
                    items={wish.locations.map((location, index) => ({
                      href: location,
                      label: `Google Maps 위치 ${index + 1}`,
                    }))}
                    title="위치 지도"
                  />
                )}

                {wish.links.length > 0 && (
                  <DetailLinkGroup
                    icon={<Link2 className="size-3.5" />}
                    items={wish.links.map((link) => ({ href: link, label: link }))}
                    title="관련 링크"
                  />
                )}

                {wish.memo && (
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-slate-400">메모</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {wish.memo}
                    </p>
                  </div>
                )}
              </MorphingDialogDescription>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
            <WishCompletionToggle
              className="mb-3 w-full"
              completed={wish.is_completed}
              disabled={completionPending}
              onToggle={onCompletionChange}
              size="lg"
              type={type}
              variant="button"
            />
            <div className="flex items-center gap-2">
              <Button
                aria-label={`${wish.title} 삭제`}
                className="flex h-11 w-11 min-w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
                isIconOnly
                onPress={onDelete}
                size="lg"
                variant="ghost"
              >
                <Trash2 className="size-4.5" />
              </Button>
              <MorphingDialogClose
                ariaLabel="다이얼로그 닫기"
                className={cn("static flex-1", dialogFooterSecondaryButtonClass)}
                footerAction
              >
                닫기
              </MorphingDialogClose>
              <MorphingDialogClose
                ariaLabel={`${wish.title} 편집`}
                className={cn("static flex-1", dialogFooterPrimaryButtonClass)}
                footerAction
                onClick={onEdit}
              >
                <Pencil className="size-4" />
                편집
              </MorphingDialogClose>
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>

      {wish.images[zoomImageIndex] && (
        <ImageZoomModal
          isOpen={zoomModalOpen}
          onClose={() => setZoomModalOpen(false)}
          src={wish.images[zoomImageIndex].url}
          title={wish.title}
        />
      )}
      </MorphingDialog>
    </ListBox.Item>
  );
}



function formatLinkUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host.includes("instagram")) return "인스타그램";
    if (host.includes("google") && parsed.pathname.includes("maps")) return "구글 맵스 지도";
    if (host.includes("naver")) return "네이버 페이지";
    if (host.includes("youtube")) return "유튜브 영상";
    return host;
  } catch {
    return url;
  }
}

function DetailLinkGroup({
  icon,
  items,
  title,
  isMap = false,
}: {
  icon: ReactNode;
  items: { href: string; label: string }[];
  title: string;
  isMap?: boolean;
}) {
  return (
    <div className="py-1">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-400">
        {icon}
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const displayLabel = isMap
            ? items.length > 1 ? `구글 맵스 위치 ${index + 1}` : "구글 맵스에서 위치 확인"
            : formatLinkUrl(item.href);

          return (
            <a
              key={item.href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100/90 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700"
              href={item.href}
              rel="noreferrer"
              target="_blank"
            >
              <span className="min-w-0 max-w-[200px] truncate">{displayLabel}</span>
              <ArrowUpRight className="size-3.5 shrink-0 opacity-60" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
