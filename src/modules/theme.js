/**
 * テーマ（色プリセット・カスタム保存・適用）
 */
import { escapeHtml } from './utils.js'

const THEME_STORAGE_KEY = 'salon_register_theme'
const CUSTOM_PRESETS_STORAGE_KEY = 'salon_register_theme_custom_presets'

export const DEFAULT_PRESETS = [
  { id: 'green', name: 'グリーン', theme: { primaryGreen: '#5a8f6a', lightGreen: '#9bc47d', softGreen: '#c8e6c9', paleGreen: '#e8f5e9', textDark: '#2d4a3a', cutColor: '#5a8f6a', colorColor: '#7a9f8a', permColor: '#6a8f7a', otherColor: '#8a9f7a' } },
  { id: 'blue', name: 'ブルー', theme: { primaryGreen: '#4a7c9e', lightGreen: '#7eb8d4', softGreen: '#b8d4e3', paleGreen: '#e3f2f7', textDark: '#2d3a4a', cutColor: '#4a7c9e', colorColor: '#6b9eb8', permColor: '#5a8cad', otherColor: '#7a9fc4' } },
  { id: 'brown', name: 'ブラウン', theme: { primaryGreen: '#8b6914', lightGreen: '#c9a227', softGreen: '#e8d9a0', paleGreen: '#f5f0e0', textDark: '#3a3528', cutColor: '#8b6914', colorColor: '#a67c20', permColor: '#9b7a20', otherColor: '#b08b30' } },
  { id: 'lavender', name: 'ラベンダー', theme: { primaryGreen: '#6b5b95', lightGreen: '#9b8bb8', softGreen: '#d4c8e8', paleGreen: '#ede8f5', textDark: '#3a354a', cutColor: '#6b5b95', colorColor: '#7a6aa5', permColor: '#7565a0', otherColor: '#8a7ab5' } },
  { id: 'mono', name: 'モノクロ', theme: { primaryGreen: '#455a64', lightGreen: '#78909c', softGreen: '#b0bec5', paleGreen: '#eceff1', textDark: '#263238', cutColor: '#455a64', colorColor: '#546e7a', permColor: '#607d8b', otherColor: '#78909c' } }
]

export const THEME_KEYS = [
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

export function getDefaultTheme () {
  return { ...DEFAULT_PRESETS[0].theme }
}

export function getCustomPresets () {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveCustomPresets (list) {
  localStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(list))
}

export function getAllPresets () {
  return [...DEFAULT_PRESETS, ...getCustomPresets()]
}

export function getPresetById (id) {
  return DEFAULT_PRESETS.find((p) => p.id === id) || getCustomPresets().find((p) => p.id === id)
}

export function loadTheme () {
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

export function saveTheme (theme) {
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
}

export function applyTheme (theme) {
  const root = document.documentElement
  THEME_KEYS.forEach(({ key, var: cssVar }) => {
    root.style.setProperty(`--${cssVar}`, theme[key])
  })
  root.style.setProperty('--border-light', theme.softGreen ?? getDefaultTheme().softGreen)
  const metaTheme = document.querySelector('meta[name="theme-color"]')
  if (metaTheme) metaTheme.setAttribute('content', theme.primaryGreen)
}

export function initTheme () {
  const theme = loadTheme() || getDefaultTheme()
  applyTheme(theme)
}

export function getThemeFromForm () {
  const theme = {}
  THEME_KEYS.forEach(({ key }) => {
    const id = 'theme' + key.charAt(0).toUpperCase() + key.slice(1)
    const input = document.getElementById(id)
    if (input && input.value) theme[key] = input.value
  })
  return theme
}

export function refreshThemeForm () {
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

export function refreshPresetSelect () {
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

export function refreshCustomPresetsList () {
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
    btn.addEventListener('click', async () => {
      const id = btn.dataset.presetId
      if (!id || !await showConfirm('確認', 'このプリセットを削除しますか？')) return
      const list = getCustomPresets().filter((p) => p.id !== id)
      saveCustomPresets(list)
      refreshCustomPresetsList()
      refreshPresetSelect()
    })
  })
}
