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

type SwipeAction = "good" | "pass" | "go";

export const SwipePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { generate, loading: generating } = useGenerateItems();

  const [items, setItems] = useState<ItemDraft[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ draft: ItemDraft; action: SwipeAction }[]>([]);
  const [saving, setSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(true);

  // タッチ/マウス スワイプ
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
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
    setDragY(0);
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
          if (action === "pass") return;
          const ref = doc(collection(db, "pairs", pairId, "items"));
          batch.set(ref, {
            ...draft,
            status: "todo",
            isWant: action === "go",
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
        setSaving(false);
        setShowComplete(true);
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
    startY.current = e.clientY;
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || startX.current === null || startY.current === null) return;
    setDragX(e.clientX - startX.current);
    setDragY(e.clientY - startY.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const absX = Math.abs(dragX);
    const absY = Math.abs(dragY);
    if (absY > absX && dragY < -80) {
      handleAction("go");
    } else if (dragX > 80) {
      handleAction("good");
    } else if (dragX < -80) {
      handleAction("pass");
    } else {
      setDragX(0);
      setDragY(0);
    }
    startX.current = null;
    startY.current = null;
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

  if (showComplete) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-6 text-center">
      <p className="text-7xl animate-bounce">🎉</p>
      <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>
        素敵なリストが完成しました！
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-mid)" }}>
        さあ、ここから<br />
        ふたりの思い出づくりを <br />
        始めましょう！
      </p>
      <button
        className="btn-primary max-w-xs mt-4"
        onClick={() => navigate("/home", { replace: true })}
      >
        リストを見る →
      </button>
    </div>
  );

  if (index >= items.length && items.length > 0) {
    return <Loading message="リストを保存中..." />;
  }

  if (!current) return null;

  const rotation = dragX * 0.08;
  const opacity = Math.max(0, 1 - Math.abs(dragX) / 300);

  // どの方向にドラッグ中か
  const absX = Math.abs(dragX);
  const absY = Math.abs(dragY);
  const isGoHint = absY > absX && dragY < -30;
  const isGoodHint = !isGoHint && dragX > 30;
  const isPassHint = !isGoHint && dragX < -30;

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
      <div className="relative w-full max-w-sm">
        <div
          className="card w-full p-6 flex flex-col items-center gap-4 cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `translateX(${dragX}px) translateY(${Math.min(0, dragY)}px) rotate(${rotation}deg)`,
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
          {isGoodHint && (
            <div className="absolute top-4 right-4 text-2xl font-black"
                 style={{ color: "var(--color-primary)", opacity: Math.min(1, dragX / 80) }}>
              Good ⇨
            </div>
          )}
          {isPassHint && (
            <div className="absolute top-4 left-4 text-2xl font-black"
                 style={{ color: "var(--color-text-soft)", opacity: Math.min(1, -dragX / 80) }}>
              ⇦ Pass
            </div>
          )}
          {isGoHint && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-2xl font-black"
                 style={{ color: "#f43f5e", opacity: Math.min(1, -dragY / 80) }}>
              ⇧ Go!!
            </div>
          )}
        </div>
      </div>

      {/* ボタン操作 */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button
          className="w-full py-3 rounded-2xl font-bold text-sm"
          style={{ background: "#f43f5e", color: "white" }}
          onClick={() => handleAction("go")}
        >
          ⇧ Go!! （お気に入り）
        </button>
        <div className="flex gap-3">
          <button
            className="flex-1 py-4 rounded-2xl border-2 font-bold text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-mid)", background: "var(--color-surface)" }}
            onClick={() => handleAction("pass")}
          >
            ⇦ Pass
          </button>
          <button
            className="flex-1 py-4 rounded-2xl font-bold text-sm"
            style={{ background: "var(--color-primary)", color: "white" }}
            onClick={() => handleAction("good")}
          >
            Good ⇨
          </button>
        </div>
      </div>

    </div>
  );
};

const Tag = ({ label }: { label: string }) => (
  <span className="text-xs font-bold px-3 py-1 rounded-full"
        style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
    {label}
  </span>
);
