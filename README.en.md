# Salon POS Workflow Demo

[日本語](README.md)

A public browser demo that covers the workflow of a small hair salon, from
customer intake and checkout to daily closing reports.

The demo is separated from any operational system. It uses no backend or real
customer information and runs entirely with sample menu data, IndexedDB, and
localStorage. The mobile-first interface is designed for phones, tablets, and
desktop screens used at a counter.

**[Open the live demo →](https://salon-register-demo.pages.dev/)**

## Workflow covered

1. **Customer intake** — add multiple customers and manage services separately.
2. **Menu and product selection** — apply services, retail products, prices, and discounts.
3. **Checkout** — choose individual or combined checkout and calculate change.
4. **History** — store receipts in IndexedDB and review the previous week.
5. **Daily closing** — calculate sales, average spend, top products, and peak hours.
6. **Data management** — back up and restore receipt history as JSON.

## Implementation highlights

| Area | Implementation |
|---|---|
| UI | Vite and vanilla JavaScript, split into feature modules under `src/modules/` |
| Typed data layer | TypeScript models for receipts, menu items, products, and categories |
| Local persistence | IndexedDB for receipts; localStorage for settings and products |
| Responsive design | Mobile-first layout with tablet and desktop breakpoints |
| Keyboard support | Shortcuts for checkout, closing dialogs, search focus, and amount entry |
| Offline support | Web App Manifest and a Service Worker registered in production builds |

### Public-demo boundary

- The login screen demonstrates the flow but does not perform server authentication.
- Menu items and products come from sample JSON committed to this repository.
- Receipt history and settings remain in the current browser and are not sent to a server.
- Role management, server synchronization, payment-terminal integration, and audit logging are out of scope.

## Main features

- Multiple customers with individual or combined checkout
- Configurable service prices and discounts
- Product creation, price updates, and deletion
- Theme presets and custom themes
- JSON backup and restore for IndexedDB receipt history
- Daily reports, top products, peak hours, and weekly history

## Technology

| Area | Technology |
|---|---|
| Build | Vite |
| Frontend | Vanilla JavaScript and TypeScript |
| Styling | SCSS and Tailwind CSS |
| Data | IndexedDB, localStorage, and JSON |
| Hosting | Cloudflare Pages |

See [MODULE_STRUCTURE.md](MODULE_STRUCTURE.md) for the source layout.

## Run locally

```bash
pnpm install
pnpm run dev
```

Open `/login.html` at the local URL printed by Vite.

## Build

```bash
pnpm run build
```

The static build is written to `dist/`.
