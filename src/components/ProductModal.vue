<script setup>
import { watch } from 'vue'
import { useProducts } from '../composables/useProducts'

const props = defineProps({
  open: Boolean,
})
defineEmits(['close'])

const { products, loading, error, load } = useProducts()

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) load()
  }
)

function formatPrice(v) {
  return `¥${Number(v).toLocaleString()}`
}

function toCartItem(p) {
  return {
    name: p.name,
    price_including_tax: p.price_including_tax ?? p.price ?? 0,
    category: 'product',
  }
}
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div class="modal-overlay" @click.self="$emit('close')"></div>
      <div class="product-modal" role="dialog" aria-labelledby="product-modal-title">
        <div class="modal-header">
          <h2 id="product-modal-title">商品リスト</h2>
          <button type="button" class="close-btn" aria-label="閉じる" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <p v-if="loading" class="loading">読み込み中...</p>
          <p v-else-if="error" class="error">{{ error }}</p>
          <div v-else-if="products.length === 0" class="empty">商品がありません</div>
          <div v-else class="product-grid">
            <button
              v-for="p in products"
              :key="p.id || p.name"
              type="button"
              class="product-btn"
              @click="$emit('add', toCartItem(p)); $emit('close')"
            >
              <span class="product-name">{{ p.name }}</span>
              <span class="product-price">{{ formatPrice(p.price_including_tax ?? p.price) }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1100;
}
.product-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1101;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.125rem;
  color: #2d4a3a;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #5a7464;
  cursor: pointer;
}
.modal-content {
  padding: 1rem;
}
.loading,
.error,
.empty {
  margin: 0;
  font-size: 0.875rem;
  color: #5a7464;
}
.error {
  color: #c62828;
}
.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.product-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d4e4d9;
  border-radius: 8px;
  background: #fff;
  color: #2d4a3a;
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  min-width: 7rem;
}
.product-btn:hover {
  border-color: #5a8f6a;
  background: #f0f8f0;
}
.product-name {
  display: block;
  font-weight: 500;
}
.product-price {
  display: block;
  font-size: 0.8rem;
  color: #5a7464;
}
</style>
