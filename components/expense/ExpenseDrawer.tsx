"use client";

import imageCompression from "browser-image-compression";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { Check, RefreshCw } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_META,
  EXPENSE_PAYMENT_META,
  EXPENSE_PAYMENT_METHODS,
  EXPENSE_PEOPLE,
  EXPENSE_PERSON_META,
  formatKrw,
  type ExchangeRateSnapshot,
  type Expense,
  type ExpenseCategory,
  type ExpensePaymentMethod,
  type ExpensePerson,
} from "@/lib/expenses";
import { WishImagePicker, type WishImageDraft } from "@/components/wish/WishImagePicker";
import {
  Drawer,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { drawerCancelButtonClass, drawerPrimaryButtonClass } from "@/components/ui/drawer-form";
import { cn } from "@/lib/utils";

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

const fetchRate = async (date: string): Promise<ExchangeRateSnapshot> => {
  const response = await fetch(`/api/exchange-rates?date=${date}`);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "환율을 불러오지 못했어요.");
  return payload.data;
};

const equalShares = (amount: number, participants: ExpensePerson[], payer: ExpensePerson | null) => {
  if (participants.length === 1) return { gahyun: participants[0] === "gahyun" ? amount : 0, minu: participants[0] === "minu" ? amount : 0 };
  const cents = Math.round(amount * 100);
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
  const [amount, setAmount] = useState(expense ? String(expense.amount_thb) : "");
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

  const numericAmount = Number(amount) || 0;
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
  const convertedKrw = Math.round(numericAmount * numericRate);
  const automaticShares = equalShares(numericAmount, participants, payer);
  const effectiveGahyunShare = manualSplit ? gahyunShare : String(automaticShares.gahyun);
  const effectiveMinuShare = manualSplit ? minuShare : String(automaticShares.minu);

  const participantSet = useMemo(() => new Set(participants), [participants]);
  const toggleParticipant = (person: ExpensePerson) => {
    setParticipants((current) => current.includes(person)
      ? current.length === 1 ? current : current.filter((item) => item !== person)
      : [...current, person]);
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
            amount_thb: numericAmount, exchange_rate_krw_per_thb: numericRate,
            exchange_rate_date: effectiveRateDate, rate_manually_edited: manualRate || rateQuery.data?.source === "supabase_fallback",
            actual_amount_krw: paymentMethod === "card" && actualKrw ? Number(actualKrw) : null,
            payer, participants,
            shares_thb: { gahyun: Number(effectiveGahyunShare) || 0, minu: Number(effectiveMinuShare) || 0 },
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
    if (!itemName.trim() || (customCategoryMode && !customCategory.trim()) || numericAmount <= 0 || numericRate <= 0 || !payer) {
      setSubmitError("필수 입력과 결제자를 확인해 주세요.");
      return;
    }
    mutation.mutate();
  };

  return <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerPopup id="expense-drawer" variant="inset" showBar className="max-w-full overflow-hidden">
      <Form aria-label={expense ? "지출 수정" : "지출 등록"} className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden" onSubmit={submit}>
        <DrawerHeader className="px-6 pb-2 pt-6 text-center"><DrawerTitle>{expense ? "지출 수정" : "지출 등록"}</DrawerTitle></DrawerHeader>
        <DrawerPanel scrollable={false} className="flex min-h-0 min-w-0 max-w-full flex-1 touch-pan-y flex-col gap-5 overflow-x-hidden overflow-y-auto overscroll-contain px-6 py-3">
          <section className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
            <NativeField label="구매 날짜"><input aria-label="구매 날짜" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" max={nowInBangkok().date} onChange={(event) => { const nextDate = event.target.value; setDate(nextDate); if (manualRate) setRateDate(nextDate); else if (expense && nextDate === initial.date) { setRate(String(expense.exchange_rate_krw_per_thb)); setRateDate(expense.exchange_rate_date); } else setRate(""); }} type="date" value={date} /></NativeField>
            <NativeField label="태국 현지 시간"><input aria-label="구매 시간" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900" onChange={(event) => setTime(event.target.value)} type="time" value={time} /></NativeField>
          </section>

          <TextField isRequired value={itemName} onChange={setItemName}><Label>품목</Label><Input maxLength={100} placeholder="예: 팟타이, 볼트 택시" /><FieldError /></TextField>

          <NativeField label="카테고리">
            <div className="grid grid-cols-3 gap-2 min-[440px]:grid-cols-4">
              {EXPENSE_CATEGORIES.map((value) => <ChoiceButton key={value} selected={!customCategoryMode && category === value} onClick={() => { setCategory(value); setCustomCategoryMode(false); }}>{EXPENSE_CATEGORY_META[value].label}</ChoiceButton>)}
              <ChoiceButton selected={customCategoryMode} onClick={() => { setCategory("other"); setCustomCategoryMode(true); }}>직접 입력</ChoiceButton>
            </div>
            {customCategoryMode && <TextField
              fullWidth
              isRequired
              className="mt-3 min-w-0"
              isInvalid={customCategory.length > 0 && !customCategory.trim()}
              name="custom-category"
              value={customCategory}
              onChange={setCustomCategory}
            >
              <Label>직접 입력 카테고리</Label>
              <Input maxLength={30} placeholder="예: 카페, 선물, 기념품" />
              <FieldError>카테고리 이름을 입력해 주세요.</FieldError>
            </TextField>}
          </NativeField>

          <section className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <label className="text-sm font-bold">결제 금액</label>
            <div className="mt-2 flex items-center gap-2"><span className="text-2xl font-bold">฿</span><input aria-label="태국 바트 금액" className="min-w-0 flex-1 bg-transparent text-right text-3xl font-semibold tabular-nums outline-none" inputMode="decimal" min="0.01" onChange={(event) => setAmount(event.target.value)} placeholder="0" step="0.01" type="number" value={amount} /></div>
            <p className="mt-2 text-right text-sm font-semibold text-slate-500">{numericRate > 0 ? formatKrw(convertedKrw) : "환율 확인 중"}</p>
          </section>

          <NativeField label="구매일 환율">
            <div className="rounded-xl border border-slate-200 px-3 py-3 dark:border-slate-700">
              <div className="flex items-center gap-2"><span className="text-sm text-slate-500">฿1 =</span><input aria-label="원화 환율" className="min-w-0 flex-1 bg-transparent text-right font-bold tabular-nums outline-none" inputMode="decimal" onChange={(event) => { setRate(event.target.value); setRateDate(date); setManualRate(true); }} step="0.000001" type="number" value={effectiveRate} /><span className="text-sm font-bold">원</span></div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400"><span>{effectiveRateDate} 관측</span>{rateQuery.isFetching && <span className="inline-flex items-center gap-1"><RefreshCw className="size-3 animate-spin" /> 조회 중</span>}{manualRate && <span>직접 입력</span>}</div>
            </div>
            {rateQuery.isError && !rate && <p className="mt-2 text-xs text-red-500">{rateQuery.error.message}</p>}
          </NativeField>

          <NativeField label="결제자"><div className="grid grid-cols-2 gap-2">{EXPENSE_PEOPLE.map((person) => <ChoiceButton key={person} selected={payer === person} onClick={() => setPayer(person)}>{EXPENSE_PERSON_META[person].label}</ChoiceButton>)}</div></NativeField>
          <NativeField label="비용 사용자"><div className="grid grid-cols-2 gap-2">{EXPENSE_PEOPLE.map((person) => <ChoiceButton key={person} selected={participantSet.has(person)} onClick={() => toggleParticipant(person)}>{EXPENSE_PERSON_META[person].label}</ChoiceButton>)}</div></NativeField>

          {participants.length === 2 && <NativeField label="공동 지출 분담"><div className="flex items-center justify-between gap-2"><p className="min-w-0 text-xs text-slate-500">기본은 반반, 1사땅 잔액은 결제자 몫이에요.</p><button className="min-h-11 shrink-0 whitespace-nowrap px-1 text-[11px] font-bold text-blue-600" onClick={() => { if (!manualSplit) { setGahyunShare(String(automaticShares.gahyun)); setMinuShare(String(automaticShares.minu)); } setManualSplit((value) => !value); }} type="button">{manualSplit ? "반반으로" : "직접 나누기"}</button></div>{manualSplit && <div className="mt-2 grid grid-cols-2 gap-2"><ShareInput label="가현쨩" value={gahyunShare} onChange={setGahyunShare} /><ShareInput label="미누쿤" value={minuShare} onChange={setMinuShare} /></div>}</NativeField>}

          <TextField value={merchant} onChange={setMerchant}><Label>상호 · 매장 (선택)</Label><Input maxLength={100} placeholder="예: Terminal 21" /></TextField>
          <NativeField label="결제 수단"><div className="grid grid-cols-4 gap-2">{EXPENSE_PAYMENT_METHODS.map((method) => <ChoiceButton key={method} selected={paymentMethod === method} onClick={() => setPaymentMethod(method)}>{EXPENSE_PAYMENT_META[method]}</ChoiceButton>)}</div></NativeField>
          {paymentMethod === "card" && <TextField value={actualKrw} onChange={setActualKrw}><Label>실제 카드 청구 원화 (선택)</Label><Input inputMode="numeric" min="1" placeholder="승인 내역 확인 후 입력" type="number" /></TextField>}

          <WishImagePicker images={images} inputId="expense-images" itemLabel="영수증 사진" label="영수증 사진" description="최대 5장 · 업로드 전에 자동으로 가볍게 압축해요." onChange={setImages} />
          <NativeField label="메모 (선택)"><textarea aria-label="지출 메모" className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900" maxLength={500} onChange={(event) => setMemo(event.target.value)} placeholder="기억할 내용을 남겨 주세요." value={memo} /></NativeField>
          {submitError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">{submitError}</p>}
        </DrawerPanel>
        <DrawerFooter className="grid shrink-0 grid-cols-2 gap-3 border-t bg-white px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 dark:bg-slate-950">
          <Button className={drawerCancelButtonClass} isDisabled={mutation.isPending} onPress={() => onOpenChange(false)} type="button" variant="secondary">취소</Button>
          <Button className={drawerPrimaryButtonClass} isDisabled={mutation.isPending || !itemName.trim() || (customCategoryMode && !customCategory.trim()) || numericAmount <= 0 || numericRate <= 0 || !payer} type="submit">{mutation.isPending ? "저장 중…" : expense ? "변경 저장" : "등록하기"}</Button>
        </DrawerFooter>
      </Form>
    </DrawerPopup>
  </Drawer>;
}

function NativeField({ label, children }: { label: string; children: React.ReactNode }) {
  return <section><p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">{label}</p>{children}</section>;
}

function ChoiceButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={cn("relative min-h-11 rounded-xl border px-2 text-xs font-bold transition active:scale-[0.98]", selected ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900")} onClick={onClick} type="button">{selected && <Check className="absolute right-1.5 top-1.5 size-3" />}{children}</button>;
}

function ShareInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="rounded-xl border border-slate-200 p-3 text-xs font-semibold dark:border-slate-700"><span>{label}</span><span className="mt-2 flex items-center gap-1"><span>฿</span><input aria-label={`${label} 분담액`} className="min-w-0 flex-1 bg-transparent text-right text-base font-bold outline-none" inputMode="decimal" min="0" onChange={(event) => onChange(event.target.value)} step="0.01" type="number" value={value} /></span></label>;
}
