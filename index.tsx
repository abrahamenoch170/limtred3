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
  // Explicitly define state property
  state: ErrorBoundaryState = { hasError: false, error: null };

  // FIXED: Used standard constructor to initialize state. 
  // This resolves "property has no initializer" TS errors that stop builds in strict mode.
  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Destructure state and props to avoid property access issues if types are loose
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff5555', backgroundColor: '#0c0c0c', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Application Error</h1>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '4px', border: '1px solid #333' }}>
            <p style={{ color: '#888', marginBottom: '10px', fontSize: '12px', textTransform: 'uppercase' }}>Stack Trace:</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto', color: '#ccc', fontSize: '12px', lineHeight: '1.5' }}>
              {error?.toString()}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: '#39b54a', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return children;
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