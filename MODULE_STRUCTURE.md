# Salon Register モジュール構造

salon-register-app プロジェクトの思想を活かし、適切な粒度でモジュール化しました。

## JavaScript モジュール構成 (10ファイル)

```
src/
├── main.js (589行) ← エントリーポイント、初期化ロジック
└── modules/
    ├── utils.js (31行) ← 共通ユーティリティ
    ├── priceSettings.js (94行) ← 価格設定・計算ロジック
    ├── theme.js (252行) ← テーマ管理
    ├── settingsModal.js (158行) ← 設定モーダル
    ├── store.js (78行) ← データストア・メニュー読み込み
    ├── receiptUI.js (201行) ← レシート・顧客リスト UI
    ├── menu.js (118行) ← メニューセクション表示
    ├── checkoutPopup.js (28行) ← 会計完了ポップアップ
    ├── slideMenu.js (64行) ← スライドメニュー
    └── payment.js (134行) ← 支払い・会計処理
```

**元の構成:** main.js (1312行) の単一ファイル  
**現在:** 10ファイルに機能分割（各ファイル 30-260行）

## SCSS モジュール構成 (14ファイル)

```
src/
├── style.scss (34行) ← エントリーポイント、各パーシャルをインポート
└── styles/
    ├── _variables.scss (67行) ← CSS変数・カスタムプロパティ
    ├── _layout.scss (406行) ← グリッド・ヘッダー・メインコンテンツ
    ├── _receipt.scss (135行) ← レシートエリア
    ├── _payment.scss (223行) ← 支払いUIコンポーネント
    ├── _customers.scss (120行) ← 顧客リスト
    ├── _product-dialog.scss (430行) ← 商品検索ダイアログ
    ├── _slide-menu.scss (71行) ← ハンバーガーメニュー
    ├── _theme-settings.scss (197行) ← テーマ設定モーダル
    ├── _daily-closing.scss (411行) ← 日次締めモーダル
    ├── _weekly-history.scss (502行) ← 週次履歴モーダル
    ├── _admin-modal.scss (167行) ← 管理者モーダル
    ├── _modal-base.scss (89行) ← モーダル共通スタイル
    ├── _buttons.scss (165行) ← ボタンコンポーネント
    └── _responsive.scss (119行) ← レスポンシブ対応
```

**元の構成:**
- salon-register-app: style.css (6013行) + system-override.css (355行)
- salon-register (初期): style.css (3108行) の単一ファイル

**現在:** 14ファイルに機能分割（各ファイル 70-500行）

## 設計思想

### 適切な粒度
- **1000行超えのファイルをゼロに**: 最大ファイルサイズ 589行（main.js）
- **機能単位で分割**: 各モジュールが明確な責務を持つ
- **可読性重視**: ファイル名から内容が推測できる

### 保守性
- **循環依存の回避**: コールバックパターンで依存を管理
- **変更の局所化**: 機能追加・修正が特定ファイル内で完結
- **テスト容易性**: 各モジュールを独立してテスト可能

### 元プロジェクトとの比較
- **salon-register-app**: 大きめのファイル構成（style.css 6013行）
- **現行**: より細かい機能分割で保守性を向上

## 技術スタック
- **TypeScript**: 型安全性を確保（tsconfig.json）
- **SCSS**: CSS変数・ネスト・パーシャルを活用
- **Tailwind CSS v4**: ユーティリティファーストCSS
- **Vite**: 高速ビルド・HMR対応
