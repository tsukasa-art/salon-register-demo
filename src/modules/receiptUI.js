/**
 * ご利用明細・顧客リストの表示更新
 */
import { escapeHtml, showAlert, showConfirm } from './utils.js'

/**
 * @param {ReturnType<import('../register.js').createRegister>} register
 * @param {{ refresh?: () => void; renderCustomerListOnly?: () => void }} opts - refresh: 全体更新, renderCustomerListOnly: 末尾で顧客リストのみ再描画
 */
export function updateReceiptUI (register, opts = {}) {
  const refresh = opts.refresh
  const renderCustomerListOnly = opts.renderCustomerListOnly
  const items = register.getItems()
  const listEl = document.getElementById('itemList')
  if (!listEl) return

  listEl.innerHTML = ''
  if (items.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty-state'
    empty.id = 'emptyState'
    empty.innerHTML = '<p>メニューを選択してください</p>'
    listEl.appendChild(empty)
  } else {
    // 同じ商品をグループ化
    const groupedItems = {}
    items.forEach((item) => {
      const key = item.productId || item.name
      if (!groupedItems[key]) {
        groupedItems[key] = {
          name: item.name,
          price: register.getItemDisplayPrice(item),
          items: [],
          key: key,
          category: item.category
        }
      }
      groupedItems[key].items.push(item)
    })

    // グループごとに表示
    Object.values(groupedItems).forEach((group) => {
      const div = document.createElement('div')
      const quantity = group.items.length
      const totalPrice = group.price * quantity
      
      // 商品の場合は+/-ボタン付き、施術の場合はシンプル表示
      if (group.category === 'product') {
        div.className = 'receipt-item receipt-item-grouped'
        div.innerHTML = `
          <div class="receipt-item-header">
            <span class="item-name">${escapeHtml(group.name)}</span>
            <span class="item-price">${register.formatPrice(totalPrice)}</span>
          </div>
          <div class="receipt-item-controls">
            <button type="button" class="receipt-quantity-btn minus" data-group-key="${escapeHtml(group.key)}" ${quantity === 1 ? 'disabled' : ''}>−</button>
            <span class="receipt-quantity-display">${quantity}</span>
            <button type="button" class="receipt-quantity-btn plus" data-group-key="${escapeHtml(group.key)}">+</button>
          </div>
          <button type="button" class="remove-item-all" aria-label="全削除" data-group-key="${escapeHtml(group.key)}"></button>
        `
      } else {
        // 施術の場合はシンプル表示（×ボタンのみ）
        div.className = 'receipt-item receipt-item-single'
        div.innerHTML = `
          <span class="item-name">${escapeHtml(group.name)}</span>
          <span class="item-price">${register.formatPrice(totalPrice)}</span>
          <button type="button" class="remove-item" aria-label="削除" data-group-key="${escapeHtml(group.key)}">×</button>
        `
      }
      listEl.appendChild(div)
    })
  }

  document.getElementById('subtotalText').textContent = register.formatPrice(register.getSubtotal())
  document.getElementById('taxText').textContent = register.formatPrice(register.getTax())
  document.getElementById('totalText').textContent = register.formatPrice(register.getTotal())
  document.getElementById('changeText').textContent = register.formatPrice(register.getChange())

  // 削除ボタン（施術の場合）
  listEl.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.groupKey
      const targetItem = items.find((item) => (item.productId || item.name) === key)
      if (targetItem) {
        register.removeItem(targetItem.id)
        if (refresh) refresh()
      }
    })
  })

  // +/-ボタン（商品の場合）
  listEl.querySelectorAll('.receipt-quantity-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.groupKey
      const isPlus = btn.classList.contains('plus')
      const targetItems = items.filter((item) => (item.productId || item.name) === key)
      
      if (isPlus) {
        // 同じ商品の最初のアイテムを複製して追加
        if (targetItems.length > 0) {
          const template = targetItems[0]
          register.addItem({
            name: template.name,
            price_including_tax: template.price,
            price: template.price,
            category: template.category,
            id: template.productId // productIdを引き継ぐ
          })
        }
      } else {
        // 最後のアイテムを1個削除
        if (targetItems.length > 0) {
          const lastItem = targetItems[targetItems.length - 1]
          register.removeItem(lastItem.id)
        }
      }
      
      if (refresh) refresh()
    })
  })

  // 全削除ボタン（複数の場合）
  listEl.querySelectorAll('.remove-item-all').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.groupKey
      const targetItems = items.filter((item) => (item.productId || item.name) === key)
      targetItems.forEach((item) => register.removeItem(item.id))
      if (refresh) refresh()
    })
  })

  if (renderCustomerListOnly) renderCustomerListOnly()
}

/**
 * @param {ReturnType<import('../register.js').createRegister>} register
 * @param {() => void} refresh - 変更時に呼ぶ全体更新コールバック
 */
export function renderCustomerList (register, refresh) {
  const container = document.getElementById('customerList')
  if (!container) return
  container.innerHTML = ''
  const list = register.getCustomers()
  const currentIndex = register.getCurrentCustomerIndex()

  const headerDiv = document.createElement('div')
  headerDiv.className = 'customer-list-header'
  const headerTitle = document.createElement('h4')
  headerTitle.textContent = '顧客リスト'
  const addBtn = document.createElement('button')
  addBtn.type = 'button'
  addBtn.id = 'addCustomerBtn'
  addBtn.className = 'add-customer-btn'
  addBtn.textContent = '+ 顧客追加'
  headerDiv.appendChild(headerTitle)
  headerDiv.appendChild(addBtn)

  const itemsDiv = document.createElement('div')
  itemsDiv.className = 'customer-items'
  list.forEach((customer, index) => {
    const item = document.createElement('div')
    item.className = `customer-item ${index === currentIndex ? 'active' : ''}`
    item.dataset.customerId = customer.id
    const info = document.createElement('div')
    info.className = 'customer-info'
    const nameEl = document.createElement('div')
    nameEl.className = 'customer-name'
    nameEl.textContent = customer.name
    const countEl = document.createElement('div')
    countEl.className = 'customer-items-count'
    countEl.textContent = `${customer.items.length}件`
    info.appendChild(nameEl)
    info.appendChild(countEl)
    item.appendChild(info)
    if (list.length > 1) {
      const removeBtn = document.createElement('button')
      removeBtn.type = 'button'
      removeBtn.className = 'remove-customer-btn'
      removeBtn.dataset.customerId = customer.id
      removeBtn.textContent = '×'
      removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation()
        if (list.length <= 1) {
          await showAlert('エラー', '最低1名の顧客が必要です')
          return
        }
        if (!await showConfirm('確認', `${customer.name}を削除しますか？\n（${customer.items.length}件の施術内容も削除されます）`)) return
        register.removeCustomer(customer.id)
        if (refresh) refresh()
      })
      item.appendChild(removeBtn)
    }
    item.addEventListener('click', (e) => {
      if (e.target.closest('.remove-customer-btn')) return
      register.setCurrentCustomerIndex(index)
      if (refresh) refresh()
    })
    itemsDiv.appendChild(item)
  })

  const inputDiv = document.createElement('div')
  inputDiv.className = 'add-customer-input'
  const nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.id = 'customerNameInput'
  nameInput.placeholder = '顧客名を入力'
  nameInput.maxLength = 20
  inputDiv.appendChild(nameInput)

  container.appendChild(headerDiv)
  container.appendChild(itemsDiv)
  container.appendChild(inputDiv)

  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim()
    register.addCustomer(name)
    nameInput.value = ''
    if (refresh) refresh()
  })
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click()
  })
}
