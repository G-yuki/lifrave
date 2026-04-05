// src/lib/token.ts

/** 招待トークンを生成する（12文字のランダム英数字） */
export const generateInviteToken = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

/** 招待URLを生成する: https://xxxx.web.app/?invite=pairId&token=xxxx */
export const generateInviteUrl = (pairId: string, inviteToken: string): string => {
  const base = window.location.origin;
  return `${base}/?invite=${pairId}&token=${inviteToken}`;
};

/** 現在のURLから招待パラメータを取得する。招待URLでなければ null */
export const getInviteParams = (): { pairId: string; token: string } | null => {
  const params = new URLSearchParams(window.location.search);
  const pairId = params.get("invite");
  const token = params.get("token");
  if (!pairId || !token) return null;
  return { pairId, token };
};
