import React, { Component, ComponentType } from "react";
import { ErrorHandler } from "@/shared/services/errorHandling";

interface ErrorBoundaryState {
  hasError: boolean;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return class ErrorBoundary extends Component<P, ErrorBoundaryState> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error) {
      ErrorHandler.handleError("Component Error", error, {
        description:
          "An unexpected error occurred while rendering this component.",
      });
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="p-4 bg-destructive/10 text-destructive rounded">
            <h3 className="font-semibold">Something went wrong</h3>
            <p>Please try refreshing the page</p>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
}
