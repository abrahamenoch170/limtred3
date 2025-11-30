import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to catch render crashes and show useful info instead of a white screen
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff5555', backgroundColor: '#0c0c0c', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Application Crashed</h1>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '4px', border: '1px solid #333' }}>
            <p style={{ color: '#aaa', marginBottom: '10px' }}>Error Details:</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#39b54a', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            RELOAD APPLICATION
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);