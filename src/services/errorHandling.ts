import { toast } from "sonner";

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  details?: unknown;
  retryable?: boolean;
}

interface NotificationOptions {
  duration?: number;
  description?: string;
  retryFn?: () => Promise<void>;
  onAction?: () => void;
  actionLabel?: string;
}

interface SuccessOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorOptions {
  code: string;
  message: string;
  details?: unknown;
  retryable?: boolean;
}

export class ErrorHandler {
  private static errorMap: Record<string, string> = {
    // Authentication errors
    invalid_credentials:
      "Invalid email or password. Please check your credentials and try again.",
    email_not_confirmed:
      "Please check your email and confirm your account before signing in.",
    too_many_requests:
      "Too many login attempts. Please wait a few minutes before trying again.",
    user_not_found: "No account found with this email address.",
    weak_password:
      "Password must be at least 8 characters long with mixed case letters and numbers.",

    // Trading errors
    insufficient_funds: "Insufficient balance to complete this trade.",
    market_closed: "This market is currently closed for trading.",
    invalid_order_size:
      "Order size must be greater than the minimum required amount.",
    leverage_exceeded: "Maximum leverage limit exceeded for this asset.",
    position_limit_reached:
      "You have reached the maximum number of open positions.",
    margin_calculation_error: "Unable to calculate margin requirements.",
    pnl_calculation_error: "Unable to calculate profit and loss.",
    realtime_subscription_error: "Unable to start real-time updates.",
    realtime_unsubscribe_error: "Unable to stop real-time updates.",
    position_update_error: "Failed to update position.",

    // Network errors
    network_error: "Network error. Please check your connection and try again.",
    server_error: "Server error. Please try again in a few moments.",
    timeout_error: "Request timed out. Please try again.",

    // Data errors
    data_fetch_error: "Unable to load data. Please refresh the page.",
    validation_error: "Please check your input and try again.",
    market_data_fetch_error:
      "Unable to fetch market data. Some information may be delayed.",
    market_data_aggregation_error: "Some market data is currently unavailable.",

    // Generic fallback
    unknown_error: "An unexpected error occurred. Please try again.",
  };

  private static isRetryableError(code: string): boolean {
    const retryableCodes = [
      "network_error",
      "timeout_error",
      "server_error",
      "data_fetch_error",
    ];
    return retryableCodes.includes(code);
  }

  static handle(error: unknown, context?: string): AppError {
    console.error(`Error in ${context || "application"}:`, error);

    let errorCode = "unknown_error";
    const details = error;

    // Type guard for error with message property
    const hasMessage = (err: unknown): err is { message: string } =>
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as { message: unknown }).message === "string";
    // Type guard for error with code property
    const hasCode = (err: unknown): err is { code: string } =>
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      typeof (err as { code: unknown }).code === "string";
    // Type guard for error with name property
    const hasName = (err: unknown): err is { name: string } =>
      typeof err === "object" &&
      err !== null &&
      "name" in err &&
      typeof (err as { name: unknown }).name === "string";

    // Handle Supabase errors
    if (hasMessage(error)) {
      if (error.message.includes("Invalid login credentials")) {
        errorCode = "invalid_credentials";
      } else if (error.message.includes("Email not confirmed")) {
        errorCode = "email_not_confirmed";
      } else if (error.message.includes("Too many requests")) {
        errorCode = "too_many_requests";
      } else if (error.message.includes("User not found")) {
        errorCode = "user_not_found";
      } else if (error.message.includes("Password should be")) {
        errorCode = "weak_password";
      }
    }

    // Handle network errors
    if (
      (hasCode(error) && error.code === "NETWORK_ERROR") ||
      (hasName(error) && error.name === "NetworkError")
    ) {
      errorCode = "network_error";
    }

    // Handle timeout errors
    if (
      (hasCode(error) && error.code === "TIMEOUT") ||
      (hasName(error) && error.name === "TimeoutError")
    ) {
      errorCode = "timeout_error";
    }

    const appError: AppError = {
      code: errorCode,
      message: hasMessage(error) ? error.message : "Unknown error",
      userMessage: this.errorMap[errorCode] || this.errorMap.unknown_error,
      details,
      retryable: this.isRetryableError(errorCode),
    };

    return appError;
  }

  static show(
    error: unknown,
    context?: string,
    retryFn?: () => Promise<void>
  ): void {
    const appError = this.handle(error, context);

    const options: NotificationOptions = {
      description:
        process.env.NODE_ENV === "development" ? appError.message : undefined,
      duration: 5000,
    };

    if (appError.retryable && retryFn) {
      options.actionLabel = "Retry";
      options.onAction = async () => {
        try {
          await retryFn();
          this.showSuccess("Operation completed successfully");
        } catch (retryError) {
          this.show(retryError, context);
        }
      };
    }

    toast.error(appError.userMessage, options);
  }

  static showNotification(
    type: "success" | "info" | "warning",
    message: string,
    options?: NotificationOptions
  ): void {
    const toastFn = toast[type];
    toastFn(message, {
      duration: options?.duration || (type === "success" ? 3000 : 4000),
      description: options?.description,
      action:
        options?.actionLabel && options?.onAction
          ? {
              label: options.actionLabel,
              onClick: options.onAction,
            }
          : undefined,
    });
  }

  static showSuccess(message: string, options?: NotificationOptions): void {
    this.showNotification("success", message, options);
  }

  static showInfo(message: string, options?: NotificationOptions): void {
    this.showNotification("info", message, options);
  }

  static showWarning(message: string, options?: NotificationOptions): void {
    this.showNotification("warning", message, options);
  }

  static handleAsync<T>(promise: Promise<T>, context: string): Promise<T> {
    return promise.catch((error) => {
      this.show(error, context);
      throw error;
    });
  }

  static createError({
    code,
    message,
    details,
    retryable = false,
  }: ErrorOptions): AppError {
    return {
      code,
      message,
      userMessage: this.errorMap[code] || message,
      details,
      retryable,
    };
  }

  static handleError(error: unknown, options: NotificationOptions = {}): void {
    const appError = this.normalizeError(error);
    const {
      duration = 5000,
      description = appError.userMessage,
      retryFn,
      onAction,
      actionLabel = appError.retryable ? "Retry" : undefined,
    } = options;

    toast.error(appError.userMessage || "An error occurred", {
      description,
      duration,
      action: actionLabel && {
        label: actionLabel,
        onClick: () => {
          if (retryFn) {
            retryFn().catch(console.error);
          }
          onAction?.();
        },
      },
    });

    // Log error for debugging
    console.error("Error handled:", {
      error: appError,
      stack: (error as Error)?.stack,
    });
  }

  static handleSuccess(title: string, options: SuccessOptions = {}): void {
    const { description, duration = 5000, action } = options;

    toast.success(title, {
      description,
      duration,
      action,
    });
  }

  private static normalizeError(error: unknown): AppError {
    if ((error as AppError).code) {
      return error as AppError;
    }

    const message = error instanceof Error ? error.message : String(error);
    return this.createError({
      code: "unknown_error",
      message,
      details: error,
    });
  }
}
