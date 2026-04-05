# Lifrave 実装計画

仕様の詳細は `プロジェクト引き継ぎ情報.txt` を参照。
べびプリの流用コードは `reference/bbp-app/bbp-app_zip/src/` を参照。

---

## Phase 1：環境構築・基盤
**完了条件：** `http://localhost:5173` でエラーなく表示される

### ✅ やること
- [x] `npm create vite@latest` でプロジェクト作成
- [x] `npm install`（base）
- [x] `npm install firebase react-router-dom @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [x] `npm install -D tailwindcss @tailwindcss/postcss postcss autoprefixer`
- [x] `postcss.config.js` 作成
- [x] `src/index.css` を Tailwind v4 + テーマカラーに置き換え
- [x] `src/` ディレクトリ構造作成
- [x] `App.tsx` をスケルトンに置き換え
- [x] `.env.local` 作成（値は空）
- [ ] `npm run dev` でローカル起動確認 ← **← 承認待ち**

### ❌ このフェーズでは触らない
- Firebase 設定ファイル（→ Phase 2）
- 型定義（→ Phase 2）
- ルーティング（→ Phase 3）
- 認証（→ Phase 3）

> ⚠️ 注：Firebase 設定ファイル・型定義はすでに作成済み（先走り）。
> Phase 2 で改めて内容確認・修正する。

---

## Phase 2：Firebase 設定・DB 構築
**完了条件：** Firebase コンソールでプロジェクト作成済み・`.env.local` に値が入っている

### やること
- Firebase プロジェクト作成（コンソール操作 → ユーザー作業）
- `.env.local` に Firebase 設定値を記入
- `src/firebase/` 各ファイルの内容確認・修正
  - `config.ts` / `app.ts` / `auth.ts` / `firestore.ts` / `functions.ts`
- `src/types/index.ts` の内容確認・修正
- Firestore セキュリティルール作成（`firestore.rules`）
- `firebase.json` / `firestore.indexes.json` 作成

### ❌ このフェーズでは触らない
- ルーティング（→ Phase 3）
- 認証 UI（→ Phase 3）
- ペアリング（→ Phase 3）

---

## Phase 3：認証・ペアリング
**完了条件：** Google ログイン → ニックネーム設定 → ペア作成/参加 が動作する

### やること
- `features/auth/` — useAuth hook・LoginPage・AuthGuard
- `features/pair/` — ペア作成・招待URL・参加フロー（べびプリから流用・コレクション名 families → pairs）
- `components/Loading.tsx`
- `routes/` ルーティング設定（react-router-dom v6）
- `/login` / `/` の画面実装

### ❌ このフェーズでは触らない
- ヒアリング（→ Phase 4）
- スワイプ（→ Phase 4）
- AI 生成（→ Phase 4）

---

## Phase 4：ヒアリング・AI 生成・スワイプ
**完了条件：** ヒアリング 6 ステップ → AI でリスト生成 → スワイプ選択 が動作する

### やること
- `features/setup/` — ヒアリング 6 ステップ画面（`/setup`）
- Cloud Functions 初期化（`functions/` ディレクトリ）
- Claude API 呼び出し（50 件 JSON 生成）
- Firestore への items 保存
- スワイプ UI（`/setup/swipe`）
- おでかけ系のみ Google Maps Places API 呼び出し・キャッシュ

### ❌ このフェーズでは触らない
- ホーム・リスト管理（→ Phase 5）

---

## Phase 5：ホーム・リスト管理
**完了条件：** `/home` でリスト表示・フィルタ・ステータス変更・メモ・★ が動作する

### やること
- `features/items/` — useItems hook・itemService
- `/home` — リスト一覧・フィルタ・検索（フロント側）・完了済み折りたたみ
- `/home/:itemId` — アイテム詳細（完了チェック・メモ・★・評価）
- `@dnd-kit` 長押しドラッグ並び替え

---

## Phase 6：提案・思い出生成
**完了条件：** `/suggest` で提案表示・`/memory` で思い出テキスト生成 が動作する

### やること
- `features/suggest/` — ルールベース提案ロジック・「もう一度」3 回制限
- `features/memory/` — 期間選択・Claude API 1 コールで 3 種同時生成
- `/settings` — 設定画面

---

## Phase 7：UI 仕上げ・デプロイ
**完了条件：** Firebase Hosting にデプロイ完了・スマホ表示確認済み

### やること
- モバイル表示確認・微調整
- `/privacy` / `/terms` 静的ページ
- `firebase.json` Hosting 設定
- `npm run build` → `firebase deploy`
- 本番動作確認
