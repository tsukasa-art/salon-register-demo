/**
 * レジ・明細の状態管理（1顧客想定）。割引: パーマ時カット0円、カラー時カット2800円
 */
import { ref, computed } from 'vue'

const CUT_DISCOUNT_WITH_COLOR = 2800

function effectivePrice(item, allItems) {
  if (item.category === 'offer') return 0
  if (item.category === 'haircut') {
    const hasPerm = allItems.some((i) => i.category === 'perm')
    const hasColor = allItems.some((i) => i.category === 'color')
    if (hasPerm) return 0
    if (hasColor && item.price > CUT_DISCOUNT_WITH_COLOR) return CUT_DISCOUNT_WITH_COLOR
  }
  return item.price
}

export function useRegister() {
  const items = ref([])
  const paymentAmount = ref(0)
  const buttonStates = ref(new Map()) // buttonKey -> itemId (for toggle selected)

  const subtotal = computed(() => {
    let sum = 0
    const list = items.value
    const offer = list.find((i) => i.category === 'offer')
    list.forEach((item) => { sum += effectivePrice(item, list) })
    if (offer) {
      if (offer.discountType === 'percentage') sum = Math.round(sum * (1 - Math.abs(offer.price) / 100))
      else if (offer.discountType === 'fixed') sum = Math.max(0, sum + offer.price)
    }
    return sum
  })

  const tax = computed(() => Math.round(subtotal.value * 0.1))
  const total = computed(() => subtotal.value + tax.value)
  const change = computed(() => Math.max(0, (paymentAmount.value || 0) - total.value))

  function addItem(menu) {
    const buttonKey = `${menu.name}${menu.category}`
    if (buttonStates.value.has(buttonKey)) return
    const id = Date.now()
    const item = {
      id,
      name: menu.name,
      price: menu.price_including_tax,
      category: menu.category,
      buttonKey,
      discountType: menu.category === 'offer' ? 'fixed' : null,
    }
    if (menu.category === 'offer') {
      const idx = items.value.findIndex((i) => i.category === 'offer')
      if (idx >= 0) items.value.splice(idx, 1, item)
      else items.value.push(item)
    } else {
      items.value.push(item)
    }
    buttonStates.value.set(buttonKey, id)
  }

  function removeItem(id) {
    const item = items.value.find((i) => i.id === id)
    if (item) {
      buttonStates.value.delete(item.buttonKey)
      items.value = items.value.filter((i) => i.id !== id)
    }
  }

  function isSelected(buttonKey) {
    return buttonStates.value.has(buttonKey)
  }

  function toggleItem(menu) {
    const buttonKey = `${menu.name}${menu.category}`
    if (buttonStates.value.has(buttonKey)) {
      const id = buttonStates.value.get(buttonKey)
      removeItem(id)
    } else {
      addItem(menu)
    }
  }

  function setPayment(amount) {
    paymentAmount.value = Number(amount) || 0
  }

  function clear() {
    items.value = []
    buttonStates.value = new Map()
    paymentAmount.value = 0
  }

  function checkout() {
    clear()
  }

  function getItemDisplayPrice(item) {
    return effectivePrice(item, items.value)
  }

  function formatPrice(value) {
    return `¥${Number(value).toLocaleString()}`
  }

  return {
    items,
    paymentAmount,
    subtotal,
    tax,
    total,
    change,
    addItem,
    removeItem,
    isSelected,
    toggleItem,
    setPayment,
    clear,
    checkout,
    getItemDisplayPrice,
    formatPrice,
  }
}
