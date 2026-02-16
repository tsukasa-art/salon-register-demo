/**
 * メニュー・商品データの取得・永続化
 */
import { getCategoryInfo, CATEGORY_ORDER } from '../categoryInfo.js'

export const menusByCategory = {}
export let products = []

const CUSTOM_PRODUCTS_KEY = 'salon_register_custom_products'

export function getCustomProducts () {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveCustomProducts (list) {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(list))
}

export function getAllProducts () {
  return [...products, ...getCustomProducts()]
}

export async function loadMenus () {
  const res = await fetch('/menus.json')
  const list = await res.json()
  Object.keys(menusByCategory).forEach((k) => delete menusByCategory[k])
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

export async function loadProducts () {
  const res = await fetch('/products.json')
  products = await res.json().catch(() => [])
}

export { CATEGORY_ORDER, getCategoryInfo }
