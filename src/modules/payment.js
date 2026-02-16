/**
 * お預かり・会計確定・クリア
 */
import * as db from '../db.js'
import { showCheckoutCompletePopup } from './checkoutPopup.js'

/**
 * @param {ReturnType<import('../register.js').createRegister>} register
 * @param {() => void} refresh - updateReceiptUI + renderMenuSections + renderCustomerList
 */
export function setupPaymentAndCheckout (register, refresh) {
  document.querySelectorAll('.quick-btn[data-amount]').forEach((btn) => {
    btn.addEventListener('click', () => {
      register.setPaymentAmount(Number(btn.dataset.amount))
      refresh()
    })
  })
  const paymentInput = document.getElementById('paymentInput')
  if (paymentInput) paymentInput.addEventListener('input', () => refresh())

  const checkoutBtn = document.getElementById('checkoutBtn')
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      const items = register.getItemsForSave()
      if (items.length === 0) return
      const total = register.getTotal()
      const payment = register.getPaymentAmount()
      const change = register.getChange()
      await db.saveReceipt({ items, total, created_at: new Date().toISOString(), payment, change })
      showCheckoutCompletePopup({ total, payment, change })
      register.clear()
      refresh()
    })
  }

  const clearBtn = document.getElementById('clearBtn')
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      register.clear()
      refresh()
    })
  }
}
