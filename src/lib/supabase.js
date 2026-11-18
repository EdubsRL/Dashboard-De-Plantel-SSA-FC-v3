import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Em vez de lançar um erro no carregamento do módulo (o que deixava a
 * tela inteira branca), expomos a falha de configuração para a interface
 * mostrar uma mensagem clara.
 */
export const supabaseConfigError = !supabaseUrl
  ? 'VITE_SUPABASE_URL não foi configurada.'
  : !supabaseAnonKey
    ? 'VITE_SUPABASE_ANON_KEY não foi configurada.'
    : null

if (import.meta.env.DEV && supabaseConfigError) {
  console.warn('[Supabase]', supabaseConfigError)
}

// Evita que uma requisição fique "carregando para sempre" em redes ruins.
const REQUEST_TIMEOUT_MS = 20000

function fetchWithTimeout(input, init = {}) {
  if (init.signal) return fetch(input, init) // respeita cancelamentos próprios
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

export const supabase = createClient(
  supabaseUrl || 'https://invalid.supabase.co',
  supabaseAnonKey || 'invalid-key',
  { global: { fetch: fetchWithTimeout } }
)

/**
 * Converte erros técnicos (rede, Supabase/PostgREST) em mensagens
 * compreensíveis para quem usa o sistema.
 */
export function friendlyError(err, fallback = 'Ocorreu um erro inesperado.') {
  if (!err) return fallback
  if (supabaseConfigError) return `Configuração ausente: ${supabaseConfigError}`

  const raw = typeof err === 'string' ? err : err.message || ''
  const msg = raw.toLowerCase()

  if (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed')
  ) {
    return typeof navigator !== 'undefined' && navigator.onLine === false
      ? 'Você está sem conexão com a internet. Verifique sua rede e tente novamente.'
      : 'Não foi possível conectar ao banco de dados. O servidor pode estar fora do ar ou pausado. Tente novamente em instantes.'
  }

  if (err.name === 'AbortError' || msg.includes('aborted')) {
    return 'O servidor demorou demais para responder. Tente novamente.'
  }

  if (err.code === '42501' || msg.includes('row-level security')) {
    return 'Sem permissão para esta operação no banco de dados (políticas RLS).'
  }
  if (err.code === '23505') return 'Já existe um registro com esses dados.'
  if (err.code === '23503') return 'Este registro está vinculado a outros dados e não pode ser alterado/excluído.'
  if (err.code === 'PGRST116') return 'Registro não encontrado.'

  return raw || fallback
}

/** Indica se o erro é de conectividade (útil para mostrar o botão "Tentar novamente"). */
export function isNetworkError(err) {
  const msg = String(err?.message || err || '').toLowerCase()
  return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed') || msg.includes('conectar')
}
