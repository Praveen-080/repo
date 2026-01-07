import React from "react";
import notify from "@/lib/notify";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    const route = window.location.pathname;
    const payload = {
      message: error?.message,
      name: error?.name,
      stack: error?.stack?.split('\n').slice(0,5),
      route,
      componentStack: info?.componentStack,
      timestamp: new Date().toISOString()
    };
    console.error('[ErrorBoundary] Crash captured:', payload);
    notify.error('Something went wrong. Please try reloading the page.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              The page failed to load. Try reloading, or go back to the home page.
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={() => window.location.reload()}>Reload</button>
              <a className="px-4 py-2 rounded border" href="/">Home</a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
