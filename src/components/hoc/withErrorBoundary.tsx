import React from "react";
import { ErrorBoundary } from "../ErrorBoundary";

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  name: string
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary name={name}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
