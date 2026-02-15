/**
 * 認証 composable（Supabase Auth + 自動ログイン用 localStorage）
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'

const SESSION_KEY = 'salon_register_auto_session'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24時間

export function useAuth() {
  const supabase = inject('supabase')
  const router = useRouter()
  const currentUser = ref(null)

  async function init() {
    if (!supabase) return
    const { data: { session } } = await supabase.auth.getSession()
    currentUser.value = session?.user ?? null
  }

  function saveSession(userData) {
    try {
      const session = {
        user: {
          id: userData.id,
          email: userData.email,
          created_at: userData.created_at,
        },
        timestamp: Date.now(),
        expires: Date.now() + SESSION_DURATION,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch (e) {
      console.warn('セッション保存エラー:', e)
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch (e) {
      console.warn('セッションクリアエラー:', e)
    }
  }

  async function login(email, password, enableAutoLogin = true) {
    if (!supabase) return { success: false, error: 'Supabase が初期化されていません' }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      currentUser.value = data.user
      if (enableAutoLogin) saveSession(data.user)
      return { success: true, user: data.user }
    } catch (err) {
      return { success: false, error: err.message ?? 'ログインに失敗しました' }
    }
  }

  async function logout() {
    if (!supabase) return
    await supabase.auth.signOut()
    currentUser.value = null
    clearSession()
    router.push({ name: 'login' })
  }

  const isAuthenticated = computed(() => currentUser.value !== null)

  return {
    currentUser,
    isAuthenticated,
    init,
    login,
    logout,
  }
}
