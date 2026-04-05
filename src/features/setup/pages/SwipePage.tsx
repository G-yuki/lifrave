// src/features/setup/pages/SwipePage.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { Loading } from "../../../components/Loading";
import { useGenerateItems } from "../hooks/useGenerateItems";
import { getUserPairId } from "../../pair/services/pairService";
import { db } from "../../../firebase/firestore";
import {
  doc, getDoc, collection, writeBatch, serverTimestamp,
} from "firebase/firestore";
import type { Hearing, ItemDraft } from "../../../types";
import { OUTDOOR_CATEGORIES } from "../../../lib/constants";

type SwipeAction = "todo" | "skip" | "want";

export const SwipePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { generate, loading: generating } = useGenerateItems();

  const [items, setItems] = useState<ItemDraft[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ draft: ItemDraft; action: SwipeAction }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  // タッチ/マウス スワイプ
  const startX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const pairId = await getUserPairId(user.uid);
        if (!pairId) { navigate("/"); return; }
        const pairSnap = await getDoc(doc(db, "pairs", pairId));
        if (!pairSnap.exists()) { navigate("/"); return; }
        const hearing = pairSnap.data().hearing as Hearing | undefined;
        if (!hearing) { navigate("/setup"); return; }

        const generated = await generate(hearing);
        if (generated) setItems(generated);
      } finally {
        setInitLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const current = items[index];
  const isOutdoor = current
    ? OUTDOOR_CATEGORIES.includes(current.category as never)
    : false;

  const handleAction = (action: SwipeAction) => {
    if (!current) return;
    setResults((prev) => [...prev, { draft: current, action }]);
    setDragX(0);
    setIndex((i) => i + 1);
  };

  // 全件完了後 Firestore 保存
  useEffect(() => {
    if (items.length === 0 || index < items.length) return;
    (async () => {
      if (!user) return;
      setSaving(true);
      try {
        const pairId = await getUserPairId(user.uid);
        if (!pairId) throw new Error("no pairId");
        const batch = writeBatch(db);
        results.forEach(({ draft, action }) => {
          if (action === "skip") return;
          const ref = doc(collection(db, "pairs", pairId, "items"));
          batch.set(ref, {
            ...draft,
            status: "todo",
            isWant: action === "want",
            rating: null,
            memo: null,
            completedAt: null,
            placeId: null,
            placeName: null,
            placeRating: null,
            placePhotoRef: null,
            createdAt: serverTimestamp(),
          });
        });
        await batch.commit();
        navigate("/home");
      } catch {
        setError("保存に失敗しました。もう一度お試しください。");
        setSaving(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, items.length]);

  // タッチ操作
  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || startX.current === null) return;
    setDragX(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragX > 80) handleAction("todo");
    else if (dragX < -80) handleAction("skip");
    else setDragX(0);
    startX.current = null;
  };

  if (initLoading || generating) return <Loading message="AIがリストを生成中..." />;
  if (saving) return <Loading message="リストを保存中..." />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
      <p className="text-red-500 text-sm text-center">{error}</p>
      <button className="btn-primary max-w-xs" onClick={() => navigate("/setup")}>
        ヒアリングに戻る
      </button>
    </div>
  );

  // 全件スワイプ完了
  if (index >= items.length && items.length > 0) {
    return <Loading message="リストを保存中..." />;
  }

  if (!current) return null;

  const rotation = dragX * 0.08;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 300);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-4 py-8">
      {/* 進捗 */}
      <div className="w-full max-w-sm text-center">
        <p className="text-sm font-bold mb-2" style={{ color: "var(--color-text-mid)" }}>
          {index + 1} / {items.length}
        </p>
        <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
          <div className="h-1.5 rounded-full transition-all"
               style={{ width: `${(index / items.length) * 100}%`, background: "var(--color-primary)" }} />
        </div>
      </div>

      {/* カード */}
      <div
        className="card w-full max-w-sm p-6 flex flex-col items-center gap-4 cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          opacity,
          transition: dragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
          touchAction: "none",
          minHeight: 280,
          justifyContent: "center",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <span className="text-5xl">{isOutdoor ? "🗺️" : "🏠"}</span>
        <p className="text-xl font-bold text-center" style={{ color: "var(--color-text-main)" }}>
          {current.title}
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          <Tag label={current.category} />
          <Tag label={current.difficulty === "easy" ? "気軽" : "特別"} />
        </div>

        {/* スワイプヒント */}
        {dragX > 30 && (
          <div className="absolute top-4 left-4 text-2xl font-black"
               style={{ color: "var(--color-primary)", opacity: Math.min(1, dragX / 80) }}>
            ✓ やる
          </div>
        )}
        {dragX < -30 && (
          <div className="absolute top-4 right-4 text-2xl font-black"
               style={{ color: "var(--color-text-soft)", opacity: Math.min(1, -dragX / 80) }}>
            スキップ
          </div>
        )}
      </div>

      {/* ボタン操作 */}
      <div className="w-full max-w-sm flex gap-3">
        <button
          className="flex-1 py-4 rounded-2xl border-2 font-bold text-sm"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-mid)", background: "var(--color-surface)" }}
          onClick={() => handleAction("skip")}
        >
          ← スキップ
        </button>
        <button
          className="py-4 px-5 rounded-2xl font-bold text-sm"
          style={{ background: "var(--color-accent)", color: "var(--color-text-main)" }}
          onClick={() => handleAction("want")}
        >
          ★ やりたい
        </button>
        <button
          className="flex-1 py-4 rounded-2xl font-bold text-sm"
          style={{ background: "var(--color-primary)", color: "white" }}
          onClick={() => handleAction("todo")}
        >
          やる →
        </button>
      </div>

      <p className="text-xs text-center mt-2" style={{ color: "var(--color-text-soft)" }}>
        左にスワイプ：スキップ　右にスワイプ：やる
      </p>
    </div>
  );
};

const Tag = ({ label }: { label: string }) => (
  <span className="text-xs font-bold px-3 py-1 rounded-full"
        style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
    {label}
  </span>
);
