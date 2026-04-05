// src/firebase/app.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { firebaseConfig } from "./config";

// 二重初期化を防ぐ
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
