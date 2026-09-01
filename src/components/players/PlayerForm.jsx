import { useState, useEffect, useRef } from 'react'
import { POSITIONS, FEET, RATINGS, STATUSES } from '../../constants/positions'
import { uploadPlayerPhoto } from '../../utils/storage'
import Avatar from '../common/Avatar'
import { Link2, Trash2, Upload, CheckCircle2 } from 'lucide-react'

const formatDateForInput = (value) => {
  if (!value) return ''
  const [year, month, day] = String(value).slice(0, 10).split('-')
  if (!year || !month || !day) return ''
  return `${day}/${month}/${year}`
}

const formatDateInput = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

const dateToDatabase = (value) => {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const [, day, month, year] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) return null
  return `${year}-${month}-${day}`
}

const empty = {
  name: '',
  birth_date: '',
  primary_position: 'Meia',
  dominant_foot: 'Direito',
  technical_rating: 'C',
  status: 'No clube',
  is_registered: false,
  secondary_positions: [],
  indicated_by: '',
  photo_url: '',
  documents: [],
}

export default function PlayerForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [err, setErr] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        birth_date: formatDateForInput(initial.birth_date),
        primary_position: initial.primary_position || 'Meia',
        dominant_foot: initial.dominant_foot || 'Direito',
        technical_rating: initial.technical_rating || 'C',
        status: initial.status || 'No clube',
        is_registered: Boolean(initial.is_registered),
        secondary_positions: initial.secondary_positions || [],
        indicated_by: initial.indicated_by || '',
        photo_url: initial.photo_url || '',
        documents: initial.documents || [],
      })
    } else setForm(empty)
  }, [initial])

  const toggleSecondary = (pos) => {
    setForm((f) => {
      const selected = new Set(f.secondary_positions || [])
      if (selected.has(pos)) selected.delete(pos)
      else selected.add(pos)
      return { ...f, secondary_positions: [...selected] }
    })
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErr('')
    setUploadingPhoto(true)
    try {
      const idForPath = initial?.id || `temp-${Date.now()}`
      const url = await uploadPlayerPhoto(file, idForPath)
      setForm((f) => ({ ...f, photo_url: url }))
    } catch (error) {
      setErr(error.message || 'Erro ao enviar a foto.')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const addDocument = () => setForm((f) => ({
    ...f,
    documents: [...(f.documents || []), { label: '', url: '' }],
  }))

  const updateDocument = (i, field, value) => {
    setForm((f) => {
      const docs = [...(f.documents || [])]
      docs[i] = { ...docs[i], [field]: value }
      return { ...f, documents: docs }
    })
  }

  const removeDocument = (i) => setForm((f) => ({
    ...f,
    documents: (f.documents || []).filter((_, idx) => idx !== i),
  }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!form.name.trim()) {
      setErr('O nome do atleta é obrigatório.')
      return
    }

    const birthDate = dateToDatabase(form.birth_date)
    if (!birthDate) {
      setErr('Informe uma data de nascimento válida no formato DD/MM/AAAA.')
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        birth_date: birthDate,
        secondary_positions: (form.secondary_positions || []).filter((p) => p !== form.primary_position),
        documents: (form.documents || []).filter((d) => d.url?.trim() && d.label?.trim()),
      })
    } catch (error) {
      setErr(error.message || 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-5 space-y-4 w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{initial ? 'Editar atleta' : 'Novo atleta'}</h3>
          <p className="text-xs text-gray-500 mt-1">Informações usadas no plantel e na escalação.</p>
        </div>
        <button type="button" className="btn-secondary text-xs" onClick={onCancel}>Fechar</button>
      </div>

      {err && <p className="rounded-lg bg-red-950/40 border border-red-900/60 p-3 text-red-300 text-sm">{err}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-xl bg-graphite-950/60 border border-graphite-800">
        <Avatar name={form.name || '?'} photoUrl={form.photo_url} size="lg" />
        <div className="min-w-0">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
          <button type="button" className="btn-secondary inline-flex items-center gap-2 text-sm min-h-10" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
            <Upload size={14} /> {uploadingPhoto ? 'Enviando...' : form.photo_url ? 'Trocar foto' : 'Enviar foto'}
          </button>
          {form.photo_url && (
            <button type="button" className="ml-3 text-xs text-red-400 hover:text-red-300" onClick={() => setForm((f) => ({ ...f, photo_url: '' }))}>Remover</button>
          )}
          <p className="text-[11px] text-gray-500 mt-1">JPG, PNG ou WEBP, até 5MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Nome completo <span className="text-pitch-400">*</span></label>
          <input className="input-field min-h-11" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
        </div>
        <div>
          <label className="label">Data de nascimento <span className="text-pitch-400">*</span></label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            maxLength={10}
            placeholder="DD/MM/AAAA"
            className="input-field min-h-11"
            value={form.birth_date}
            onChange={(e) => setForm((f) => ({ ...f, birth_date: formatDateInput(e.target.value) }))}
          />
          <p className="text-[11px] text-gray-500 mt-1">Digite a data no formato dia/mês/ano.</p>
        </div>
        <div>
          <label className="label">Posição principal <span className="text-gray-600">(opcional)</span></label>
          <select className="input-field min-h-11" value={form.primary_position} onChange={(e) => setForm({ ...form, primary_position: e.target.value })}>
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Pé dominante <span className="text-gray-600">(opcional)</span></label>
          <select className="input-field min-h-11" value={form.dominant_foot} onChange={(e) => setForm({ ...form, dominant_foot: e.target.value })}>
            {FEET.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Avaliação técnica <span className="text-gray-600">(opcional)</span></label>
          <select className="input-field min-h-11" value={form.technical_rating} onChange={(e) => setForm({ ...form, technical_rating: e.target.value })}>
            {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Situação <span className="text-gray-600">(opcional)</span></label>
          <select className="input-field min-h-11" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Inscrição <span className="text-gray-600">(opcional)</span></label>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, is_registered: !f.is_registered }))}
            className={`w-full min-h-11 rounded-lg border px-3 flex items-center justify-between text-sm transition ${
              form.is_registered ? 'border-pitch-600 bg-pitch-950/40 text-pitch-300' : 'border-graphite-700 bg-graphite-950 text-gray-400'
            }`}
          >
            <span>{form.is_registered ? 'Inscrito na competição' : 'Não inscrito'}</span>
            <CheckCircle2 size={18} className={form.is_registered ? 'text-pitch-400' : 'text-gray-600'} />
          </button>
        </div>
        <div>
          <label className="label">Indicado por <span className="text-gray-600">(opcional)</span></label>
          <input className="input-field min-h-11" value={form.indicated_by} onChange={(e) => setForm({ ...form, indicated_by: e.target.value })} />
        </div>

        <div className="sm:col-span-2">
          <label className="label">Posições secundárias <span className="text-gray-600">(opcional)</span></label>
          <div className="flex flex-wrap gap-2 mt-1">
            {POSITIONS.filter((p) => p !== form.primary_position).map((pos) => (
              <button key={pos} type="button" onClick={() => toggleSecondary(pos)}
                className={`text-xs px-3 py-2 rounded-full border transition min-h-9 ${
                  (form.secondary_positions || []).includes(pos) ? 'bg-pitch-600 border-pitch-500 text-white' : 'border-graphite-600 text-gray-400 hover:border-pitch-500'
                }`}>{pos}</button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="label">Documentos (links) <span className="text-gray-600">(opcional)</span></label>
          <div className="space-y-2">
            {(form.documents || []).map((doc, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto] sm:flex gap-2 items-center">
                <input className="input-field min-h-10 sm:w-36 shrink-0" placeholder="Nome (RG)" value={doc.label} onChange={(e) => updateDocument(i, 'label', e.target.value)} />
                <div className="relative min-w-0">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input className="input-field pl-8 min-h-10" placeholder="https://..." value={doc.url} onChange={(e) => updateDocument(i, 'url', e.target.value)} />
                </div>
                <button type="button" className="p-2 rounded hover:bg-red-900/50 text-red-400 shrink-0" onClick={() => removeDocument(i)} title="Remover">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="btn-secondary text-xs min-h-10" onClick={addDocument}>+ Adicionar documento</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
        <button type="button" className="btn-secondary min-h-11" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary min-h-11" disabled={saving || uploadingPhoto}>{saving ? 'Salvando...' : 'Salvar atleta'}</button>
      </div>
    </form>
  )
}
