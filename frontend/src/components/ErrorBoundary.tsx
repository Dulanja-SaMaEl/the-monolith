import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] text-black font-inter flex flex-col items-center justify-center p-6 selection:bg-[#9F8170] selection:text-white">
          <div className="max-w-md w-full bg-white border border-[#9F8170]/30 rounded-2xl p-8 shadow-xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-4 h-4 bg-black flex items-center justify-center text-white text-[9px] font-bold">
                ■
              </span>
              <span className="font-oswald text-xl font-bold tracking-[0.2em] text-black uppercase">
                MONOLITH<span className="text-[#9F8170] ml-1">LK</span>
              </span>
            </div>
            <h2 className="font-oswald text-2xl font-bold uppercase text-black">
              Session Recovered
            </h2>
            <p className="text-xs text-[#9F8170] font-mono leading-relaxed">
              An unexpected interface synchronization event occurred. The environment has been safely contained.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 px-6 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-[#9F8170] transition-colors"
              >
                Reload Architecture & Return Home →
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
