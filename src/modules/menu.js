/**
 * メニューセクションの描画（レジ・Option 等）
 */
import { escapeHtml, getColorCategory } from './utils.js'
import { getEffectiveMenuPrice } from './priceSettings.js'
import { menusByCategory, getCategoryInfo, CATEGORY_ORDER } from './store.js'

/**
 * @param {ReturnType<import('../register.js').createRegister>} register
 * @param {() => void} onItemToggle - メニュー選択時に呼ぶ（明細・顧客リスト・メニュー再描画）
 */
export function renderMenuSections (register, onItemToggle) {
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
        if (onItemToggle) onItemToggle()
      })
      grid.appendChild(btn)
    })
    container.appendChild(section)
  })
}
