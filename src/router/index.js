import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('../views/MainView.vue'),
      meta: { title: 'サロンレジ - 料金計算', requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'サロンレジ - ログイン' },
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  if (to.meta?.title) document.title = to.meta.title

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const { data: { session } } = await supabase.auth.getSession()

  if (requiresAuth && !session) {
    next({ name: 'login' })
    return
  }
  if (to.name === 'login' && session) {
    next({ name: 'main' })
    return
  }
  next()
})

export default router
