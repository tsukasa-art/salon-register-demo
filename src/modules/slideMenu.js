/**
 * スライドメニュー（ハンバーガー）
 */
import { openModal } from './utils.js'
import { refreshThemeForm, refreshPresetSelect, refreshCustomPresetsList } from './theme.js'
import { logout } from '../auth.js'

export function closeSlideMenu () {
  const overlay = document.getElementById('slideMenuOverlay')
  const hamburger = document.getElementById('hamburgerBtn')
  const textEl = document.getElementById('hamburgerText')
  if (overlay) overlay.classList.remove('show')
  if (hamburger) hamburger.classList.remove('active')
  if (textEl) textEl.textContent = 'MENU'
  document.body.classList.remove('modal-open')
}

export function setupSlideMenu () {
  const overlay = document.getElementById('slideMenuOverlay')
  const hamburger = document.getElementById('hamburgerBtn')
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeSlideMenu() })
  hamburger?.addEventListener('click', () => {
    const isOpening = !overlay.classList.contains('show')
    overlay.classList.toggle('show')
    hamburger.classList.toggle('active')
    const textEl = document.getElementById('hamburgerText')
    if (textEl) textEl.textContent = overlay.classList.contains('show') ? 'CLOSE' : 'MENU'
    if (isOpening) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
  })
  overlay?.querySelectorAll('.slide-menu-parent[data-expand]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subId = btn.dataset.expand
      const sub = overlay?.querySelector(`.slide-menu-sub[data-sub="${subId}"]`)
      const isExpanded = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', !isExpanded)
      sub?.classList.toggle('open', !isExpanded)
    })
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
