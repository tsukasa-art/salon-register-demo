/**
 * Supabase クライアント（Vite の import.meta.env から読み取り）
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

if (!url || !anonKey) {
  console.warn(
    'VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を .env または環境変数に設定してください。'
  )
}

export const supabase = createClient(url, anonKey)

export const DEMO_USER_EMAIL = import.meta.env.VITE_DEMO_USER_EMAIL ?? ''
