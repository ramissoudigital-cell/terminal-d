import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5">
              <AlertTriangle size={32} />
            </div>
            
            <h1 className="text-xl font-extrabold text-slate-900 mb-2">
              Une erreur inattendue est survenue
            </h1>
            
            <p className="text-sm text-slate-500 mb-6 font-medium leading-relaxed">
              L'application a rencontré un problème temporaire. Cliquez sur le bouton ci-dessous pour rafraîchir la page.
            </p>

            {this.state.error && (
              <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-6 text-left">
                <p className="text-xs font-mono text-slate-600 truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-200 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw size={18} />
              <span>Recharger l'application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
