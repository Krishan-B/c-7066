interface ErrorHandlerOptions {
  description?: string;
  duration?: number;
  retryFn?: () => Promise<void>;
}

interface ErrorOptions {
  title: string;
  description?: string;
}

class ErrorHandlerService {
  handleError(
    title: string,
    error: Error | string,
    options?: ErrorHandlerOptions
  ) {
    console.error(`${title}:`, error);
    // Toast implementation would go here
  }

  handleSuccess(title: string, options?: ErrorHandlerOptions) {
    console.log(`Success - ${title}:`, options?.description);
    // Toast implementation would go here
  }

  handleWarning(title: string, options?: ErrorHandlerOptions) {
    console.warn(`Warning - ${title}:`, options?.description);
    // Toast implementation would go here
  }

  createError(options: ErrorOptions): Error & { description?: string } {
    const error = new Error(options.title) as Error & { description?: string };
    if (options.description) {
      error.description = options.description;
    }
    return error;
  }
}

export const ErrorHandler = new ErrorHandlerService();
