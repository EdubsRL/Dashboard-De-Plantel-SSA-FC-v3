import { supabase } from '../lib/supabase'

const BUCKET = 'player-photos'
const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Faz upload da foto de um atleta para o Supabase Storage e retorna a URL pública.
 * Lança um erro com mensagem amigável se o arquivo for inválido ou o upload falhar.
 */
export async function uploadPlayerPhoto(file, playerId) {
  if (!file) return null

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato de imagem inválido. Use JPG, PNG ou WEBP.')
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Imagem muito grande. Máximo de ${MAX_SIZE_MB}MB.`)
  }

  const ext = file.name.split('.').pop()
  const path = `${playerId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: true })

  if (uploadError) {
    if (uploadError.message?.toLowerCase().includes('bucket not found')) {
      throw new Error(
        'O bucket "player-photos" ainda não existe no Supabase. Rode o script de migração (migrations/002_status_plantel_photos.sql).'
      )
    }
    throw new Error(uploadError.message || 'Erro ao enviar a foto.')
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data?.publicUrl || null
}
