<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useMenus } from '../composables/useMenus'
import { useRegister } from '../composables/useRegister'
import { getCategoryInfo } from '../data/categoryInfo'

const auth = useAuth()
const { menusByCategory, load } = useMenus()
const {
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
} = useRegister()

onMounted(() => load())
</script>

<template>
  <div class="main-view">
    <header class="main-header">
      <h1>サロンレジ</h1>
      <nav class="header-actions">
        <button type="button" class="link-btn" @click="auth.logout()">ログアウト</button>
      </nav>
    </header>

    <div class="content-wrapper">
      <main class="main-content">
        <template v-for="cat in ['haircut', 'color', 'perm', 'option', 'offer']" :key="cat">
          <section v-if="menusByCategory[cat]?.length" class="menu-section">
            <div class="section-header">
              <h2>{{ getCategoryInfo(cat).title }} <span class="section-subtitle">{{ getCategoryInfo(cat).subtitle }}</span></h2>
            </div>
            <p v-if="getCategoryInfo(cat).note" class="info-note">{{ getCategoryInfo(cat).note }}</p>
            <div class="menu-grid">
              <button
                v-for="menu in menusByCategory[cat]"
                :key="menu.name + menu.category"
                type="button"
                class="menu-btn"
                :class="{ selected: isSelected(menu.name + menu.category) }"
                @click="toggleItem(menu)"
              >
                <span class="menu-name">{{ menu.name }}</span>
                <span class="menu-price">¥{{ menu.price_including_tax?.toLocaleString() }}</span>
              </button>
            </div>
          </section>
        </template>
        <div class="service-note">
          <p class="highlight">全メニューに炭酸水使用</p>
          <p>※表示価格は消費税込となっております</p>
        </div>
      </main>

      <aside class="receipt">
        <h3>ご利用明細</h3>
        <div class="item-list">
          <template v-if="items.length">
            <div v-for="item in items" :key="item.id" class="receipt-item">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-price">{{ formatPrice(getItemDisplayPrice(item)) }}</span>
              <button type="button" class="remove-item" aria-label="削除" @click="removeItem(item.id)">×</button>
            </div>
          </template>
          <div v-else class="empty-state">
            <p>メニューを選択してください</p>
          </div>
        </div>
        <div class="total-section">
          <div class="total-row subtotal"><span>小計（税抜）</span><span>{{ formatPrice(subtotal) }}</span></div>
          <div class="total-row tax"><span>消費税（10%）</span><span>{{ formatPrice(tax) }}</span></div>
          <div class="total-row total"><span>合計</span><span>{{ formatPrice(total) }}</span></div>
        </div>
        <div class="payment-section">
          <label class="payment-label">お預かり金額</label>
          <div class="quick-amounts">
            <button type="button" class="quick-btn" @click="setPayment(5000)">5千円</button>
            <button type="button" class="quick-btn" @click="setPayment(10000)">1万円</button>
            <button type="button" class="quick-btn" @click="setPayment(20000)">2万円</button>
          </div>
          <input
            v-model.number="paymentAmount"
            type="number"
            class="payment-input"
            placeholder="¥0"
            min="0"
            step="100"
            inputmode="numeric"
          />
          <div class="change-box">
            <span class="change-label">お釣り</span>
            <span class="change-amount">{{ formatPrice(change) }}</span>
          </div>
        </div>
        <button type="button" class="main-action-btn" @click="checkout()">会計確定</button>
        <button type="button" class="clear-btn" @click="clear()">すべてクリア</button>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8f5e9 0%, #f0f8f0 100%);
}
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #e8f5e9;
  border-bottom: 1px solid #d4e4d9;
}
.main-header h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d4a3a;
}
.link-btn {
  background: none;
  border: none;
  color: #5a8f6a;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
}
.link-btn:hover {
  text-decoration: underline;
}

.content-wrapper {
  flex: 1;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  min-height: 0;
}
.main-content {
  flex: 1;
  overflow-y: auto;
}
.menu-section {
  margin-bottom: 1.5rem;
}
.section-header {
  margin-bottom: 0.5rem;
}
.section-header h2 {
  margin: 0;
  font-size: 1.125rem;
  color: #2d4a3a;
}
.section-subtitle {
  font-size: 0.75rem;
  color: #5a7464;
  margin-left: 0.25rem;
}
.info-note {
  font-size: 0.75rem;
  color: #5a7464;
  margin: 0 0 0.5rem;
}
.menu-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.menu-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d4e4d9;
  border-radius: 10px;
  background: #fff;
  color: #2d4a3a;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 6rem;
}
.menu-btn:hover {
  border-color: #5a8f6a;
  background: #f0f8f0;
}
.menu-btn.selected {
  border-color: #5a8f6a;
  background: #e8f5e9;
}
.menu-name { font-weight: 500; }
.menu-price { font-size: 0.8rem; color: #5a7464; }
.service-note {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #5a7464;
}
.highlight { font-weight: 500; color: #2d4a3a; }

.receipt {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(90, 143, 106, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}
.receipt h3 {
  margin: 0;
  font-size: 1rem;
  color: #2d4a3a;
}
.item-list {
  min-height: 4rem;
}
.receipt-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid #eee;
  font-size: 0.875rem;
}
.item-name { flex: 1; }
.item-price { color: #2d4a3a; font-weight: 500; }
.remove-item {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 1.1rem;
}
.remove-item:hover { color: #c62828; }
.empty-state {
  padding: 1rem;
  text-align: center;
  color: #888;
  font-size: 0.875rem;
}
.total-section {
  border-top: 1px solid #d4e4d9;
  padding-top: 0.75rem;
}
.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 0.25rem 0;
}
.total-row.total {
  font-weight: 600;
  font-size: 1rem;
  color: #2d4a3a;
}
.payment-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.payment-label { font-size: 0.875rem; color: #5a7464; }
.quick-amounts {
  display: flex;
  gap: 0.5rem;
}
.quick-btn {
  padding: 0.35rem 0.5rem;
  border: 1px solid #d4e4d9;
  border-radius: 6px;
  background: #fff;
  font-size: 0.75rem;
  cursor: pointer;
}
.quick-btn:hover { border-color: #5a8f6a; }
.payment-input {
  padding: 0.5rem;
  border: 1px solid #d4e4d9;
  border-radius: 8px;
  font-size: 1rem;
}
.change-box {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}
.change-amount { font-weight: 600; }
.main-action-btn {
  width: 100%;
  padding: 0.75rem;
  background: #5a8f6a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
}
.main-action-btn:hover { background: #4a7f5a; }
.clear-btn {
  width: 100%;
  padding: 0.5rem;
  background: #fff;
  color: #5a7464;
  border: 1px solid #d4e4d9;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}
.clear-btn:hover { border-color: #5a8f6a; }
</style>
