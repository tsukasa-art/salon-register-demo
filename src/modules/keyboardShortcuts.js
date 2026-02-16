/**
 * キーボードショートカット
 */
import { openDialog, closeDialog } from './utils.js'

/**
 * キーボードショートカットを設定
 * @param {ReturnType<import('../register.js').createRegister>} register
 * @param {() => void} refresh
 */
export function setupKeyboardShortcuts(register, refresh) {
  document.addEventListener('keydown', (e) => {
    // 入力フィールドにフォーカスがある場合はスキップ
    const target = e.target
    const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    // Escキー: モーダルを閉じる（既存の実装を補完）
    if (e.key === 'Escape') {
      // カスタムモーダルを閉じる
      const openModals = document.querySelectorAll('.modal-overlay[aria-hidden="false"]')
      if (openModals.length > 0) {
        const lastModal = openModals[openModals.length - 1]
        lastModal.setAttribute('aria-hidden', 'true')
        document.body.classList.remove('modal-open')
        e.preventDefault()
        return
      }
      
      // ダイアログを閉じる
      const openDialogs = document.querySelectorAll('dialog[open]')
      if (openDialogs.length > 0) {
        closeDialog(openDialogs[openDialogs.length - 1])
        e.preventDefault()
        return
      }
    }

    // 入力フィールドにフォーカスがある場合、以下のショートカットはスキップ
    if (isInputField) {
      return
    }

    // /キー: 商品検索にフォーカス
    if (e.key === '/') {
      const searchInput = document.getElementById('productSearchInput')
      const productDialog = document.getElementById('productDialog')
      if (productDialog && !productDialog.open) {
        openDialog(productDialog)
      }
      if (searchInput) {
        searchInput.focus()
        e.preventDefault()
      }
      return
    }

    // Enterキー: 会計確定（レシートエリアにフォーカスがある場合）
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const checkoutBtn = document.getElementById('checkoutBtn')
      if (checkoutBtn && checkoutBtn.offsetParent !== null) {
        checkoutBtn.click()
        e.preventDefault()
      }
      return
    }

    // 数字キー（1-9）: 金額クイックボタン
    if (e.key >= '1' && e.key <= '9' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      const amounts = {
        '1': 1000,
        '2': 2000,
        '3': 3000,
        '4': 4000,
        '5': 5000,
        '6': 6000,
        '7': 7000,
        '8': 8000,
        '9': 9000,
      }
      const amount = amounts[e.key]
      if (amount) {
        register.setPaymentAmount(amount)
        if (refresh) refresh()
        e.preventDefault()
      }
      return
    }

    // 0キー: 1万円
    if (e.key === '0' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      register.setPaymentAmount(10000)
      if (refresh) refresh()
      e.preventDefault()
      return
    }

    // Ctrl/Cmd + Pキー: 印刷（デフォルト動作を維持）
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      // ブラウザのデフォルト印刷動作をそのまま使用
      return
    }

    // Ctrl/Cmd + Sキー: 設定を開く
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      const settingsBtn = document.getElementById('settingsBtn')
      if (settingsBtn) {
        settingsBtn.click()
        e.preventDefault()
      }
      return
    }
  })
}
