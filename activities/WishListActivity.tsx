import React, { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ArrowUpRight, Image as ImageIcon, Link2, MapPin, Pencil, Plus, RefreshCw, RotateCcw, Store, Trash2, ZoomIn } from "lucide-react";
import { Button, Chip } from "@heroui/react";
import { toast } from "sonner";
import { WishDrawer } from "@/components/wish/WishDrawer";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { ImageZoomModal } from "@/components/ui/image-zoom-modal";
import { GooeyInput } from "@/components/ui/gooey-input";
import { triggerHapticFeedback } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
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
  formatThaiBaht,
  isWishType,
  WISH_TYPE_META,
  type WishItem,
  type WishType,
} from "@/lib/wishes";

interface WishListActivityProps { params: { type?: string } }

const fetchWishes = async (type: WishType): Promise<WishItem[]> => {
  const response = await fetch(`/api/wishes?type=${type}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "위시를 불러오지 못했습니다.");
  return payload.data;
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
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const { data: wishes = [], isError, isLoading, refetch } = useQuery({ queryKey: ["wishes", type], queryFn: () => fetchWishes(type) });
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

  const filteredWishes = useMemo(
    () =>
      wishes.filter((wish) => {
        const matchesSearch = wishMatchesSearch(wish, deferredSearchQuery);
        const matchesCategory =
          selectedCategory === "전체" || wish.categories.includes(selectedCategory);
        return matchesSearch && matchesCategory;
      }),
    [deferredSearchQuery, selectedCategory, wishes],
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
    <AppScreen appBar={{ title: meta.title }}>
      <main className="min-h-full w-full bg-slate-50 pb-12 dark:bg-slate-950">
        <section className="mx-auto flex w-full max-w-lg flex-col gap-4 px-5 pt-5">
          <div
            aria-label={`${meta.title} 검색 및 필터`}
            className="sticky top-0 z-30 -mx-2 flex min-h-14 items-center justify-center px-2 py-2 backdrop-blur-md"
            data-slot="wish-filter-toolbar"
            role="search"
          >
            <GooeyInput
              className="w-full"
              fullWidthOnExpand
              onOpenChange={setSearchOpen}
              onValueChange={setSearchQuery}
              open={searchOpen}
              placeholder={`${meta.title.replace(" 정보", "")} 검색`}
              value={searchQuery}
            />
          </div>

          {/* Category Filter Chips & Status Bar */}
          {!isLoading && !isError && wishes.length > 0 && (
            <div className="-mt-1 flex flex-col gap-3">
              {/* Category Filter Chips */}
              {availableCategories.length > 1 && (
                <div className="-mx-5 flex items-center gap-1.5 overflow-x-auto px-5 no-scrollbar py-0.5">
                  {availableCategories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          triggerHapticFeedback(10);
                          setSelectedCategory(cat);
                        }}
                        type="button"
                        className={cn(
                          "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95",
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                            : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Result Count & Clear Status */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>
                    {searchQuery || selectedCategory !== "전체" ? "검색/필터 결과" : "전체"}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {filteredWishes.length}건
                  </span>
                  {(searchQuery || selectedCategory !== "전체") && (
                    <span className="text-[11px] text-slate-400">
                      (총 {wishes.length}건)
                    </span>
                  )}
                </div>

                {(searchQuery || selectedCategory !== "전체") && (
                  <button
                    onClick={() => {
                      triggerHapticFeedback(10);
                      setSearchQuery("");
                      setSelectedCategory("전체");
                    }}
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <RotateCcw className="size-3" />
                    필터 초기화
                  </button>
                )}
              </div>
            </div>
          )}

          <header className={`rounded-3xl bg-gradient-to-br ${meta.accent} px-5 py-5 text-white shadow-lg shadow-slate-200/70 dark:shadow-none`}>
            <p className="text-2xl" aria-hidden="true">{meta.icon}</p>
            <h1 className="mt-2 text-xl font-extrabold">{meta.title}</h1>
            <p className="mt-1 text-sm text-white/80">{meta.description}</p>
          </header>

          {isLoading && (
            <div className="-mx-5 divide-y divide-slate-200 dark:divide-slate-800">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex h-24 animate-pulse items-center gap-3 px-5">
                  <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {isError && <div className="rounded-3xl border border-red-100 bg-white px-5 py-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900"><p className="font-semibold text-slate-800 dark:text-slate-100">위시를 불러오지 못했어요.</p><p className="mt-1 text-sm text-slate-500">데이터베이스 설정과 네트워크를 확인해 주세요.</p><Button className="mt-4" variant="secondary" onPress={() => refetch()}><RefreshCw className="size-4" /> 다시 시도</Button></div>}
          {!isLoading && !isError && wishes.length === 0 && <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900"><span className="text-4xl" aria-hidden="true">{meta.icon}</span><h2 className="mt-3 font-bold text-slate-800 dark:text-slate-100">아직 담긴 항목이 없어요</h2><p className="mt-1 text-sm leading-6 text-slate-500">{meta.emptyMessage}</p><Button className="mt-5" onPress={openCreateDrawer}><Plus className="size-4" /> 등록하기</Button></div>}
          {!isLoading && !isError && wishes.length > 0 && filteredWishes.length === 0 && (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">
              <span className="text-3xl" aria-hidden="true">🔎</span>
              <h2 className="mt-3 font-bold text-slate-800 dark:text-slate-100">검색 결과가 없어요</h2>
              <p className="mt-1 text-sm text-slate-500">다른 이름이나 카테고리로 찾아보세요.</p>
              <Button className="mt-4" variant="secondary" onPress={resetSearch}>검색 초기화</Button>
            </div>
          )}
          {!isLoading && !isError && filteredWishes.length > 0 && (
            <div
              className="-mx-5 divide-y divide-slate-200 dark:divide-slate-800"
              role="list"
            >
              {filteredWishes.map((wish) => (
                <WishListItem
                  key={wish.id}
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
            </div>
          )}
        </section>
        <div className="fixed bottom-6 right-5 z-40 h-14 min-w-14">
          <Button aria-label={`${meta.title} 등록`} className="h-full w-full rounded-full px-5 shadow-xl" onPress={openCreateDrawer}><Plus className="size-5" /><span className="font-bold">등록</span></Button>
          <NativeHapticSwitch
            ariaLabel={`${meta.title} 등록`}
            checked={drawerOpen}
            onChange={openCreateDrawer}
          />
        </div>
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
            <button
              className="h-12 rounded-xl bg-white font-semibold text-slate-600 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:bg-white/5 dark:text-slate-200 dark:ring-slate-700"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingWish(null)}
              type="button"
            >
              취소
            </button>
            <button
              className="h-12 rounded-xl bg-red-500 font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              disabled={!deletingWish || deleteMutation.isPending}
              onClick={() => deletingWish && deleteMutation.mutate(deletingWish.id)}
              type="button"
            >
              {deleteMutation.isPending ? "삭제 중…" : "삭제"}
            </button>
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
}: {
  wish: WishItem;
  type: WishType;
  thbToKrwRate: number;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const price = formatThaiBaht(wish.target_price_thb);
  const priceKrw = wish.target_price_thb === null
    ? null
    : Math.round(wish.target_price_thb * thbToKrwRate);

  return (
    <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.45 }}>
      <MorphingDialogTrigger
        ariaLabel={`${wish.title} 자세히 보기`}
        className="group block w-full text-left outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        <article className="flex min-h-24 items-center gap-3 px-5 py-3 transition-colors group-hover:bg-slate-100/70 group-active:bg-slate-200/70 dark:group-hover:bg-white/5 dark:group-active:bg-white/10" role="listitem">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
              {wish.image_url ? (
                <MorphingDialogImage alt="" className="size-full object-cover" src={wish.image_url} />
              ) : (
                <ImageIcon aria-hidden="true" className="size-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <MorphingDialogTitle className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">{wish.title}</h2>
                </MorphingDialogTitle>
                {price && <span className="shrink-0 text-sm font-bold tabular-nums text-slate-800 dark:text-slate-200">฿{price}</span>}
              </div>
              {wish.categories.length > 0 && (
                <div className="mt-1.5 flex min-w-0 items-center gap-1 overflow-hidden">
                  {wish.categories.slice(0, 2).map((category) => <Chip key={category} color="accent" size="sm" variant="soft">{category}</Chip>)}
                  {wish.categories.length > 2 && <span className="shrink-0 text-[11px] font-semibold text-slate-400">+{wish.categories.length - 2}</span>}
                </div>
              )}
              <div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-slate-500">
                {wish.vendor && <span className="flex min-w-0 items-center gap-1"><Store className="size-3 shrink-0" /><span className="truncate">{wish.vendor}</span></span>}
                {wish.vendor && wish.memo && <span aria-hidden="true" className="shrink-0 text-slate-300 dark:text-slate-700">·</span>}
                {wish.memo && <span className="min-w-0 truncate">{wish.memo}</span>}
              </div>
            </div>
        </article>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="relative mx-4 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
          <MorphingDialogClose className="right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur" />
          
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto">
            {wish.image_url ? (
              <div className="relative">
                <MorphingDialogImage
                  alt={`${wish.title} 이미지`}
                  className="h-56 w-full cursor-pointer object-cover"
                  onClick={() => setZoomModalOpen(true)}
                  src={wish.image_url}
                />
                <button
                  type="button"
                  onClick={() => setZoomModalOpen(true)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-md transition hover:bg-black/85"
                >
                  <ZoomIn className="size-3.5" />
                  <span>탭하여 확대</span>
                </button>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-900">
                <ImageIcon aria-hidden="true" className="size-10" />
              </div>
            )}

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
              {price && priceKrw !== null && (
                <div className="mt-1 flex items-center gap-1.5 text-sm tabular-nums">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ฿ {wish.target_price_thb!.toLocaleString()}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    약 {priceKrw.toLocaleString()}원
                  </span>
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
            <div className="flex items-center gap-2">
              <button
                aria-label={`${wish.title} 삭제`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                onClick={onDelete}
                type="button"
              >
                <Trash2 className="size-4.5" />
              </button>
              <MorphingDialogClose
                ariaLabel="다이얼로그 닫기"
                className="static flex h-11 flex-1 items-center justify-center rounded-xl bg-slate-100 font-semibold text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                닫기
              </MorphingDialogClose>
              <MorphingDialogClose
                ariaLabel={`${wish.title} 편집`}
                className="static flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 font-bold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                onClick={onEdit}
              >
                <Pencil className="size-4" />
                편집
              </MorphingDialogClose>
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>

      {wish.image_url && (
        <ImageZoomModal
          isOpen={zoomModalOpen}
          onClose={() => setZoomModalOpen(false)}
          src={wish.image_url}
          title={wish.title}
        />
      )}
    </MorphingDialog>
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


