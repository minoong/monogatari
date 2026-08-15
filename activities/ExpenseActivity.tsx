"use client";

import dynamic from "next/dynamic";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { Button, Skeleton, Tabs } from "@heroui/react";
import { Camera, Filter, Pencil, Plus, ReceiptText, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ExpenseDrawer } from "@/components/expense/ExpenseDrawer";
import { CompactSegmentedTabsList } from "@/components/ui/compact-segmented-tabs";
import { NativeHapticSwitch } from "@/components/ui/native-haptic-switch";
import { Button as BaseButton } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { WishImageGallery } from "@/components/wish/WishImageGallery";
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
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_META,
  EXPENSE_PAYMENT_META,
  EXPENSE_PEOPLE,
  EXPENSE_PERSON_META,
  formatBangkokDate,
  formatBangkokDateKey,
  formatBangkokTime,
  formatKrw,
  formatThb,
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
  loading: () => <ChartSkeleton />,
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
  const [person, setPerson] = useState<PersonFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase("ko-KR"));
  const query = useQuery({ queryKey: ["expenses"], queryFn: fetchExpenses });

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
  const clearFilters = () => { setPerson("all"); setCategory("all"); setFrom(""); setTo(""); };

  return <AppScreen appBar={{ title: "여행 가계부" }}>
    <main className="min-h-full w-full max-w-full overflow-x-clip bg-slate-50 pb-[calc(6rem+max(env(safe-area-inset-bottom,0px),12px))] dark:bg-slate-950">
      <Tabs aria-label="가계부 보기" selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(String(key))} className="w-full min-w-0 max-w-full overflow-x-clip">
        <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
          <CompactSegmentedTabsList ariaLabel="가계부 내역과 통계" items={[{ id: "list", label: "내역" }, { id: "stats", label: "통계" }]} />
        </div>
        <Tabs.Panel className="min-w-0 max-w-full overflow-x-clip !p-0" id="list">
          {query.isLoading ? <ExpenseSkeleton /> : initialError ? <LoadError onRetry={() => query.refetch()} /> : <section className="mx-auto w-full min-w-0 max-w-lg px-4 py-4">
            <ExpenseSummary expenses={filtered} />
            {query.isError && query.data && <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"><span>최근 데이터를 표시 중이에요.</span><button className="min-h-8 px-2 font-bold" onClick={() => query.refetch()} type="button">다시 연결</button></div>}
            <div className="mt-4 flex items-center gap-2">
              <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900"><Search className="size-4 text-slate-400" /><input aria-label="지출 검색" className="min-w-0 flex-1 bg-transparent text-sm outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="품목, 상호, 메모 검색" value={search} />{search && <button aria-label="검색어 지우기" className="grid size-8 place-items-center" onClick={() => setSearch("")} type="button"><X className="size-4" /></button>}</label>
              <button aria-label="지출 필터" className={cn("relative grid size-11 shrink-0 place-items-center rounded-xl border bg-white dark:bg-slate-900", filtersActive ? "border-blue-500 text-blue-600" : "border-slate-200 text-slate-500 dark:border-slate-800")} onClick={() => setFilterOpen(true)} type="button"><Filter className="size-4" />{filtersActive && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-500" />}</button>
            </div>
            {expenses.length === 0 ? <EmptyState onCreate={openCreate} /> : filtered.length === 0 ? <div className="py-16 text-center"><p className="font-bold">조건에 맞는 지출이 없어요.</p><button className="mt-3 min-h-11 px-4 text-sm font-bold text-blue-600" onClick={clearFilters} type="button">필터 초기화</button></div> : <div className="mt-5 space-y-6">{grouped.map((group) => <section key={group.date}><header className="mb-2 flex items-end justify-between px-1"><h2 className="text-sm font-extrabold">{formatBangkokDate(group.items[0].purchased_at)}</h2><p className="text-xs font-bold tabular-nums text-slate-500">{formatKrw(group.items.reduce((total, item) => total + getEffectiveKrw(item), 0))}</p></header><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:divide-slate-800">{group.items.map((expense) => <ExpenseRow expense={expense} key={expense.id} onDelete={() => setDeleting(expense)} onEdit={() => openEdit(expense)} />)}</div></section>)}</div>}
          </section>}
        </Tabs.Panel>
        <Tabs.Panel className="min-w-0 max-w-full overflow-x-clip !p-0" id="stats">
          {selectedTab === "stats" && (query.isLoading ? <div className="mx-auto w-full min-w-0 max-w-lg px-4 py-4"><ChartSkeleton /></div> : initialError ? <LoadError onRetry={() => query.refetch()} /> : <section className="mx-auto w-full min-w-0 max-w-lg px-4 py-4">{expenses.length ? <ExpenseCharts expenses={filtered} /> : <EmptyState onCreate={openCreate} />}</section>)}
        </Tabs.Panel>
      </Tabs>
    </main>
    <div className="fixed bottom-[calc(1.5rem+max(env(safe-area-inset-bottom,0px),12px))] right-5 z-40 h-14 min-w-14"><Button aria-label="지출 등록" className="h-full w-full rounded-full px-5 shadow-xl" onPress={openCreate}><Plus className="size-5" /><span className="font-bold">등록</span></Button><NativeHapticSwitch ariaLabel="지출 등록" checked={drawerOpen} onChange={openCreate} /></div>
    {drawerOpen && <ExpenseDrawer key={drawerSession} expense={editing} open={drawerOpen} onOpenChange={(next) => { setDrawerOpen(next); if (!next) setEditing(null); }} />}
    <FilterDrawer category={category} categoryOptions={categoryOptions} from={from} open={filterOpen} person={person} to={to} onCategory={setCategory} onFrom={setFrom} onOpenChange={setFilterOpen} onPerson={setPerson} onReset={clearFilters} onTo={setTo} />
    <AlertDialog open={Boolean(deleting)} onOpenChange={(next) => { if (!next && !remove.isPending) setDeleting(null); }}><AlertDialogPopup><AlertDialogHeader><div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 text-red-500"><Trash2 className="size-5" /></div><AlertDialogTitle>지출을 삭제할까요?</AlertDialogTitle><AlertDialogDescription><strong>{deleting?.item_name}</strong> 내역과 영수증 사진이 함께 삭제돼요.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="grid grid-cols-2"><button className="h-12 rounded-xl bg-white font-bold ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700" disabled={remove.isPending} onClick={() => setDeleting(null)} type="button">취소</button><button className="h-12 rounded-xl bg-red-500 font-bold text-white disabled:opacity-50" disabled={!deleting || remove.isPending} onClick={() => deleting && remove.mutate(deleting)} type="button">{remove.isPending ? "삭제 중…" : "삭제"}</button></AlertDialogFooter></AlertDialogPopup></AlertDialog>
  </AppScreen>;
};

function ExpenseSummary({ expenses }: { expenses: Expense[] }) {
  const summary = summarizeExpenses(expenses);
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-[11px] font-semibold text-slate-400">전체 지출</p><div className="mt-1 flex items-end justify-between gap-3"><div><p className="text-2xl font-black tracking-tight tabular-nums">{formatKrw(summary.totalKrw)}</p><p className="mt-1 text-xs font-semibold text-slate-500">{formatThb(summary.totalThb)} · {summary.count}건</p></div>{summary.settlement ? <div className="text-right"><p className="text-[10px] font-semibold text-slate-400">현재 정산</p><p className="mt-1 text-xs font-extrabold"><span className="text-blue-600">{EXPENSE_PERSON_META[summary.settlement.from].label}</span> → {EXPENSE_PERSON_META[summary.settlement.to].label}</p><p className="text-sm font-black tabular-nums">{formatKrw(summary.settlement.amount)}</p></div> : <p className="text-xs font-bold text-slate-400">정산 완료</p>}</div></section>;
}

function ExpenseRow({ expense, onEdit, onDelete }: { expense: Expense; onEdit: () => void; onDelete: () => void }) {
  const categoryLabel = getExpenseCategoryLabel(expense);
  const categoryColor = getExpenseCategoryColor(expense);
  const users = EXPENSE_PEOPLE.filter((person) => person === "gahyun" ? expense.share_gahyun_thb > 0 : expense.share_minu_thb > 0);
  return <MorphingDialog transition={{ type: "spring", bounce: 0.08, duration: 0.42 }}><MorphingDialogTrigger ariaLabel={`${expense.item_name} 상세 보기`} className="block w-full max-w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"><article className="flex min-h-[76px] min-w-0 items-center gap-3 px-4 py-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}><ReceiptText className="size-5" /></div><div className="min-w-0 flex-1"><MorphingDialogTitle><h3 className="truncate text-sm font-bold">{expense.item_name}</h3></MorphingDialogTitle><p className="mt-1 truncate text-xs text-slate-400">{formatBangkokTime(expense.purchased_at)}{expense.merchant ? ` · ${expense.merchant}` : ""}</p><div className="mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden text-[10px] font-semibold text-slate-500"><span className="shrink-0">{EXPENSE_PERSON_META[expense.payer].label} 결제</span><span>·</span><span className="truncate">{users.map((person) => EXPENSE_PERSON_META[person].label).join(" + ")}</span>{expense.images.length > 0 && <><span>·</span><Camera className="size-3 shrink-0" /><span>{expense.images.length}</span></>}</div></div><div className="shrink-0 text-right"><p className="text-sm font-extrabold tabular-nums">{formatThb(expense.amount_thb)}</p><p className="mt-1 text-[11px] font-semibold tabular-nums text-slate-400">{formatKrw(getEffectiveKrw(expense))}</p></div></article></MorphingDialogTrigger><MorphingDialogContainer><MorphingDialogContent className="relative mx-4 flex max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"><MorphingDialogClose className="right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur" /><div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">{expense.images.length > 0 && <WishImageGallery images={expense.images} onImagePress={() => {}} title={expense.item_name} />}<div className="min-w-0 p-5"><p className="truncate text-xs font-bold" style={{ color: categoryColor }}>{categoryLabel}</p><MorphingDialogTitle><h2 className="mt-1 break-words text-xl font-extrabold">{expense.item_name}</h2></MorphingDialogTitle><p className="mt-2 text-3xl font-black tabular-nums">{formatThb(expense.amount_thb)}</p><p className="mt-1 text-sm font-bold text-slate-500">{formatKrw(getEffectiveKrw(expense))}</p><MorphingDialogDescription disableLayoutAnimation className="mt-5 divide-y divide-slate-100 text-sm dark:divide-slate-800"><Detail label="구매 시각" value={`${formatBangkokDate(expense.purchased_at)} ${formatBangkokTime(expense.purchased_at)}`} /><Detail label="상호" value={expense.merchant ?? "—"} /><Detail label="결제" value={`${EXPENSE_PERSON_META[expense.payer].label} · ${EXPENSE_PAYMENT_META[expense.payment_method]}`} /><Detail label="환율" value={`฿1 = ₩${expense.exchange_rate_krw_per_thb.toLocaleString()} · ${expense.exchange_rate_date}`} /><Detail label="가현쨩 몫" value={`${formatThb(expense.share_gahyun_thb)} · ${formatKrw(expense.share_gahyun_krw)}`} /><Detail label="미누쿤 몫" value={`${formatThb(expense.share_minu_thb)} · ${formatKrw(expense.share_minu_krw)}`} />{expense.memo && <div className="py-3"><p className="text-xs font-semibold text-slate-400">메모</p><p className="mt-1 break-words whitespace-pre-wrap leading-6">{expense.memo}</p></div>}</MorphingDialogDescription></div></div><div className="grid shrink-0 grid-cols-[44px_1fr_1fr] gap-2 border-t bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><MorphingDialogClose ariaLabel="지출 삭제" className="static grid h-11 place-items-center rounded-xl bg-red-50 text-red-500" onClick={onDelete}><Trash2 className="size-4" /></MorphingDialogClose><MorphingDialogClose ariaLabel="상세 닫기" className="static grid h-11 place-items-center rounded-xl bg-slate-100 text-sm font-bold dark:bg-slate-800">닫기</MorphingDialogClose><MorphingDialogClose ariaLabel="지출 수정" className="static flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-sm font-bold text-white dark:bg-white dark:text-slate-900" onClick={onEdit}><Pencil className="size-4" />수정</MorphingDialogClose></div></MorphingDialogContent></MorphingDialogContainer></MorphingDialog>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4 py-3"><span className="shrink-0 text-xs font-semibold text-slate-400">{label}</span><span className="text-right font-semibold">{value}</span></div>; }

function FilterDrawer({ open, person, category, categoryOptions, from, to, onOpenChange, onPerson, onCategory, onFrom, onTo, onReset }: { open: boolean; person: PersonFilter; category: CategoryFilter; categoryOptions: CategoryOption[]; from: string; to: string; onOpenChange: (open: boolean) => void; onPerson: (value: PersonFilter) => void; onCategory: (value: CategoryFilter) => void; onFrom: (value: string) => void; onTo: (value: string) => void; onReset: () => void }) {
  return <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerPopup variant="inset" showBar className="max-w-full overflow-hidden">
      <DrawerHeader className="pt-6"><DrawerTitle>지출 필터</DrawerTitle></DrawerHeader>
      <DrawerPanel className="max-w-full space-y-5 overflow-x-hidden">
        <Field className="gap-2"><FieldLabel className="text-sm">사용자</FieldLabel><div className="grid grid-cols-3 gap-2">{(["all", ...EXPENSE_PEOPLE] as PersonFilter[]).map((value) => <BaseButton aria-pressed={person === value} className={filterButtonClass(person === value)} key={value} onClick={() => onPerson(value)} title={value === "all" ? "전체" : EXPENSE_PERSON_META[value].label} variant="outline">{value === "all" ? "전체" : EXPENSE_PERSON_META[value].label}</BaseButton>)}</div></Field>
        <Field className="gap-2"><FieldLabel className="text-sm">카테고리</FieldLabel><div className="grid grid-cols-3 gap-2"><BaseButton aria-pressed={category === "all"} className={filterButtonClass(category === "all")} onClick={() => onCategory("all")} variant="outline">전체</BaseButton>{categoryOptions.map((option) => <BaseButton aria-pressed={category === option.value} className={filterButtonClass(category === option.value)} key={option.value} onClick={() => onCategory(option.value)} title={option.label} variant="outline">{option.label}</BaseButton>)}</div></Field>
        <Field className="gap-2"><FieldLabel className="text-sm">날짜 범위</FieldLabel><div className="grid min-w-0 grid-cols-2 gap-2"><input aria-label="시작 날짜" className="h-11 min-w-0 rounded-xl border px-2 text-sm dark:bg-slate-900" max={to || undefined} onChange={(event) => onFrom(event.target.value)} type="date" value={from} /><input aria-label="종료 날짜" className="h-11 min-w-0 rounded-xl border px-2 text-sm dark:bg-slate-900" min={from || undefined} onChange={(event) => onTo(event.target.value)} type="date" value={to} /></div></Field>
      </DrawerPanel>
      <DrawerFooter className="grid grid-cols-2 gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))]"><BaseButton className="h-12 rounded-xl bg-slate-100 font-bold dark:bg-slate-800" onClick={onReset} variant="secondary">초기화</BaseButton><BaseButton className="h-12 rounded-xl bg-slate-900 font-bold text-white dark:bg-white dark:text-slate-900" onClick={() => onOpenChange(false)}>적용</BaseButton></DrawerFooter>
    </DrawerPopup>
  </Drawer>;
}

const filterButtonClass = (selected: boolean) => cn(
  "min-h-11 min-w-0 truncate rounded-xl px-2 text-xs font-bold",
  selected ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15" : "border-slate-200 dark:border-slate-700",
);

function EmptyState({ onCreate }: { onCreate: () => void }) { return <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900"><ReceiptText className="size-6" /></div><h2 className="mt-4 font-extrabold">아직 지출 내역이 없어요</h2><p className="mt-1 text-sm text-slate-500">태국에서 쓴 첫 비용을 기록해 보세요.</p><Button className="mt-5" onPress={onCreate}><Plus className="size-4" />첫 지출 등록</Button></div>; }
function LoadError({ onRetry }: { onRetry: () => void }) { return <div className="mx-auto flex min-h-80 max-w-lg flex-col items-center justify-center px-4 text-center"><p className="font-extrabold">지출 내역을 불러오지 못했어요.</p><p className="mt-1 text-sm text-slate-500">기존 데이터가 있다면 화면에 유지되고 다시 연결을 시도할 수 있어요.</p><Button className="mt-4" onPress={onRetry} variant="secondary"><RefreshCw className="size-4" />다시 시도</Button></div>; }
function ExpenseSkeleton() { return <div className="mx-auto max-w-lg space-y-4 px-4 py-4"><Skeleton className="h-28 rounded-2xl" /><Skeleton className="h-11 rounded-xl" />{[0, 1, 2].map((item) => <div className="space-y-2" key={item}><Skeleton className="h-4 w-28 rounded-full" /><Skeleton className="h-[154px] rounded-2xl" /></div>)}</div>; }
function ChartSkeleton() { return <div className="space-y-4">{[120, 240, 190, 220, 150].map((height, index) => <Skeleton className="rounded-2xl" key={index} style={{ height }} />)}</div>; }
