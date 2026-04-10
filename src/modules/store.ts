/**
 * メニュー・商品データの取得・永続化
 */
import { getCategoryInfo, CATEGORY_ORDER, type Category } from '../categoryInfo.js'

export interface MenuItem {
  name: string
  category: string
  display_order: number
  price_including_tax: number
}

export interface Product {
  id: string
  name: string
  price_including_tax: number
  category: string
}

export type MenusByCategory = Record<string, MenuItem[]>

export const menusByCategory: MenusByCategory = {}
export let products: Product[] = []

const CUSTOM_PRODUCTS_KEY = 'salon_register_custom_products'

export function getCustomProducts(): Product[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY)
    if (!raw) return []
    const list: unknown = JSON.parse(raw)
    return Array.isArray(list) ? (list as Product[]) : []
  } catch {
    return []
  }
}

export function saveCustomProducts(list: Product[]): void {
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(list))
}

export function getAllProducts(): Product[] {
  return [...products, ...getCustomProducts()]
}

export async function loadMenus(): Promise<void> {
  const res = await fetch('/menus.json')
  const list: MenuItem[] = await res.json()
  Object.keys(menusByCategory).forEach((k) => delete menusByCategory[k])
  list.forEach((m) => {
    const cat = m.category || 'option'
    if (!menusByCategory[cat]) menusByCategory[cat] = []
    menusByCategory[cat].push(m)
  })
  CATEGORY_ORDER.forEach((cat: Category) => {
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

export async function loadProducts(): Promise<void> {
  const res = await fetch('/products.json')
  products = await res.json().catch(() => [])
}

export { CATEGORY_ORDER, getCategoryInfo }
