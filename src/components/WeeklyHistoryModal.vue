<script setup>
import { ref, watch } from 'vue'
import { inject } from 'vue'

const props = defineProps({
  open: Boolean,
})
defineEmits(['close'])

const supabase = inject('supabase')
const grouped = ref({})
const loading = ref(false)
const error = ref(null)

async function fetchWeekly() {
  if (!supabase) {
    grouped.value = {}
    return
  }
  loading.value = true
  error.value = null
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const { data, err } = await supabase
      .from('receipts')
      .select('*')
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: false })
    if (err) throw err
    grouped.value = groupByDate(data || [])
  } catch (e) {
    error.value = e.message || '取得に失敗しました'
    grouped.value = {}
  } finally {
    loading.value = false
  }
}

function groupByDate(receipts) {
  return receipts.reduce((acc, r) => {
    const date = new Date(r.created_at).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
    if (!acc[date]) {
      acc[date] = { receipts: [], totalAmount: 0, count: 0 }
    }
    acc[date].receipts.push(r)
    acc[date].totalAmount += r.total || 0
    acc[date].count += 1
    return acc
  }, {})
}

function formatPrice(v) {
  return `¥${Number(v).toLocaleString()}`
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) fetchWeekly()
  }
)
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div class="modal-overlay" @click.self="$emit('close')"></div>
      <div class="weekly-history-modal" role="dialog" aria-labelledby="weekly-history-title">
        <div class="modal-header">
          <h2 id="weekly-history-title">過去の履歴（1週間分）</h2>
          <button type="button" class="close-btn" aria-label="閉じる" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <p v-if="loading" class="loading">読み込み中...</p>
          <p v-else-if="error" class="error">{{ error }}</p>
          <div v-else-if="Object.keys(grouped).length === 0" class="empty-history">
            <h3>履歴がありません</h3>
            <p>過去1週間に会計データがありません</p>
          </div>
          <div v-else class="weekly-history-list">
            <div v-for="(info, date) in grouped" :key="date" class="date-group">
              <div class="date-header">
                <span class="date-title">{{ date }}</span>
                <span class="date-total">{{ formatPrice(info.totalAmount) }}（{{ info.count }}件）</span>
              </div>
              <ul class="receipt-list">
                <li v-for="r in info.receipts" :key="r.id || r.created_at" class="receipt-row">
                  <span class="receipt-time">{{ new Date(r.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }}</span>
                  <span class="receipt-total">{{ formatPrice(r.total) }}</span>
                </li>
              </ul>
            </div>
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
.weekly-history-modal {
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
  padding: 1.25rem;
}
.loading,
.error {
  margin: 0;
  font-size: 0.875rem;
  color: #5a7464;
}
.error {
  color: #c62828;
}
.empty-history {
  text-align: center;
  padding: 2rem 0;
}
.empty-history h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #2d4a3a;
}
.empty-history p {
  margin: 0;
  font-size: 0.875rem;
  color: #5a7464;
}
.weekly-history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.date-group {
  border: 1px solid #d4e4d9;
  border-radius: 8px;
  overflow: hidden;
}
.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: #e8f5e9;
  font-size: 0.875rem;
}
.date-title {
  font-weight: 600;
  color: #2d4a3a;
}
.date-total {
  color: #5a7464;
}
.receipt-list {
  margin: 0;
  padding: 0.5rem;
  list-style: none;
}
.receipt-row {
  display: flex;
  justify-content: space-between;
  padding: 0.35rem 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid #f0f0f0;
}
.receipt-row:last-child {
  border-bottom: none;
}
.receipt-time {
  color: #5a7464;
}
.receipt-total {
  font-weight: 500;
  color: #2d4a3a;
}
</style>
