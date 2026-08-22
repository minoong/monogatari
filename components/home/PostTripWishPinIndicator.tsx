"use client";

import { WishTypeIcon } from "@/components/wish/WishTypeIcon";
import { cn } from "@/lib/utils";
import {
  getWishProgress,
  WISH_COMPLETION_LABEL,
  WISH_TYPE_META,
  WISH_TYPES,
  type WishItem,
  type WishType,
} from "@/lib/wishes";

const WISH_KIND_LABEL: Record<WishType, "구매" | "먹은 것"> = {
  shopping: "구매",
  restaurant: "먹은 것",
  menu: "먹은 것",
  snack: "먹은 것",
};

const WISH_LIST_LABEL: Record<WishType, string> = {
  shopping: "쇼핑",
  restaurant: "맛집",
  menu: "메뉴",
  snack: "간식",
};

const visibleWishes = (wishes: WishItem[], type: WishType) => {
  const items = wishes.filter((wish) => wish.type === type);
  return [...items].sort((a, b) => Number(b.is_completed) - Number(a.is_completed)).slice(0, 4);
};

type PostTripWishPinIndicatorProps = {
  wishes: WishItem[];
};

export function PostTripWishPinIndicator({ wishes }: PostTripWishPinIndicatorProps) {
  const overall = getWishProgress(wishes);

  return (
    <div className="wish-pin">
      <header className="wish-pin-header">
        <p className="post-trip-panel-eyebrow">위시</p>
        <div className="wish-pin-heading">
          <h2 className="wish-pin-title">해냈던 것들</h2>
          <p className="wish-pin-overall">
            {overall.total === 0 ? "아직 위시가 없어요" : `${overall.completed} / ${overall.total}`}
          </p>
        </div>
      </header>

      <div className="wish-pin-body">
        <div className="wish-pin-rail">
          <div className="wish-pin-track" aria-hidden="true">
            <div className="wish-pin-fill" />
          </div>
          <ul className="wish-pin-list">
            {WISH_TYPES.map((type) => (
              <li className="wish-pin-item" key={type}>
                {WISH_LIST_LABEL[type]}
              </li>
            ))}
          </ul>
        </div>

        <div className="wish-pin-right">
          {WISH_TYPES.map((type) => {
            const progress = getWishProgress(wishes, type);
            const entries = visibleWishes(wishes, type);
            const ratio = progress.total === 0 ? 0 : progress.completed / progress.total;
            const meta = WISH_TYPE_META[type];

            return (
              <div className="wish-pin-slide" key={type}>
                <div className="wish-pin-slide-head">
                  <span className="wish-pin-kind">{WISH_KIND_LABEL[type]}</span>
                  <p className="wish-pin-count">
                    <strong>{progress.completed}</strong>
                    <span> / {progress.total}</span>
                  </p>
                </div>
                <div className="wish-pin-meter" aria-hidden="true">
                  <span style={{ width: `${Math.round(ratio * 100)}%` }} />
                </div>
                {entries.length === 0 ? (
                  <div className="wish-pin-empty">
                    <WishTypeIcon
                      className={cn("size-11 bg-gradient-to-br shadow-sm ring-1 ring-black/5", meta.accent)}
                      iconClassName="text-white"
                      size={20}
                      tone="dark"
                      type={type}
                    />
                    <p>이 칸은 아직 비어 있어요.</p>
                  </div>
                ) : (
                  <ul className="wish-pin-entries">
                    {entries.map((wish) => (
                      <li
                        className={`wish-pin-entry${wish.is_completed ? " is-done" : " is-pending"}`}
                        key={wish.id}
                      >
                        {wish.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="" src={wish.images[0].url} />
                        ) : (
                          <WishTypeIcon
                            className={cn("wish-pin-entry-fallback bg-gradient-to-br", meta.accent)}
                            iconClassName="text-white"
                            size={16}
                            tone="dark"
                            type={type}
                          />
                        )}
                        <div className="wish-pin-entry-copy">
                          <strong>{wish.title}</strong>
                          <span>{wish.is_completed ? WISH_COMPLETION_LABEL[type] : "아직"}</span>
                        </div>
                        <span className="wish-pin-entry-mark" aria-hidden="true">
                          {wish.is_completed ? "✓" : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
