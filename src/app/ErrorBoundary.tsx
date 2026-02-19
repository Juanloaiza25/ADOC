import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-950 p-6">
          <div className="max-w-lg w-full bg-dark-900 border border-gray-800 rounded-2xl p-8">
            <h1 className="text-xl font-bold text-red-400 mb-2">
              Algo salió mal
            </h1>
            <p className="text-gray-400 mb-4 font-mono text-sm">
              {this.state.error.message}
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-300">
                Ver detalles
              </summary>
              <pre className="mt-2 p-4 bg-dark-800 rounded-xl text-xs overflow-auto max-h-40 text-gray-400">
                {this.state.error.stack}
              </pre>
            </details>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 text-dark-950 font-semibold rounded-xl hover:bg-primary-400"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
