# サロンレジ デモ — モジュール構造

## JavaScript / TypeScript モジュール構成

```
src/
├── main.js (662行)          ← エントリーポイント・画面初期化
├── register.js (246行)      ← レジ状態管理（顧客・明細・割引計算）
├── auth.js (25行)           ← 簡易認証（sessionStorage フラグ）
├── login.js (13行)          ← ログイン画面処理
├── categoryInfo.ts (20行)   ← Category 型・CategoryInfo 型・CATEGORY_ORDER 定数
├── db.ts (158行)            ← Receipt / ReceiptItem / ExportData 型、IndexedDB 操作
└── modules/
    ├── store.ts (72行)      ← MenuItem / Product / MenusByCategory 型、JSON 読み込みと永続化
    ├── menu.js (56行)       ← メニューセクション描画
    ├── receiptUI.js (224行) ← 明細 UI 描画
    ├── payment.js (133行)   ← 会計確定処理（個別・まとめて）
    ├── priceSettings.js (60行)      ← 価格・割引設定（localStorage 永続化）
    ├── settingsModal.js (148行)     ← 設定モーダル
    ├── theme.js (177行)             ← テーマ管理
    ├── slideMenu.js (60行)          ← ハンバーガーメニュー
    ├── checkoutPopup.js (42行)      ← 会計完了ポップアップ
    ├── keyboardShortcuts.js (113行) ← ショートカット（Enter/Esc/`/`/0-9）
    └── utils.js (151行)             ← モーダル・ダイアログ共通処理
```

TypeScript を適用しているのはデータ層の 3 ファイル（`categoryInfo.ts` / `db.ts` / `modules/store.ts`）のみ。UI 層は Vanilla JS のまま。

## SCSS モジュール構成

```
src/
├── style.scss (33行) ← エントリーポイント、各パーシャルをインポート
└── styles/
    ├── _variables.scss (72行)        ← CSS 変数・カスタムプロパティ
    ├── _layout.scss (406行)          ← グリッド・ヘッダー・メインコンテンツ
    ├── _receipt.scss (241行)         ← レシートエリア
    ├── _payment.scss (273行)         ← 支払い UI コンポーネント
    ├── _customers.scss (120行)       ← 顧客リスト
    ├── _product-dialog.scss (406行)  ← 商品検索ダイアログ
    ├── _slide-menu.scss (88行)       ← ハンバーガーメニュー
    ├── _theme-settings.scss (290行)  ← テーマ設定モーダル
    ├── _daily-closing.scss (586行)   ← 日次締めモーダル
    ├── _weekly-history.scss (639行)  ← 週次履歴モーダル
    ├── _admin-modal.scss (168行)     ← 管理者モーダル
    ├── _modal-base.scss (178行)      ← モーダル共通スタイル
    ├── _buttons.scss (182行)         ← ボタンコンポーネント
    └── _responsive.scss (120行)      ← レスポンシブ対応
```

## 技術スタック

| 項目 | 内容 |
|---|---|
| ビルド | Vite |
| 言語 | Vanilla JS（UI 層）+ TypeScript（データ層） |
| スタイル | SCSS（Dart Sass）、CSS 変数でテーマ色を一元管理 |
| データ永続化 | IndexedDB（会計履歴）/ localStorage（設定・商品） |
