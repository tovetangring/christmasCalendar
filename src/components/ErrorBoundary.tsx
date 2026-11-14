import { Component, type ReactNode } from 'react'

// Last line of defence: show a friendly screen instead of a blank page if something unexpected throws.
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="page center">
        <h1>Något gick fel</h1>
        <p>Prova att ladda om sidan.</p>
        <div>
          <button
            onClick={() => {
              window.location.hash = '#/'
              window.location.reload()
            }}
          >
            Ladda om
          </button>
        </div>
      </main>
    )
  }
}
