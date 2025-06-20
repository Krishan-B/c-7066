/**
 * Trade Component Types
 * Type definitions specifically for trade-related components
 */
import { type MarketType } from '@/hooks/market';
import { type Asset } from '@/hooks/market/types';
import { ORDER_TYPES, type OrderTypeEnum } from '@/types/schema';

export interface TradeMainContentProps {
  assetCategory: MarketType;
  onAssetCategoryChange: (category: MarketType) => void;
  selectedAsset: Asset;
  onAssetSelect: (symbol: string) => void;
  orderType: OrderTypeEnum;
  setOrderType: (type: OrderTypeEnum) => void;
  units: string;
  setUnits: (units: string) => void;
  onExecuteTrade: (action: 'buy' | 'sell') => void;
  isExecuting: boolean;
  tradeAction: 'buy' | 'sell';
  hasStopLoss: boolean;
  setHasStopLoss: (has: boolean) => void;
  hasTakeProfit: boolean;
  setHasTakeProfit: (has: boolean) => void;
  hasExpirationDate: boolean;
  setHasExpirationDate: (has: boolean) => void;
  orderRate: string;
  setOrderRate: (rate: string) => void;
  stopLossRate?: string;
  setStopLossRate?: (rate: string) => void;
  takeProfitRate?: string;
  setTakeProfitRate?: (rate: string) => void;
  setExpirationDate?: (date?: string) => void;
}

export interface AdvancedOrderFormValues {
  orderType: OrderTypeEnum;
  stopLoss: boolean;
  takeProfit: boolean;
  expirationDate: boolean;
  stopLossRate?: string;
  stopLossAmount?: string;
  takeProfitRate?: string;
  takeProfitAmount?: string;
  orderRate?: string;
  expirationDay?: string;
  expirationMonth?: string;
  expirationYear?: string;
  units: string;
  assetCategory?: MarketType;
  assetSymbol?: string;
}

export interface AdvancedOrderFormProps {
  currentPrice: number;
  symbol: string;
  onOrderSubmit: (values: AdvancedOrderFormValues, action: 'buy' | 'sell') => void;
  isLoading?: boolean;
  availableFunds?: number;
  assetCategory?: MarketType;
  onAssetCategoryChange?: (category: MarketType) => void;
  marketData?: Asset[];
}

export interface OrderTypeSelectorProps {
  orderType: OrderTypeEnum;
  onOrderTypeChange: (orderType: OrderTypeEnum) => void;
  disabled?: boolean;
}

export interface AssetSelectorProps {
  assets: Asset[];
  selectedAsset: string;
  onAssetSelect: (symbol: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}
