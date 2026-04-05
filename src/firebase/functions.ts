// src/firebase/functions.ts
import { getFunctions } from "firebase/functions";
import { firebaseApp } from "./app";

export const functions = getFunctions(firebaseApp, "asia-northeast1");
