
import { 
  validateTrade, 
  handleValidationError, 
  validateTradeWithErrorHandling,
  TradeValidationErrorType
} from '../tradeValidation';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn()
  }
}));

describe('Trade Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTrade', () => {
    test('should return null for valid trade parameters', () => {
      const validParams = {
        userId: 'user-123',
        symbol: 'BTCUSD',
        units: 0.1,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const,
        availableFunds: 10000,
        marketOpen: true
      };
      
      const result = validateTrade(validParams);
      expect(result).toBeNull();
    });

    test('should return authentication error if userId is missing', () => {
      const invalidParams = {
        symbol: 'BTCUSD',
        units: 0.1,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const
      };
      
      const result = validateTrade(invalidParams);
      expect(result).toEqual({
        type: TradeValidationErrorType.AUTHENTICATION,
        message: 'You must be signed in to execute trades'
      });
    });

    test('should return input error if symbol is missing', () => {
      const invalidParams = {
        userId: 'user-123',
        symbol: '',
        units: 0.1,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const
      };
      
      const result = validateTrade(invalidParams);
      expect(result).toEqual({
        type: TradeValidationErrorType.INPUT,
        message: 'Symbol is required',
        field: 'symbol'
      });
    });

    test('should return input error if units is invalid', () => {
      const invalidParams = {
        userId: 'user-123',
        symbol: 'BTCUSD',
        units: 0,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const
      };
      
      const result = validateTrade(invalidParams);
      expect(result).toEqual({
        type: TradeValidationErrorType.INPUT,
        message: 'Units must be a positive number',
        field: 'units'
      });
    });

    test('should return input error if entry price is missing for entry orders', () => {
      const invalidParams = {
        userId: 'user-123',
        symbol: 'BTCUSD',
        units: 0.1,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'entry' as const
      };
      
      const result = validateTrade(invalidParams);
      expect(result).toEqual({
        type: TradeValidationErrorType.INPUT,
        message: 'Entry price is required for entry orders and must be greater than zero',
        field: 'entryPrice'
      });
    });

    test('should return funds error if insufficient funds', () => {
      const invalidParams = {
        userId: 'user-123',
        symbol: 'BTCUSD',
        units: 0.5,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const,
        availableFunds: 5000 // Not enough for 0.5 BTC at $50,000
      };
      
      const result = validateTrade(invalidParams);
      expect(result?.type).toBe(TradeValidationErrorType.FUNDS);
      expect(result?.message).toContain('Insufficient funds');
    });

    test('should return market error if market is closed', () => {
      const invalidParams = {
        userId: 'user-123',
        symbol: 'BTCUSD',
        units: 0.1,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const,
        marketOpen: false
      };
      
      const result = validateTrade(invalidParams);
      expect(result).toEqual({
        type: TradeValidationErrorType.MARKET,
        message: 'Market is currently closed',
        field: 'market'
      });
    });
  });

  describe('handleValidationError', () => {
    test('should display toast error and return false', () => {
      const validationError = {
        type: TradeValidationErrorType.FUNDS,
        message: 'Insufficient funds',
        field: 'funds'
      };
      
      const result = handleValidationError(validationError);
      
      expect(toast.error).toHaveBeenCalledWith('Insufficient funds');
      expect(result).toBe(false);
    });
  });

  describe('validateTradeWithErrorHandling', () => {
    test('should return true for valid trade parameters', () => {
      const validParams = {
        userId: 'user-123',
        symbol: 'BTCUSD',
        units: 0.1,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const
      };
      
      const result = validateTradeWithErrorHandling(validParams);
      expect(result).toBe(true);
    });

    test('should handle validation error and return false', () => {
      const invalidParams = {
        userId: 'user-123',
        symbol: 'BTCUSD',
        units: 0,
        price: 50000,
        direction: 'buy' as const,
        orderType: 'market' as const
      };
      
      const result = validateTradeWithErrorHandling(invalidParams);
      
      expect(toast.error).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
