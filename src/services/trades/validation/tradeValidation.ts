
import { toast } from "sonner";

/**
 * Trade validation error types
 */
export enum TradeValidationErrorType {
  AUTHENTICATION = "authentication",
  INPUT = "input",
  FUNDS = "funds",
  MARKET = "market",
  SYSTEM = "system"
}

/**
 * Trade validation error interface
 */
export interface TradeValidationError {
  type: TradeValidationErrorType;
  message: string;
  field?: string;
}

/**
 * Trade validation parameters
 */
export interface TradeValidationParams {
  userId?: string;
  symbol: string;
  units: number | string;
  price: number;
  direction: 'buy' | 'sell';
  orderType: 'market' | 'entry';
  entryPrice?: number;
  availableFunds?: number;
  marketOpen?: boolean;
}

/**
 * Validates a trade before execution
 * @param params - The trade parameters to validate
 * @returns null if valid, or a TradeValidationError if invalid
 */
export function validateTrade(params: TradeValidationParams): TradeValidationError | null {
  // Authentication validation
  if (!params.userId) {
    return {
      type: TradeValidationErrorType.AUTHENTICATION,
      message: "You must be signed in to execute trades"
    };
  }
  
  // Input validations
  if (!params.symbol) {
    return {
      type: TradeValidationErrorType.INPUT,
      message: "Symbol is required",
      field: "symbol"
    };
  }
  
  const units = typeof params.units === 'string' ? parseFloat(params.units) : params.units;
  if (isNaN(units) || units <= 0) {
    return {
      type: TradeValidationErrorType.INPUT,
      message: "Units must be a positive number",
      field: "units"
    };
  }
  
  if (params.price <= 0) {
    return {
      type: TradeValidationErrorType.INPUT,
      message: "Price must be greater than zero",
      field: "price"
    };
  }
  
  // Entry order specific validations
  if (params.orderType === 'entry') {
    if (!params.entryPrice || params.entryPrice <= 0) {
      return {
        type: TradeValidationErrorType.INPUT,
        message: "Entry price is required for entry orders and must be greater than zero",
        field: "entryPrice"
      };
    }
  }
  
  // Funds validation
  if (params.availableFunds !== undefined) {
    const cost = units * params.price;
    if (cost > params.availableFunds) {
      return {
        type: TradeValidationErrorType.FUNDS,
        message: `Insufficient funds. Required: ${cost.toFixed(2)}, Available: ${params.availableFunds.toFixed(2)}`,
        field: "funds"
      };
    }
  }
  
  // Market hours validation
  if (params.marketOpen === false) {
    return {
      type: TradeValidationErrorType.MARKET,
      message: "Market is currently closed",
      field: "market"
    };
  }
  
  // All validations passed
  return null;
}

/**
 * Handle validation errors by displaying appropriate messages and logging
 * @param error The validation error to handle
 * @returns false to indicate validation failure
 */
export function handleValidationError(error: TradeValidationError): boolean {
  // Display error message in toast
  toast.error(error.message);
  
  // Log the error
  console.error("Trade validation error:", error);
  
  // Return false to indicate validation failure
  return false;
}

/**
 * Unified function to validate a trade with error handling
 * @param params Validation parameters
 * @returns true if valid, false if invalid (with error handled)
 */
export function validateTradeWithErrorHandling(params: TradeValidationParams): boolean {
  const validationError = validateTrade(params);
  
  if (validationError) {
    return !handleValidationError(validationError);
  }
  
  return true;
}
