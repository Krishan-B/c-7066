# Error Handling Guidelines

## Overview

This document outlines the standard error handling patterns used in the Trade-Pro platform.
Following these guidelines ensures consistent error handling and user feedback across the
application.

## Core Components

### 1. ErrorHandler Service

The `ErrorHandler` service (`src/services/errorHandling.ts`) provides centralized error handling
with:

- Standardized error codes and user-friendly messages
- Typed error responses
- Retryable error support
- Unified notification system
- Detailed error logging for debugging

```typescript
// Example basic usage:
try {
  // Your code here
} catch (error) {
  ErrorHandler.handleError(
    ErrorHandler.createError({
      code: "data_fetch_error",
      message: "Failed to load data",
      details: error,
      retryable: true,
    }),
    {
      description: "Unable to load your data. Please try again.",
      retryFn: async () => {
        // Retry logic here
      },
    }
  );
}

// Example success notification:
ErrorHandler.handleSuccess("Operation completed", { description: "Your changes have been saved" });
```

### 2. Error Boundaries

Error boundaries catch and handle React component tree errors:

- Automatic error reporting
- Retry capability
- Development mode stack traces
- Fallback UI

```typescript
// Wrap components with error boundary:
export default withErrorBoundary(MyComponent, "component_name");
```

## Best Practices

1. **Always Use ErrorHandler**
   - Replace direct toast calls with ErrorHandler methods
   - Use appropriate error codes for consistent messaging
   - Always include error details for debugging
   - Use retry functionality for recoverable errors

2. **Standardized Error Codes**
   - Use consistent error codes across the application
   - Map error codes to user-friendly messages in ErrorHandler
   - Group related errors (auth, trading, data, etc.)

3. **Appropriate Error Handling by Type**
   - Authentication errors: Redirect to login when appropriate
   - Network errors: Provide retry options
   - Validation errors: Show specific feedback
   - Business logic errors: Display clear action steps

## Error Codes

The system uses standardized error codes grouped by domain:

### Authentication Errors

- `invalid_credentials`: Wrong username/password
- `email_not_confirmed`: Email verification needed
- `email_already_used`: Email address is already registered
- `too_many_requests`: Rate limiting
- `user_not_found`: User doesn't exist
- `weak_password`: Password requirements not met
- `authentication_error`: General auth error
- `password_update_error`: Password change failed
- `session_check_error`: Session validation failed

### Profile Errors

- `profile_update_error`: Profile update failed

### Trading Errors

- `insufficient_funds`: Not enough balance
- `market_closed`: Market unavailable
- `invalid_order_size`: Order size issues
- `leverage_exceeded`: Beyond allowed leverage
- `position_limit_reached`: Too many open positions
- `margin_calculation_error`: Margin calculation failed
- `pnl_calculation_error`: P&L calculation error
- `order_placement_error`: Order creation failed
- `order_cancellation_error`: Order cancellation failed
- `order_modification_error`: Order update failed

### KYC Errors

- `kyc_document_upload_error`: Document upload failed
- `kyc_document_fetch_error`: Can't retrieve documents
- `kyc_document_delete_error`: Document deletion failed
- `kyc_verification_error`: Verification process error

### Data & Network Errors

- `network_error`: Connection issues
- `server_error`: Backend problems
- `timeout_error`: Request timeout
- `data_fetch_error`: Data retrieval failed
- `validation_error`: Invalid input
- `market_data_fetch_error`: Market data unavailable
- `data_refresh_error`: Data update failed

## Implementation Guidelines

1. **For New Components**
   - Import ErrorHandler instead of toast
   - Use createError for typed errors
   - Handle success states with handleSuccess

2. **For Refactoring Existing Code**
   - Replace direct toast calls with ErrorHandler methods
   - Add appropriate error codes
   - Implement retry functionality where appropriate

3. **For Hooks**
   - Use proper error handling in async operations
   - Return normalized errors for component handling
   - Add retry capabilities for data operations

## Example Pattern for Hooks

```typescript
const useDataHook = () => {
  const fetchData = async () => {
    try {
      // Data fetching logic
      return data;
    } catch (error) {
      ErrorHandler.handleError(
        ErrorHandler.createError({
          code: "data_fetch_error",
          message: "Failed to fetch required data",
          details: error,
          retryable: true,
        }),
        {
          description: "Unable to load necessary data. Please try again.",
          retryFn: async () => await fetchData(),
        }
      );
      return fallbackData;
    }
  };

  return { fetchData };
};
```
