/**
 * 共通ユーティリティ
 */
export function escapeHtml (s) {
  const div = document.createElement('div')
  div.textContent = s
  return div.innerHTML
}

/** メニュー名から色分け用カテゴリを返す */
export function getColorCategory (menuName) {
  if (!menuName) return 'other'
  if (/カット|シャンプーカット/.test(menuName)) return 'cut'
  if (/ブリーチ|染め|おしゃれ染め|白髪染め/.test(menuName)) return 'color'
  if (/パーマ|縮毛矯正|リペア/.test(menuName)) return 'perm'
  return 'other'
}

let scrollPosition = 0

export function openModal (id) {
  const el = document.getElementById(id)
  if (el) {
    // スクロール位置を保存
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop
    el.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')
    // position: fixedによるスクロール位置のリセットを防ぐ
    document.body.style.top = `-${scrollPosition}px`
  }
}

export function closeModal (id) {
  const el = document.getElementById(id)
  if (el) {
    el.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    // スクロール位置を復元
    document.body.style.top = ''
    window.scrollTo(0, scrollPosition)
  }
}

/**
 * <dialog>要素を開く（背景スクロール防止付き）
 * @param {HTMLDialogElement} dialogElement - dialog要素
 */
export function openDialog (dialogElement) {
  if (dialogElement) {
    // スクロール位置を保存
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop
    dialogElement.showModal()
    document.body.classList.add('modal-open')
    // position: fixedによるスクロール位置のリセットを防ぐ
    document.body.style.top = `-${scrollPosition}px`
  }
}

/**
 * <dialog>要素を閉じる（背景スクロール復元付き）
 * @param {HTMLDialogElement} dialogElement - dialog要素
 */
export function closeDialog (dialogElement) {
  if (dialogElement) {
    dialogElement.close()
    document.body.classList.remove('modal-open')
    // スクロール位置を復元
    document.body.style.top = ''
    window.scrollTo(0, scrollPosition)
  }
}

/**
 * カスタムアラートモーダルを表示
 * @param {string} title - タイトル
 * @param {string} message - メッセージ
 * @returns {Promise<void>}
 */
export function showAlert(title, message) {
  return new Promise((resolve) => {
    document.getElementById('alertTitle').textContent = title
    document.getElementById('alertMessage').textContent = message
    openModal('alertModal')
    
    const btn = document.getElementById('alertCloseBtn')
    const handler = () => {
      closeModal('alertModal')
      btn.removeEventListener('click', handler)
      resolve()
    }
    btn.addEventListener('click', handler)
    
    // Escapeキーでも閉じる
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal('alertModal')
        btn.removeEventListener('click', handler)
        document.removeEventListener('keydown', escHandler)
        resolve()
      }
    }
    document.addEventListener('keydown', escHandler)
  })
}

/**
 * カスタム確認モーダルを表示
 * @param {string} title - タイトル
 * @param {string} message - メッセージ
 * @returns {Promise<boolean>} - OKならtrue、キャンセルならfalse
 */
export function showConfirm(title, message) {
  return new Promise((resolve) => {
    document.getElementById('confirmTitle').textContent = title
    document.getElementById('confirmMessage').textContent = message
    openModal('confirmModal')
    
    const okBtn = document.getElementById('confirmOkBtn')
    const cancelBtn = document.getElementById('confirmCancelBtn')
    
    const handleOk = () => {
      closeModal('confirmModal')
      cleanup()
      resolve(true)
    }
    
    const handleCancel = () => {
      closeModal('confirmModal')
      cleanup()
      resolve(false)
    }
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal('confirmModal')
        cleanup()
        resolve(false)
      }
    }
    
    const cleanup = () => {
      okBtn.removeEventListener('click', handleOk)
      cancelBtn.removeEventListener('click', handleCancel)
      document.removeEventListener('keydown', handleEscape)
    }
    
    okBtn.addEventListener('click', handleOk)
    cancelBtn.addEventListener('click', handleCancel)
    document.addEventListener('keydown', handleEscape)
  })
}
