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

export function openModal (id) {
  const el = document.getElementById(id)
  if (el) {
    el.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')
  }
}

export function closeModal (id) {
  const el = document.getElementById(id)
  if (el) {
    el.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
  }
}
