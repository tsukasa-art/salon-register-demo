/**
 * お預かり・会計確定・クリア
 */
import * as db from '../db.js'
import { showCheckoutCompletePopup } from './checkoutPopup.js'
import { showAlert } from './utils.js'

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

  // 会計ボタンの表示を動的に更新
  updateCheckoutButtons(register, refresh)

  const clearBtn = document.getElementById('clearBtn')
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      register.clear()
      refresh()
    })
  }
}

/**
 * 顧客数に応じて会計ボタンを動的に生成
 */
export function updateCheckoutButtons(register, refresh) {
  const container = document.getElementById('checkoutButtons')
  if (!container) return

  const customers = register.getCustomers()
  const currentTotal = register.getTotal()
  const allCustomersTotal = register.getAllCustomersTotal()

  container.innerHTML = ''

  if (customers.length > 1) {
    // 2人以上の場合：個別会計とまとめて会計の2つのボタン
    const individualBtn = document.createElement('button')
    individualBtn.type = 'button'
    individualBtn.className = 'checkout-btn-individual'
    individualBtn.id = 'checkoutBtn'
    individualBtn.textContent = `個別会計 ${register.formatPrice(currentTotal)}`
    individualBtn.addEventListener('click', async () => {
      const items = register.getItemsForSave()
      if (items.length === 0) {
        await showAlert('エラー', '会計するアイテムがありません')
        return
      }
      const total = register.getTotal()
      const payment = register.getPaymentAmount()
      if (payment < total) {
        await showAlert(
          'お預かり金額が不足しています',
          `合計: ${register.formatPrice(total)}\nお預かり: ${register.formatPrice(payment)}`
        )
        return
      }
      const change = register.getChange()
      await db.saveReceipt({ items, total, created_at: new Date().toISOString(), payment, change })
      showCheckoutCompletePopup({ total, payment, change })
      register.clearCurrentCustomer()
      refresh()
    })

    const batchBtn = document.createElement('button')
    batchBtn.type = 'button'
    batchBtn.className = 'checkout-btn-batch'
    batchBtn.id = 'checkoutBatchBtn'
    batchBtn.textContent = `まとめて会計 ${register.formatPrice(allCustomersTotal)}`
    batchBtn.addEventListener('click', async () => {
      const allItems = register.getAllCustomersItemsForSave()
      if (allItems.length === 0) {
        await showAlert('エラー', '会計するアイテムがありません')
        return
      }
      const total = allCustomersTotal
      const payment = register.getPaymentAmount()
      if (payment < total) {
        await showAlert(
          'お預かり金額が不足しています',
          `合計: ${register.formatPrice(total)}\nお預かり: ${register.formatPrice(payment)}`
        )
        return
      }
      const change = Math.max(0, payment - total)
      await db.saveReceipt({ items: allItems, total, created_at: new Date().toISOString(), payment, change })
      showCheckoutCompletePopup({ total, payment, change })
      register.clearAllCustomers()
      refresh()
    })

    container.appendChild(individualBtn)
    container.appendChild(batchBtn)
  } else {
    // 1人の場合：通常の会計確定ボタン
    const checkoutBtn = document.createElement('button')
    checkoutBtn.type = 'button'
    checkoutBtn.className = 'main-action-btn'
    checkoutBtn.id = 'checkoutBtn'
    checkoutBtn.textContent = '会計確定'
    checkoutBtn.addEventListener('click', async () => {
      const items = register.getItemsForSave()
      if (items.length === 0) return
      const total = register.getTotal()
      const payment = register.getPaymentAmount()
      if (payment < total) {
        await showAlert(
          'お預かり金額が不足しています',
          `合計: ${register.formatPrice(total)}\nお預かり: ${register.formatPrice(payment)}`
        )
        return
      }
      const change = register.getChange()
      await db.saveReceipt({ items, total, created_at: new Date().toISOString(), payment, change })
      showCheckoutCompletePopup({ total, payment, change })
      register.clear()
      refresh()
    })

    container.appendChild(checkoutBtn)
  }
}
