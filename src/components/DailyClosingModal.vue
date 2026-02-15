<script setup>
defineProps({
  open: Boolean,
})
defineEmits(['close', 'report', 'clear-complete'])
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div class="modal-overlay" @click.self="$emit('close')"></div>
      <div class="daily-closing-modal" role="dialog" aria-labelledby="daily-closing-title">
        <div class="modal-header">
          <h2 id="daily-closing-title">日次締め作業</h2>
          <button type="button" class="close-btn" aria-label="閉じる" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <div class="closing-options">
            <div class="option-card">
              <div class="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m0-7V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-6 0h6m-6 0v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3"/>
                </svg>
              </div>
              <h3>日次レポート</h3>
              <p>当日の売上レポートを表示します</p>
              <button type="button" class="option-btn primary" @click="$emit('report')">レポート表示</button>
            </div>
            <div class="option-card">
              <div class="option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
                </svg>
              </div>
              <h3>締め作業完了</h3>
              <p>今日のデータを削除して締め作業を完了します</p>
              <button type="button" class="option-btn danger" @click="$emit('clear-complete')">締め作業完了</button>
            </div>
          </div>
          <div class="closing-info">
            <h4>💡 ヒント</h4>
            <ul>
              <li>過去の履歴は「メニュー」から確認できます</li>
              <li>Supabaseには2週間分のデータが保存されます</li>
              <li>締め作業後はページがリロードされます</li>
              <li>重要なデータは事前にバックアップを取ってください</li>
            </ul>
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
.daily-closing-modal {
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
  padding: 0 0.25rem;
}
.close-btn:hover {
  color: #2d4a3a;
}
.modal-content {
  padding: 1.25rem;
}
.closing-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.option-card {
  padding: 1rem;
  border: 1px solid #d4e4d9;
  border-radius: 10px;
  background: #fafaf8;
}
.option-icon {
  color: #5a8f6a;
  margin-bottom: 0.5rem;
}
.option-card h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: #2d4a3a;
}
.option-card p {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  color: #5a7464;
}
.option-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}
.option-btn.primary {
  background: #5a8f6a;
  color: #fff;
}
.option-btn.primary:hover {
  background: #4a7f5a;
}
.option-btn.danger {
  background: #fff;
  color: #c62828;
  border: 1px solid #ef9a9a;
}
.option-btn.danger:hover {
  background: #ffebee;
}
.closing-info {
  font-size: 0.8125rem;
  color: #5a7464;
}
.closing-info h4 {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: #2d4a3a;
}
.closing-info ul {
  margin: 0;
  padding-left: 1.25rem;
}
.closing-info li {
  margin-bottom: 0.25rem;
}
</style>
