# サロンレジ デモ

美容室・サロン向けの料金計算レジの**デモ用**フロントエンドです。  
Vite + Vanilla JS で構成し、バックエンドなしで **JSON と IndexedDB のみ**で動作します。

## 技術スタック

- **Vite**（ビルド・開発サーバー）
- **Vanilla JavaScript**（フレームワークなし）
- **データ**: メニュー・商品は `public/menus.json` / `public/products.json`、会計履歴は **IndexedDB**

### モック（TypeScript + SCSS + Tailwind CSS）

本番の `main.js` / `style.css` とは別に、**モック**を用意しています。TypeScript・SCSS・Tailwind CSS で構成し、デバッグしやすい小さい単位でレジUIを試せます。

- **エントリ**: `mock.html` → `src/mock/main.ts` + `src/mock/styles/main.scss`
- **起動**: `pnpm run dev` のあと、ブラウザで `http://localhost:5173/mock.html` を開く
- **ビルド**: `pnpm run build` に含まれ、`dist/mock.html` に出力されます

## 主な機能

- レジ操作（複数顧客・メニュー/商品選択・合計・お預かり・お釣り・会計確定）
- 価格・割引設定（カラー時/パーマ時カット料金、施術価格の上書き）
- 商品管理（商品の追加・価格上書き・削除）
- テーマ（色のプリセット・カスタム保存）
- 今日の売上・履歴・締め作業

## 使い方

```bash
pnpm install
pnpm run dev
```

開発サーバー起動後、表示された URL（例: `http://localhost:5173`）で `/login.html` を開き、「デモで始める」を押すとメイン画面へ進みます。**ログイン認証はありません**（ボタン操作で入るだけのデモ用の入り口です）。

## ビルド

```bash
pnpm run build
```

`dist/` に出力されます。静的ホスティング（Cloudflare Pages など）にそのままデプロイできます。

## 注意

このリポジトリは**デモ・ポートフォリオ用**です。実運用でバックエンドと連携する場合は別構成になります。
