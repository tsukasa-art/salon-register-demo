import './styles/main.scss'

// モック用の型定義
interface MenuItem {
  name: string
  price: number
  category: string
}

interface MockState {
  menus: MenuItem[]
  selected: string[]
}

const state: MockState = {
  menus: [
    { name: 'カット', price: 4800, category: 'cut' },
    { name: '幼児カット', price: 1800, category: 'cut' },
    { name: 'スタンプ割', price: -300, category: 'option' },
  ],
  selected: [],
}

function formatYen (n: number): string {
  return `¥${n.toLocaleString()}`
}

function renderMenuSection (title: string, subtitle: string, items: MenuItem[]): string {
  const cards = items
    .map(
      (item) => `
      <button type="button" class="mock-menu-card w-full rounded-xl border-2 border-[var(--border-light)] bg-white p-4 text-left shadow-sm transition hover:border-[var(--soft-green)] hover:shadow-md" data-name="${item.name}" data-price="${item.price}">
        <span class="font-medium text-[var(--text-dark)]">${item.name}</span>
        <span class="mt-1 block text-lg font-semibold text-[var(--primary-green)]">${formatYen(item.price)}</span>
      </button>
    `
    )
    .join('')
  return `
    <section class="mock-section rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div class="mock-section__header">
        <h2 class="mock-section__title">${title} <span class="mock-section__subtitle">${subtitle}</span></h2>
      </div>
      <div class="grid grid-cols-1 gap-4">${cards}</div>
    </section>
  `
}

function renderProductsSection (): string {
  return `
    <section class="mock-section rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-white p-6 shadow-[var(--shadow-soft)]">
      <div class="mock-section__header">
        <h2 class="mock-section__title">Products <span class="mock-section__subtitle">商品</span></h2>
      </div>
      <button type="button" class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--soft-green)] bg-white px-5 py-4 font-semibold text-[var(--text-dark)] shadow-sm transition hover:border-[var(--light-green)] hover:bg-[var(--pale-green)]">
        <svg class="h-5 w-5 text-[var(--primary-green)]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        商品リストを表示
      </button>
    </section>
  `
}

function renderReceipt (): string {
  return `
    <aside class="rounded-[var(--radius-lg)] border-2 border-[var(--soft-green)] bg-white p-6 shadow-md">
      <h3 class="mb-4 text-xl font-semibold text-[var(--primary-green)]">ご利用明細</h3>
      <p class="text-gray-500">メニューを選択してください</p>
      <div class="mt-4 border-t border-[var(--border-light)] pt-4">
        <div class="flex justify-between text-sm text-gray-600"><span>小計（税抜）</span><span>¥0</span></div>
        <div class="flex justify-between text-sm text-gray-600"><span>消費税（10%）</span><span>¥0</span></div>
        <div class="mt-2 flex justify-between font-semibold text-[var(--text-dark)]"><span>合計</span><span>¥0</span></div>
      </div>
      <div class="mt-4">
        <label class="block text-sm font-medium text-[var(--text-dark)]">お預かり金額</label>
        <div class="mt-2 grid grid-cols-3 gap-2">
          <button type="button" class="rounded-lg border-2 border-[var(--soft-green)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--pale-green)]">5千円</button>
          <button type="button" class="rounded-lg border-2 border-[var(--soft-green)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--pale-green)]">1万円</button>
          <button type="button" class="rounded-lg border-2 border-[var(--soft-green)] px-3 py-2 text-sm font-medium transition hover:bg-[var(--pale-green)]">2万円</button>
        </div>
        <p class="mt-2 text-sm text-gray-600">お釣り ¥0</p>
      </div>
      <button type="button" class="mt-4 w-full rounded-xl bg-[var(--primary-green)] px-4 py-3 font-semibold text-white shadow transition hover:opacity-90">会計確定</button>
    </aside>
  `
}

function mount (): void {
  const app = document.getElementById('app')
  if (!app) return

  const cutItems = state.menus.filter((m) => m.category === 'cut')
  const optionItems = state.menus.filter((m) => m.category === 'option')

  app.innerHTML = `
    <div class="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <header class="mb-6 flex items-center justify-between border-b border-[var(--border-light)] bg-[var(--pale-green)] px-4 py-4 md:px-6">
        <h1 class="text-2xl font-semibold text-[var(--primary-green)]">レジ</h1>
        <button type="button" class="rounded-full bg-[var(--primary-green)] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow">MENU</button>
      </header>

      <div class="grid gap-6 md:grid-cols-[1fr_400px] md:gap-8">
        <main class="flex flex-col gap-6 md:gap-8">
          ${renderMenuSection('レジ', '', cutItems)}
          ${renderMenuSection('Option', 'オプション', optionItems)}
          ${renderProductsSection()}
        </main>
        ${renderReceipt()}
      </div>
    </div>
  `

  // カードクリックで選択状態をトグル（モック用）
  app.querySelectorAll('.mock-menu-card').forEach((el) => {
    el.addEventListener('click', () => {
      const name = (el as HTMLElement).dataset.name ?? ''
      const idx = state.selected.indexOf(name)
      if (idx === -1) state.selected.push(name)
      else state.selected.splice(idx, 1)
      el.classList.toggle('ring-2', state.selected.includes(name))
      el.classList.toggle('ring-[var(--primary-green)]', state.selected.includes(name))
    })
  })
}

mount()
