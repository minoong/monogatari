"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Pencil, Trash2, X, ZoomIn } from "lucide-react";
import { ExpenseCurrencyAmount } from "@/components/expense/currency-display";
import {
  ReceiptDashedRule,
  ReceiptKeyValue,
  ReceiptTotalBlock,
} from "@/components/expense/receipt-ui";
import { MorphingDialogClose, MorphingDialogDescription, MorphingDialogTitle } from "@/components/motion-primitives/morphing-dialog";
import {
  dialogFooterDangerIconButtonClass,
  dialogFooterPrimaryButtonClass,
  dialogFooterSecondaryButtonClass,
} from "@/components/ui/drawer-form";
import { ImageZoomModal } from "@/components/ui/image-zoom-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  EXPENSE_PAYMENT_META,
  EXPENSE_PERSON_META,
  EXPENSE_PEOPLE,
  formatBangkokDate,
  formatBangkokTime,
  getEffectiveKrw,
  getExpenseCategoryLabel,
  type Expense,
  type ExpenseImage,
  type ExpensePerson,
} from "@/lib/expenses";
import { cn } from "@/lib/utils";

interface ExpenseReceiptDetailProps {
  expense: Expense;
  categoryColor: string;
  onDelete: () => void;
  onEdit: () => void;
}

export function ExpenseReceiptDetail({ expense, categoryColor, onDelete, onEdit }: ExpenseReceiptDetailProps) {
  const categoryLabel = getExpenseCategoryLabel(expense);
  const users = EXPENSE_PEOPLE.filter((person) => (person === "gahyun" ? expense.share_gahyun_thb > 0 : expense.share_minu_thb > 0));
  const receiptNo = expense.id.slice(0, 8).toUpperCase();
  const effectiveKrw = getEffectiveKrw(expense);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  const openZoom = (index: number) => {
    setZoomIndex(index);
    setZoomOpen(true);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-slate-950">
      <header className="relative shrink-0 border-b border-slate-100 px-4 pb-3 pt-4 dark:border-slate-800">
        <MorphingDialogClose
          ariaLabel="상세 닫기"
          className="absolute right-3 top-3.5 z-10 flex size-8 items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <X className="size-5" strokeWidth={2} />
        </MorphingDialogClose>
        <MorphingDialogDescription disableLayoutAnimation className="sr-only">
          {expense.item_name} 지출 상세 영수증
        </MorphingDialogDescription>
        <MorphingDialogTitle>
          <h2 className="px-8 text-center text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
            가현짱, 렌탈 영수증 발행!
          </h2>
        </MorphingDialogTitle>
      </header>

      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-3">
        {expense.images.length > 0 && (
          <ReceiptPhotoStrip images={expense.images} onImagePress={openZoom} title={expense.item_name} />
        )}

        <section aria-label="매장 정보" className="space-y-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          <p className="font-semibold text-slate-700 dark:text-slate-300">{expense.merchant ?? categoryLabel}</p>
          <p className="tabular-nums">
            {formatBangkokDate(expense.purchased_at)} {formatBangkokTime(expense.purchased_at)}
          </p>
          <p className="tabular-nums">NO. {receiptNo}</p>
        </section>

        <ReceiptDashedRule className="my-3" />

        <section aria-label="품목 내역">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>품목명</span>
            <span>금액</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 flex-1 break-words text-[13px] font-semibold leading-snug text-slate-900 dark:text-white">
              {expense.item_name}
            </p>
            <div className="flex shrink-0 flex-col items-end tabular-nums">
              <ExpenseCurrencyAmount currency="KRW" size="inline" value={effectiveKrw} />
              <ExpenseCurrencyAmount className="mt-0.5" currency="THB" size="inline" value={expense.amount_thb} />
            </div>
          </div>
        </section>

        <ReceiptDashedRule className="my-3" />

        <section aria-label="금액 요약" className="space-y-1.5 text-right text-[11px] text-slate-500 dark:text-slate-400">
          <div className="tabular-nums">
            바트 합계 <ExpenseCurrencyAmount className="ml-1" currency="THB" size="inline" value={expense.amount_thb} />
          </div>
          <p className="tabular-nums">
            적용 환율 ฿1 = ₩{expense.exchange_rate_krw_per_thb.toLocaleString()}
          </p>
          <div className="text-[12px] font-semibold text-slate-700 tabular-nums dark:text-slate-300">
            원화 합계 <ExpenseCurrencyAmount className="ml-1" currency="KRW" size="inline" value={effectiveKrw} />
          </div>
          <p className="text-[10px] tabular-nums">{expense.exchange_rate_date} 기준</p>
        </section>

        <ReceiptTotalBlock krw={effectiveKrw} thb={expense.amount_thb} />

        <section aria-label="결제 정보" className="space-y-2">
          <ReceiptKeyValue label="결제 수단" value={EXPENSE_PAYMENT_META[expense.payment_method]} />
          <ReceiptKeyValue
            label="카테고리"
            valueNode={
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: `${categoryColor}14`, color: categoryColor }}
              >
                {categoryLabel}
              </span>
            }
          />
        </section>

        <ReceiptDashedRule className="my-3" />

        <section aria-label="함께 쓴 금액" className="space-y-2.5">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">함께 쓴 금액</p>
          <ReceiptKeyValue
            label="결제자"
            valueNode={<PersonValue person={expense.payer} />}
          />
          {users.map((person) => (
            <ReceiptShareRow expense={expense} key={person} person={person} />
          ))}
        </section>

        {expense.memo && (
          <>
            <ReceiptDashedRule className="my-3" />
            <section aria-label="메모">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">메모</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-6 text-slate-700 dark:text-slate-300">
                {expense.memo}
              </p>
            </section>
          </>
        )}

        <ReceiptDashedRule className="my-4" />

        <footer className="pb-2 text-center">
          <ReceiptBarcode seed={expense.id} />
          <p className="mt-3 text-[10px] font-medium text-slate-400">BANGKOK · THAILAND</p>
        </footer>
      </div>

      <div className="grid shrink-0 grid-cols-[44px_1fr_1fr] gap-2 border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
        <MorphingDialogClose
          ariaLabel="지출 삭제"
          className={cn("static", dialogFooterDangerIconButtonClass)}
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </MorphingDialogClose>
        <MorphingDialogClose
          ariaLabel="상세 닫기"
          className={cn("static", dialogFooterSecondaryButtonClass)}
        >
          닫기
        </MorphingDialogClose>
        <MorphingDialogClose
          ariaLabel="지출 수정"
          className={cn("static", dialogFooterPrimaryButtonClass)}
          onClick={onEdit}
        >
          <Pencil className="size-4" />
          수정
        </MorphingDialogClose>
      </div>

      {expense.images[zoomIndex] && (
        <ImageZoomModal
          alt={zoomIndex === 0 ? "영수증 사진" : `영수증 사진 ${zoomIndex + 1}`}
          isOpen={zoomOpen}
          onClose={() => setZoomOpen(false)}
          src={expense.images[zoomIndex].url}
          title={`${expense.item_name}${expense.images.length > 1 ? ` · ${zoomIndex + 1}/${expense.images.length}` : ""}`}
        />
      )}
    </div>
  );
}

function ReceiptPhotoStrip({
  images,
  onImagePress,
  title,
}: {
  images: ExpenseImage[];
  onImagePress: (index: number) => void;
  title: string;
}) {
  const multiple = images.length > 1;

  return (
    <section aria-label="첨부 영수증" className="mb-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">첨부 영수증</p>
        <span className="text-[10px] font-medium tabular-nums text-slate-400">{images.length}장</span>
      </div>

      {multiple ? (
        <div className="mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image, index) => (
            <ReceiptPhotoThumb
              countLabel={`${index + 1}/${images.length}`}
              image={image}
              index={index}
              key={image.id}
              onPress={() => onImagePress(index)}
              title={title}
            />
          ))}
        </div>
      ) : (
        <ReceiptPhotoHero image={images[0]} onPress={() => onImagePress(0)} title={title} />
      )}

      <p className="mt-1.5 text-center text-[10px] text-slate-400">
        {multiple ? "탭하면 크게 볼 수 있어요" : "탭하면 크게 볼 수 있어요"}
      </p>
    </section>
  );
}

function ReceiptPhotoHero({
  image,
  onPress,
  title,
}: {
  image: ExpenseImage;
  onPress: () => void;
  title: string;
}) {
  return (
    <button
      className="relative mt-2 block h-40 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
      onClick={onPress}
      type="button"
    >
      <Image alt={`${title} 영수증`} className="object-cover" fill sizes="300px" src={image.url} unoptimized />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-black/50 to-transparent px-3 py-2 text-[10px] font-medium text-white">
        <ZoomIn className="size-3.5" strokeWidth={2.25} />
        확대 보기
      </span>
    </button>
  );
}

function ReceiptPhotoThumb({
  countLabel,
  image,
  index,
  onPress,
  title,
}: {
  countLabel: string;
  image: ExpenseImage;
  index: number;
  onPress: () => void;
  title: string;
}) {
  return (
    <button
      className={cn(
        "group relative h-28 w-[84px] shrink-0 snap-start overflow-hidden rounded-lg border bg-slate-50 dark:bg-slate-900",
        index === 0 ? "border-slate-400 dark:border-slate-500" : "border-slate-200 dark:border-slate-700",
      )}
      onClick={onPress}
      type="button"
    >
      <Image alt={`${title} 영수증 ${index + 1}`} className="object-cover" fill sizes="84px" src={image.url} unoptimized />
      <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
        {countLabel}
      </span>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/40 to-transparent py-1.5 opacity-80">
        <ZoomIn className="size-3 text-white" strokeWidth={2.25} />
      </span>
    </button>
  );
}

function PersonValue({ person }: { person: ExpensePerson }) {
  const meta = EXPENSE_PERSON_META[person];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
      <Avatar className="!size-4" color={person === "gahyun" ? "accent" : "success"} size="sm">
        <AvatarImage alt="" src={meta.image} />
        <AvatarFallback>{person === "gahyun" ? "G" : "M"}</AvatarFallback>
      </Avatar>
      {meta.label}
    </span>
  );
}

function ReceiptShareRow({ expense, person }: { expense: Expense; person: ExpensePerson }) {
  const thb = person === "gahyun" ? expense.share_gahyun_thb : expense.share_minu_thb;
  const krw = person === "gahyun" ? expense.share_gahyun_krw : expense.share_minu_krw;
  return (
    <ReceiptKeyValue
      labelNode={<PersonValue person={person} />}
      valueNode={
        <span className="shrink-0 text-right font-semibold tabular-nums">
          <ExpenseCurrencyAmount currency="KRW" size="inline" value={krw} />
          <ExpenseCurrencyAmount className="ml-1.5" currency="THB" size="inline" value={thb} />
        </span>
      }
    />
  );
}

function ReceiptBarcode({ seed }: { seed: string }) {
  const bars = useMemo(() => {
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    return Array.from({ length: 48 }, (_, index) => {
      const value = (hash + index * 17) % 5;
      return { width: value === 0 ? 1 : value === 1 ? 2 : value === 2 ? 3 : value === 3 ? 1.5 : 2.5, tall: index % 4 !== 2 };
    });
  }, [seed]);

  return (
    <div aria-hidden="true" className="mx-auto flex h-10 max-w-[240px] items-end justify-center gap-px">
      {bars.map((bar, index) => (
        <span
          className="bg-slate-800 dark:bg-slate-200"
          key={index}
          style={{ width: `${bar.width}px`, height: bar.tall ? "100%" : "72%" }}
        />
      ))}
    </div>
  );
}
