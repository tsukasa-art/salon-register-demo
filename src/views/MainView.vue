<script setup>
// メイン画面（レジ・料金計算）ひな形
</script>

<template>
  <div class="main-view">
    <header class="main-header">
      <h1>サロンレジ</h1>
      <nav class="header-actions">
        <router-link to="/login" class="link">ログアウト</router-link>
      </nav>
    </header>
    <main class="main-content">
      <p class="placeholder">メニュー選択・明細・会計エリア（ここから実装を進めます）</p>
    </main>
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
.header-actions .link {
  color: #5a8f6a;
  text-decoration: none;
  font-size: 0.875rem;
}
.header-actions .link:hover {
  text-decoration: underline;
}
.main-content {
  flex: 1;
  padding: 1.5rem;
}
.placeholder {
  color: #5a7464;
  font-size: 0.875rem;
  margin: 0;
}
</style>
