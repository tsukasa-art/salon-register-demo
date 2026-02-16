/**
 * 設定モーダル（テーマ色・データ管理）
 */
import { closeModal, showAlert, showConfirm } from './utils.js'
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
import * as db from '../db.js'

export function setupSettingsModal () {
  // テーマモーダル
  const closeTheme = () => closeModal('themeModal')
  document.getElementById('closeThemeModalBtn').addEventListener('click', closeTheme)
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

  // データ管理
  document.getElementById('exportDataBtn')?.addEventListener('click', async () => {
    try {
      const data = await db.exportData()
      const receiptCount = data.receipts?.length || 0
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `salon-register-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      await showAlert('バックアップ完了', `${receiptCount}件の会計データを保存しました。\nファイルは安全な場所に保管してください。`)
    } catch (error) {
      await showAlert('エラー', `バックアップに失敗しました: ${error.message}`)
    }
  })

  document.getElementById('importDataBtn')?.addEventListener('click', () => {
    document.getElementById('importDataInput')?.click()
  })

  document.getElementById('importDataInput')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      const confirmed = await showConfirm(
        '警告：データを復元',
        `現在の会計データ（すべての履歴）が削除され、\n選択したファイルの内容（${data.receipts?.length || 0}件）に置き換わります。\n\nこの操作は取り消せません。\n本当に復元しますか？`
      )
      
      if (!confirmed) {
        e.target.value = ''
        return
      }

      const count = await db.importData(data)
      await showAlert('復元完了', `${count}件の会計データを復元しました。\nページをリロードします。`)
      
      // ページをリロード
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
      e.target.value = ''
    } catch (error) {
      await showAlert('エラー', `データの読み込みに失敗しました。\nファイル形式を確認してください。\n\nエラー: ${error.message}`)
      e.target.value = ''
    }
  })

  // データ管理モーダル
  const closeDataManagement = () => closeModal('dataManagementModal')
  document.getElementById('closeDataManagementBtn').addEventListener('click', closeDataManagement)
}
