<script setup>
import { ref, watch } from 'vue'
import { inject } from 'vue'

const props = defineProps({
  open: Boolean,
})
defineEmits(['close'])

const supabase = inject('supabase')
const todayTotal = ref(0)
const todayCount = ref(0)
const loading = ref(false)
const error = ref(null)

async function fetchToday() {
  if (!supabase) {
    todayTotal.value = 0
    todayCount.value = 0
    return
  }
  loading.value = true
  error.value = null
  try {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const { data, err } = await supabase
      .from('receipts')
      .select('total')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
    if (err) throw err
    const list = data || []
    todayCount.value = list.length
    todayTotal.value = list.reduce((sum, r) => sum + (r.total || 0), 0)
  } catch (e) {
    error.value = e.message || '取得に失敗しました'
    todayTotal.value = 0
    todayCount.value = 0
  } finally {
    loading.value = false
  }
}

function formatPrice(v) {
  return `¥${Number(v).toLocaleString()}`
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) fetchToday()
  }
)
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div class="modal-overlay" @click.self="$emit('close')"></div>
      <div class="daily-report-modal" role="dialog" aria-labelledby="daily-report-title">
        <div class="modal-header">
          <h2 id="daily-report-title">日次レポート</h2>
          <button type="button" class="close-btn" aria-label="閉じる" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <p v-if="loading" class="loading">読み込み中...</p>
          <p v-else-if="error" class="error">{{ error }}</p>
          <template v-else>
            <div class="report-summary">
              <div class="summary-row">
                <span>本日の会計件数</span>
                <span>{{ todayCount }}件</span>
              </div>
              <div class="summary-row total">
                <span>本日の売上合計</span>
                <span>{{ formatPrice(todayTotal) }}</span>
              </div>
            </div>
            <p v-if="todayCount === 0" class="no-data">本日の会計データはありません</p>
          </template>
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
  z-index: 1200;
}
.daily-report-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 360px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1201;
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
.error,
.no-data {
  margin: 0;
  font-size: 0.875rem;
  color: #5a7464;
}
.error {
  color: #c62828;
}
.report-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
}
.summary-row.total {
  font-weight: 600;
  font-size: 1.125rem;
  color: #2d4a3a;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}
</style>
