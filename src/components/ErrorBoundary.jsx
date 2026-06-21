import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('NeatClock render error', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-theme-bg text-theme-text p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-serif text-2xl font-semibold">Something went wrong</h1>
            <p className="text-theme-text-muted text-sm leading-relaxed">
              NeatClock hit an unexpected error. Your schedule may still be saved in this browser.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
            >
              Reload NeatClock
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
