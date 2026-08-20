"use client";

import imageCompression from "browser-image-compression";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, CheckboxGroup, FieldError, Input, Label, Radio, RadioGroup, TextArea, TextField } from "@heroui/react";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from "react";
import { toast } from "sonner";
import { triggerHapticFeedback } from "@/components/BottomNav";
import {
  convertKrwToThb,
  convertThbToKrw,
  toggleCurrencyAmount,
  toFiniteAmount,
  formatCurrencyInputAmount,
  type InputCurrency,
} from "@/lib/exchange-rates";
import { type ReceiptScanResult } from "@/lib/receipt-scan";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_META,
  EXPENSE_PEOPLE,
  EXPENSE_PERSON_META,
  roundThb,
  type ExchangeRateSnapshot,
  type Expense,
  type ExpenseCategory,
  type ExpensePaymentMethod,
  type ExpensePerson,
} from "@/lib/expenses";
import type { WishImageDraft } from "@/components/wish/WishImagePicker";
import { CalendarDaysIcon } from "@/components/ui/calendar-days";
import { ClockIcon } from "@/components/ui/clock";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileTextIcon } from "@/components/ui/file-text";
import { LayersIcon } from "@/components/ui/layers";
import { ScanTextIcon } from "@/components/ui/scan-text";
import { UsersRoundIcon } from "@/components/ui/users-round";
import { WalletIcon } from "@/components/ui/wallet";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DrawerFieldLabel, drawerCancelButtonClass, drawerPrimaryButtonClass, scrollDrawerFieldIntoView } from "@/components/ui/drawer-form";
import { Field } from "@/components/ui/field";
import { CurrencyAmountField } from "@/components/ui/currency-amount-field";
import { ExpenseReceiptPicker, type ReceiptScanStatus } from "@/components/expense/ExpenseReceiptPicker";
import { ExpensePaymentMethodField } from "@/components/expense/ExpensePaymentMethodField";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";

const nowInBangkok = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date()).reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
};

const bangkokParts = (value: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value)).reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
};

const formatDateInputValue = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? `${year}. ${month}. ${day}.` : "날짜 선택";
};

const formatTimeInputValue = (value: string) => {
  const [hour, minute] = value.split(":");
  return hour && minute ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}` : "시간 선택";
};

const fetchRate = async (date: string): Promise<ExchangeRateSnapshot> => {
  const response = await fetch(`/api/exchange-rates?date=${date}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "환율을 불러오지 못했어요.");
  return payload.data;
};

const equalShares = (amount: number, participants: ExpensePerson[], payer: ExpensePerson | null) => {
  const total = roundThb(amount);
  if (participants.length === 1) return { gahyun: participants[0] === "gahyun" ? total : 0, minu: participants[0] === "minu" ? total : 0 };
  const cents = Math.round(total * 100);
  const lower = Math.floor(cents / 2) / 100;
  const upper = (cents - Math.floor(cents / 2)) / 100;
  return payer === "gahyun" ? { gahyun: upper, minu: lower } : { gahyun: lower, minu: upper };
};

export function ExpenseDrawer({ open, expense, onOpenChange }: { open: boolean; expense: Expense | null; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const initial = expense ? bangkokParts(expense.purchased_at) : nowInBangkok();
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [itemName, setItemName] = useState(expense?.item_name ?? "");
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "food");
  const [customCategoryMode, setCustomCategoryMode] = useState(Boolean(expense?.custom_category));
  const [customCategory, setCustomCategory] = useState(expense?.custom_category ?? "");
  const [categoryDraft, setCategoryDraft] = useState("");
  const [amount, setAmount] = useState(expense ? String(expense.amount_thb) : "");
  const [inputCurrency, setInputCurrency] = useState<InputCurrency>("THB");
  const [rate, setRate] = useState(expense ? String(expense.exchange_rate_krw_per_thb) : "");
  const [rateDate, setRateDate] = useState(expense?.exchange_rate_date ?? initial.date);
  const [manualRate, setManualRate] = useState(expense?.exchange_rate_source === "manual_override");
  const [payer, setPayer] = useState<ExpensePerson | null>(() => {
    if (expense) return expense.payer;
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem("expense-last-payer");
    return saved === "gahyun" || saved === "minu" ? saved : null;
  });
  const [participants, setParticipants] = useState<ExpensePerson[]>(() => expense
    ? EXPENSE_PEOPLE.filter((person) => person === "gahyun" ? expense.share_gahyun_thb > 0 : expense.share_minu_thb > 0)
    : [...EXPENSE_PEOPLE]);
  const [manualSplit, setManualSplit] = useState(false);
  const [gahyunShare, setGahyunShare] = useState(expense ? String(expense.share_gahyun_thb) : "");
  const [minuShare, setMinuShare] = useState(expense ? String(expense.share_minu_thb) : "");
  const [merchant, setMerchant] = useState(expense?.merchant ?? "");
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod>(expense?.payment_method ?? "cash");
  const [actualKrw, setActualKrw] = useState(expense?.actual_amount_krw ? String(expense.actual_amount_krw) : "");
  const [memo, setMemo] = useState(expense?.memo ?? "");
  const [images, setImages] = useState<WishImageDraft[]>(() => expense?.images.map((image) => ({ id: image.id, path: image.path, url: image.url })) ?? []);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ReceiptScanStatus>("idle");
  const scanResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const handleFieldFocus = (event: FocusEvent<HTMLElement>) => scrollDrawerFieldIntoView(event);
  useEffect(() => {
    if (!open) panelRef.current?.scrollTo({ top: 0 });
  }, [open]);
  const scanning = scanStatus === "scanning";
  useEffect(() => () => { if (scanResetRef.current) clearTimeout(scanResetRef.current); }, []);

  const numericInput = toFiniteAmount(Number(amount) || 0);
  const isKrwInput = inputCurrency === "KRW";
  const shouldLoadRate = open && !manualRate && (!expense || date !== initial.date);
  const rateQuery = useQuery({
    queryKey: ["expense-exchange-rate", date],
    queryFn: () => fetchRate(date),
    enabled: shouldLoadRate,
    staleTime: 1000 * 60 * 60 * 6,
    retry: 1,
  });

  const autoRate = shouldLoadRate && rateQuery.data
    ? String(Number(rateQuery.data.rate.toFixed(6)))
    : "";
  const effectiveRate = rate || autoRate;
  const effectiveRateDate = shouldLoadRate && rateQuery.data ? rateQuery.data.observedDate : rateDate;
  const numericRate = Number(effectiveRate) || 0;
  const numericAmountThb = roundThb(isKrwInput ? convertKrwToThb(numericInput, numericRate) : numericInput);
  const convertedKrw = convertThbToKrw(numericAmountThb, numericRate);
  const automaticShares = equalShares(numericAmountThb, participants, payer);

  const toggleInputCurrency = () => {
    const { nextCurrency, nextAmount } = toggleCurrencyAmount(numericInput, numericRate, inputCurrency, amount);
    setAmount(nextAmount);
    setInputCurrency(nextCurrency);
  };
  const effectiveGahyunShare = manualSplit ? gahyunShare : String(automaticShares.gahyun);
  const effectiveMinuShare = manualSplit ? minuShare : String(automaticShares.minu);
  const selectedCategoryTag = customCategoryMode ? customCategory : EXPENSE_CATEGORY_META[category].label;
  const categorySuggestions = EXPENSE_CATEGORIES.map((value) => EXPENSE_CATEGORY_META[value].label);
  const visibleCategorySuggestions = selectedCategoryTag && !categorySuggestions.includes(selectedCategoryTag)
    ? [selectedCategoryTag, ...categorySuggestions]
    : categorySuggestions;

  const selectCategoryTag = (value: string) => {
    const next = value.trim();
    if (!next) return;
    const preset = EXPENSE_CATEGORIES.find((item) => EXPENSE_CATEGORY_META[item].label === next);
    setCategory(preset ?? "other");
    setCustomCategoryMode(!preset);
    setCustomCategory(preset ? "" : next);
    setCategoryDraft("");
  };

  const applyPurchasedDate = (nextDate: string) => {
    setDate(nextDate);
    if (manualRate) setRateDate(nextDate);
    else if (expense && nextDate === initial.date) {
      setRate(String(expense.exchange_rate_krw_per_thb));
      setRateDate(expense.exchange_rate_date);
    } else setRate("");
  };

  const applyReceiptScan = (data: ReceiptScanResult) => {
    if (data.purchased_date) applyPurchasedDate(data.purchased_date);
    if (data.purchased_time) setTime(data.purchased_time);
    if (data.item_name) setItemName(data.item_name);
    if (data.merchant) setMerchant(data.merchant);
    if (data.payment_method) setPaymentMethod(data.payment_method);
    if (data.memo) setMemo(data.memo);
    if (data.custom_category) selectCategoryTag(data.custom_category);
    else if (data.category) selectCategoryTag(EXPENSE_CATEGORY_META[data.category].label);
    if (data.amount != null && data.currency) {
      setInputCurrency(data.currency);
      setAmount(formatCurrencyInputAmount(data.amount, data.currency));
    }
  };

  const scanReceipt = async () => {
    const image = images[0];
    if (!image || scanning) return;
    setScanStatus("scanning");
    setSubmitError(null);
    try {
      let file = image.file;
      if (!file) {
        const response = await fetch(image.url);
        if (!response.ok) throw new Error("영수증 사진을 불러오지 못했어요.");
        const blob = await response.blob();
        file = new File([blob], "receipt.jpg", { type: blob.type || "image/jpeg" });
      }
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/jpeg" });
      const formData = new FormData();
      formData.append("image", compressed);
      const response = await fetch("/api/expenses/receipt-scan", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "영수증을 스캔하지 못했어요.");
      applyReceiptScan(payload.data as ReceiptScanResult);
      triggerHapticFeedback(18);
      setScanStatus("success");
      if (scanResetRef.current) clearTimeout(scanResetRef.current);
      scanResetRef.current = setTimeout(() => setScanStatus("idle"), 1600);
      toast.success("스캔해서 채웠어요. 확인하고 저장해 주세요.");
    } catch (error) {
      setScanStatus("error");
      if (scanResetRef.current) clearTimeout(scanResetRef.current);
      scanResetRef.current = setTimeout(() => setScanStatus("idle"), 2200);
      toast.error(error instanceof Error ? error.message : "영수증을 스캔하지 못했어요.");
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const uploadedPaths: string[] = [];
      const imagePaths: string[] = [];
      try {
        for (const image of images) {
          if (image.path) { imagePaths.push(image.path); continue; }
          if (!image.file) continue;
          const compressed = await imageCompression(image.file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/jpeg" });
          const formData = new FormData();
          formData.append("image", compressed);
          const upload = await fetch("/api/expenses/image", { method: "POST", body: formData });
          const payload = await upload.json();
          if (!upload.ok) throw new Error(payload.error ?? "사진을 업로드하지 못했어요.");
          uploadedPaths.push(payload.data.path);
          imagePaths.push(payload.data.path);
        }
        const response = await fetch(expense ? `/api/expenses?id=${expense.id}` : "/api/expenses", {
          method: expense ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            purchased_at: new Date(`${date}T${time}:00+07:00`).toISOString(),
            item_name: itemName, category,
            custom_category: customCategoryMode ? customCategory.trim() : null,
            merchant, payment_method: paymentMethod,
            amount_thb: numericAmountThb, exchange_rate_krw_per_thb: numericRate,
            exchange_rate_date: effectiveRateDate, rate_manually_edited: manualRate || rateQuery.data?.source === "supabase_fallback",
            actual_amount_krw: paymentMethod === "card" && actualKrw ? Number(actualKrw) : null,
            payer, participants,
            shares_thb: {
              gahyun: roundThb(Number(effectiveGahyunShare) || 0),
              minu: roundThb(Number(effectiveMinuShare) || 0),
            },
            memo, image_paths: imagePaths,
          }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "지출을 저장하지 못했어요.");
        return payload.data as Expense;
      } catch (error) {
        if (uploadedPaths.length) await fetch("/api/expenses/image", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paths: uploadedPaths }) });
        throw error;
      }
    },
    onSuccess: async () => {
      if (payer) localStorage.setItem("expense-last-payer", payer);
      await queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success(expense ? "지출을 수정했어요." : "지출을 등록했어요.");
      onOpenChange(false);
    },
    onError: (error) => setSubmitError(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    if (!itemName.trim() || (customCategoryMode && !customCategory.trim()) || numericAmountThb <= 0 || numericRate <= 0 || !payer) {
      setSubmitError("필수 입력과 결제자를 확인해 주세요.");
      return;
    }
    mutation.mutate();
  };

  return <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerPopup id="expense-drawer" variant="inset" showBar className="overflow-hidden">
      <form aria-label={expense ? "지출 수정" : "지출 등록"} className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden" onSubmit={submit}>
        <DrawerHeader className="px-4 pb-1 pt-5 text-center sm:px-6 sm:pt-6"><DrawerTitle>{expense ? "지출 수정" : "지출 등록"}</DrawerTitle></DrawerHeader>
        <DrawerPanel ref={panelRef} scrollable={false} className="flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-2 pb-6 *:shrink-0 sm:gap-5 sm:px-6 sm:py-3">
          <ExpenseReceiptPicker
            active={open}
            disabled={mutation.isPending}
            images={images}
            onChange={setImages}
            onScan={scanReceipt}
            scanStatus={scanStatus}
          />

          <section className="grid min-w-0 grid-cols-1 gap-3 min-[340px]:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] sm:grid-cols-2">
            <Field className="min-w-0 gap-2">
              <Label htmlFor="expense-date"><DrawerFieldLabel icon={CalendarDaysIcon} active={open}>날짜</DrawerFieldLabel></Label>
              <div className="relative flex h-11 w-full min-w-0 items-center rounded-xl border border-slate-200 bg-white px-3 pr-9 text-[15px] tabular-nums transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900">
                <span aria-hidden="true" className="min-w-0 truncate">{formatDateInputValue(date)}</span>
                <input id="expense-date" aria-label="구매 날짜" className="absolute inset-0 z-10 block size-full min-w-0 cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" max={nowInBangkok().date} onChange={(event) => applyPurchasedDate(event.target.value)} type="date" value={date} />
                <CalendarDaysIcon aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={17} />
              </div>
            </Field>
            <Field className="min-w-0 gap-2">
              <Label htmlFor="expense-time"><DrawerFieldLabel icon={ClockIcon} active={open}>시간</DrawerFieldLabel></Label>
              <div className="relative flex h-11 w-full min-w-0 items-center rounded-xl border border-slate-200 bg-white px-3 pr-9 text-[15px] tabular-nums transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900">
                <span aria-hidden="true" className="min-w-0 truncate">{formatTimeInputValue(time)}</span>
                <input id="expense-time" aria-label="구매 시간" className="absolute inset-0 z-10 block size-full min-w-0 cursor-pointer opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:size-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" onChange={(event) => setTime(event.target.value)} type="time" value={time} />
                <ClockIcon aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={17} />
              </div>
            </Field>
          </section>

          <TextField isRequired value={itemName} onChange={setItemName}><Label><DrawerFieldLabel icon={ScanTextIcon} active={open}>품목</DrawerFieldLabel></Label><Input maxLength={100} onFocus={handleFieldFocus} placeholder="예: 팟타이, 볼트 택시" /><FieldError /></TextField>

          <div className="flex flex-col gap-2">
            <div className="flex items-end gap-2">
              <TextField className="min-w-0 flex-1" name="categoryDraft" value={categoryDraft} onChange={setCategoryDraft}>
                <Label><DrawerFieldLabel icon={LayersIcon} active={open}>카테고리 태그</DrawerFieldLabel></Label>
                <Input autoComplete="off" maxLength={30} onFocus={handleFieldFocus} onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                  if (event.key === "Enter" || event.key === ",") { event.preventDefault(); selectCategoryTag(categoryDraft); }
                }} placeholder="입력 후 Enter" />
              </TextField>
              <Button aria-label="카테고리 태그 적용" isDisabled={!categoryDraft.trim()} onPress={() => selectCategoryTag(categoryDraft)} type="button" variant="secondary"><Plus className="size-4" /></Button>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">추천 태그</p>
              <div className="flex min-w-0 flex-wrap gap-2">
                {visibleCategorySuggestions.map((suggestion) => {
                  const isSelected = selectedCategoryTag === suggestion;
                  return <button className={`min-h-8 max-w-full rounded-full border px-3 text-xs font-semibold transition-colors ${isSelected ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" : "border-gray-200 bg-white text-gray-500 hover:border-blue-300 dark:border-gray-700 dark:bg-white/5"}`} disabled={isSelected} key={suggestion} onClick={() => selectCategoryTag(suggestion)} type="button"><span className="block max-w-full truncate">{isSelected ? "✓ " : "+ "}{suggestion}</span></button>;
                })}
              </div>
              <p className="mt-1 text-xs text-gray-400">하나 선택 가능 · 직접 입력은 최대 30자</p>
            </div>
          </div>

          <Field className="min-w-0 gap-2">
            <Label htmlFor="expense-amount"><DrawerFieldLabel icon={WalletIcon} active={open}>결제 금액</DrawerFieldLabel></Label>
            <CurrencyAmountField
              amount={amount}
              convertedValue={isKrwInput ? numericAmountThb : convertedKrw}
              currency={inputCurrency}
              inputId="expense-amount"
              onAmountChange={setAmount}
              onInputFocus={handleFieldFocus}
              onToggle={toggleInputCurrency}
              rateReady={numericRate > 0}
            />
          </Field>

          <Field className="gap-2"><Label htmlFor="expense-rate"><DrawerFieldLabel icon={WalletIcon} active={open}>구매일 환율</DrawerFieldLabel></Label>
            <InputGroup className="h-12 min-w-0 rounded-2xl">
              <InputGroupAddon><InputGroupText className="text-sm font-semibold">฿1 =</InputGroupText></InputGroupAddon>
              <InputGroupInput id="expense-rate" aria-label="원화 환율" className="min-w-0 text-right font-bold tabular-nums" inputMode="decimal" onChange={(event) => { setRate(event.target.value); setRateDate(date); setManualRate(true); }} onFocus={handleFieldFocus} step="0.000001" style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }} type="number" value={effectiveRate} />
              <InputGroupAddon align="inline-end"><InputGroupText className="text-xs font-semibold">KRW</InputGroupText></InputGroupAddon>
            </InputGroup>
            <div className="flex min-w-0 items-center justify-between gap-2 px-1 text-xs text-slate-400"><span className="min-w-0 truncate">{effectiveRateDate} 관측</span>{rateQuery.isFetching && <span className="inline-flex shrink-0 items-center gap-1"><RefreshCw className="size-3 animate-spin" /> 조회 중</span>}{manualRate && <span className="shrink-0">직접 입력</span>}</div>
            {rateQuery.isError && !rate && <p className="mt-2 text-xs text-red-500">{rateQuery.error.message}</p>}
          </Field>

          <RadioGroup className="gap-2" name="expense-payer" value={payer ?? undefined} onChange={(value) => setPayer(value as ExpensePerson)}><Label><DrawerFieldLabel icon={UsersRoundIcon} active={open}>결제자</DrawerFieldLabel></Label><div className="flex flex-row flex-wrap gap-x-6 gap-y-3 pt-1">{EXPENSE_PEOPLE.map((person) => <Radio key={person} value={person}><Radio.Content><Radio.Control><Radio.Indicator /></Radio.Control><PersonAvatar person={person} /><span>{EXPENSE_PERSON_META[person].label}</span></Radio.Content></Radio>)}</div></RadioGroup>
          <CheckboxGroup className="gap-2" name="expense-participants" value={participants} onChange={(value) => { const next = value as ExpensePerson[]; if (next.length) setParticipants(next); }}><Label><DrawerFieldLabel icon={UsersRoundIcon} active={open}>비용 사용자</DrawerFieldLabel></Label><div className="flex flex-row flex-wrap gap-x-6 gap-y-3 pt-1">{EXPENSE_PEOPLE.map((person) => <Checkbox key={person} value={person}><Checkbox.Content><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><PersonAvatar person={person} /><span>{EXPENSE_PERSON_META[person].label}</span></Checkbox.Content></Checkbox>)}</div></CheckboxGroup>

          {participants.length === 2 && <Field className="gap-2"><DrawerFieldLabel icon={UsersRoundIcon} active={open}>공동 지출 분담</DrawerFieldLabel><div className="flex items-center justify-between gap-2"><p className="min-w-0 text-xs text-slate-500">기본은 반반, 1사땅 잔액은 결제자 몫이에요.</p><Button className="min-h-11 shrink-0 whitespace-nowrap px-1 text-[11px] font-bold text-blue-600" onPress={() => { if (!manualSplit) { setGahyunShare(String(automaticShares.gahyun)); setMinuShare(String(automaticShares.minu)); } setManualSplit((value) => !value); }} size="sm" type="button" variant="ghost">{manualSplit ? "반반으로" : "직접 나누기"}</Button></div>{manualSplit && <div className="mt-2 grid grid-cols-2 gap-2"><ShareInput label="가현쨩" value={gahyunShare} onChange={setGahyunShare} /><ShareInput label="미누쿤" value={minuShare} onChange={setMinuShare} /></div>}</Field>}

          <TextField value={merchant} onChange={setMerchant}><Label><DrawerFieldLabel icon={ScanTextIcon} active={open}>상호 · 매장 (선택)</DrawerFieldLabel></Label><Input maxLength={100} onFocus={handleFieldFocus} placeholder="예: Terminal 21" /></TextField>
          <ExpensePaymentMethodField open={open} value={paymentMethod} onChange={setPaymentMethod} />
          {paymentMethod === "card" && <TextField value={actualKrw} onChange={setActualKrw}><Label><DrawerFieldLabel icon={WalletIcon} active={open}>실제 카드 청구 원화 (선택)</DrawerFieldLabel></Label><Input inputMode="numeric" min="1" onFocus={handleFieldFocus} placeholder="승인 내역 확인 후 입력" type="number" /></TextField>}

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-memo"><DrawerFieldLabel icon={FileTextIcon} active={open}>메모 (선택)</DrawerFieldLabel></Label>
            <TextArea
              enterKeyHint="done"
              id="expense-memo"
              className="min-h-24 scroll-mb-28"
              maxLength={500}
              onChange={(event) => setMemo(event.target.value)}
              onFocus={handleFieldFocus}
              placeholder="기억할 내용을 남겨 주세요."
              rows={4}
              value={memo}
            />
          </div>
          {submitError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{submitError}</p>}
        </DrawerPanel>
        <DrawerFooter className="relative z-10 grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-popover px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pt-4">
          <Button fullWidth className={drawerCancelButtonClass} isDisabled={mutation.isPending || scanning} onPress={() => onOpenChange(false)} size="lg" type="button">취소</Button>
          <Button fullWidth className={drawerPrimaryButtonClass} isDisabled={mutation.isPending || scanning || !itemName.trim() || (customCategoryMode && !customCategory.trim()) || numericAmountThb <= 0 || numericRate <= 0 || !payer} size="lg" type="submit">{mutation.isPending ? "저장 중…" : expense ? "변경 저장" : "등록하기"}</Button>
        </DrawerFooter>
      </form>
    </DrawerPopup>
  </Drawer>;
}

function PersonAvatar({ person }: { person: ExpensePerson }) {
  const meta = EXPENSE_PERSON_META[person];
  return <Avatar color={person === "gahyun" ? "accent" : "success"} size="sm"><AvatarImage alt="" src={meta.image} /><AvatarFallback>{person === "gahyun" ? "G" : "M"}</AvatarFallback></Avatar>;
}

function ShareInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="rounded-xl border border-slate-200 p-3 text-xs font-semibold dark:border-slate-700"><span>{label}</span><span className="mt-2 flex items-center gap-1"><span>฿</span><input aria-label={`${label} 분담액`} className="min-w-0 flex-1 bg-transparent text-right text-base font-bold outline-none" inputMode="decimal" min="0" onChange={(event) => onChange(event.target.value)} onFocus={scrollDrawerFieldIntoView} step="0.01" type="number" value={value} /></span></label>;
}
