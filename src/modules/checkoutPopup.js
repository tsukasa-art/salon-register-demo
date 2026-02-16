/**
 * 会計完了ポップアップ
 */
export function showCheckoutCompletePopup (receiptData) {
  if (!receiptData || typeof receiptData.total !== 'number') return
  const total = receiptData.total ?? 0
  const payment = receiptData.payment ?? 0
  const change = receiptData.change ?? 0
  const popupHtml = `
    <div class="checkout-complete-popup">
      <div class="popup-overlay"></div>
      <div class="popup-content">
        <h3>会計完了</h3>
        <div class="receipt-summary">
          <div class="summary-row"><span>合計金額</span><span>¥${Number(total).toLocaleString()}</span></div>
          <div class="summary-row"><span>お預かり</span><span>¥${Number(payment).toLocaleString()}</span></div>
          <div class="summary-row highlight"><span>お釣り</span><span>¥${Number(change).toLocaleString()}</span></div>
        </div>
        <button type="button" class="close-popup-btn">閉じる</button>
      </div>
    </div>
  `
  document.body.insertAdjacentHTML('beforeend', popupHtml)
  const popup = document.querySelector('.checkout-complete-popup')
  const closeBtn = popup?.querySelector('.close-popup-btn')
  const overlay = popup?.querySelector('.popup-overlay')
  function closeCheckoutPopup () {
    if (!popup) return
    popup.style.opacity = '0'
    popup.style.transition = 'opacity 0.2s ease'
    setTimeout(() => { popup.remove() }, 200)
    document.body.classList.remove('modal-open')
    document.removeEventListener('keydown', onEsc)
  }
  function onEsc (e) {
    if (e.key === 'Escape') closeCheckoutPopup()
  }
  closeBtn?.addEventListener('click', closeCheckoutPopup)
  overlay?.addEventListener('click', closeCheckoutPopup)
  document.body.classList.add('modal-open')
  document.addEventListener('keydown', onEsc)
}
