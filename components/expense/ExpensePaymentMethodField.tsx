"use client";

import { useState } from "react";
import { Avatar, Description, Label, ListBox } from "@heroui/react";
import { Banknote, CreditCard, Ellipsis, QrCode, type LucideIcon } from "lucide-react";
import { DrawerFieldLabel } from "@/components/ui/drawer-form";
import { WalletIcon } from "@/components/ui/wallet";
import {
  EXPENSE_PAYMENT_META,
  EXPENSE_PAYMENT_METHODS,
  type ExpensePaymentMethod,
} from "@/lib/expenses";
import { cn } from "@/lib/utils";

const PAYMENT_DESCRIPTIONS: Record<ExpensePaymentMethod, string> = {
  cash: "현금·바트 직접 결제",
  card: "신용·체크카드",
  qr: "PromptPay 등 QR 결제",
  other: "그 외 결제 수단",
};

const PAYMENT_ICONS: Record<ExpensePaymentMethod, LucideIcon> = {
  cash: Banknote,
  card: CreditCard,
  qr: QrCode,
  other: Ellipsis,
};

export function ExpensePaymentMethodField({
  open,
  value,
  onChange,
}: {
  open: boolean;
  value: ExpensePaymentMethod;
  onChange: (value: ExpensePaymentMethod) => void;
}) {
  const [interaction, setInteraction] = useState(0);

  return (
    <div
      className="flex flex-col gap-2"
      data-drawer-interactive-field
      onPointerDownCapture={() => setInteraction((current) => current + 1)}
    >
      <Label>
        <DrawerFieldLabel active={open} icon={WalletIcon} interactionSignal={interaction}>
          결제 수단
        </DrawerFieldLabel>
      </Label>
      <ListBox
        aria-label="결제 수단"
        className="grid w-full grid-cols-2 gap-2 min-[440px]:grid-cols-4"
        disallowEmptySelection
        selectedKeys={new Set([value])}
        selectionMode="single"
        onSelectionChange={(keys) => {
          if (keys === "all") return;
          const next = Array.from(keys)[0] as ExpensePaymentMethod | undefined;
          if (!next || next === value) return;
          onChange(next);
        }}
      >
        {EXPENSE_PAYMENT_METHODS.map((method) => {
          const Icon = PAYMENT_ICONS[method];
          const selected = value === method;

          return (
            <ListBox.Item
              key={method}
              className={cn(
                "!flex min-w-0 items-center gap-2 p-2.5",
                selected && "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10",
              )}
              id={method}
              textValue={EXPENSE_PAYMENT_META[method]}
            >
              <Avatar size="sm">
                <Avatar.Fallback>
                  <Icon aria-hidden="true" className="size-4" />
                </Avatar.Fallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <Label className="truncate text-sm">{EXPENSE_PAYMENT_META[method]}</Label>
                <Description className="line-clamp-2 text-[10px] leading-4 text-slate-500! dark:text-slate-400!">
                  {PAYMENT_DESCRIPTIONS[method]}
                </Description>
              </div>
              <ListBox.ItemIndicator className="shrink-0" />
            </ListBox.Item>
          );
        })}
      </ListBox>
    </div>
  );
}
