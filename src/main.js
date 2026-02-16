import { requireAuth, logout } from './auth.js'
import { createRegister } from './register.js'
import { getCategoryInfo, CATEGORY_ORDER } from './categoryInfo.js'
import * as db from './db.js'
import { initTheme } from './modules/theme.js'
import { setupSettingsModal } from './modules/settingsModal.js'
import { refreshThemeForm, refreshPresetSelect, refreshCustomPresetsList } from './modules/theme.js'
import { openModal, closeModal, escapeHtml } from './modules/utils.js'
import { closeSlideMenu, setupSlideMenu } from './modules/slideMenu.js'
import { menusByCategory, loadMenus, loadProducts, getCustomProducts, saveCustomProducts, getAllProducts } from './modules/store.js'
import { getPriceSettings, savePriceSettings, getMenuPriceKey, getEffectiveMenuPrice, getEffectiveProductPrice, DEFAULT_PRICE_SETTINGS } from './modules/priceSettings.js'
import { updateReceiptUI, renderCustomerList } from './modules/receiptUI.js'
import { renderMenuSections } from './modules/menu.js'
import { showCheckoutCompletePopup } from './modules/checkoutPopup.js'
import { setupPaymentAndCheckout } from './modules/payment.js'

if (!requireAuth()) throw new Error('redirecting to login')

const register = createRegister()

/** 全体更新（明細・顧客リスト・メニュー再描画） */
function refresh () {
  updateReceiptUI(register, opts)
  renderMenuSections(register, refresh)
  renderCustomerList(register, refresh)
}

const opts = {
  refresh,
  renderCustomerListOnly: () => renderCustomerList(register, refresh)
}

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function setupModals() {
  document.getElementById('dailyClosingBtn').addEventListener('click', () => openModal('dailyClosingModal'))
  document.getElementById('closeClosingBtn').addEventListener('click', () => closeModal('dailyClosingModal'))
  async function openTodayReport() {
    closeModal('dailyClosingModal')
    const receipts = await db.getReceiptsToday()
    document.getElementById('dailyReportTitle').textContent = `今日の売上 (${getTodayString()})`
    const total = receipts.reduce((sum, r) => sum + (r.total ?? 0), 0)
    const count = receipts.length
    const average = count > 0 ? Math.round(total / count) : 0
    const content =
      count === 0
        ? '<div class="empty-report"><p>本日はまだ会計データがありません</p></div>'
        : `
    <div class="report-summary report-summary-vertical">
      <div class="report-card">
        <div class="report-label">会計件数</div>
        <div class="report-value">${count}<span class="unit">件</span></div>
      </div>
      <div class="report-card highlight">
        <div class="report-label">売上合計</div>
        <div class="report-value">¥${total.toLocaleString()}</div>
      </div>
      <div class="report-card">
        <div class="report-label">平均単価</div>
        <div class="report-value">¥${average.toLocaleString()}</div>
      </div>
    </div>
    <div class="report-details">
      <h3>本日の会計履歴</h3>
      <div class="report-list">
        ${receipts
          .map((r) => {
            const time = new Date(r.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
            const items = r.items || []
            const payment = r.payment ?? r.paid_amount
            const change = r.change
            const paymentStr = payment != null ? `¥${Number(payment).toLocaleString()}` : '-'
            const changeStr = change != null ? `¥${Number(change).toLocaleString()}` : '-'
            return `
          <div class="report-item">
            <div class="report-item-header">
              <span class="report-time">${time}</span>
              <span class="report-amount">¥${(r.total ?? 0).toLocaleString()}</span>
            </div>
            <div class="report-item-body">
              ${items.map((item) => `<div class="report-item-row"><span>${item.name || '商品'}</span><span>¥${(item.price ?? 0).toLocaleString()}</span></div>`).join('')}
            </div>
            <div class="report-item-summary">
              <div class="summary-row"><span class="summary-label">合計</span><span class="summary-value">¥${(r.total ?? 0).toLocaleString()}</span></div>
              <div class="summary-row"><span class="summary-label">お預かり</span><span class="summary-value">${paymentStr}</span></div>
              <div class="summary-row total-row"><span class="summary-label">お釣り</span><span class="summary-value">${changeStr}</span></div>
            </div>
          </div>
        `
          })
          .join('')}
      </div>
    </div>
    <div class="modal-actions">
      <button type="button" class="main-action-btn" id="closeDailyReportBtn">閉じる</button>
    </div>
    `
    document.getElementById('dailyReportContent').innerHTML = content
    document.getElementById('closeDailyReportBtn')?.addEventListener('click', () => closeModal('dailyReportModal'))
    openModal('dailyReportModal')
  }
  document.getElementById('dailyReportBtn').addEventListener('click', openTodayReport)
  document.getElementById('dailyReportBtnAside')?.addEventListener('click', openTodayReport)
  document.getElementById('historyBtn')?.addEventListener('click', () => {
    document.getElementById('weeklyHistoryModal').dispatchEvent(new CustomEvent('open'))
  })
  document.getElementById('clearTodayBtn').addEventListener('click', async () => {
    if (!confirm('本日のデータを IndexedDB から削除しますか？')) return
    await db.clearAllReceipts()
    closeModal('dailyClosingModal')
  })

  async function renderWeeklyHistory() {
    const receipts = await db.getReceiptsLastDays(7)
    const groupedByDate = {}
    receipts.forEach((r) => {
      const dateKey = new Date(r.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short'
      })
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { receipts: [], totalAmount: 0, count: 0 }
      }
      groupedByDate[dateKey].receipts.push(r)
      groupedByDate[dateKey].totalAmount += r.total ?? 0
      groupedByDate[dateKey].count += 1
    })
    const dates = Object.keys(groupedByDate)
    const formatTime = (iso) => new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    const html =
      dates.length === 0
        ? `
    <div class="empty-history">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M3 3h18v18H3zM9 9h6v6H9z"/><path d="M9 9l6 6M15 9l-6 6"/>
        </svg>
      </div>
      <h3>履歴がありません</h3>
      <p>過去1週間に会計データがありません</p>
    </div>
    `
        : `
    <div class="weekly-history-list">
      ${dates
        .map(
          (date) => `
        <div class="date-group">
          <div class="date-header-ios">
            <div class="date-title-ios">${date}</div>
            <div class="date-stats-ios">
              <span class="count-badge">${groupedByDate[date].count}件</span>
              <span class="total-amount">¥${groupedByDate[date].totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <div class="receipts-list">
            ${groupedByDate[date].receipts
              .map((receipt) => {
                const items = receipt.items || []
                const payment = receipt.payment ?? receipt.paid_amount
                const change = receipt.change
                const paymentStr = payment != null ? `¥${Number(payment).toLocaleString()}` : '-'
                const changeStr = change != null ? `¥${Number(change).toLocaleString()}` : '-'
                const itemRows =
                  items.length > 1
                    ? `
                  <div class="item-list">
                    ${items.map((item) => `<div class="item-row"><span class="item-name">${item.name || '商品'}</span><span class="item-price">¥${(item.price ?? 0).toLocaleString()}</span></div>`).join('')}
                  </div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-summary">
                    <div class="summary-row"><span class="summary-label">合計:</span><span class="summary-value">¥${(receipt.total ?? 0).toLocaleString()}</span></div>
                    <div class="summary-row"><span class="summary-label">お預かり:</span><span class="summary-value">${paymentStr}</span></div>
                    <div class="summary-row total-row"><span class="summary-label">お釣り:</span><span class="summary-value">${changeStr}</span></div>
                  </div>
                `
                    : `
                  <div class="item-list">
                    <div class="item-row"><span class="item-name">${items[0]?.name || '商品'}</span><span class="item-price">¥${(receipt.total ?? 0).toLocaleString()}</span></div>
                  </div>
                  <div class="receipt-divider"></div>
                  <div class="receipt-summary">
                    <div class="summary-row"><span class="summary-label">合計:</span><span class="summary-value">¥${(receipt.total ?? 0).toLocaleString()}</span></div>
                    <div class="summary-row"><span class="summary-label">お預かり:</span><span class="summary-value">${paymentStr}</span></div>
                    <div class="summary-row total-row"><span class="summary-label">お釣り:</span><span class="summary-value">${changeStr}</span></div>
                  </div>
                `
                return `
              <div class="receipt-card-ios" data-receipt-id="${receipt.id}">
                <div class="card-content">
                  <div class="receipt-info">
                    <div class="time-badge">${formatTime(receipt.created_at)}</div>
                    <div class="item-info">${itemRows}</div>
                  </div>
                  <button type="button" class="delete-btn-ios" data-receipt-id="${receipt.id}" title="この会計を削除">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>
            `
              })
              .join('')}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    <div class="modal-actions" style="padding: 20px 24px;">
      <button type="button" class="main-action-btn" id="closeWeeklyHistoryBtn">閉じる</button>
    </div>
    `
    const container = document.getElementById('weeklyHistoryContent')
    if (!container) return
    container.innerHTML = html
    container.querySelector('#closeWeeklyHistoryBtn')?.addEventListener('click', () => closeModal('weeklyHistoryModal'))
    container.querySelectorAll('.delete-btn-ios').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const id = btn.getAttribute('data-receipt-id')
        if (!id || !confirm('この会計を削除しますか？\n\n削除後は復元できません。')) return
        await db.deleteReceipt(Number(id))
        await renderWeeklyHistory()
      })
    })
  }

  document.getElementById('weeklyHistoryModal').addEventListener('open', async () => {
    await renderWeeklyHistory()
    openModal('weeklyHistoryModal')
  })

  const productDialog = document.getElementById('productDialog')
  const productModalGrid = document.getElementById('productModalGrid')
  const productSearchInput = document.getElementById('productSearchInput')
  const clearSearchBtn = document.getElementById('clearSearchBtn')
  const searchResultsInfo = document.getElementById('searchResultsInfo')
  const searchResultsCount = document.getElementById('searchResultsCount')

  function getCartQuantity(productId) {
    return register.getItems().filter((i) => i.productId === String(productId)).length
  }

  function renderProductGrid(filter = '') {
    if (!productModalGrid) return
    const q = (filter || '').trim().toLowerCase()
    const all = getAllProducts()
    const list = q ? all.filter((p) => (p.name || '').toLowerCase().includes(q)) : all
    if (list.length === 0) {
      productModalGrid.innerHTML = '<p class="product-grid-empty">商品がありません。</p>'
    } else {
      productModalGrid.innerHTML = list
        .map((p) => {
          const cartQty = getCartQuantity(p.id)
          const cartIndicator =
            cartQty > 0
              ? `<div class="cart-status-indicator">カートに追加済み (${cartQty}個)</div>`
              : ''
          return `<div class="product-modal-item" data-product-id="${escapeHtml(String(p.id))}">
              <div class="product-modal-info">
                <div class="product-modal-name">${escapeHtml(p.name || '')}</div>
                <div class="product-modal-price">¥${getEffectiveProductPrice(p).toLocaleString()}</div>
                ${cartIndicator}
              </div>
              <div class="product-modal-controls">
                <div class="product-modal-quantity-controls">
                  <button type="button" class="product-modal-quantity-btn minus" data-product-id="${escapeHtml(String(p.id))}">−</button>
                  <span class="product-modal-quantity-display" data-product-id="${escapeHtml(String(p.id))}">0</span>
                  <button type="button" class="product-modal-quantity-btn plus" data-product-id="${escapeHtml(String(p.id))}">+</button>
                </div>
                <button type="button" class="product-modal-add-btn" data-product-id="${escapeHtml(String(p.id))}" disabled>追加</button>
              </div>
            </div>`
        })
        .join('')

      productModalGrid.querySelectorAll('.product-modal-quantity-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const productId = btn.dataset.productId
          const isPlus = btn.classList.contains('plus')
          const quantityDisplay = productModalGrid.querySelector(`.product-modal-quantity-display[data-product-id="${productId}"]`)
          const addBtn = productModalGrid.querySelector(`.product-modal-add-btn[data-product-id="${productId}"]`)
          let current = parseInt(quantityDisplay.textContent, 10) || 0
          current = isPlus ? current + 1 : Math.max(0, current - 1)
          quantityDisplay.textContent = String(current)
          if (addBtn) addBtn.disabled = current === 0
        })
      })

      productModalGrid.querySelectorAll('.product-modal-add-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const productId = btn.dataset.productId
          const quantityDisplay = productModalGrid.querySelector(`.product-modal-quantity-display[data-product-id="${productId}"]`)
          const quantity = parseInt(quantityDisplay.textContent, 10) || 0
          if (quantity <= 0) return
          const p = getAllProducts().find((x) => String(x.id) === productId)
          if (!p) return
          const effectivePrice = getEffectiveProductPrice(p)
          const productWithPrice = { ...p, category: 'product', price_including_tax: effectivePrice, price: effectivePrice }
          for (let i = 0; i < quantity; i++) {
            register.addItem(productWithPrice)
          }
updateReceiptUI(register, opts)
      renderMenuSections(register, refresh)
      renderProductGrid(productSearchInput?.value ?? '')
          btn.disabled = true
          btn.style.opacity = '0.6'
          setTimeout(() => {
            btn.disabled = false
            btn.style.opacity = '1'
          }, 2000)
        })
      })
    }
    if (searchResultsInfo) {
      searchResultsInfo.style.display = q ? 'block' : 'none'
      if (searchResultsCount) searchResultsCount.textContent = list.length
    }
  }

  document.getElementById('productsOpenBtn').addEventListener('click', () => {
    if (productSearchInput) productSearchInput.value = ''
    if (clearSearchBtn) clearSearchBtn.style.display = 'none'
    renderProductGrid()
    productDialog.showModal()
    setTimeout(() => productSearchInput?.focus(), 0)
  })

  document.getElementById('closeProductDialogBtn').addEventListener('click', () => productDialog.close())

  productSearchInput?.addEventListener('input', () => {
    const v = productSearchInput.value.trim()
    if (clearSearchBtn) clearSearchBtn.style.display = v ? 'flex' : 'none'
    renderProductGrid(v)
  })

  clearSearchBtn?.addEventListener('click', () => {
    productSearchInput.value = ''
    clearSearchBtn.style.display = 'none'
    renderProductGrid()
    productSearchInput.focus()
  })

  productDialog?.addEventListener('click', (e) => {
    if (e.target === productDialog) productDialog.close()
  })
  productDialog?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') productDialog.close()
  })

  const tempProductDialog = document.getElementById('tempProductDialog')
  document.getElementById('addManualProductBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('tempProductName')
    const priceInput = document.getElementById('tempProductPrice')
    const qtyInput = document.getElementById('tempProductQuantity')
    if (nameInput) nameInput.value = ''
    if (priceInput) priceInput.value = ''
    if (qtyInput) qtyInput.value = '1'
    tempProductDialog?.showModal()
  })
  document.getElementById('closeTempProductDialogBtn')?.addEventListener('click', () => tempProductDialog?.close())
  document.getElementById('cancelTempProductBtn')?.addEventListener('click', () => tempProductDialog?.close())
  document.getElementById('addTempProductBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('tempProductName')
    const priceInput = document.getElementById('tempProductPrice')
    const qtyInput = document.getElementById('tempProductQuantity')
    const name = nameInput?.value?.trim() ?? ''
    const price = Number(priceInput?.value) || 0
    const qty = Math.max(1, parseInt(qtyInput?.value, 10) || 1)
    if (!name) {
      alert('商品名を入力してください')
      return
    }
    for (let i = 0; i < qty; i++) {
      register.addItem({
        name,
        price_including_tax: price,
        price,
        category: 'product',
      })
    }
    tempProductDialog?.close()
    updateReceiptUI(register, opts)
    renderCustomerList(register, refresh)
    renderMenuSections(register, refresh)
    if (productDialog?.open) renderProductGrid(productSearchInput?.value ?? '')
  })
  tempProductDialog?.addEventListener('click', (e) => { if (e.target === tempProductDialog) tempProductDialog.close() })
  tempProductDialog?.addEventListener('keydown', (e) => { if (e.key === 'Escape') tempProductDialog.close() })

  ;['dailyClosingModal', 'dailyReportModal', 'weeklyHistoryModal', 'settingsModal', 'priceSettingsModal', 'productAdminModal'].forEach((id) => {
    const el = document.getElementById(id)
    el?.addEventListener('click', (e) => { if (e.target === el) closeModal(id) })
  })
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return
    if (document.getElementById('productDialog')?.open) document.getElementById('productDialog').close()
    else ;['weeklyHistoryModal', 'dailyReportModal', 'dailyClosingModal', 'settingsModal', 'priceSettingsModal', 'productAdminModal'].forEach(closeModal)
    closeSlideMenu()
  })

  function openPriceSettingsModal() {
    const s = getPriceSettings()
    const cutColorEl = document.getElementById('settingCutWithColor')
    const cutPermEl = document.getElementById('settingCutWithPerm')
    if (cutColorEl) cutColorEl.value = s.discountCutWithColor === DEFAULT_PRICE_SETTINGS.discountCutWithColor ? '' : String(s.discountCutWithColor)
    if (cutPermEl) cutPermEl.value = s.discountCutWithPerm === DEFAULT_PRICE_SETTINGS.discountCutWithPerm ? '' : String(s.discountCutWithPerm)

    const menuListEl = document.getElementById('priceSettingsMenuList')
    if (menuListEl) {
      menuListEl.innerHTML = ''
      const allMenus = CATEGORY_ORDER.flatMap((cat) => menusByCategory[cat] || [])
      allMenus.forEach((menu, idx) => {
        const key = getMenuPriceKey(menu)
        const basePrice = Number(menu.price_including_tax ?? menu.price ?? 0)
        const over = s.menuPriceOverrides[key]
        const row = document.createElement('div')
        row.className = 'price-settings-item'
        const safeKey = key.replace(/"/g, '&quot;')
        row.innerHTML = `
          <label class="price-settings-item-label" for="menu-override-${idx}">${escapeHtml(menu.name)}</label>
          <span class="price-settings-base">¥${basePrice.toLocaleString()}</span>
          <input type="number" id="menu-override-${idx}" data-menu-key="${safeKey}" class="price-settings-override" min="0" step="1" placeholder="上書き" value="${over != null && over >= 0 ? over : ''}" />
        `
        menuListEl.appendChild(row)
      })
    }

    openModal('priceSettingsModal')
  }
  window.openPriceSettingsModal = openPriceSettingsModal

  function renderProductAdminList() {
    const s = getPriceSettings()
    const listEl = document.getElementById('productAdminList')
    if (!listEl) return
    listEl.innerHTML = ''
    const all = getAllProducts()
    all.forEach((product, idx) => {
      const id = product.id != null ? String(product.id) : ''
      const isCustom = id.startsWith('custom_')
      const basePrice = Number(product.price_including_tax ?? product.price ?? 0)
      const over = id ? s.productPriceOverrides[id] : undefined
      const row = document.createElement('div')
      row.className = 'price-settings-item' + (isCustom ? ' product-admin-item-custom' : '')
      row.innerHTML = `
        <label class="price-settings-item-label" for="product-admin-${idx}">${escapeHtml(product.name || '商品')}${isCustom ? ' <span class="product-admin-badge">追加済</span>' : ''}</label>
        <span class="price-settings-base">¥${basePrice.toLocaleString()}</span>
        <input type="number" id="product-admin-${idx}" data-product-id="${escapeHtml(id)}" class="price-settings-override" min="0" step="1" placeholder="上書き" value="${over != null && over >= 0 ? over : ''}" />
        ${isCustom ? `<button type="button" class="product-admin-delete-btn" data-product-id="${escapeHtml(id)}" aria-label="削除">削除</button>` : ''}
      `
      listEl.appendChild(row)
      if (isCustom) {
        row.querySelector('.product-admin-delete-btn')?.addEventListener('click', () => {
          const list = getCustomProducts().filter((p) => String(p.id) !== id)
          saveCustomProducts(list)
          renderProductAdminList()
          renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
        })
      }
    })
  }

  function openProductAdminModal() {
    document.getElementById('productAdminNewName').value = ''
    document.getElementById('productAdminNewPrice').value = ''
    renderProductAdminList()
    openModal('productAdminModal')
  }
  window.openProductAdminModal = openProductAdminModal

  document.getElementById('closePriceSettingsBtn2')?.addEventListener('click', () => closeModal('priceSettingsModal'))
  document.getElementById('priceSettingsSaveBtn')?.addEventListener('click', () => {
    const cutWithColor = document.getElementById('settingCutWithColor')?.value.trim()
    const cutWithPerm = document.getElementById('settingCutWithPerm')?.value.trim()
    const s = getPriceSettings()
    s.discountCutWithColor = cutWithColor === '' ? DEFAULT_PRICE_SETTINGS.discountCutWithColor : Math.max(0, parseInt(cutWithColor, 10) || 0)
    s.discountCutWithPerm = cutWithPerm === '' ? DEFAULT_PRICE_SETTINGS.discountCutWithPerm : Math.max(0, parseInt(cutWithPerm, 10) || 0)

    s.menuPriceOverrides = {}
    document.querySelectorAll('#priceSettingsMenuList input[data-menu-key]').forEach((input) => {
      const key = input.getAttribute('data-menu-key')
      const v = input.value.trim()
      if (key && v !== '' && !Number.isNaN(Number(v))) {
        const num = parseInt(v, 10)
        if (num >= 0) s.menuPriceOverrides[key] = num
      }
    })

    savePriceSettings(s)
    closeModal('priceSettingsModal')
    renderMenuSections(register, refresh)
    if (typeof showToast === 'function') showToast('価格設定を保存しました', 'success')
    else alert('価格設定を保存しました')
  })
  document.getElementById('priceSettingsResetBtn')?.addEventListener('click', () => {
    if (!confirm('割引ルールをデフォルトに戻しますか？')) return
    savePriceSettings({ ...DEFAULT_PRICE_SETTINGS })
    closeModal('priceSettingsModal')
    if (typeof showToast === 'function') showToast('デフォルトに戻しました', 'success')
    else alert('デフォルトに戻しました')
  })

  document.getElementById('closeProductAdminBtn2')?.addEventListener('click', () => closeModal('productAdminModal'))
  document.getElementById('productAdminAddBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('productAdminNewName')
    const priceInput = document.getElementById('productAdminNewPrice')
    const name = (nameInput?.value ?? '').trim()
    const price = parseInt(priceInput?.value ?? '', 10)
    if (!name) {
      alert('商品名を入力してください')
      return
    }
    if (Number.isNaN(price) || price < 0) {
      alert('金額を0以上の数値で入力してください')
      return
    }
    const list = getCustomProducts()
    const newProduct = {
      id: 'custom_' + Date.now(),
      name,
      price_including_tax: price,
      price,
      category: 'product'
    }
    list.push(newProduct)
    saveCustomProducts(list)
    if (nameInput) nameInput.value = ''
    if (priceInput) priceInput.value = ''
    renderProductAdminList()
    renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
    if (typeof showToast === 'function') showToast('商品を追加しました', 'success')
    else alert('商品を追加しました')
  })
  document.getElementById('productAdminSaveBtn')?.addEventListener('click', () => {
    const s = getPriceSettings()
    s.productPriceOverrides = {}
    document.querySelectorAll('#productAdminList input[data-product-id]').forEach((input) => {
      const id = input.getAttribute('data-product-id')
      const v = input.value.trim()
      if (id && v !== '' && !Number.isNaN(Number(v))) {
        const num = parseInt(v, 10)
        if (num >= 0) s.productPriceOverrides[id] = num
      }
    })
    savePriceSettings(s)
    closeModal('productAdminModal')
    renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
    if (typeof showToast === 'function') showToast('商品設定を保存しました', 'success')
    else alert('商品設定を保存しました')
  })
  document.getElementById('productAdminResetBtn')?.addEventListener('click', () => {
    if (!confirm('商品価格の上書きをすべて解除しますか？')) return
    const s = getPriceSettings()
    s.productPriceOverrides = {}
    savePriceSettings(s)
    closeModal('productAdminModal')
    renderProductGrid(document.getElementById('productSearchInput')?.value ?? '')
    if (typeof showToast === 'function') showToast('デフォルトに戻しました', 'success')
    else alert('デフォルトに戻しました')
  })
}

async function init () {
  initTheme()
  await loadMenus()
  await loadProducts()
  register.addInitialCustomer()
  renderMenuSections(register, refresh)
  renderCustomerList(register, refresh)
  updateReceiptUI(register, opts)
  setupSlideMenu()
  setupModals()
  setupSettingsModal()
  setupPaymentAndCheckout(register, refresh)
  document.getElementById('logoutBtn').addEventListener('click', logout)
}

init()

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
