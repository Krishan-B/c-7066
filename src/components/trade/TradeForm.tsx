import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import { OrderTypeSelector, TradeSummary } from '@/components/trade';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/auth';
import type { Asset } from '@/hooks/market/types';
import { usePriceMovement } from '@/hooks/market/usePriceMovement';
import { useTradeCalculations } from '@/hooks/trades/useTradeCalculations';

import { AssetCategorySelector } from './AssetCategorySelector';
import { AssetSelector } from './AssetSelector';
import { EntryRateInput } from './EntryRateInput';
import { StopLossCheckbox } from './StopLossCheckbox';
import { StopLossSettings } from './StopLossSettings';
import { TakeProfitCheckbox } from './TakeProfitCheckbox';
import { TakeProfitSettings } from './TakeProfitSettings';
import { TradeActionButton } from './TradeActionButton';
import { UnitsInput } from './UnitsInput';

interface TradeFormProps {
  action: 'buy' | 'sell';
  asset: {
    name: string;
    symbol: string;
    price: number;
    market_type: string;
  };
  currentPrice: number;
  isLoading: boolean;
  isExecuting: boolean;
  marketIsOpen: boolean;
  onSubmit: (amount: string, orderType: string, leverage?: number[]) => void;
  availableFunds?: number;
  marketData?: Asset[];
}

const TradeForm = ({
  action,
  asset,
  currentPrice,
  isLoading,
  isExecuting,
  marketIsOpen,
  onSubmit,
  availableFunds = 10000,
  marketData = [],
}: TradeFormProps) => {
  const [units, setUnits] = useState('0.1');
  const [orderType, setOrderType] = useState('market');
  const [assetCategory, setAssetCategory] = useState(asset.market_type);
  const [selectedAsset, setSelectedAsset] = useState(asset.symbol);
  const [hasStopLoss, setHasStopLoss] = useState(false);
  const [hasTakeProfit, setHasTakeProfit] = useState(false);
  const { profile } = useAuth(); // Get user profile

  // Use our custom hooks
  const { buyPrice, sellPrice } = usePriceMovement(currentPrice);

  // Filter assets based on selected category with null check
  const filteredAssets = marketData?.filter((a) => a.market_type === assetCategory) ?? [];

  // Use the trade calculations hook with proper parameters
  const tradeCalculations = useTradeCalculations(
    units,
    currentPrice,
    assetCategory,
    availableFunds
  );

  const handleAssetCategoryChange = (value: string) => {
    setAssetCategory(value);

    // Reset asset selection if there are assets in this category
    const assetsInCategory = marketData?.filter((a) => a.market_type === value) ?? [];
    if (assetsInCategory.length > 0 && assetsInCategory[0]?.symbol) {
      setSelectedAsset(assetsInCategory[0].symbol);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(units, orderType, [tradeCalculations.leverage]);
  };

  // Create a no-parameter version of handleSubmit for the button click
  const handleButtonClick = () => {
    onSubmit(units, orderType, [tradeCalculations.leverage]);
  };

  // Check if user is verified enough to trade
  const canTrade = profile?.verificationLevel && profile.verificationLevel >= 3;
  const kycNotStarted = !profile?.kycStatus || profile.kycStatus === 'NOT_STARTED';
  const kycPending = profile?.kycStatus === 'PENDING';
  const kycRejected = profile?.kycStatus === 'REJECTED';

  if (!canTrade) {
    let message = 'Account verification is required to trade.';
    let linkText = 'Complete KYC Verification';
    const linkTo = '/kyc'; // Changed to const

    if (kycNotStarted) {
      message = 'Please complete your KYC verification to start trading.';
    } else if (kycPending) {
      message =
        'Your KYC verification is currently pending review. Trading will be enabled upon approval.';
      linkText = 'Check KYC Status';
    } else if (kycRejected) {
      message = 'Your KYC verification was rejected. Please review your documents and resubmit.';
      linkText = 'Review KYC Submission';
    } else if (profile?.verificationLevel && profile.verificationLevel < 3) {
      message = `Your current verification level (${profile.verificationLevel}) is not sufficient for trading. Please complete all KYC steps.`;
    }

    return (
      <Alert variant="warning" className="mt-4">
        <ShieldAlert className="h-5 w-5" />
        <AlertDescription className="ml-2">
          {message}
          <Link to={linkTo} className="ml-1 font-semibold text-yellow-700 hover:underline">
            {linkText}
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {/* Asset Category Selection */}
      <AssetCategorySelector
        assetCategory={assetCategory}
        setAssetCategory={handleAssetCategoryChange}
        isExecuting={isExecuting}
      />

      {/* Asset Selection */}
      <AssetSelector
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        isExecuting={isExecuting}
        isLoading={isLoading}
        filteredAssets={filteredAssets}
      />

      {/* Units Input */}
      <UnitsInput
        units={units}
        setUnits={setUnits}
        isExecuting={isExecuting}
        requiredFunds={tradeCalculations.requiredFunds}
        canAfford={tradeCalculations.canAfford}
        availableFunds={availableFunds}
      />

      {/* Order Type Selection */}
      <OrderTypeSelector
        orderType={orderType}
        onOrderTypeChange={setOrderType}
        disabled={isExecuting}
      />

      {/* Show Entry Rate input if entry order is selected */}
      {orderType === 'entry' && <EntryRateInput currentPrice={currentPrice} />}

      {/* Stop Loss Checkbox */}
      <StopLossCheckbox
        hasStopLoss={hasStopLoss}
        setHasStopLoss={setHasStopLoss}
        isExecuting={isExecuting}
      />

      {/* Stop Loss Settings */}
      {hasStopLoss && <StopLossSettings currentPrice={currentPrice} />}

      {/* Take Profit Checkbox */}
      <TakeProfitCheckbox
        hasTakeProfit={hasTakeProfit}
        setHasTakeProfit={setHasTakeProfit}
        isExecuting={isExecuting}
      />

      {/* Take Profit Settings */}
      {hasTakeProfit && <TakeProfitSettings currentPrice={currentPrice} />}

      {/* Trade Summary */}
      <TradeSummary
        currentPrice={currentPrice}
        parsedAmount={tradeCalculations.requiredFunds}
        fee={tradeCalculations.fee}
        total={tradeCalculations.total}
        isLoading={isLoading}
      />

      {/* Trade Action Button */}
      <TradeActionButton
        action={action}
        price={currentPrice}
        selectedAsset={selectedAsset}
        isExecuting={isExecuting}
        marketIsOpen={marketIsOpen}
        parsedUnits={tradeCalculations.parsedUnits}
        canAfford={tradeCalculations.canAfford}
        buyPrice={buyPrice}
        sellPrice={sellPrice}
        onClick={handleButtonClick}
        disabled={
          isExecuting ||
          !marketIsOpen ||
          !tradeCalculations.canAfford ||
          tradeCalculations.parsedUnits <= 0
        }
      />
    </form>
  );
};

export default TradeForm;
