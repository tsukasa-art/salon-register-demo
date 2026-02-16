/**
 * 価格設定（割引ルール・メニュー/商品価格上書き）
 */
const PRICE_SETTINGS_KEY = 'salon_register_price_settings'

export const DEFAULT_PRICE_SETTINGS = {
  discountCutWithColor: 2800,
  discountCutWithPerm: 0,
  menuPriceOverrides: {},
  productPriceOverrides: {}
}

export function getPriceSettings () {
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

export function savePriceSettings (settings) {
  localStorage.setItem(PRICE_SETTINGS_KEY, JSON.stringify(settings))
}

export function getMenuPriceKey (menu) {
  if (menu.id != null) return String(menu.id)
  return `${menu.category || 'option'}:${menu.name || ''}`
}

export function getEffectiveMenuPrice (menu) {
  if (!menu) return 0
  const s = getPriceSettings()
  const key = getMenuPriceKey(menu)
  const over = s.menuPriceOverrides[key]
  if (typeof over === 'number' && over >= 0) return over
  return Number(menu.price_including_tax ?? menu.price ?? 0)
}

export function getEffectiveProductPrice (product) {
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
