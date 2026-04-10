// src/components/InstallPrompt.tsx
import { useState, useEffect } from "react";

// BeforeInstallPromptEvent は標準型定義に含まれないため独自定義
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
  window.matchMedia("(display-mode: standalone)").matches;

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 既にインストール済み or 過去に非表示にした場合はスキップ
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem("install-prompt-dismissed")) return;

    // Android / Chrome: beforeinstallprompt を捕捉
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS Safari: スタンドアロンでなければヒント表示
    if (isIos()) {
      setShowIosHint(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    handleDismiss();
  };

  const handleDismiss = () => {
    sessionStorage.setItem("install-prompt-dismissed", "1");
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIosHint(false);
  };

  if (dismissed) return null;

  // Android: ネイティブインストールバナー
  if (deferredPrompt) return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      padding: "16px 20px",
      background: "var(--color-surface)",
      borderTop: "1px solid var(--color-border)",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.10)",
      display: "flex", alignItems: "center", gap: 14,
      fontFamily: "var(--font-sans)",
    }}>
      <img src="/apple-touch-icon.png" alt="KataLog"
           style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-main)",
                    margin: 0, marginBottom: 2 }}>
          KataLog をインストール
        </p>
        <p style={{ fontSize: 11, color: "var(--color-text-soft)", margin: 0 }}>
          ホーム画面に追加してすぐ開けます
        </p>
      </div>
      <button onClick={handleDismiss}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px",
                       color: "var(--color-text-soft)", fontSize: 13, flexShrink: 0 }}>
        後で
      </button>
      <button onClick={handleInstall}
              style={{ background: "var(--color-primary)", color: "#fff", border: "none",
                       borderRadius: 20, padding: "8px 16px", fontSize: 13, fontWeight: 600,
                       cursor: "pointer", flexShrink: 0 }}>
        追加
      </button>
    </div>
  );

  // iOS Safari: 手動操作ヒント
  if (showIosHint) return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      padding: "16px 20px 32px",
      background: "var(--color-surface)",
      borderTop: "1px solid var(--color-border)",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.10)",
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-main)", margin: 0 }}>
          ホーム画面に追加できます
        </p>
        <button onClick={handleDismiss}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0,
                         color: "var(--color-text-soft)", fontSize: 13 }}>
          ✕
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 22 }}>⬆️</span>
        <p style={{ fontSize: 12, color: "var(--color-text-mid)", margin: 0, lineHeight: 1.7 }}>
          Safari 下部の <strong>共有ボタン</strong> →「<strong>ホーム画面に追加</strong>」
        </p>
      </div>
    </div>
  );

  return null;
};
