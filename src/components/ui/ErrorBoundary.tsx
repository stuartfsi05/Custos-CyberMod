import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./Button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode; // Optional custom fallback
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Global Error Boundary to prevent white screen of death.
 * Highly recommended for Offline-First apps to handle data corruption gracefully.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // Here we could log to a service like Sentry in production
    }

    private handleReset = () => {
        // Basic recovery strategy: Clear storage if it's likely a data issue, or just reload.
        // For now, we just reload the page to clear transient state.
        window.location.reload();
    };

    private handleClearData = () => {
        if (confirm("Isso apagará todas as configurações e dados salvos para tentar recuperar o app. Continuar?")) {
            localStorage.clear();
            window.location.reload();
        }
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-50 dark:bg-zinc-950 text-center">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl max-w-md w-full animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        </div>

                        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2">Ops! Algo deu errado.</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm leading-relaxed">
                            Ocorreu um erro inesperado. Isso pode ter acontecido por um problema temporário ou dados corrompidos.
                        </p>

                        <div className="space-y-3">
                            <Button onClick={this.handleReset} className="w-full" variant="primary">
                                Tentar Novamente
                            </Button>
                            <Button onClick={this.handleClearData} className="w-full" variant="destructive">
                                Resetar App (Apagar Dados)
                            </Button>
                        </div>

                        {this.state.error && (
                            <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden text-left">
                                <p className="text-[10px] font-mono text-zinc-500 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
