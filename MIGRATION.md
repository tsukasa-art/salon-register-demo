# サロンレジ 料金計算アプリ 移行ガイド

既存の **salon-register-app**（Vanilla JS + Vite）から **salon-register**（Vite + Vue + Vue Router）への移行手順です。このドキュメントに沿って順に進めます。

---

## 1. 概要

| 項目 | 既存（salon-register-app） | 移行先（salon-register） |
|------|-------------------------------|--------------------------|
| 場所 | `salon-calc/salon-register-app/` | `develop/salon-register/` |
| フレームワーク | Vanilla JS + Vite | Vite + Vue 3 + Vue Router 4 |
| 画面 | index.html + login.html（2ページ） | `/`（メイン）+ `/login`（ログイン） |
| 認証・DB | Supabase（Auth + Postgres） | 同一 Supabase プロジェクトを利用 |
| デプロイ | Cloudflare Pages | Cloudflare Pages（設定済み） |

---

## 2. 現在の salon-register の状態

- **ルート**: `/` = メイン画面、`/login` = ログイン画面（ひな形のみ）
- **依存**: Vue 3, Vue Router 4（Supabase は未導入）
- **ビルド**: `pnpm run build` → `dist/` 出力（Cloudflare Pages のビルド出力は `dist` に設定）

---

## 3. 移行フェーズ（進める順序）

以下の順で進めると、依存関係が少なく段階的に動作確認できます。

### Phase 1: Supabase 連携

**目的**: プロジェクトに Supabase を入れ、環境変数で URL/anon key を読めるようにする。

| 手順 | 内容 | 参照（既存） |
|------|------|--------------|
| 1.1 | `@supabase/supabase-js` をインストール | `salon-register-app/package.json` |
| 1.2 | `.env.example` を作成（`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEMO_USER_EMAIL`） | `.env.example`, `src/env-config.js` |
| 1.3 | Supabase クライアントを 1 箇所で作成（例: `src/lib/supabase.js`）し、`import.meta.env.VITE_*` で初期化 | `src/env-config.js` |
| 1.4 | アプリ起動時にクライアントを利用可能にする（plugin または provide/inject） | - |

**成果**: どのコンポーネントからも `supabase` にアクセスできる状態。

---

### Phase 2: 認証フロー

**目的**: ログイン画面でメール/パスワード認証し、セッションがあればメインへ、なければログインへ誘導する。

| 手順 | 内容 | 参照（既存） |
|------|------|--------------|
| 2.1 | 認証用 composable または store を作成（`login`, `logout`, `getSession`, 自動ログイン用セッション保存） | `auth.js`（AuthManager, AutoLoginManager） |
| 2.2 | ログイン画面にフォームを実装（メール・パスワード・送信）し、認証成功時に `/` へリダイレクト | `login.html`, `src/login-main.js` |
| 2.3 | ルートガードを設定：未認証で `/` にアクセスしたら `/login` へリダイレクト | `boot.js` のリダイレクト処理 |
| 2.4 | メイン画面の「ログアウト」で `logout` 実行後、`/login` へ遷移 | `boot.js`, `auth.js` |

**成果**: ログイン → メイン表示、未ログインでメインアクセス → ログインへ、ログアウト → ログイン。

---

### Phase 3: メイン画面（レジ・料金計算）

**目的**: メニュー選択・明細・合計・お預かり・お釣り・会計確定まで動くようにする。

| 手順 | 内容 | 参照（既存） |
|------|------|--------------|
| 3.1 | メニューデータ（施術・価格）の定義を移植。必要なら Supabase から取得する処理を追加 | `script.js` 内のメニュー定義、DataCache |
| 3.2 | メイン画面のレイアウトを組み立てる（ヘッダー・メニューエリア・明細エリア・合計・お預かり・お釣り・会計確定・クリア） | `index.html` の構造、`style.css` |
| 3.3 | カート（明細）の状態管理（追加・削除・数量変更）と割引ロジック（カラー時カット料金など）を実装 | `script.js`（DataCache, 割引計算） |
| 3.4 | 会計確定・クリアの処理。必要ならレシート保存（Supabase または IndexedDB） | `script.js`, 既存 API/テーブル |

**成果**: メニューを選んで明細に追加し、合計・お預かり・お釣りを表示して会計確定できる。

---

### Phase 4: 追加機能（締め作業・履歴・バックアップ・商品）

**目的**: 日次締め・過去履歴・バックアップ・商品モーダルなど、既存で使っている機能を Vue で再実装する。

| 手順 | 内容 | 参照（既存） |
|------|------|--------------|
| 4.1 | 締め作業モーダル（日次レポート・データクリア） | `boot.js`（showDailyClosingModal）, 関連 UI |
| 4.2 | 過去の履歴（1週間分の売上） | `boot.js`（showWeeklyHistory） |
| 4.3 | データバックアップ（IndexedDB バックアップ・復元） | `src/backup/*`, `src/core/IndexedDBManager.js` 等 |
| 4.4 | 商品リストモーダル・一時商品追加 | `index.html` の productDialog, script.js 内の商品処理 |
| 4.5 | スライドメニュー（ハンバーガー）の開閉と各項目の紐付け | `index.html` の slide-menu, `boot.js` |

**成果**: 既存と同等の操作が Vue 版でできる。

---

### Phase 5: PWA

**目的**: ホーム画面に追加してネイティブアプリ風に使えるようにする。

| 手順 | 内容 | 参照（既存） |
|------|------|--------------|
| 5.1 | `manifest.json` を配置（名前・アイコン・theme-color 等） | `salon-register-app/manifest.json`, index.html の link |
| 5.2 | Service Worker を登録（キャッシュ・オフライン用）。必要なら既存 `sw.js` をベースにビルドに合わせて調整 | `sw.js`, `public/sw.js` |
| 5.3 | アイコン画像を `public/` に配置 | `images/` 等 |

**成果**: インストール可能な PWA として動作。

- 実装済み: `public/manifest.json`（theme_color: #5a8f6a）、`public/sw.js`（ネットワーク優先・Supabase はキャッシュしない）、本番のみ `main.js` で SW 登録。`index.html` に manifest / theme-color / apple-mobile-web-app メタを追加。
- アイコン: `public/images/` に `android-chrome-192x192.png` と `android-chrome-512x512.png` を置くと「ホームに追加」時のアイコンが反映されます。既存プロジェクトの `images/` からコピー可能。

---

### Phase 6: スタイル・レスポンシブ

**目的**: 既存の見た目（緑テーマ・モバイル/デスクトップ切替）に近づける。

| 手順 | 内容 | 参照（既存） |
|------|------|--------------|
| 6.1 | 既存の `style.css` / `system-override.css` の変数やレイアウトを Vue 用に取り込む（グローバル or コンポーネント） | `style.css`, `system-override.css` |
| 6.2 | メイン/ログインのヘッダー・ボタン・明細エリアのスタイルを合わせる | `style.css` の .main-header, .mobile-header 等 |
| 6.3 | レスポンシブ・レイアウト調整（768px/767px/480px、content-wrapper 1 列、スライドメニュー上部余白） | `style.css` のメディアクエリ |

**成果**: 既存アプリと同等の見た目・操作性。

- 実装済み: `src/style.css` に変数・ベース・メイン/ログイン/明細/ボタン/レスポンシブを移植。`SlideMenu.vue` に 767px 時の `padding-top: 100px` を追加。

---

## 4. 既存ファイルとの対応（参照用）

| 既存（salon-register-app） | 移行先での扱い |
|--------------------------------|----------------|
| `src/env-config.js` | `src/lib/supabase.js` + 環境変数（.env） |
| `auth.js` | composable（例: `src/composables/useAuth.js`）または store |
| `login.html` + `src/login-main.js` | `src/views/LoginView.vue` + 認証 composable |
| `index.html`（メインの構造） | `src/views/MainView.vue` + 子コンポーネント |
| `script.js`（メニュー・キャッシュ・明細・会計） | 分割: composables / components / メニューデータ |
| `boot.js`（初期化・イベント紐付け） | ルートガード・MainView の onMounted 等に分散 |
| `config.js` | 環境変数（Vite）に集約。非公開値は Cloudflare の環境変数 |
| `src/core/*`（IndexedDB, DataCache, DisasterRecovery 等） | 必要に応じて `src/lib/` や composables に移植 |
| `src/backup/*` | Phase 4 で `src/backup/` または `src/lib/` に移植 |
| `style.css` / `system-override.css` | Phase 6 で `src/style.css` 等に取り込み |

---

## 5. 環境変数

**開発時（.env）**

- `VITE_SUPABASE_URL` … Supabase プロジェクト URL  
- `VITE_SUPABASE_ANON_KEY` … anon key  
- `VITE_DEMO_USER_EMAIL` … デモ用メール（任意）

**本番（Cloudflare Pages）**

- 同じ名前で「設定」→「環境変数」に追加（本番・プレビューのどちらに出すか指定）。

`.env` はリポジトリに含めず、`.env.example` のみコミットする。

---

## 6. Cloudflare Pages の注意点

- **ビルドコマンド**: `pnpm run build`（または `npm run build`）  
- **ビルド出力ディレクトリ**: `dist`  
- **SPA 用**: Vue Router が history モードのため、「404 を index.html にフォールバック」するルールを有効にする（Pages の「ビルド」設定など）。

---

## 7. 進め方の目安

1. **Phase 1** まで完了 → ローカルで `pnpm run dev` し、Supabase クライアントが読めることを確認。  
2. **Phase 2** まで完了 → ログイン → メイン → ログアウトの流れを確認。  
3. **Phase 3** まで完了 → レジとして最低限使える状態。  
4. **Phase 4〜6** は必要に応じて順に追加。

既存の salon-register-app は本番でそのまま運用し、salon-register は別ブランチまたは別リポジトリで進め、動作が揃った時点で切り替える想定で問題ありません。
