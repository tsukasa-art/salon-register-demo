<script setup>
defineProps({
  open: Boolean,
})
defineEmits(['close', 'daily-closing', 'weekly-history', 'backup', 'logout'])
</script>

<template>
  <Teleport to="body">
    <div
      class="slide-menu-overlay"
      :class="{ show: open }"
      aria-hidden="true"
      @click.self="$emit('close')"
    >
      <div class="slide-menu-panel" role="dialog" aria-label="メニュー">
        <div class="slide-menu-content">
          <button type="button" class="slide-menu-item" @click="$emit('daily-closing')">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <rect x="7" y="8" width="3" height="8"/>
                <rect x="11" y="6" width="3" height="10"/>
                <rect x="15" y="4" width="3" height="12"/>
              </svg>
            </div>
            <div class="menu-text">
              <div class="menu-title">締め作業</div>
              <div class="menu-subtitle">日次レポート・データクリア</div>
            </div>
          </button>
          <button type="button" class="slide-menu-item" @click="$emit('weekly-history')">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                <path d="M9 9l6 6M15 9l-6 6"/>
              </svg>
            </div>
            <div class="menu-text">
              <div class="menu-title">過去の履歴</div>
              <div class="menu-subtitle">1週間分の売上データ</div>
            </div>
          </button>
          <button type="button" class="slide-menu-item" @click="$emit('backup')">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div class="menu-text">
              <div class="menu-title">データバックアップ</div>
              <div class="menu-subtitle">バックアップ管理・復元</div>
            </div>
          </button>
          <button type="button" class="slide-menu-item" @click="$emit('logout')">
            <div class="menu-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <div class="menu-text">
              <div class="menu-title">ログアウト</div>
              <div class="menu-subtitle">セッション終了</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.slide-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s;
}
.slide-menu-overlay.show {
  opacity: 1;
  visibility: visible;
}
.slide-menu-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 85vw;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.25s;
  overflow-y: auto;
}
.slide-menu-overlay.show .slide-menu-panel {
  transform: translateX(0);
}
.slide-menu-content {
  padding: 1.5rem 0;
}
.slide-menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9375rem;
  color: #2d4a3a;
}
.slide-menu-item:hover {
  background: #e8f5e9;
}
.menu-icon {
  flex-shrink: 0;
  color: #5a8f6a;
}
.menu-text {
  flex: 1;
}
.menu-title {
  font-weight: 600;
}
.menu-subtitle {
  font-size: 0.75rem;
  color: #5a7464;
  margin-top: 0.15rem;
}
</style>
