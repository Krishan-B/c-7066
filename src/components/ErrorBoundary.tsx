import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorHandler } from "@/services/errorHandling";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetOnPropsChange?: boolean;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorCount: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);

    // Log error to ErrorHandler for consistent handling
    ErrorHandler.show(error, `error_boundary:${this.props.name || "unnamed"}`);

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));
  }

  public componentDidUpdate(prevProps: Props) {
    // Reset error state if props change and resetOnPropsChange is true
    if (
      this.props.resetOnPropsChange &&
      this.state.hasError &&
      prevProps !== this.props
    ) {
      this.handleReset();
    }
  }

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    if (this.state.errorCount >= MAX_RETRIES) {
      ErrorHandler.showWarning("Maximum retry attempts reached", {
        description:
          "Please try reloading the page or contact support if the issue persists.",
      });
      return;
    }

    this.retryTimeout = setTimeout(() => {
      this.handleReset();
    }, RETRY_DELAY);
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  private handleGoBack = () => {
    window.history.back();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred."}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={this.handleGoBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>

              {this.state.errorCount < MAX_RETRIES && (
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              )}

              <Button onClick={this.handleReload} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <div className="mt-4">
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
