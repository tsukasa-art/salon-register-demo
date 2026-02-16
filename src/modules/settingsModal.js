/**
 * 設定モーダル（テーマ色）
 */
import { closeModal } from './utils.js'
import {
  getPresetById,
  getThemeFromForm,
  getDefaultTheme,
  getCustomPresets,
  saveTheme,
  applyTheme,
  saveCustomPresets,
  refreshThemeForm,
  refreshPresetSelect,
  THEME_KEYS
} from './theme.js'

export function setupSettingsModal () {
  const closeSettings = () => closeModal('settingsModal')
  document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings)
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
