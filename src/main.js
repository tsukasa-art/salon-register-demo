import { requireAuth, logout } from './auth.js'
import { createRegister } from './register.js'
import { getCategoryInfo, CATEGORY_ORDER } from './categoryInfo.js'
import * as db from './db.js'

if (!requireAuth()) throw new Error('redirecting to login')

const THEME_STORAGE_KEY = 'salon_register_theme'
const CUSTOM_PRESETS_STORAGE_KEY = 'salon_register_theme_custom_presets'

const PRICE_SETTINGS_KEY = 'salon_register_price_settings'
const DEFAULT_PRICE_SETTINGS = {
  discountCutWithColor: 2800,
  discountCutWithPerm: 0,
  menuPriceOverrides: {},
  productPriceOverrides: {}
}
function getPriceSettings() {
  try {
    const raw = localStorage.getItem(PRICE_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_PRICE_SETTINGS, menuPriceOverrides: {}, productPriceOverrides: {} }
    const parsed = JSON.parse(raw)
    return {
      discountCutWithColor: typeof parsed.discountCutWithColor === 'number' ? parsed.discountCutWithColor : DEFAULT_PRICE_SETTINGS.discountCutWithColor,
      discountCutWithPerm: typeof parsed.discountCutWithPerm === 'number' ? parsed.discountCutWithPerm : DEFAULT_PRICE_SETTINGS.discountCutWithPerm,
      menuPriceOverrides: parsed.menuPriceOverrides && typeof parsed.menuPriceOverrides === 'object' ? parsed.menuPriceOverrides : {},
      productPriceOverrides: parsed.productPriceOverrides && typeof parsed.productPriceOverrides === 'object' ? parsed.productPriceOverrides : {}
    }
  } catch {
    return { ...DEFAULT_PRICE_SETTINGS, menuPriceOverrides: {}, productPriceOverrides: {} }
  }
}
function savePriceSettings(settings) {
  localStorage.setItem(PRICE_SETTINGS_KEY, JSON.stringify(settings))
}
function getMenuPriceKey(menu) {
  if (menu.id != null) return String(menu.id)
  return `${menu.category || 'option'}:${menu.name || ''}`
}
function getEffectiveMenuPrice(menu) {
  if (!menu) return 0
  const s = getPriceSettings()
  const key = getMenuPriceKey(menu)
  const over = s.menuPriceOverrides[key]
  if (typeof over === 'number' && over >= 0) return over
  return Number(menu.price_including_tax ?? menu.price ?? 0)
}
function getEffectiveProductPrice(product) {
  if (!product) return 0
  const s = getPriceSettings()
  const id = product.id != null ? String(product.id) : ''
  const over = id ? s.productPriceOverrides[id] : undefined
  if (typeof over === 'number' && over >= 0) return over
  return Number(product.price_including_tax ?? product.price ?? 0)
}
if (typeof window !== 'undefined') {
  window.getPriceSettings = getPriceSettings
  window.getEffectiveMenuPrice = getEffectiveMenuPrice
  window.getEffectiveProductPrice = getEffectiveProductPrice
}

const DEFAULT_PRESETS = [
  {
    id: 'green',
    name: 'グリーン',
    theme: {
      primaryGreen: '#5a8f6a',
      lightGreen: '#9bc47d',
      softGreen: '#c8e6c9',
      paleGreen: '#e8f5e9',
      textDark: '#2d4a3a',
      cutColor: '#5a8f6a',
      colorColor: '#7a9f8a',
      permColor: '#6a8f7a',
      otherColor: '#8a9f7a'
    }
  },
  {
    id: 'blue',
    name: 'ブルー',
    theme: {
      primaryGreen: '#4a7c9e',
      lightGreen: '#7eb8d4',
      softGreen: '#b8d4e3',
      paleGreen: '#e3f2f7',
      textDark: '#2d3a4a',
      cutColor: '#4a7c9e',
      colorColor: '#6b9eb8',
      permColor: '#5a8cad',
      otherColor: '#7a9fc4'
    }
  },
  {
    id: 'brown',
    name: 'ブラウン',
    theme: {
      primaryGreen: '#8b6914',
      lightGreen: '#c9a227',
      softGreen: '#e8d9a0',
      paleGreen: '#f5f0e0',
      textDark: '#3a3528',
      cutColor: '#8b6914',
      colorColor: '#a67c20',
      permColor: '#9b7a20',
      otherColor: '#b08b30'
    }
  },
  {
    id: 'lavender',
    name: 'ラベンダー',
    theme: {
      primaryGreen: '#6b5b95',
      lightGreen: '#9b8bb8',
      softGreen: '#d4c8e8',
      paleGreen: '#ede8f5',
      textDark: '#3a354a',
      cutColor: '#6b5b95',
      colorColor: '#7a6aa5',
      permColor: '#7565a0',
      otherColor: '#8a7ab5'
    }
  },
  {
    id: 'mono',
    name: 'モノクロ',
    theme: {
      primaryGreen: '#455a64',
      lightGreen: '#78909c',
      softGreen: '#b0bec5',
      paleGreen: '#eceff1',
      textDark: '#263238',
      cutColor: '#455a64',
      colorColor: '#546e7a',
      permColor: '#607d8b',
      otherColor: '#78909c'
    }
  }
]

const DEFAULT_THEME = DEFAULT_PRESETS[0].theme

const THEME_KEYS = [
  { key: 'primaryGreen', var: 'primary-green', label: 'メイン色' },
  { key: 'lightGreen', var: 'light-green', label: 'アクセント色' },
  { key: 'softGreen', var: 'soft-green', label: '枠・薄い緑' },
  { key: 'paleGreen', var: 'pale-green', label: '背景（薄い緑）' },
  { key: 'textDark', var: 'text-dark', label: '文字色' },
  { key: 'cutColor', var: 'cut-color', label: 'カット（メニュー枠）' },
  { key: 'colorColor', var: 'color-color', label: 'カラー（メニュー枠）' },
  { key: 'permColor', var: 'perm-color', label: 'パーマ（メニュー枠）' },
  { key: 'otherColor', var: 'other-color', label: 'その他（メニュー枠）' }
]

function getDefaultTheme() {
  return { ...DEFAULT_PRESETS[0].theme }
}

function getCustomPresets() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function saveCustomPresets(list) {
  localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(list))
}

function getAllPresets() {
  return [...DEFAULT_PRESETS, ...getCustomPresets()]
}

function getPresetById(id) {
  return DEFAULT_PRESETS.find((p) => p.id === id) || getCustomPresets().find((p) => p.id === id)
}

function loadTheme() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) return null
    const t = JSON.parse(raw)
    const defaultTheme = getDefaultTheme()
    const merged = { ...defaultTheme }
    THEME_KEYS.forEach(({ key }) => {
      if (typeof t[key] === 'string') merged[key] = t[key]
    })
    return THEME_KEYS.every(({ key }) => typeof merged[key] === 'string') ? merged : null
  } catch {
    return null
  }
}

function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
}

function applyTheme(theme) {
  const root = document.documentElement
  THEME_KEYS.forEach(({ key, var: cssVar }) => {
    root.style.setProperty(`--${cssVar}`, theme[key])
  })
  root.style.setProperty('--border-light', theme.softGreen ?? getDefaultTheme().softGreen)
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) metaTheme.setAttribute('content', theme.primaryGreen)
}

function initTheme() {
  const theme = loadTheme() || getDefaultTheme()
  applyTheme(theme)
}

function getThemeFromForm() {
  const theme = {}
  THEME_KEYS.forEach(({ key }) => {
    const id = 'theme' + key.charAt(0).toUpperCase() + key.slice(1)
    const input = document.getElementById(id)
    if (input && input.value) theme[key] = input.value
  })
  return theme
}

function refreshThemeForm() {
  const theme = loadTheme() || getDefaultTheme()
  THEME_KEYS.forEach(({ key }) => {
    const id = 'theme' + key.charAt(0).toUpperCase() + key.slice(1)
    const input = document.getElementById(id)
    const hexEl = document.getElementById(id + 'Hex')
    if (input) {
      input.value = theme[key]
      if (hexEl) hexEl.textContent = theme[key]
    }
  })
}

function refreshPresetSelect() {
  const triggerLabel = document.getElementById('themePresetTriggerLabel')
  const dropdown = document.getElementById('themePresetDropdown')
  if (!triggerLabel || !dropdown) return
  const currentTheme = loadTheme()
  const currentThemeStr = currentTheme ? JSON.stringify(currentTheme) : ''
  const all = getAllPresets()
  let currentName = 'グリーン'
  dropdown.innerHTML = ''
  all.forEach((p) => {
    const isSelected = currentThemeStr && JSON.stringify(p.theme) === currentThemeStr
    if (isSelected) currentName = p.name
    const opt = document.createElement('button')
    opt.type = 'button'
    opt.role = 'option'
    opt.className = 'theme-preset-option' + (isSelected ? ' is-selected' : '')
    opt.dataset.presetId = p.id
    opt.textContent = p.name
    dropdown.appendChild(opt)
  })
  triggerLabel.textContent = currentName
}

function refreshCustomPresetsList() {
  const container = document.getElementById('customPresetsList')
  const section = document.getElementById('customPresetsSection')
  if (!container) return
  const custom = getCustomPresets()
  if (section) section.style.display = custom.length ? 'block' : 'none'
  container.innerHTML = custom.length === 0
    ? ''
    : custom
    .map(
      (p) => `
    <div class="custom-preset-item" data-preset-id="${p.id}">
      <span class="custom-preset-name">${escapeHtml(p.name)}</span>
      <button type="button" class="custom-preset-apply" data-preset-id="${p.id}" title="適用">適用</button>
      <button type="button" class="custom-preset-delete" data-preset-id="${p.id}" title="削除" aria-label="削除">×</button>
    </div>
  `
    )
    .join('')
  container.querySelectorAll('.custom-preset-apply').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = getPresetById(btn.dataset.presetId)
      if (preset) {
        saveTheme(preset.theme)
        applyTheme(preset.theme)
        refreshThemeForm()
        refreshPresetSelect()
      }
    })
  })
  container.querySelectorAll('.custom-preset-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.presetId
      if (!id || !confirm('このプリセットを削除しますか？')) return
      const list = getCustomPresets().filter((p) => p.id !== id)
      saveCustomPresets(list)
      refreshCustomPresetsList()
      refreshPresetSelect()
    })
  })
}

function setupSettingsModal() {
  const closeSettings = () => closeModal('settingsModal')
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings)
  document.getElementById('closeSettingsHeaderBtn').addEventListener('click', closeSettings)
  const trigger = document.getElementById('themePresetTrigger')
  const dropdown = document.getElementById('themePresetDropdown')
  if (trigger && dropdown) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = !dropdown.hidden
      dropdown.hidden = isOpen
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true')
    })
    dropdown.addEventListener('click', (e) => {
      const opt = e.target.closest('[data-preset-id]')
      if (!opt) return
      const preset = getPresetById(opt.dataset.presetId)
      if (preset) {
        saveTheme(preset.theme)
        applyTheme(preset.theme)
        refreshThemeForm()
        refreshPresetSelect()
        dropdown.hidden = true
        trigger.setAttribute('aria-expanded', 'false')
      }
    })
  }
  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.hidden && !e.target.closest('#themePresetCustom')) {
      dropdown.hidden = true
      if (trigger) trigger.setAttribute('aria-expanded', 'false')
    }
  })
  document.getElementById('themeResetBtn').addEventListener('click', () => {
    const def = getDefaultTheme()
    saveTheme(def)
    applyTheme(def)
    refreshThemeForm()
    refreshPresetSelect()
  })
  document.getElementById('themeSavePresetBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('themeSavePresetName')
    const name = (nameInput?.value?.trim() || '').replace(/\s+/g, ' ') || 'マイテーマ'
    const theme = getThemeFromForm()
    if (Object.keys(theme).length !== THEME_KEYS.length) return
    const list = getCustomPresets()
    const id = 'custom_' + Date.now()
    list.push({ id, name, theme })
    saveCustomPresets(list)
    saveTheme(theme)
    applyTheme(theme)
    if (nameInput) nameInput.value = ''
    refreshPresetSelect()
    refreshCustomPresetsList()
  })
  THEME_KEYS.forEach(({ key }) => {
    const id = 'theme' + key.charAt(0).toUpperCase() + key.slice(1)
    const input = document.getElementById(id)
    if (!input) return
    input.addEventListener('input', () => {
      const theme = getThemeFromForm()
      if (Object.keys(theme).length !== THEME_KEYS.length) return
      saveTheme(theme)
      applyTheme(theme)
      THEME_KEYS.forEach(({ key: k }) => {
        const hexEl = document.getElementById('theme' + k.charAt(0).toUpperCase() + k.slice(1) + 'Hex')
        if (hexEl) hexEl.textContent = theme[k] || ''
      })
    })
  })
}

let menusByCategory = {}
let products = []
const register = createRegister()

async function loadMenus() {
  const res = await fetch('/menus.json')
  const list = await res.json()
  menusByCategory = {}
  list.forEach((m) => {
    const cat = m.category || 'option'
    if (!menusByCategory[cat]) menusByCategory[cat] = []
    menusByCategory[cat].push(m)
  })
  CATEGORY_ORDER.forEach((cat) => {
    if (menusByCategory[cat]) {
      menusByCategory[cat].sort((a, b) => {
        const oa = a.display_order ?? 0
        const ob = b.display_order ?? 0
        if (oa !== ob) return oa - ob
        return (a.name || '').localeCompare(b.name || '')
      })
    }
  })
}

const CUSTOM_PRODUCTS_KEY = 'salon_register_custom_products'

function getCustomProducts() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function saveCustomProducts(list) {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(list))
}

function getAllProducts() {
  return [...products, ...getCustomProducts()]
}

async function loadProducts() {
  const res = await fetch('/products.json')
  products = await res.json().catch(() => [])
}

function updateReceiptUI() {
  const items = register.getItems()
  const listEl = document.getElementById('itemList')
  if (!listEl) return

  listEl.innerHTML = ''
  if (items.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty-state'
    empty.id = 'emptyState'
    empty.innerHTML = '<p>メニューを選択してください</p>'
    listEl.appendChild(empty)
  } else {
    items.forEach((item) => {
      const div = document.createElement('div')
      div.className = 'receipt-item'
      div.innerHTML = `
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-price">${register.formatPrice(register.getItemDisplayPrice(item))}</span>
        <button type="button" class="remove-item" aria-label="削除" data-id="${item.id}">×</button>
      `
      listEl.appendChild(div)
    })
  }

  document.getElementById('subtotalText').textContent = register.formatPrice(register.getSubtotal())
  document.getElementById('taxText').textContent = register.formatPrice(register.getTax())
  document.getElementById('totalText').textContent = register.formatPrice(register.getTotal())
  document.getElementById('changeText').textContent = register.formatPrice(register.getChange())

  listEl.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      register.removeItem(Number(btn.dataset.id))
      updateReceiptUI()
      renderMenuSections()
    })
  })

  renderCustomerList()
}

function renderCustomerList() {
  const container = document.getElementById('customerList')
  if (!container) return
  container.innerHTML = ''
  const list = register.getCustomers()
  const currentIndex = register.getCurrentCustomerIndex()

  const headerDiv = document.createElement('div')
  headerDiv.className = 'customer-list-header'
  const headerTitle = document.createElement('h4')
  headerTitle.textContent = '顧客リスト'
  const addBtn = document.createElement('button')
  addBtn.type = 'button'
  addBtn.id = 'addCustomerBtn'
  addBtn.className = 'add-customer-btn'
  addBtn.textContent = '+ 顧客追加'
  headerDiv.appendChild(headerTitle)
  headerDiv.appendChild(addBtn)

  const itemsDiv = document.createElement('div')
  itemsDiv.className = 'customer-items'
  list.forEach((customer, index) => {
    const item = document.createElement('div')
    item.className = `customer-item ${index === currentIndex ? 'active' : ''}`
    item.dataset.customerId = customer.id
    const info = document.createElement('div')
    info.className = 'customer-info'
    const nameEl = document.createElement('div')
    nameEl.className = 'customer-name'
    nameEl.textContent = customer.name
    const countEl = document.createElement('div')
    countEl.className = 'customer-items-count'
    countEl.textContent = `${customer.items.length}件`
    info.appendChild(nameEl)
    info.appendChild(countEl)
    item.appendChild(info)
    if (list.length > 1) {
      const removeBtn = document.createElement('button')
      removeBtn.type = 'button'
      removeBtn.className = 'remove-customer-btn'
      removeBtn.dataset.customerId = customer.id
      removeBtn.textContent = '×'
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (list.length <= 1) {
          alert('最低1名の顧客が必要です')
          return
        }
        if (!confirm(`${customer.name}を削除しますか？\n（${customer.items.length}件の施術内容も削除されます）`)) return
        register.removeCustomer(customer.id)
        renderCustomerList()
        updateReceiptUI()
        renderMenuSections()
      })
      item.appendChild(removeBtn)
    }
    item.addEventListener('click', (e) => {
      if (e.target.closest('.remove-customer-btn')) return
      register.setCurrentCustomerIndex(index)
      renderCustomerList()
      updateReceiptUI()
      renderMenuSections()
    })
    itemsDiv.appendChild(item)
  })

  const inputDiv = document.createElement('div')
  inputDiv.className = 'add-customer-input'
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.id = 'customerNameInput'
  nameInput.placeholder = '顧客名を入力'
  nameInput.maxLength = 20
  inputDiv.appendChild(nameInput)

  container.appendChild(headerDiv)
  container.appendChild(itemsDiv)
  container.appendChild(inputDiv)

  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim()
    register.addCustomer(name)
    nameInput.value = ''
    renderCustomerList()
    updateReceiptUI()
    renderMenuSections()
  })
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addBtn.click()
    }
  })
}

function escapeHtml(s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

/** メニュー名から色分け用カテゴリを返す（本番 salon-register-app と統一） */
function getColorCategory(menuName) {
  if (!menuName) return 'other'
  if (/カット|シャンプーカット/.test(menuName)) return 'cut'
  if (/ブリーチ|染め|おしゃれ染め|白髪染め/.test(menuName)) return 'color'
  if (/パーマ|縮毛矯正|リペア/.test(menuName)) return 'perm'
  return 'other'
}

function renderMenuSections() {
  const container = document.getElementById('menuSections')
  if (!container) return
  container.innerHTML = ''
  CATEGORY_ORDER.forEach((cat) => {
    const menus = menusByCategory[cat]
    if (!menus?.length) return
    const info = getCategoryInfo(cat)
    const section = document.createElement('section')
    section.className = 'menu-section'
    let noteHtml = info.note ? `<p class="info-note">${escapeHtml(info.note)}</p>` : ''
    section.innerHTML = `
      <div class="section-header">
        <h2>${escapeHtml(info.title)} <span class="section-subtitle">${escapeHtml(info.subtitle)}</span></h2>
      </div>
      ${noteHtml}
      <div class="menu-grid" data-category="${cat}"></div>
    `
    const grid = section.querySelector('.menu-grid')
    menus.forEach((menu) => {
      const effectivePrice = getEffectiveMenuPrice(menu)
      const isSelected = register.isSelected(`${menu.name}${menu.category}`)
      const customerIndex = register.getCurrentCustomerIndex()
      const badgeNum = String(customerIndex + 1)
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'menu-btn' + (isSelected ? ' selected' : '')
      btn.dataset.name = menu.name
      btn.dataset.category = menu.category
      btn.dataset.colorCategory = getColorCategory(menu.name)
      btn.innerHTML = `
        <span class="menu-name">${escapeHtml(menu.name)}</span>
        <span class="menu-price">¥${effectivePrice.toLocaleString()}</span>
        ${isSelected ? `<span class="customer-number-badge">${badgeNum}</span>` : ''}
      `
      btn.addEventListener('click', () => {
        const menuWithEffectivePrice = { ...menu, price_including_tax: effectivePrice, price: effectivePrice }
        register.toggleItem(menuWithEffectivePrice)
        updateReceiptUI()
        renderMenuSections()
      })
      grid.appendChild(btn)
    })
    container.appendChild(section)
  })
}

function openModal(id) {
  const el = document.getElementById(id)
  if (el) {
    el.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')
  }
}

function closeModal(id) {
  const el = document.getElementById(id)
  if (el) {
    el.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
  }
}

function showCheckoutCompletePopup(receiptData) {
  if (!receiptData || typeof receiptData.total !== 'number') return
  const total = receiptData.total ?? 0
  const payment = receiptData.payment ?? 0
  const change = receiptData.change ?? 0
  const popupHtml = `
    <div class="checkout-complete-popup">
      <div class="popup-overlay"></div>
      <div class="popup-content">
        <h3>会計完了</h3>
        <div class="receipt-summary">
          <div class="summary-row"><span>合計金額</span><span>¥${Number(total).toLocaleString()}</span></div>
          <div class="summary-row"><span>お預かり</span><span>¥${Number(payment).toLocaleString()}</span></div>
          <div class="summary-row highlight"><span>お釣り</span><span>¥${Number(change).toLocaleString()}</span></div>
        </div>
        <button type="button" class="close-popup-btn">閉じる</button>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML('beforeend', popupHtml)
  const popup = document.querySelector('.checkout-complete-popup')
  const closeBtn = popup?.querySelector('.close-popup-btn')
  const overlay = popup?.querySelector('.popup-overlay')
  function closeCheckoutPopup() {
    if (!popup) return
    popup.style.opacity = '0'
    popup.style.transition = 'opacity 0.2s ease'
    setTimeout(() => { popup.remove() }, 200)
    document.body.classList.remove('modal-open')
    document.removeEventListener('keydown', onEsc)
  }
  function onEsc(e) {
    if (e.key === 'Escape') closeCheckoutPopup()
  }
  closeBtn?.addEventListener('click', closeCheckoutPopup)
  overlay?.addEventListener('click', closeCheckoutPopup)
  document.body.classList.add('modal-open')
  document.addEventListener('keydown', onEsc)
}

function closeSlideMenu() {
  document.getElementById('slideMenuOverlay').classList.remove('show')
  document.getElementById('hamburgerBtn').classList.remove('active')
  document.getElementById('hamburgerText').textContent = 'MENU'
  document.body.classList.remove('modal-open')
}

function setupSlideMenu() {
  const overlay = document.getElementById('slideMenuOverlay')
  const hamburger = document.getElementById('hamburgerBtn')
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeSlideMenu() })
  hamburger?.addEventListener('click', () => {
    const isOpening = !overlay.classList.contains('show')
    overlay.classList.toggle('show')
    hamburger.classList.toggle('active')
    document.getElementById('hamburgerText').textContent = overlay.classList.contains('show') ? 'CLOSE' : 'MENU'
    if (isOpening) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
  })
  overlay?.querySelectorAll('.slide-menu-item[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action
      closeSlideMenu()
      if (action === 'daily-closing') document.getElementById('dailyClosingBtn').click()
      if (action === 'weekly-history') document.getElementById('weeklyHistoryModal').dispatchEvent(new CustomEvent('open'))
      if (action === 'price-settings') window.openPriceSettingsModal?.()
      if (action === 'product-admin') window.openProductAdminModal?.()
      if (action === 'settings') {
        refreshThemeForm()
        refreshPresetSelect()
        refreshCustomPresetsList()
        openModal('settingsModal')
      }
      if (action === 'logout') logout()
    })
  })
}

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function setupModals() {
  document.getElementById('dailyClosingBtn').addEventListener('click', () => openModal('dailyClosingModal'))
  document.getElementById('closeClosingBtn').addEventListener('click', () => closeModal('dailyClosingModal'))
  async function openTodayReport() {
    closeModal('dailyClosingModal')
    const receipts = await db.getReceiptsToday()
    document.getElementById('dailyReportTitle').textContent = `今日の売上 (${getTodayString()})`
    const total = receipts.reduce((sum, r) => sum + (r.total ?? 0), 0)
    const count = receipts.length
    const average = count > 0 ? Math.round(total / count) : 0
    const content =
      count === 0
        ? '<div class="empty-report"><p>本日はまだ会計データがありません</p></div>'
        : `
    <div class="report-summary report-summary-vertical">
      <div class="report-card">
        <div class="report-label">会計件数</div>
        <div class="report-value">${count}<span class="unit">件</span></div>
      </div>
      <div class="report-card highlight">
        <div class="report-label">売上合計</div>
        <div class="report-value">¥${total.toLocaleString()}</div>
      </div>
      <div class="report-card">
        <div class="report-label">平均単価</div>
        <div class="report-value">¥${average.toLocaleString()}</div>
      </div>
    </div>
    <div class="report-details">
      <h3>本日の会計履歴</h3>
      <div class="report-list">
        ${receipts
          .map((r) => {
            const time = new Date(r.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
            const items = r.items || []
            const payment = r.payment ?? r.paid_amount
            const change = r.change
            const paymentStr = payment != null ? `¥${Number(payment).toLocaleString()}` : '-'
            const changeStr = change != null ? `¥${Number(change).toLocaleString()}` : '-'
            return `
          <div class="report-item">
            <div class="report-item-header">
              <span class="report-time">${time}</span>
              <span class="report-amount">¥${(r.total ?? 0).toLocaleString()}</span>
            </div>
            <div class="report-item-body">
              ${items.map((item) => `<div class="report-item-row"><span>${item.name || '商品'}</span><span>¥${(item.price ?? 0).toLocaleString()}</span></div>`).join('')}
            </div>
            <div class="report-item-summary">
              <div class="summary-row"><span class="summary-label">合計</span><span class="summary-value">¥${(r.total ?? 0).toLocaleString()}</span></div>
              <div class="summary-row"><span class="summary-label">お預かり</span><span class="summary-value">${paymentStr}</span></div>
              <div class="summary-row total-row"><span class="summary-label">お釣り</span><span class="summary-value">${changeStr}</span></div>
            </div>
          </div>
        `
          })
          .join('')}
      </div>
    </div>
    `
    document.getElementById('dailyReportContent').innerHTML = content
    openModal('dailyReportModal')
  }
  document.getElementById('dailyReportBtn').addEventListener('click', openTodayReport)
  document.getElementById('dailyReportBtnAside')?.addEventListener('click', openTodayReport)
  document.getElementById('historyBtn')?.addEventListener('click', () => {
    document.getElementById('weeklyHistoryModal').dispatchEvent(new CustomEvent('open'))
  })
  document.getElementById('clearTodayBtn').addEventListener('click', async () => {
    if (!confirm('本日のデータを IndexedDB から削除しますか？')) return
    await db.clearAllReceipts()
    closeModal('dailyClosingModal')
  })
  document.getElementById('closeReportBtn').addEventListener('click', () => closeModal('dailyReportModal'))

  async function renderWeeklyHistory() {
    const receipts = await db.getReceiptsLastDays(7)
    const groupedByDate = {}
    receipts.forEach((r) => {
      const dateKey = new Date(r.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { receipts: [], totalAmount: 0, count: 0 }
      }
      groupedByDate[dateKey].receipts.push(r)
      groupedByDate[dateKey].totalAmount += r.total ?? 0
      groupedByDate[dateKey].count += 1
    })
    const dates = Object.keys(groupedByDate)
    const formatTime = (iso) => new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    const html =
      dates.length === 0
        ? `
    <div class="empty-history">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M3 3h18v18H3zM9 9h6v6H9z"/><path d="M9 9l6 6M15 9l-6 6"/>
        </svg>
      </div>
      <h3>履歴がありません</h3>
      <p>過去1週間に会計データがありません</p>
    </div>
    `
        : `
    <div class="weekly-history-list">
      ${dates
        .map(
          (date) => `
        <div class="date-group">
          <div class="date-header-ios">
            <div class="date-title-ios">${date}</div>
            <div class="date-stats-ios">
              <span class="count-badge">${groupedByDate[date].count}件</span>
              <span class="total-amount">¥${groupedByDate[date].totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div class="receipts-list">
            ${groupedByDate[date].receipts
              .map((receipt) => {
                const items = receipt.items || []
                const payment = receipt.payment ?? receipt.paid_amount
                const change = receipt.change
                const paymentStr = payment != null ? `¥${Number(payment).toLocaleString()}` : '-'
                const changeStr = change != null ? `¥${Number(change).toLocaleString()}` : '-'
                const itemRows =
                  items.length > 1
                    ? `
                  <div class="item-list">
                    ${items.map((item) => `<div class="item-row"><span class="item-name">${item.name || '商品'}</span><span class="item-price">¥${(item.price ?? 0).toLocaleString()}</span></div>`).join('')}
                  </div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-summary">
                    <div class="summary-row"><span class="summary-label">合計:</span><span class="summary-value">¥${(receipt.total ?? 0).toLocaleString()}</span></div>
                    <div class="summary-row"><span class="summary-label">お預かり:</span><span class="summary-value">${paymentStr}</span></div>
                    <div class="summary-row total-row"><span class="summary-label">お釣り:</span><span class="summary-value">${changeStr}</span></div>
                  </div>
                `
                    : `
                  <div class="item-list">
                    <div class="item-row"><span class="item-name">${items[0]?.name || '商品'}</span><span class="item-price">¥${(receipt.total ?? 0).toLocaleString()}</span></div>
                  </div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-summary">
                    <div class="summary-row"><span class="summary-label">合計:</span><span class="summary-value">¥${(receipt.total ?? 0).toLocaleString()}</span></div>
                    <div class="summary-row"><span class="summary-label">お預かり:</span><span class="summary-value">${paymentStr}</span></div>
                    <div class="summary-row total-row"><span class="summary-label">お釣り:</span><span class="summary-value">${changeStr}</span></div>
                  </div>
                `
                return `
              <div class="receipt-card-ios" data-receipt-id="${receipt.id}">
                <div class="card-content">
                  <div class="receipt-info">
                    <div class="time-badge">${formatTime(receipt.created_at)}</div>
                    <div class="item-info">${itemRows}</div>
                  </div>
                  <button type="button" class="delete-btn-ios" data-receipt-id="${receipt.id}" title="この会計を削除">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            `
              })
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    `
    const container = document.getElementById('weeklyHistoryContent')
    if (!container) return
    container.innerHTML = html
    container.querySelectorAll('.delete-btn-ios').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const id = btn.getAttribute('data-receipt-id')
        if (!id || !confirm('この会計を削除しますか？\n\n削除後は復元できません。')) return
        await db.deleteReceipt(Number(id))
        await renderWeeklyHistory()
      })
    })
  }

  document.getElementById('weeklyHistoryModal').addEventListener('open', async () => {
    await renderWeeklyHistory()
    openModal('weeklyHistoryModal')
  })
  document.getElementById('closeHistoryBtn').addEventListener('click', () => closeModal('weeklyHistoryModal'))

  const productDialog = document.getElementById('productDialog')
  const productModalGrid = document.getElementById('productModalGrid')
  const productSearchInput = document.getElementById('productSearchInput')
  const clearSearchBtn = document.getElementById('clearSearchBtn')
  const searchResultsInfo = document.getElementById('searchResultsInfo')
  const searchResultsCount = document.getElementById('searchResultsCount')

  function getCartQuantity(productId) {
    return register.getItems().filter((i) => i.productId === String(productId)).length
  }

  function renderProductGrid(filter = '') {
    if (!productModalGrid) return
    const q = (filter || '').trim().toLowerCase()
    const all = getAllProducts()
    const list = q ? all.filter((p) => (p.name || '').toLowerCase().includes(q)) : all
    if (list.length === 0) {
      productModalGrid.innerHTML = '<p class="product-grid-empty">商品がありません。</p>'
    } else {
      productModalGrid.innerHTML = list
        .map((p) => {
          const cartQty = getCartQuantity(p.id)
          const cartIndicator =
            cartQty > 0
              ? `<div class="cart-status-indicator">カートに追加済み (${cartQty}個)</div>`
              : ''
          return `<div class="product-modal-item" data-product-id="${escapeHtml(String(p.id))}">
              <div class="product-modal-info">
                <div class="product-modal-name">${escapeHtml(p.name || '')}</div>
                <div class="product-modal-price">¥${getEffectiveProductPrice(p).toLocaleString()}</div>
                ${cartIndicator}
              </div>
              <div class="product-modal-controls">
                <div class="product-modal-quantity-controls">
                  <button type="button" class="product-modal-quantity-btn minus" data-product-id="${escapeHtml(String(p.id))}">−</button>
                  <span class="product-modal-quantity-display" data-product-id="${escapeHtml(String(p.id))}">0</span>
                  <button type="button" class="product-modal-quantity-btn plus" data-product-id="${escapeHtml(String(p.id))}">+</button>
                </div>
                <button type="button" class="product-modal-add-btn" data-product-id="${escapeHtml(String(p.id))}" disabled>追加</button>
              </div>
            </div>`
        })
        .join('')

      productModalGrid.querySelectorAll('.product-modal-quantity-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const productId = btn.dataset.productId
          const isPlus = btn.classList.contains('plus')
          const quantityDisplay = productModalGrid.querySelector(`.product-modal-quantity-display[data-product-id="${productId}"]`)
          const addBtn = productModalGrid.querySelector(`.product-modal-add-btn[data-product-id="${productId}"]`)
          let current = parseInt(quantityDisplay.textContent, 10) || 0
          current = isPlus ? current + 1 : Math.max(0, current - 1)
          quantityDisplay.textContent = String(current)
          if (addBtn) addBtn.disabled = current === 0
        })
      })

      productModalGrid.querySelectorAll('.product-modal-add-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const productId = btn.dataset.productId
          const quantityDisplay = productModalGrid.querySelector(`.product-modal-quantity-display[data-product-id="${productId}"]`)
          const quantity = parseInt(quantityDisplay.textContent, 10) || 0
          if (quantity <= 0) return
          const p = getAllProducts().find((x) => String(x.id) === productId)
          if (!p) return
          const effectivePrice = getEffectiveProductPrice(p)
          const productWithPrice = { ...p, category: 'product', price_including_tax: effectivePrice, price: effectivePrice }
          for (let i = 0; i < quantity; i++) {
            register.addItem(productWithPrice)
          }
          updateReceiptUI()
          renderMenuSections()
          renderProductGrid(productSearchInput?.value ?? '')
          btn.disabled = true
          btn.style.opacity = '0.6'
          setTimeout(() => {
            btn.disabled = false
            btn.style.opacity = '1'
          }, 2000)
        })
      })
    }
    if (searchResultsInfo) {
      searchResultsInfo.style.display = q ? 'block' : 'none'
      if (searchResultsCount) searchResultsCount.textContent = list.length
    }
  }

  document.getElementById('productsOpenBtn').addEventListener('click', () => {
    if (productSearchInput) productSearchInput.value = ''
    if (clearSearchBtn) clearSearchBtn.style.display = 'none'
    renderProductGrid()
    productDialog.showModal()
    setTimeout(() => productSearchInput?.focus(), 0)
  })

  document.getElementById('closeProductDialogBtn').addEventListener('click', () => productDialog.close())

  productSearchInput?.addEventListener('input', () => {
    const v = productSearchInput.value.trim()
    if (clearSearchBtn) clearSearchBtn.style.display = v ? 'flex' : 'none'
    renderProductGrid(v)
  })

  clearSearchBtn?.addEventListener('click', () => {
    productSearchInput.value = ''
    clearSearchBtn.style.display = 'none'
    renderProductGrid()
    productSearchInput.focus()
  })

  productDialog?.addEventListener('click', (e) => {
    if (e.target === productDialog) productDialog.close()
  })
  productDialog?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') productDialog.close()
  })

  const tempProductDialog = document.getElementById('tempProductDialog')
  document.getElementById('addManualProductBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('tempProductName')
    const priceInput = document.getElementById('tempProductPrice')
    const qtyInput = document.getElementById('tempProductQuantity')
    if (nameInput) nameInput.value = ''
    if (priceInput) priceInput.value = ''
    if (qtyInput) qtyInput.value = '1'
    tempProductDialog?.showModal()
  })
  document.getElementById('closeTempProductDialogBtn')?.addEventListener('click', () => tempProductDialog?.close())
  document.getElementById('cancelTempProductBtn')?.addEventListener('click', () => tempProductDialog?.close())
  document.getElementById('addTempProductBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('tempProductName')
    const priceInput = document.getElementById('tempProductPrice')
    const qtyInput = document.getElementById('tempProductQuantity')
    const name = nameInput?.value?.trim() ?? ''
    const price = Number(priceInput?.value) || 0
    const qty = Math.max(1, parseInt(qtyInput?.value, 10) || 1)
    if (!name) {
      alert('商品名を入力してください')
      return
    }
    for (let i = 0; i < qty; i++) {
      register.addItem({
        name,
        price_including_tax: price,
        price,
        category: 'product',
      })
    }
    tempProductDialog?.close()
    updateReceiptUI()
    renderCustomerList()
    renderMenuSections()
    if (productDialog?.open) renderProductGrid(productSearchInput?.value ?? '')
  })
  tempProductDialog?.addEventListener('click', (e) => { if (e.target === tempProductDialog) tempProductDialog.close() })
  tempProductDialog?.addEventListener('keydown', (e) => { if (e.key === 'Escape') tempProductDialog.close() })

  ;['dailyClosingModal', 'dailyReportModal', 'weeklyHistoryModal', 'settingsModal', 'priceSettingsModal', 'productAdminModal'].forEach((id) => {
    const el = document.getElementById(id)
    el?.addEventListener('click', (e) => { if (e.target === el) closeModal(id) })
  })
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    if (document.getElementById('productDialog')?.open) document.getElementById('productDialog').close()
    else ;['weeklyHistoryModal', 'dailyReportModal', 'dailyClosingModal', 'settingsModal', 'priceSettingsModal', 'productAdminModal'].forEach(closeModal)
    closeSlideMenu()
  })

  function openPriceSettingsModal() {
    const s = getPriceSettings()
    const cutColorEl = document.getElementById('settingCutWithColor')
    const cutPermEl = document.getElementById('settingCutWithPerm')
    if (cutColorEl) cutColorEl.value = s.discountCutWithColor === DEFAULT_PRICE_SETTINGS.discountCutWithColor ? '' : String(s.discountCutWithColor)
    if (cutPermEl) cutPermEl.value = s.discountCutWithPerm === DEFAULT_PRICE_SETTINGS.discountCutWithPerm ? '' : String(s.discountCutWithPerm)

    const menuListEl = document.getElementById('priceSettingsMenuList')
    if (menuListEl) {
      menuListEl.innerHTML = ''
      const allMenus = CATEGORY_ORDER.flatMap((cat) => menusByCategory[cat] || [])
      allMenus.forEach((menu, idx) => {
        const key = getMenuPriceKey(menu)
        const basePrice = Number(menu.price_including_tax ?? menu.price ?? 0)
        const over = s.menuPriceOverrides[key]
        const row = document.createElement('div')
        row.className = 'price-settings-item'
        const safeKey = key.replace(/"/g, '&quot;')
        row.innerHTML = `
          <label class="price-settings-item-label" for="menu-override-${idx}">${escapeHtml(menu.name)}</label>
          <span class="price-settings-base">¥${basePrice.toLocaleString()}</span>
          <input type="number" id="menu-override-${idx}" data-menu-key="${safeKey}" class="price-settings-override" min="0" step="1" placeholder="上書き" value="${over != null && over >= 0 ? over : ''}" />
        `
        menuListEl.appendChild(row)
      })
    }

    openModal('priceSettingsModal')
  }
  window.openPriceSettingsModal = openPriceSettingsModal

  function renderProductAdminList() {
    const s = getPriceSettings()
    const listEl = document.getElementById('productAdminList')
    if (!listEl) return
    listEl.innerHTML = ''
    const all = getAllProducts()
    all.forEach((product, idx) => {
      const id = product.id != null ? String(product.id) : ''
      const isCustom = id.startsWith('custom_')
      const basePrice = Number(product.price_including_tax ?? product.price ?? 0)
      const over = id ? s.productPriceOverrides[id] : undefined
      const row = document.createElement('div')
      row.className = 'price-settings-item' + (isCustom ? ' product-admin-item-custom' : '')
      row.innerHTML = `
        <label class="price-settings-item-label" for="product-admin-${idx}">${escapeHtml(product.name || '商品')}${isCustom ? ' <span class="product-admin-badge">追加済</span>' : ''}</label>
        <span class="price-settings-base">¥${basePrice.toLocaleString()}</span>
        <input type="number" id="product-admin-${idx}" data-product-id="${escapeHtml(id)}" class="price-settings-override" min="0" step="1" placeholder="上書き" value="${over != null && over >= 0 ? over : ''}" />
        ${isCustom ? `<button type="button" class="product-admin-delete-btn" data-product-id="${escapeHtml(id)}" aria-label="削除">削除</button>` : ''}
      `
      listEl.appendChild(row)
      if (isCustom) {
        row.querySelector('.product-admin-delete-btn')?.addEventListener('click', () => {
          const list = getCustomProducts().filter((p) => String(p.id) !== id)
          saveCustomProducts(list)
          renderProductAdminList()
          renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
        })
      }
    })
  }

  function openProductAdminModal() {
    document.getElementById('productAdminNewName').value = ''
    document.getElementById('productAdminNewPrice').value = ''
    renderProductAdminList()
    openModal('productAdminModal')
  }
  window.openProductAdminModal = openProductAdminModal

  document.getElementById('closePriceSettingsBtn')?.addEventListener('click', () => closeModal('priceSettingsModal'))
  document.getElementById('closePriceSettingsBtn2')?.addEventListener('click', () => closeModal('priceSettingsModal'))
  document.getElementById('priceSettingsSaveBtn')?.addEventListener('click', () => {
    const cutWithColor = document.getElementById('settingCutWithColor')?.value.trim()
    const cutWithPerm = document.getElementById('settingCutWithPerm')?.value.trim()
    const s = getPriceSettings()
    s.discountCutWithColor = cutWithColor === '' ? DEFAULT_PRICE_SETTINGS.discountCutWithColor : Math.max(0, parseInt(cutWithColor, 10) || 0)
    s.discountCutWithPerm = cutWithPerm === '' ? DEFAULT_PRICE_SETTINGS.discountCutWithPerm : Math.max(0, parseInt(cutWithPerm, 10) || 0)

    s.menuPriceOverrides = {}
    document.querySelectorAll('#priceSettingsMenuList input[data-menu-key]').forEach((input) => {
      const key = input.getAttribute('data-menu-key')
      const v = input.value.trim()
      if (key && v !== '' && !Number.isNaN(Number(v))) {
        const num = parseInt(v, 10)
        if (num >= 0) s.menuPriceOverrides[key] = num
      }
    })

    savePriceSettings(s)
    closeModal('priceSettingsModal')
    renderMenuSections()
    if (typeof showToast === 'function') showToast('価格設定を保存しました', 'success')
    else alert('価格設定を保存しました')
  })
  document.getElementById('priceSettingsResetBtn')?.addEventListener('click', () => {
    if (!confirm('割引ルールをデフォルトに戻しますか？')) return
    savePriceSettings({ ...DEFAULT_PRICE_SETTINGS })
    closeModal('priceSettingsModal')
    if (typeof showToast === 'function') showToast('デフォルトに戻しました', 'success')
    else alert('デフォルトに戻しました')
  })

  document.getElementById('closeProductAdminBtn')?.addEventListener('click', () => closeModal('productAdminModal'))
  document.getElementById('closeProductAdminBtn2')?.addEventListener('click', () => closeModal('productAdminModal'))
  document.getElementById('productAdminAddBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('productAdminNewName')
    const priceInput = document.getElementById('productAdminNewPrice')
    const name = (nameInput?.value ?? '').trim()
    const price = parseInt(priceInput?.value ?? '', 10)
    if (!name) {
      alert('商品名を入力してください')
      return
    }
    if (Number.isNaN(price) || price < 0) {
      alert('金額を0以上の数値で入力してください')
      return
    }
    const list = getCustomProducts()
    const newProduct = {
      id: 'custom_' + Date.now(),
      name,
      price_including_tax: price,
      price,
      category: 'product'
    }
    list.push(newProduct)
    saveCustomProducts(list)
    if (nameInput) nameInput.value = ''
    if (priceInput) priceInput.value = ''
    renderProductAdminList()
    renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
    if (typeof showToast === 'function') showToast('商品を追加しました', 'success')
    else alert('商品を追加しました')
  })
  document.getElementById('productAdminSaveBtn')?.addEventListener('click', () => {
    const s = getPriceSettings()
    s.productPriceOverrides = {}
    document.querySelectorAll('#productAdminList input[data-product-id]').forEach((input) => {
      const id = input.getAttribute('data-product-id')
      const v = input.value.trim()
      if (id && v !== '' && !Number.isNaN(Number(v))) {
        const num = parseInt(v, 10)
        if (num >= 0) s.productPriceOverrides[id] = num
      }
    })
    savePriceSettings(s)
    closeModal('productAdminModal')
    renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
    if (typeof showToast === 'function') showToast('商品設定を保存しました', 'success')
    else alert('商品設定を保存しました')
  })
  document.getElementById('productAdminResetBtn')?.addEventListener('click', () => {
    if (!confirm('商品価格の上書きをすべて解除しますか？')) return
    const s = getPriceSettings()
    s.productPriceOverrides = {}
    savePriceSettings(s)
    closeModal('productAdminModal')
    renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
    if (typeof showToast === 'function') showToast('デフォルトに戻しました', 'success')
    else alert('デフォルトに戻しました')
  })
}

function setupPaymentAndCheckout() {
  document.querySelectorAll('.quick-btn[data-amount]').forEach((btn) => {
    btn.addEventListener('click', () => {
      register.setPaymentAmount(Number(btn.dataset.amount))
      updateReceiptUI()
    })
  })
  document.getElementById('paymentInput').addEventListener('input', updateReceiptUI)
  document.getElementById('checkoutBtn').addEventListener('click', async () => {
    const items = register.getItemsForSave()
    if (items.length === 0) return
    const total = register.getTotal()
    const payment = register.getPaymentAmount()
    const change = register.getChange()
    await db.saveReceipt({ items, total, created_at: new Date().toISOString(), payment, change })
    showCheckoutCompletePopup({ total, payment, change })
    register.clear()
    updateReceiptUI()
    renderCustomerList()
    renderMenuSections()
  })
  document.getElementById('clearBtn').addEventListener('click', () => {
    register.clear()
    updateReceiptUI()
    renderCustomerList()
    renderMenuSections()
  })
}

async function init() {
  initTheme()
  await loadMenus()
  await loadProducts()
  register.addInitialCustomer()
  renderMenuSections()
  renderCustomerList()
  updateReceiptUI()
  setupSlideMenu()
  setupModals()
  setupSettingsModal()
  setupPaymentAndCheckout()
  document.getElementById('logoutBtn').addEventListener('click', logout)
}

init()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
