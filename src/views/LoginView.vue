<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const enableAutoLogin = ref(true)
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()
const auth = useAuth()

async function onSubmit(e) {
  e.preventDefault()
  errorMessage.value = ''
  loading.value = true
  try {
    const result = await auth.login(email.value, password.value, enableAutoLogin.value)
    if (result.success) {
      router.push({ name: 'main' })
      return
    }
    errorMessage.value = result.error ?? 'ログインに失敗しました'
  } catch (err) {
    errorMessage.value = 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}
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

      <form class="login-form" @submit="onSubmit">
        <div class="form-group">
          <label for="email">メールアドレス</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="example@email.com"
          />
        </div>
        <div class="form-group">
          <label for="password">パスワード</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="パスワードを入力"
          />
        </div>
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div class="login-options">
          <label class="auto-login-label">
            <input v-model="enableAutoLogin" type="checkbox" />
            <span>24時間自動ログインを有効にする</span>
          </label>
        </div>
        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="!loading">ログイン</span>
          <span v-else>ログイン中...</span>
        </button>
      </form>
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
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.form-group label {
  font-size: 0.875rem;
  color: #2d4a3a;
}
.form-group input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d4e4d9;
  border-radius: 8px;
  font-size: 1rem;
}
.form-group input:focus {
  outline: none;
  border-color: #5a8f6a;
}
.error-message {
  font-size: 0.875rem;
  color: #c62828;
}
.login-options {
  font-size: 0.875rem;
  color: #5a7464;
}
.auto-login-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.login-btn {
  padding: 0.75rem 1rem;
  background: #5a8f6a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}
.login-btn:hover:not(:disabled) {
  background: #4a7f5a;
}
.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
