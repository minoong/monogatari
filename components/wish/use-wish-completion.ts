"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { triggerHapticFeedback } from "@/components/BottomNav";
import type { WishItem } from "@/lib/wishes";

async function patchWishCompletion(id: string, is_completed: boolean) {
  const response = await fetch(`/api/wishes?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_completed }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "완료 상태를 저장하지 못했습니다.");
  return payload.data as WishItem;
}

export function useWishCompletionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, is_completed }: { id: string; is_completed: boolean }) =>
      patchWishCompletion(id, is_completed),
    onMutate: async ({ id, is_completed }) => {
      triggerHapticFeedback(12);
      await queryClient.cancelQueries({ queryKey: ["wishes"] });
      const previous = queryClient.getQueriesData<WishItem[]>({ queryKey: ["wishes"] });
      queryClient.setQueriesData<WishItem[]>({ queryKey: ["wishes"] }, (old) =>
        old?.map((wish) =>
          wish.id === id
            ? {
                ...wish,
                is_completed,
                completed_at: is_completed ? new Date().toISOString() : null,
              }
            : wish,
        ),
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wishes"] });
    },
  });
}
