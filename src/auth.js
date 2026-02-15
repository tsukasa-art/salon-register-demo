/**
 * デモ用認証（サーバーなし）。sessionStorage で「ログイン済み」を保持するだけ。
 */
const DEMO_KEY = 'salon_register_demo_logged_in'

export function isLoggedIn() {
  return !!sessionStorage.getItem(DEMO_KEY)
}

export function login() {
  sessionStorage.setItem(DEMO_KEY, '1')
}

export function logout() {
  sessionStorage.removeItem(DEMO_KEY)
  window.location.href = '/login.html'
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html'
    return false
  }
  return true
}
