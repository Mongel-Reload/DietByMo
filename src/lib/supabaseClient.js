import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diatur. Salin .env.example menjadi .env dan isi kredensial Supabase kamu.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
