import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
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

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-error" />
          </div>
          <h1 className="font-display text-2xl font-bold text-surface-800 mb-2">Нещо се обърка</h1>
          <p className="text-surface-500 mb-6 max-w-xs">
            {this.state.error?.message ?? 'Възникна неочаквана грешка. Опитайте отново.'}
          </p>
          <button
            onClick={this.reset}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <RotateCcw size={16} />
            Опитай отново
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
