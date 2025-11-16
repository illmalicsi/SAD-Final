import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    try {
      console.error('ErrorBoundary caught an error:', error);
      console.error('ErrorBoundary info:', info && info.componentStack);
      if (this.props?.onError) this.props.onError(error, info);
    } catch (e) {
      // swallow
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee2e2', borderRadius: 8, color: '#991b1b' }}>
          <strong>Something went wrong rendering this component.</strong>
          <div style={{ marginTop: 8, fontSize: 13 }}>
            {String(this.state.error && this.state.error.toString())}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
