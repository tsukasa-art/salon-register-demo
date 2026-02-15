# Salon Register（デモ版）

美容室向け料金計算レジの**デモ用**フロントエンドです。  
Vite + Vanilla JS で構成し、**Supabase は使わず** JSON と IndexedDB のみで動作します。

## 技術スタック

- **Vite**（ビルド・開発サーバー）
- **Vanilla JavaScript**（Vue なし）
- **データ**: メニュー・商品は `public/menus.json` / `public/products.json`、会計履歴は **IndexedDB**

## 使い方

```bash
pnpm install
pnpm run dev
```

`http://localhost:5173/login.html` で「デモで始める」→ メイン画面でレジ操作ができます。

## ビルド

```bash
pnpm run build
```

`dist/` に出力されます。静的ホスティング（Cloudflare Pages など）にそのままデプロイできます。

## 本番について

実運用版は別プロジェクト（salon-register-app）で Supabase を使用しています。  
このリポジトリは面接・ポートフォリオ用のデモです。
