import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#e0e0e0', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Something went wrong</div>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#e0e0e0', cursor: 'pointer', fontSize: 13 }}>Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}
