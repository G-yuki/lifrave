// src/features/items/pages/HomePage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useItems } from "../hooks/useItems";
import { Loading } from "../../../components/Loading";
import { getDisplayName } from "../../pair/services/pairService";
import { usePair } from "../../../contexts/PairContext";
import { db } from "../../../firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { CATEGORY_STYLE } from "../../../lib/constants";
import { BottomNav } from "../../../components/BottomNav";
import type { Item, Category } from "../../../types";

type Filter = "all" | Category;

const CATEGORIES: Category[] = ["おでかけ", "映画", "食事", "本", "ゲーム", "音楽", "スポーツ", "その他"];
const MAPS_KEY = import.meta.env.VITE_MAPS_BROWSER_KEY as string;

const photoUrl = (photoRef: string) =>
  `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=400&key=${MAPS_KEY}`;

export const HomePage = () => {
  const navigate = useNavigate();
  const { pairId, loading: pairLoading } = usePair();
  const [pairNames, setPairNames] = useState("");
  const { items, loading, setStatus, toggleIsWant, removeItem } = useItems(pairId);

  const [filter, setFilter] = useState<Filter>("all");
  const [doneOpen, setDoneOpen] = useState(false);
  const [tryOpen, setTryOpen] = useState(false);

  useEffect(() => {
    if (pairLoading) return;
    if (!pairId) { navigate("/", { replace: true }); return; }
    (async () => {
      const pairSnap = await getDoc(doc(db, "pairs", pairId));
      if (!pairSnap.exists()) return;
      const members = pairSnap.data().members as string[];
      const names = await Promise.all(members.map((uid) => getDisplayName(uid)));
      const validNames = names.filter(Boolean) as string[];
      if (validNames.length > 0) {
        setPairNames(validNames.join(" & "));
      }
    })();
  }, [pairId, pairLoading, navigate]);

  const activeItems = items.filter((i) => i.status !== "done");
  const doneItems   = items.filter((i) => i.status === "done");
  const goItems     = activeItems.filter((i) => i.isWant);
  const goodItems   = activeItems.filter((i) => !i.isWant && (i.matchTier ?? "good") !== "try");
  const tryItems    = activeItems.filter((i) => !i.isWant && i.matchTier === "try");

  const filteredGood = filter === "all"
    ? goodItems
    : goodItems.filter((i: Item) => i.category === filter);

  const progress = items.length > 0 ? doneItems.length / items.length : 0;

  if (pairLoading || loading) return <Loading />;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh",
                  background: "var(--color-bg)" }}>

      {/* ── ヘッダー ── */}
      <header style={{ flexShrink: 0, padding: "14px 20px 10px",
                       background: "var(--color-bg)", borderBottom: "1px solid rgba(0,0,0,0.07)",
                       position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500,
                       color: "var(--color-text-main)", letterSpacing: "0.01em" }}>
            LIST: リスト一覧
          </h1>
          {items.length > 0 && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)",
                             fontFamily: "var(--font-sans)", lineHeight: 1 }}>
                {doneItems.length}
              </span>
              <span style={{ fontSize: 10, color: "var(--color-text-soft)",
                             fontFamily: "var(--font-sans)" }}>
                /{items.length} 完了
              </span>
            </div>
          )}
        </div>
        {pairNames && (
          <p style={{ fontSize: 11, color: "var(--color-text-mid)", marginTop: 3,
                      fontFamily: "var(--font-sans)", letterSpacing: "0.04em" }}>
            {pairNames}
          </p>
        )}
        {items.length > 0 && (
          <div style={{ height: 3, background: "rgba(0,0,0,0.08)",
                        borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
            <div style={{ width: `${progress * 100}%`, height: "100%",
                          background: "var(--color-primary)", borderRadius: 2,
                          transition: "width 0.4s ease" }} />
          </div>
        )}
      </header>

      {/* ── フィルター ── */}
      <div style={{ flexShrink: 0, padding: "10px 20px 8px", display: "flex", gap: 6,
                    overflowX: "auto", scrollbarWidth: "none",
                    background: "var(--color-bg)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
        {(["all", ...CATEGORIES] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
                  style={{ flexShrink: 0, fontSize: 11, padding: "5px 13px",
                           borderRadius: 20, whiteSpace: "nowrap",
                           fontFamily: "var(--font-sans)", cursor: "pointer",
                           border: filter === f ? "none" : "1px solid rgba(0,0,0,0.12)",
                           background: filter === f ? "var(--color-text-main)" : "transparent",
                           color: filter === f ? "var(--color-bg)" : "#5C4A35" }}>
            {f === "all" ? "すべて" : f}
          </button>
        ))}
      </div>

      {/* ── スクロールエリア ── */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", paddingBottom: 80 }}>

        {/* Go!! セクション */}
        {goItems.length > 0 && (
          <div style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <SectionLabel>GO!! — 最優先リスト</SectionLabel>
            <div style={{ padding: "0 20px 12px", display: "flex", gap: 10,
                          overflowX: "auto", scrollbarWidth: "none" }}>
              {goItems.map((item) => (
                <GoCard key={item.itemId} item={item}
                        onClick={() => navigate(`/home/${item.itemId}`)}
                        onDone={() => setStatus(item.itemId, "done")}
                        onWant={() => toggleIsWant(item.itemId, item.isWant)}
                        onDelete={() => removeItem(item.itemId)} />
              ))}
            </div>
          </div>
        )}

        {/* Good カードグリッド */}
        {filteredGood.length > 0 ? (
          <>
            <SectionLabel style={{ paddingTop: 10 }}>GOOD — やりたいリスト</SectionLabel>
            <div style={{ padding: "0 20px 4px",
                          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {filteredGood.map((item) => (
                <GoodCard key={item.itemId} item={item}
                          onTap={() => navigate(`/home/${item.itemId}`)}
                          onWant={() => toggleIsWant(item.itemId, item.isWant)}
                          onDone={() => setStatus(item.itemId, "done")}
                          onDelete={() => removeItem(item.itemId)} />
              ))}
            </div>
          </>
        ) : (
          activeItems.length === 0 && (
            <EmptyState onAskAI={() => navigate("/suggest")} />
          )
        )}

        {filteredGood.length === 0 && goodItems.length > 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--color-text-soft)" }}>
              このカテゴリにはアイテムがありません
            </p>
          </div>
        )}

        {/* TRY トグル */}
        {tryItems.length > 0 && (
          <>
            <button onClick={() => setTryOpen((o) => !o)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                             padding: "14px 20px", background: "transparent", border: "none",
                             borderTop: "1px solid rgba(0,0,0,0.06)", cursor: "pointer" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
              <span style={{ fontSize: 11, color: "var(--color-text-mid)",
                             letterSpacing: "0.06em", whiteSpace: "nowrap",
                             fontFamily: "var(--font-sans)" }}>
                {tryOpen ? `TRY ${tryItems.length}件を隠す`
                         : `TRY — 試してみる？ ${tryItems.length}件`}
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
            </button>
            {tryOpen && (
              <div style={{ padding: "0 20px 4px",
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {tryItems.map((item) => (
                  <GoodCard key={item.itemId} item={item}
                            onTap={() => navigate(`/home/${item.itemId}`)}
                            onWant={() => toggleIsWant(item.itemId, item.isWant)}
                            onDone={() => setStatus(item.itemId, "done")}
                            onDelete={() => removeItem(item.itemId)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* 完了トグル */}
        {doneItems.length > 0 && (
          <>
            <button onClick={() => setDoneOpen((o) => !o)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10,
                             padding: "14px 20px", background: "transparent", border: "none",
                             borderTop: "1px solid rgba(0,0,0,0.06)", cursor: "pointer" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
              <span style={{ fontSize: 11, color: "var(--color-text-mid)",
                             letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                {doneOpen ? `完了済み ${doneItems.length}件を隠す`
                          : `完了済み ${doneItems.length}件を見る ✨`}
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.08)" }} />
            </button>
            {doneOpen && (
              <div style={{ padding: "0 20px" }}>
                {doneItems.map((item) => (
                  <DoneRow key={item.itemId} item={item}
                           onTap={() => navigate(`/home/${item.itemId}`)} />
                ))}
              </div>
            )}
          </>
        )}

        <div style={{ height: 16 }} />
      </div>

      {/* ── ボトムナビ ── */}
      <BottomNav />
    </div>
  );
};

// ── サブコンポーネント ───────────────────────────────────

const SectionLabel = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <p style={{ padding: "16px 20px 10px", fontSize: 10, letterSpacing: "0.14em",
              color: "var(--color-text-mid)", textTransform: "uppercase",
              fontFamily: "var(--font-sans)", ...style }}>
    {children}
  </p>
);

const GoCard = ({ item, onClick, onDone, onWant, onDelete }:
  { item: Item; onClick: () => void; onDone: () => void; onWant: () => void; onDelete: () => void }) => {
  const s = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE["その他"];
  const hasPhoto = !!item.placePhotoRef;
  return (
    // カード全体をボタンにしてタップ判定を全面に
    <button onClick={onClick}
            style={{ flexShrink: 0, width: 120, height: 150, borderRadius: 12, overflow: "hidden",
                     position: "relative", border: "none", padding: 0, cursor: "pointer" }}>
      {/* 背景：写真 or グラデーション */}
      {hasPhoto ? (
        <img src={photoUrl(item.placePhotoRef!)} alt={item.title} loading="lazy"
             style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: s.bg }} />
      )}
      {/* 絵文字（写真なしのみ） */}
      {!hasPhoto && (
        <div style={{ position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 40, opacity: 0.88,
                         filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.4))" }}>
            {s.emoji}
          </span>
        </div>
      )}
      {/* 暗幕オーバーレイ */}
      <div style={{ position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)",
                    pointerEvents: "none" }} />
      {/* Google評価バッジ（左上） */}
      {item.placeRating != null && (
        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.5)",
                      color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 20,
                      display: "flex", alignItems: "center", gap: 2, zIndex: 2 }}>
          <span style={{ color: "#F5C842" }}>★</span>{item.placeRating.toFixed(1)}
        </div>
      )}
      {/* ✓ 完了ボタン（右上） */}
      <button onClick={(e) => { e.stopPropagation(); onDone(); }}
              style={{ position: "absolute", top: 7, right: 7.5, zIndex: 3,
                       width: 17, height: 17, borderRadius: "50%",
                       background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)",
                       display: "flex", alignItems: "center", justifyContent: "center",
                       cursor: "pointer" }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {/* × 削除ボタン（左下） */}
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ position: "absolute", bottom: 9, left: 8, zIndex: 3,
                       background: "transparent", border: "none",
                       fontSize: 13, color: "rgba(255,255,255,0.55)", cursor: "pointer",
                       lineHeight: 1, padding: 0 }}>
        ×
      </button>
      {/* タイトル・カテゴリ（下部） */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
                    padding: "8px 28px 9px 10px", textAlign: "left" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.08em",
                      color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)",
                      marginBottom: 3 }}>
          {item.category}
        </div>
        <p style={{ fontSize: 10, fontWeight: 500, color: "#fff", lineHeight: 1.35,
                    fontFamily: "var(--font-sans)", margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </p>
      </div>
      {/* ❤️ お気に入り（右下） */}
      <button onClick={(e) => { e.stopPropagation(); onWant(); }}
              style={{ position: "absolute", bottom: 11, right: 8, zIndex: 3,
                       background: "transparent", border: "none",
                       fontSize: 13, cursor: "pointer", lineHeight: 1 }}>
        {item.isWant ? "❤️" : "🤍"}
      </button>
    </button>
  );
};

const GoodCard = ({ item, onTap, onWant, onDone, onDelete }:
  { item: Item; onTap: () => void; onWant: () => void; onDone: () => void; onDelete: () => void }) => {
  const s = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE["その他"];
  const hasPhoto = !!item.placePhotoRef;
  return (
    // カード全体をボタンにしてタップ判定を全面に
    <button onClick={onTap}
            style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 130,
                     border: "none", padding: 0, cursor: "pointer", width: "100%" }}>
      {/* 背景：写真 or グラデーション */}
      {hasPhoto ? (
        <img src={photoUrl(item.placePhotoRef!)} alt={item.title} loading="lazy"
             style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: s.bg }} />
      )}
      {/* 絵文字（写真なしのみ） */}
      {!hasPhoto && (
        <div style={{ position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 36, opacity: 0.75,
                         filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))" }}>
            {s.emoji}
          </span>
        </div>
      )}
      {/* 暗幕オーバーレイ */}
      <div style={{ position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)",
                    pointerEvents: "none" }} />
      {/* ✓ 完了ボタン（右上） */}
      <button onClick={(e) => { e.stopPropagation(); onDone(); }}
              style={{ position: "absolute", top: 7, right: 7.5, zIndex: 2,
                       width: 17, height: 17, borderRadius: "50%",
                       background: "rgba(255,255,255,0.2)", border: "1.5px solid rgba(255,255,255,0.5)",
                       display: "flex", alignItems: "center", justifyContent: "center",
                       cursor: "pointer" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {/* × 削除ボタン（左下） */}
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ position: "absolute", bottom: 9, left: 8, zIndex: 3,
                       background: "transparent", border: "none",
                       fontSize: 13, color: "rgba(255,255,255,0.55)", cursor: "pointer",
                       lineHeight: 1, padding: 0 }}>
        ×
      </button>
      {/* Google評価バッジ（左上、写真ありかつGoCardの評価なし場合のみ） */}
      {item.placeRating != null && (
        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.5)",
                      color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 20,
                      display: "flex", alignItems: "center", gap: 2, zIndex: 2 }}>
          <span style={{ color: "#F5C842" }}>★</span>{item.placeRating.toFixed(1)}
        </div>
      )}
      {/* タイトル（下部） */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
                    padding: "8px 28px 9px 10px", textAlign: "left" }}>
        <p style={{ fontSize: 10, fontWeight: 500, color: "#fff", lineHeight: 1.35,
                    fontFamily: "var(--font-sans)", margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </p>
      </div>
      {/* ❤️ お気に入り（右下） */}
      <button onClick={(e) => { e.stopPropagation(); onWant(); }}
              style={{ position: "absolute", bottom: 10, right: 8, zIndex: 3,
                       background: "transparent", border: "none",
                       fontSize: 13, cursor: "pointer", lineHeight: 1 }}>
        {item.isWant ? "❤️" : "🤍"}
      </button>
    </button>
  );
};

const EmptyState = ({ onAskAI }: { onAskAI: () => void }) => (
  <div style={{ padding: "48px 32px", textAlign: "center" }}>
    <p style={{ fontSize: 36, marginBottom: 16 }}>✨</p>
    <p style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-main)",
                marginBottom: 8, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
      やりたいことが全部完了しました！
    </p>
    <p style={{ fontSize: 13, color: "var(--color-text-mid)", marginBottom: 24, lineHeight: 1.6,
                fontFamily: "var(--font-sans)" }}>
      AIにもう一度、ふたりにぴったりの体験を提案してもらいましょう。
    </p>
    <button onClick={onAskAI}
            style={{ padding: "12px 28px", background: "var(--color-primary)",
                     color: "#fff", border: "none", borderRadius: 24,
                     fontSize: 13, fontWeight: 500, letterSpacing: "0.04em",
                     fontFamily: "var(--font-sans)", cursor: "pointer" }}>
      ✦ AIに再提案してもらう
    </button>
  </div>
);

const DoneRow = ({ item, onTap }: { item: Item; onTap: () => void }) => {
  const s = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE["その他"];
  return (
    <button onClick={onTap}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12,
                     padding: "11px 0", borderBottom: "1px solid rgba(0,0,0,0.06)",
                     background: "transparent", border: "none", cursor: "pointer", opacity: 0.55 }}>
      <div style={{ width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                    overflow: "hidden", position: "relative",
                    background: s.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 20 }}>
        {item.placePhotoRef ? (
          <img src={photoUrl(item.placePhotoRef)} alt={item.title} loading="lazy"
               style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          s.emoji
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-main)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    textDecoration: "line-through", fontFamily: "var(--font-sans)" }}>
          {item.title}
        </p>
        <p style={{ fontSize: 10, color: "var(--color-text-mid)", marginTop: 2,
                    fontFamily: "var(--font-sans)" }}>
          {item.category}{item.rating != null && ` · ${"⭐".repeat(item.rating)}`}
        </p>
      </div>
    </button>
  );
};

