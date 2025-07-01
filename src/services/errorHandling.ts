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
    email_already_used:
      "This email is already in use. Please use a different email.",
    too_many_requests:
      "Too many login attempts. Please wait a few minutes before trying again.",
    user_not_found: "No account found with this email address.",
    weak_password:
      "Password must be at least 8 characters long with mixed case letters and numbers.",
    authentication_error: "You need to be logged in to perform this action.",
    password_update_error: "Unable to update password. Please try again.",
    session_check_error: "Unable to verify your authentication status.",

    // Profile errors
    profile_update_error: "Unable to update your profile information.",

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
    order_placement_error: "Unable to place your order.",
    order_cancellation_error: "Unable to cancel your order.",
    order_modification_error: "Unable to modify your order.",

    // KYC errors
    kyc_document_upload_error: "Failed to upload KYC document.",
    kyc_document_fetch_error: "Failed to retrieve KYC documents.",
    kyc_document_delete_error: "Failed to delete KYC document.",
    kyc_verification_error: "KYC verification failed.",

    // Network errors
    network_error: "Network error. Please check your connection and try again.",
    server_error: "Server error. Please try again in a few moments.",
    timeout_error: "Request timed out. Please try again.",
    api_health_check_failed:
      "API is unreachable. Please check your connection.",

    // Data errors
    data_fetch_error: "Unable to load data. Please refresh the page.",
    validation_error: "Please check your input and try again.",
    market_data_fetch_error:
      "Unable to fetch market data. Some information may be delayed.",
    market_data_aggregation_error: "Some market data is currently unavailable.",
    data_refresh_error: "Unable to refresh data.",

    // News errors
    news_fetch_error:
      "Failed to load market news. Please check your connection.",

    // Generic fallback
    unknown_error: "An unexpected error occurred. Please try again.",
  };

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
