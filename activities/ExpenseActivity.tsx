"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Button, Label, Radio, RadioGroup, Tabs } from "@heroui/react";
import { Filter, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ExpenseDrawer } from "@/components/expense/ExpenseDrawer";
import { ExpenseChartSkeleton, ExpenseListSkeleton } from "@/components/expense/ExpenseListSkeleton";
import { ExpenseCurrencyPair, ExpenseDaySummary } from "@/components/expense/currency-display";
import { ExpenseReceiptDetail } from "@/components/expense/ExpenseReceiptDetail";
import { ExpenseSummaryHeader } from "@/components/expense/ExpenseSummaryHeader";
import { ActivityRegisterFab } from "@/components/ui/activity-register-fab";
import { CompactSegmentedTabsList } from "@/components/ui/compact-segmented-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { ClockIcon } from "@/components/ui/clock";
import { DrawerFieldLabel, drawerCancelButtonClass, drawerPrimaryButtonClass } from "@/components/ui/drawer-form";
import { GalleryThumbnailsIcon } from "@/components/ui/gallery-thumbnails";
import { LayersIcon } from "@/components/ui/layers";
import { ReceiptIcon } from "@/components/ui/receipt";
import { ScanTextIcon } from "@/components/ui/scan-text";
import { UsersRoundIcon } from "@/components/ui/users-round";
import { WalletIcon } from "@/components/ui/wallet";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  MorphingDialog,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_META,
  EXPENSE_PEOPLE,
  EXPENSE_PERSON_META,
  formatBangkokDate,
  formatBangkokDateKey,
  formatBangkokTime,
  getEffectiveKrw,
  getExpenseCategoryColor,
  getExpenseCategoryKey,
  getExpenseCategoryLabel,
  summarizeExpenses,
  type Expense,
  type ExpenseCategory,
  type ExpensePerson,
} from "@/lib/expenses";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ExpenseCharts = dynamic(() => import("@/components/expense/ExpenseCharts").then((module) => module.ExpenseCharts), {
  ssr: false,
  loading: () => <ExpenseChartSkeleton />,
});

const fetchExpenses = async (): Promise<Expense[]> => {
  const response = await fetch("/api/expenses");
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "지출 내역을 불러오지 못했어요.");
  return payload.data;
};

type PersonFilter = "all" | ExpensePerson;
type CategoryFilter = "all" | ExpenseCategory | `custom:${string}`;
type CategoryOption = { value: CategoryFilter; label: string };

export const ExpenseActivity: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("list");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSession, setDrawerSession] = useState(0);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSession, setFilterSession] = useState(0);
  const [person, setPerson] = useState<PersonFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("ko-KR"));
  const query = useQuery({ queryKey: ["expenses"], queryFn: fetchExpenses });
  const listScrollRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const channel = supabase.channel("expenses_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, () => queryClient.invalidateQueries({ queryKey: ["expenses"] }))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);

  const expenses = useMemo(() => query.data ?? [], [query.data]);
  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const customCategories = Array.from(new Set(expenses.map((expense) => expense.custom_category).filter((value): value is string => Boolean(value))));
    return [
      ...EXPENSE_CATEGORIES.map((value) => ({ value, label: EXPENSE_CATEGORY_META[value].label })),
      ...customCategories.map((label) => ({ value: `custom:${label}` as const, label })),
    ];
  }, [expenses]);
  const filtered = useMemo(() => expenses.filter((expense) => {
    const date = formatBangkokDateKey(expense.purchased_at);
    const matchesPerson = person === "all" || expense.payer === person || (person === "gahyun" ? expense.share_gahyun_thb > 0 : expense.share_minu_thb > 0);
    const matchesCategory = category === "all" || getExpenseCategoryKey(expense) === category;
    const matchesDate = (!from || date >= from) && (!to || date <= to);
    const matchesSearch = !deferredSearch || [expense.item_name, expense.custom_category, expense.merchant, expense.memo].some((value) => value?.toLocaleLowerCase("ko-KR").includes(deferredSearch));
    return matchesPerson && matchesCategory && matchesDate && matchesSearch;
  }), [category, deferredSearch, expenses, from, person, to]);
  const grouped = useMemo(() => {
    const groups = new Map<string, Expense[]>();
    filtered.forEach((expense) => {
      const key = formatBangkokDateKey(expense.purchased_at);
      groups.set(key, [...(groups.get(key) ?? []), expense]);
    });
    return Array.from(groups, ([date, items]) => ({ date, items }));
  }, [filtered]);
  const filtersActive = person !== "all" || category !== "all" || Boolean(from) || Boolean(to);
  const initialError = query.isError && !query.data;

  const remove = useMutation({
    mutationFn: async (expense: Expense) => {
      const response = await fetch(`/api/expenses?id=${expense.id}`, { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "지출을 삭제하지 못했어요.");
      return payload.data;
    },
    onSuccess: async (data) => {
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(data.storage_cleanup_warning ? "내역은 삭제했지만 일부 사진 정리가 지연되고 있어요." : "지출을 삭제했어요.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."),
  });

  const openCreate = () => { setEditing(null); setDrawerSession((value) => value + 1); setDrawerOpen(true); };
  const openEdit = (expense: Expense) => { setEditing(expense); setDrawerSession((value) => value + 1); setDrawerOpen(true); };
  const openFilters = () => { setFilterSession((value) => value + 1); setFilterOpen(true); };
  const clearFilters = () => { setPerson("all"); setCategory("all"); setFrom(""); setTo(""); };

  return <AppScreen appBar={{ title: "가현짱, 렌탈 영수증 발행!" }}>
    <main ref={mainRef} className="flex h-[calc(100svh-56px)] w-full max-w-full flex-col overflow-hidden bg-white dark:bg-slate-950">
      <Tabs aria-label="가계부 보기" selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(String(key))} className="flex min-h-0 w-full min-w-0 max-w-full flex-1 flex-col">
        <div className="z-30 shrink-0 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
          <CompactSegmentedTabsList ariaLabel="가계부 내역과 통계" items={[{ id: "list", label: "내역" }, { id: "stats", label: "통계" }]} />
        </div>
        <Tabs.Panel className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden !p-0" id="list">
          {query.isLoading ? (
            <div className="expense-list-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[calc(6rem+max(env(safe-area-inset-bottom,0px),12px))]">
              <ExpenseListSkeleton />
            </div>
          ) : initialError ? <LoadError onRetry={() => query.refetch()} /> : <div ref={listScrollRef} className="expense-list-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[calc(6rem+max(env(safe-area-inset-bottom,0px),12px))]">
            <ExpenseSummaryHeader expenses={filtered} scrollRef={listScrollRef} />
            <section className="mx-auto w-full min-w-0 max-w-lg px-4 pb-4 pt-3">
            {query.isError && query.data && <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"><span>최근 데이터를 표시 중이에요.</span><button className="min-h-8 px-2 font-bold" onClick={() => query.refetch()} type="button">다시 연결</button></div>}
            <div className="flex items-center gap-2">
              <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900"><Search className="size-4 shrink-0 text-slate-400" /><input aria-label="지출 검색" className="min-w-0 flex-1 bg-transparent text-sm outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="품목, 상호, 메모 검색" value={search} />{search && <button aria-label="검색어 지우기" className="grid size-8 shrink-0 place-items-center" onClick={() => setSearch("")} type="button"><X className="size-4" /></button>}</label>
              <button aria-label="지출 필터" className={cn("relative grid size-11 shrink-0 place-items-center rounded-xl border bg-white dark:bg-slate-900", filtersActive ? "border-blue-500 text-blue-600" : "border-slate-200 text-slate-500 dark:border-slate-800")} onClick={openFilters} type="button"><Filter className="size-4" />{filtersActive && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-500" />}</button>
            </div>
            {expenses.length === 0 ? <EmptyState onCreate={openCreate} /> : filtered.length === 0 ? <div className="py-16 text-center"><p className="font-bold">조건에 맞는 지출이 없어요.</p><button className="mt-3 min-h-11 px-4 text-sm font-bold text-blue-600" onClick={clearFilters} type="button">필터 초기화</button></div> : <div className="mt-6 space-y-5">{grouped.map((group) => <section key={group.date}><ExpenseDayHeader items={group.items} /><div className="mt-2 overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_-26px_rgba(15,23,42,0.55)] ring-1 ring-black/[0.055] dark:bg-slate-900 dark:ring-white/10">{group.items.map((expense, index) => <ExpenseRow expense={expense} key={expense.id} onDelete={() => setDeleting(expense)} onEdit={() => openEdit(expense)} showDivider={index < group.items.length - 1} />)}</div></section>)}</div>}
          </section></div>}
        </Tabs.Panel>
        <Tabs.Panel className="min-h-0 min-w-0 max-w-full flex-1 overflow-y-auto overscroll-contain !p-0 pb-[calc(6rem+max(env(safe-area-inset-bottom,0px),12px))]" id="stats">
          {selectedTab === "stats" && (query.isLoading ? <div className="mx-auto w-full min-w-0 max-w-lg px-4 py-4"><ExpenseChartSkeleton /></div> : initialError ? <LoadError onRetry={() => query.refetch()} /> : <section className="mx-auto w-full min-w-0 max-w-lg px-4 py-4">{expenses.length ? <ExpenseCharts expenses={filtered} /> : <EmptyState onCreate={openCreate} />}</section>)}
        </Tabs.Panel>
      </Tabs>
    </main>
    <ActivityRegisterFab
      ariaLabel="지출 등록"
      drawerOpen={drawerOpen}
      onPress={openCreate}
      scrollAnchorRef={mainRef}
      scrollElementRef={listScrollRef}
      scrollKey={`${selectedTab}-${query.isLoading ? "loading" : "ready"}`}
    />
    <ExpenseDrawer key={`expense-${drawerSession}`} expense={editing} open={drawerOpen} onOpenChange={setDrawerOpen} />
    <FilterDrawer key={`filter-${filterSession}`} category={category} categoryOptions={categoryOptions} from={from} open={filterOpen} person={person} to={to} onApply={({ person: nextPerson, category: nextCategory, from: nextFrom, to: nextTo }) => { setPerson(nextPerson); setCategory(nextCategory); setFrom(nextFrom); setTo(nextTo); }} onOpenChange={setFilterOpen} />
    <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => { if (!next && !remove.isPending) setDeleting(null); }}><AlertDialogPopup><AlertDialogHeader><div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-500"><Trash2 className="size-5" /></div><AlertDialogTitle>지출을 삭제할까요?</AlertDialogTitle><AlertDialogDescription><strong>{deleting?.item_name}</strong> 내역과 영수증 사진이 함께 삭제돼요.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="grid grid-cols-2"><button className="h-12 rounded-xl bg-white font-bold ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700" disabled={remove.isPending} onClick={() => setDeleting(null)} type="button">취소</button><button className="h-12 rounded-xl bg-red-500 font-bold text-white disabled:opacity-50" disabled={!deleting || remove.isPending} onClick={() => deleting && remove.mutate(deleting)} type="button">{remove.isPending ? "삭제 중…" : "삭제"}</button></AlertDialogFooter></AlertDialogPopup></AlertDialog>
  </AppScreen>;
};

function ExpenseDayHeader({ items }: { items: Expense[] }) {
  const summary = summarizeExpenses(items);
  return <header className="expense-day-header sticky z-20 -mx-1 flex min-w-0 items-center justify-between gap-3 rounded-xl bg-white px-2 py-1.5 dark:bg-slate-950">
    <h2 className="min-w-0 truncate text-[13px] font-extrabold tracking-[-0.01em] text-slate-800 dark:text-slate-100">{formatBangkokDate(items[0].purchased_at)}</h2>
    <ExpenseDaySummary count={summary.count} krw={summary.totalKrw} thb={summary.totalThb} />
  </header>;
}

function ExpenseRow({ expense, onEdit, onDelete, showDivider }: { expense: Expense; onEdit: () => void; onDelete: () => void; showDivider: boolean }) {
  const categoryLabel = getExpenseCategoryLabel(expense);
  const categoryColor = getExpenseCategoryColor(expense);
  const users = EXPENSE_PEOPLE.filter((person) => person === "gahyun" ? expense.share_gahyun_thb > 0 : expense.share_minu_thb > 0);
  const coverImage = expense.images[0];
  return <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.42 }}>
    <MorphingDialogTrigger ariaLabel={`${expense.item_name} 상세 보기`} className="group relative block w-full max-w-full text-left outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500">
      <article className="flex min-h-[80px] min-w-0 items-center gap-3 px-3.5 py-3 transition-[background-color,transform] duration-150 hover:bg-slate-50/80 active:scale-[0.995] active:bg-slate-100 motion-reduce:transition-none dark:hover:bg-white/5 dark:active:bg-white/10">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-[11px]" style={{ backgroundColor: `${categoryColor}10`, color: categoryColor }}>
          {coverImage ? <Image alt="" className="size-full object-cover" height={88} src={coverImage.url} unoptimized width={88} /> : <div className="relative grid size-full place-items-center border border-dashed" style={{ borderColor: `${categoryColor}45` }}><ReceiptIcon animateOnMount aria-hidden="true" size={20} /><span aria-hidden="true" className="absolute inset-x-2 bottom-1.5 border-b border-dashed opacity-25" /></div>}
          {expense.images.length > 1 && <span className="absolute bottom-1 right-1 grid min-w-4 place-items-center rounded-full bg-slate-950/75 px-1 py-0.5 text-[8px] font-black leading-none text-white backdrop-blur">+{expense.images.length - 1}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <MorphingDialogTitle><h3 className="truncate text-[15px] font-extrabold tracking-[-0.01em] text-slate-900 dark:text-white">{expense.item_name}</h3></MorphingDialogTitle>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] font-semibold text-slate-500">
            <div className="flex max-w-28 shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold" style={{ backgroundColor: `${categoryColor}12`, color: categoryColor }}><LayersIcon aria-hidden="true" className="shrink-0" size={10} /><span className="truncate">{categoryLabel}</span></div>
            {expense.merchant && <><span className="text-slate-300">·</span><div className="flex min-w-0 items-center gap-1"><ScanTextIcon aria-hidden="true" className="shrink-0" size={11} /><span className="truncate">{expense.merchant}</span></div></>}
          </div>
          <div className="mt-1.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[10px] font-semibold text-slate-400">
            <div aria-label={`${EXPENSE_PERSON_META[expense.payer].label} 결제`} className="flex shrink-0 items-center gap-1"><WalletIcon aria-hidden="true" className="shrink-0" size={11} /><FilterPersonAvatar compact person={expense.payer} /></div>
            <span className="text-slate-300">·</span>
            <div aria-label={`비용 사용자 ${users.map((person) => EXPENSE_PERSON_META[person].label).join(", ")}`} className="flex shrink-0 items-center gap-1"><UsersRoundIcon aria-hidden="true" className="shrink-0" size={11} /><span className="flex -space-x-1">{users.map((person) => <FilterPersonAvatar compact key={person} person={person} />)}</span></div>
            {expense.images.length > 0 && <><span className="text-slate-300">·</span><GalleryThumbnailsIcon aria-hidden="true" className="shrink-0" size={12} /><span>{expense.images.length}</span></>}
          </div>
        </div>
        <div className="flex shrink-0 self-stretch flex-col items-end py-0.5 text-right">
          <ExpenseCurrencyPair krw={getEffectiveKrw(expense)} thb={expense.amount_thb} />
          <div aria-label={`구매 시간 ${formatBangkokTime(expense.purchased_at)}`} className="mt-auto flex items-center gap-1 text-[10px] font-semibold tabular-nums text-slate-400"><ClockIcon aria-hidden="true" size={10} /><span>{formatBangkokTime(expense.purchased_at)}</span></div>
        </div>
      </article>
      {showDivider && <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-[4.75rem] right-3.5 h-px bg-slate-100 dark:bg-slate-800" />}
    </MorphingDialogTrigger>
    <MorphingDialogContainer>
      <MorphingDialogContent className="relative mx-3 flex max-h-[88dvh] w-[calc(100%_-_1.5rem)] max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-950">
        <ExpenseReceiptDetail categoryColor={categoryColor} expense={expense} onDelete={onDelete} onEdit={onEdit} />
      </MorphingDialogContent>
    </MorphingDialogContainer>
  </MorphingDialog>;
}

function FilterDrawer({ open, person, category, categoryOptions, from, to, onOpenChange, onApply }: { open: boolean; person: PersonFilter; category: CategoryFilter; categoryOptions: CategoryOption[]; from: string; to: string; onOpenChange: (open: boolean) => void; onApply: (filter: { person: PersonFilter; category: CategoryFilter; from: string; to: string }) => void }) {
  const [draftPerson, setDraftPerson] = useState<PersonFilter>(person);
  const [draftCategory, setDraftCategory] = useState<CategoryFilter>(category);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  const resetDraft = () => {
    setDraftPerson("all");
    setDraftCategory("all");
    setDraftFrom("");
    setDraftTo("");
  };

  return <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerPopup variant="inset" showBar className="overflow-hidden">
      <DrawerHeader className="px-4 pb-1 pt-5 text-center sm:px-6 sm:pt-6"><DrawerTitle>지출 필터</DrawerTitle></DrawerHeader>
      <DrawerPanel scrollable={false} className="flex min-h-0 flex-1 touch-pan-y flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-2 sm:gap-5 sm:px-6 sm:py-3">
        <RadioGroup className="gap-2" name="expense-filter-person" value={draftPerson} onChange={(value) => setDraftPerson(value as PersonFilter)}>
          <Label><DrawerFieldLabel icon={UsersRoundIcon} active={open}>사용자</DrawerFieldLabel></Label>
          <div className="flex flex-row flex-wrap gap-x-6 gap-y-3 pt-1">
            <Radio value="all"><Radio.Content><Radio.Control><Radio.Indicator /></Radio.Control><span>전체</span></Radio.Content></Radio>
            {EXPENSE_PEOPLE.map((value) => <Radio key={value} value={value}><Radio.Content><Radio.Control><Radio.Indicator /></Radio.Control><FilterPersonAvatar person={value} /><span>{EXPENSE_PERSON_META[value].label}</span></Radio.Content></Radio>)}
          </div>
        </RadioGroup>
        <RadioGroup className="gap-2" name="expense-filter-category" value={draftCategory} onChange={(value) => setDraftCategory(value as CategoryFilter)}>
          <Label><DrawerFieldLabel icon={LayersIcon} active={open}>카테고리</DrawerFieldLabel></Label>
          <div className="flex flex-row flex-wrap gap-x-5 gap-y-3 pt-1">
            <Radio value="all"><Radio.Content><Radio.Control><Radio.Indicator /></Radio.Control><span>전체</span></Radio.Content></Radio>
            {categoryOptions.map((option) => <Radio key={option.value} value={option.value}><Radio.Content><Radio.Control><Radio.Indicator /></Radio.Control><span>{option.label}</span></Radio.Content></Radio>)}
          </div>
        </RadioGroup>
        <section className="space-y-2"><DrawerFieldLabel icon={CalendarDaysIcon} active={open}>날짜 범위</DrawerFieldLabel><div className="grid min-w-0 grid-cols-2 gap-2"><input aria-label="시작 날짜" className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900" max={draftTo || undefined} onChange={(event) => setDraftFrom(event.target.value)} type="date" value={draftFrom} /><input aria-label="종료 날짜" className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-900" min={draftFrom || undefined} onChange={(event) => setDraftTo(event.target.value)} type="date" value={draftTo} /></div></section>
      </DrawerPanel>
      <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pt-4"><Button fullWidth className={drawerCancelButtonClass} onPress={resetDraft} size="lg" type="button">초기화</Button><Button fullWidth className={drawerPrimaryButtonClass} onPress={() => { onApply({ person: draftPerson, category: draftCategory, from: draftFrom, to: draftTo }); onOpenChange(false); }} size="lg" type="button">적용</Button></DrawerFooter>
    </DrawerPopup>
  </Drawer>;
}

function FilterPersonAvatar({ person, compact = false }: { person: ExpensePerson; compact?: boolean }) {
  const meta = EXPENSE_PERSON_META[person];
  return <Avatar className={compact ? "!size-4 shrink-0 ring-1 ring-white dark:ring-slate-900" : undefined} color={person === "gahyun" ? "accent" : "success"} size="sm"><AvatarImage alt="" src={meta.image} /><AvatarFallback>{person === "gahyun" ? "G" : "M"}</AvatarFallback></Avatar>;
}

function EmptyState({ onCreate }: { onCreate: () => void }) { return <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900"><ReceiptIcon animateOnMount aria-hidden="true" size={24} /></div><h2 className="mt-4 font-extrabold">아직 지출 내역이 없어요</h2><p className="mt-1 text-sm text-slate-500">태국에서 쓴 첫 비용을 기록해 보세요.</p><Button className="mt-5" onPress={onCreate}><Plus className="size-4" />첫 지출 등록</Button></div>; }
function LoadError({ onRetry }: { onRetry: () => void }) { return <div className="mx-auto flex min-h-80 max-w-lg flex-col items-center justify-center px-4 text-center"><p className="font-extrabold">지출 내역을 불러오지 못했어요.</p><p className="mt-1 text-sm text-slate-500">기존 데이터가 있다면 화면에 유지되고 다시 연결을 시도할 수 있어요.</p><Button className="mt-4" onPress={onRetry} variant="secondary"><RefreshCw className="size-4" />다시 시도</Button></div>; }
