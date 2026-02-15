/**
 * 商品一覧の取得（Supabase products テーブル、失敗時は空）
 */
import { ref, computed } from 'vue'
import { inject } from 'vue'

export function useProducts() {
  const supabase = inject('supabase')
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      if (supabase) {
        const { data, err } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name')
        if (!err && data) products.value = data
        else products.value = []
      } else {
        products.value = []
      }
    } catch (e) {
      error.value = e.message || '商品の読み込みに失敗しました'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, load }
}
