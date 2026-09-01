import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('================================')
console.log('SUPABASE URL:', supabaseUrl)
console.log(
  'SUPABASE KEY:',
  supabaseAnonKey ? 'CARREGADA' : 'NÃO CARREGADA'
)
console.log('================================')

if (!supabaseUrl) {
  throw new Error(
    'VITE_SUPABASE_URL não foi carregada.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY não foi carregada.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)