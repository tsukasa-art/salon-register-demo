<script setup>
defineProps({
  open: Boolean,
})
defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div class="modal-overlay" @click.self="$emit('close')"></div>
      <div class="backup-placeholder-modal" role="dialog" aria-labelledby="backup-title">
        <div class="modal-header">
          <h2 id="backup-title">データバックアップ</h2>
          <button type="button" class="close-btn" aria-label="閉じる" @click="$emit('close')">×</button>
        </div>
        <div class="modal-content">
          <p class="message">バックアップ・復元機能は準備中です。Phase 4.3 で実装予定です。</p>
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
.backup-placeholder-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 360px;
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
.message {
  margin: 0;
  font-size: 0.875rem;
  color: #5a7464;
}
</style>
