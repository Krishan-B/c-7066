
import { toast } from 'sonner';

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  details?: any;
}

export class ErrorHandler {
  private static errorMap: Record<string, string> = {
    // Authentication errors
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'email_not_confirmed': 'Please check your email and confirm your account before signing in.',
    'too_many_requests': 'Too many login attempts. Please wait a few minutes before trying again.',
    'user_not_found': 'No account found with this email address.',
    'weak_password': 'Password must be at least 8 characters long with mixed case letters and numbers.',
    
    // Trading errors
    'insufficient_funds': 'Insufficient balance to complete this trade.',
    'market_closed': 'This market is currently closed for trading.',
    'invalid_order_size': 'Order size must be greater than the minimum required amount.',
    'leverage_exceeded': 'Maximum leverage limit exceeded for this asset.',
    'position_limit_reached': 'You have reached the maximum number of open positions.',
    
    // Network errors
    'network_error': 'Network error. Please check your connection and try again.',
    'server_error': 'Server error. Please try again in a few moments.',
    'timeout_error': 'Request timed out. Please try again.',
    
    // Data errors
    'data_fetch_error': 'Unable to load data. Please refresh the page.',
    'validation_error': 'Please check your input and try again.',
    
    // Generic fallback
    'unknown_error': 'An unexpected error occurred. Please try again or contact support.'
  };

  static handle(error: any, context?: string): AppError {
    console.error(`Error in ${context || 'application'}:`, error);

    let errorCode = 'unknown_error';
    let details = error;

    // Handle Supabase errors
    if (error?.message) {
      if (error.message.includes('Invalid login credentials')) {
        errorCode = 'invalid_credentials';
      } else if (error.message.includes('Email not confirmed')) {
        errorCode = 'email_not_confirmed';
      } else if (error.message.includes('Too many requests')) {
        errorCode = 'too_many_requests';
      } else if (error.message.includes('User not found')) {
        errorCode = 'user_not_found';
      } else if (error.message.includes('Password should be')) {
        errorCode = 'weak_password';
      }
    }

    // Handle network errors
    if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
      errorCode = 'network_error';
    }

    // Handle timeout errors
    if (error?.code === 'TIMEOUT' || error?.name === 'TimeoutError') {
      errorCode = 'timeout_error';
    }

    const appError: AppError = {
      code: errorCode,
      message: error?.message || 'Unknown error',
      userMessage: this.errorMap[errorCode] || this.errorMap.unknown_error,
      details
    };

    return appError;
  }

  static show(error: any, context?: string): void {
    const appError = this.handle(error, context);
    
    toast.error(appError.userMessage, {
      description: process.env.NODE_ENV === 'development' ? appError.message : undefined,
      duration: 5000
    });
  }

  static showSuccess(message: string, description?: string): void {
    toast.success(message, {
      description,
      duration: 3000
    });
  }

  static showInfo(message: string, description?: string): void {
    toast.info(message, {
      description,
      duration: 4000
    });
  }

  static showWarning(message: string, description?: string): void {
    toast.warning(message, {
      description,
      duration: 4000
    });
  }
}
