// src/lib/token.ts

/** 招待トークンを生成する（12文字のランダム英数字） */
export const generateInviteToken = (): string => {
  const chars = "ABCDEFGHIJKLMNOQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

/** 招待URLを生成する: https://xxxx.web.app/?invite=pairId&token=xxxx */
export const generateInviteUrl = (pairId: string, inviteToken: string): string => {
  const base = window.location.origin;
  return `${base}/?invite=${pairId}&token=${inviteToken}`;
};

const SESSION_KEY = "inviteParams";

/**
 * 現在のURLから招待パラメータを取得する。
 * URLに存在すれば sessionStorage にも保存（OAuthリダイレクト後の復元用）。
 * URLになければ sessionStorage を fallback として使用。
 */
export const getInviteParams = (): { pairId: string; token: string } | null => {
  const params = new URLSearchParams(window.location.search);
  const pairId = params.get("invite");
  const token = params.get("token");
  if (pairId && token) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ pairId, token }));
    return { pairId, token };
  }
  // OAuthリダイレクト後など URL パラメータが消えた場合の復元
  const saved = sessionStorage.getItem(SESSION_KEY);
  if (saved) {
    try { return JSON.parse(saved) as { pairId: string; token: string }; } catch { /* ignore */ }
  }
  return null;
};

/** 参加完了後に sessionStorage の招待パラメータを削除する */
export const clearInviteParams = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};
