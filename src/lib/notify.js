/**
 * Sistema simples de notificações (toasts) e confirmações,
 * substituindo alert() e window.confirm() do navegador.
 * Pode ser chamado de qualquer lugar, inclusive fora de componentes.
 */
const listeners = new Set()
let nextId = 1

function emit(event) {
  listeners.forEach((listener) => listener(event))
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function toast(type, message, duration) {
  emit({
    kind: 'toast',
    toast: {
      id: nextId++,
      type,
      message: String(message ?? ''),
      duration: duration ?? (type === 'error' ? 6000 : 3500),
    },
  })
}

export const notify = {
  success: (message, duration) => toast('success', message, duration),
  error: (message, duration) => toast('error', message, duration),
  info: (message, duration) => toast('info', message, duration),
  warning: (message, duration) => toast('warning', message, duration),
}

/**
 * Abre um diálogo de confirmação estilizado.
 * Retorna uma Promise<boolean>.
 */
export function confirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    // Se o Toaster ainda não estiver montado, cai no confirm nativo.
    if (!listeners.size) {
      resolve(window.confirm(message))
      return
    }
    emit({
      kind: 'confirm',
      confirm: {
        id: nextId++,
        message: String(message ?? ''),
        title: options.title || 'Confirmar ação',
        confirmLabel: options.confirmLabel || 'Confirmar',
        cancelLabel: options.cancelLabel || 'Cancelar',
        danger: options.danger ?? true,
        resolve,
      },
    })
  })
}
