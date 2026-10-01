import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { subscribe } from '../../lib/notify'

const STYLES = {
  success: { icon: CheckCircle2, cls: 'border-emerald-700/60 text-emerald-300' },
  error: { icon: XCircle, cls: 'border-red-700/60 text-red-300' },
  info: { icon: Info, cls: 'border-pitch-700/60 text-pitch-300' },
  warning: { icon: AlertTriangle, cls: 'border-amber-700/60 text-amber-300' },
}

export default function Toaster() {
  const [toasts, setToasts] = useState([])
  const [confirm, setConfirm] = useState(null)
  const confirmBtnRef = useRef(null)

  useEffect(
    () =>
      subscribe((event) => {
        if (event.kind === 'toast') {
          const t = event.toast
          setToasts((list) => [...list.slice(-3), t])
          setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), t.duration)
        } else if (event.kind === 'confirm') {
          setConfirm(event.confirm)
        }
      }),
    []
  )

  useEffect(() => {
    if (!confirm) return
    confirmBtnRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirm])

  const close = (value) => {
    confirm?.resolve(value)
    setConfirm(null)
  }

  return (
    <>
      <div
        className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { icon: Icon, cls } = STYLES[t.type] || STYLES.info
          return (
            <div
              key={t.id}
              className={`toast-in pointer-events-auto flex items-start gap-3 rounded-xl border bg-graphite-900/95 backdrop-blur px-4 py-3 shadow-2xl ${cls}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="flex-1 text-sm text-gray-100 whitespace-pre-line">{t.message}</p>
              <button
                type="button"
                aria-label="Fechar"
                className="text-gray-500 hover:text-white"
                onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {confirm && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="card w-full max-w-md p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirm-title" className="text-lg font-semibold text-white mb-2">
              {confirm.title}
            </h3>
            <p className="text-sm text-gray-300 whitespace-pre-line">{confirm.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => close(false)}>
                {confirm.cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                className={confirm.danger ? 'btn-danger' : 'btn-primary'}
                onClick={() => close(true)}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
