/**
 * レジ・明細の状態管理（Vanilla）。複数顧客対応。割引: 設定で変更可（デフォルト パーマ時カット0円、カラー時カット2800円）
 */
function effectivePrice(item, allItems) {
  if (item.category === 'offer') return 0
  if (item.category === 'haircut') {
    const ps = typeof window !== 'undefined' && window.getPriceSettings ? window.getPriceSettings() : { discountCutWithColor: 2800, discountCutWithPerm: 0 }
    const hasPerm = allItems.some((i) => i.category === 'perm')
    const hasColor = allItems.some((i) => i.category === 'color')
    if (hasPerm) return ps.discountCutWithPerm
    if (hasColor && item.price > ps.discountCutWithColor) return ps.discountCutWithColor
  }
  return item.price
}

export function createRegister() {
  let customers = []
  let currentCustomerIndex = 0

  function getCurrent() {
    return customers[currentCustomerIndex]
  }

  function getItems() {
    const cur = getCurrent()
    return cur ? [...cur.items] : []
  }

  /** 税込合計（表示価格は全て税込のため、effectivePrice の合計がそのまま税込合計） */
  function getTotalWithTax() {
    const items = getItems()
    let sum = 0
    const offer = items.find((i) => i.category === 'offer')
    items.forEach((item) => { sum += effectivePrice(item, items) })
    if (offer) {
      if (offer.discountType === 'percentage') sum = Math.round(sum * (1 - Math.abs(offer.price) / 100))
      else if (offer.discountType === 'fixed') sum = Math.max(0, sum + offer.price)
    }
    return sum
  }

  /** 小計（税抜）：税込合計から逆算（本番と同じ） */
  function getSubtotal() {
    return Math.round(getTotalWithTax() / 1.1)
  }

  /** 消費税：税込合計 − 税抜小計（本番と同じ） */
  function getTax() {
    return getTotalWithTax() - getSubtotal()
  }

  return {
    getItems,
    getCustomers: () => customers.map((c) => ({ id: c.id, name: c.name, items: c.items })),
    getCurrentCustomerIndex: () => currentCustomerIndex,
    setCurrentCustomerIndex(i) {
      if (i >= 0 && i < customers.length) currentCustomerIndex = i
    },

    getPaymentAmount: () => Number(document.getElementById('paymentInput')?.value) || 0,
    setPaymentAmount(val) {
      const el = document.getElementById('paymentInput')
      if (el) el.value = String(val)
    },
    getSubtotal,
    getTax,
    getTotal: () => getTotalWithTax(),
    getChange: () => Math.max(0, (Number(document.getElementById('paymentInput')?.value) || 0) - getTotalWithTax()),

    addCustomer(name = '') {
      const customerName = (typeof name === 'string' ? name : '').trim()
      const nextNum = customers.length + 1
      const customer = {
        id: `customer_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        name: customerName || `お客様${nextNum}`,
        items: [],
        buttonStates: new Map(),
      }
      
      // 名前を入力した場合、アイテムが空のデフォルト顧客（お客様1等）を削除
      if (customerName) {
        const emptyDefaultIndex = customers.findIndex(c => 
          c.items.length === 0 && /^お客様\d+$/.test(c.name)
        )
        if (emptyDefaultIndex !== -1) {
          customers.splice(emptyDefaultIndex, 1)
          // 削除した顧客より後ろにいた場合、currentCustomerIndex を調整
          if (currentCustomerIndex > emptyDefaultIndex) {
            currentCustomerIndex--
          }
        }
      }
      
      customers.unshift(customer)  // 先頭に追加
      currentCustomerIndex = 0  // 新規顧客を選択
    },

    addInitialCustomer() {
      if (customers.length === 0) this.addCustomer('')
    },

    removeCustomer(customerId) {
      if (customers.length <= 1) return false
      const idx = customers.findIndex((c) => c.id === customerId)
      if (idx < 0) return false
      customers.splice(idx, 1)
      if (currentCustomerIndex >= customers.length) currentCustomerIndex = Math.max(0, customers.length - 1)
      if (currentCustomerIndex > idx) currentCustomerIndex -= 1
      return true
    },

    addItem(menu) {
      const cur = getCurrent()
      if (!cur) return
      const { items, buttonStates } = cur
      const buttonKey = `${menu.name}${menu.category}`
      const id = Date.now()
      const item = {
        id,
        name: menu.name,
        price: menu.price_including_tax ?? menu.price,
        category: menu.category,
        buttonKey,
        discountType: menu.category === 'offer' ? 'fixed' : null,
      }
      if (menu.category === 'product' && menu.id != null) {
        item.productId = String(menu.id)
      }
      if (menu.category === 'offer') {
        if (buttonStates.has(buttonKey)) return
        const i = items.findIndex((x) => x.category === 'offer')
        if (i >= 0) items.splice(i, 1, item)
        else items.push(item)
        buttonStates.set(buttonKey, id)
      } else if (menu.category === 'product') {
        items.push(item)
      } else {
        if (buttonStates.has(buttonKey)) return
        items.push(item)
        buttonStates.set(buttonKey, id)
      }
    },

    removeItem(id) {
      const cur = getCurrent()
      if (!cur) return
      const item = cur.items.find((i) => i.id === id)
      if (item) {
        cur.buttonStates.delete(item.buttonKey)
        cur.items = cur.items.filter((i) => i.id !== id)
      }
    },

    isSelected(buttonKey) {
      const cur = getCurrent()
      return cur ? cur.buttonStates.has(buttonKey) : false
    },

    toggleItem(menu) {
      const buttonKey = `${menu.name}${menu.category}`
      const cur = getCurrent()
      if (!cur) return
      if (cur.buttonStates.has(buttonKey)) {
        this.removeItem(cur.buttonStates.get(buttonKey))
      } else {
        this.addItem(menu)
      }
    },

    clear() {
      customers.forEach((c) => {
        c.items = []
        c.buttonStates.clear()
      })
      this.setPaymentAmount(0)
    },

    getItemDisplayPrice(item) {
      return effectivePrice(item, getItems())
    },

    formatPrice(value) {
      return `¥${Number(value).toLocaleString()}`
    },

    getItemsForSave() {
      return getItems().map((i) => ({
        name: i.name,
        price: this.getItemDisplayPrice(i),
        category: i.category,
      }))
    },
  }
}
