import { Component } from 'react'

/** Captura erros de renderização e mostra uma tela amigável em vez de tela branca. */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Erro na interface:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="card max-w-md w-full p-6 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Algo deu errado</h2>
          <p className="text-sm text-gray-400 mb-5">
            Ocorreu um erro inesperado nesta tela. Seus dados não foram perdidos.
          </p>
          <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
            Recarregar página
          </button>
        </div>
      </div>
    )
  }
}
