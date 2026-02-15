<script setup>
// ログイン画面（ひな形）
</script>

<template>
  <div class="login-view">
    <header class="login-header">
      <h1>サロンレジ</h1>
      <p class="subtitle">料金計算システム</p>
    </header>
    <main class="login-content">
      <h2>ログイン</h2>
      <p class="login-description">メールアドレスとパスワードを入力してください。</p>
      <!-- フォームは後で実装 -->
    </main>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #e8f5e9 0%, #f0f8f0 100%);
}
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}
.login-header h1 {
  color: #2d4a3a;
  font-size: 1.75rem;
  margin: 0;
}
.subtitle {
  color: #5a7464;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}
.login-content {
  width: 100%;
  max-width: 20rem;
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(90, 143, 106, 0.08);
}
.login-content h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: #2d4a3a;
}
.login-description {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: #5a7464;
}
</style>
