/**
 * ご利用明細・顧客リストの表示更新
 */
import { escapeHtml } from './utils.js'

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
    items.forEach((item) => {
      const div = document.createElement('div')
      div.className = 'receipt-item'
      div.innerHTML = `
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-price">${register.formatPrice(register.getItemDisplayPrice(item))}</span>
        <button type="button" class="remove-item" aria-label="削除" data-id="${item.id}">×</button>
      `
      listEl.appendChild(div)
    })
  }

  document.getElementById('subtotalText').textContent = register.formatPrice(register.getSubtotal())
  document.getElementById('taxText').textContent = register.formatPrice(register.getTax())
  document.getElementById('totalText').textContent = register.formatPrice(register.getTotal())
  document.getElementById('changeText').textContent = register.formatPrice(register.getChange())

  listEl.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      register.removeItem(Number(btn.dataset.id))
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
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        if (list.length <= 1) {
          alert('最低1名の顧客が必要です')
          return
        }
        if (!confirm(`${customer.name}を削除しますか？\n（${customer.items.length}件の施術内容も削除されます）`)) return
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
