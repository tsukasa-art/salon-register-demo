/**
 * メニュー一覧の取得（Supabase 優先、失敗時はフォールバック）
 */
import { ref, computed } from 'vue'
import { inject } from 'vue'
import { fallbackMenus } from '../data/fallbackMenus'
import { CATEGORY_ORDER } from '../data/categoryInfo'

export function useMenus() {
  const supabase = inject('supabase')
  const menus = ref([])
  const loading = ref(false)
  const error = ref(null)

  const menusByCategory = computed(() => {
    const map = {}
    CATEGORY_ORDER.forEach((c) => { map[c] = [] })
    menus.value.forEach((m) => {
      if (map[m.category]) map[m.category].push(m)
    })
    CATEGORY_ORDER.forEach((c) => {
      if (map[c]) map[c].sort((a, b) => (a.display_order || 0) - (b.display_order || 0) || (a.name || '').localeCompare(b.name || ''))
    })
    return map
  })

  async function load() {
    loading.value = true
    error.value = null
    try {
      if (supabase) {
        const { data, err } = await supabase.from('menus').select('*').eq('is_active', true).order('display_order').order('name')
        if (!err && data && data.length > 0) {
          menus.value = data
          return
        }
      }
      menus.value = [...fallbackMenus]
    } catch (e) {
      error.value = e.message || 'メニューの読み込みに失敗しました'
      menus.value = [...fallbackMenus]
    } finally {
      loading.value = false
    }
  }

  return { menus, menusByCategory, loading, error, load }
}
