"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

/** Evita que un fallo en tarjetas/imágenes tumbe toda la home. */
export class FeedErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[FeedErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="fh-empty">
            <p>No se pudo mostrar parte de la agenda.</p>
            <button
              type="button"
              className="fh-btn fh-btn-primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Reintentar
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
