import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { isMarketOpen } from '@/utils/marketHours';

interface TradePanelFooterProps {
  onExecuteTrade: (action: 'buy' | 'sell') => void;
  isExecuting: boolean;
  tradeAction: 'buy' | 'sell';
  selectedAsset: { symbol: string; market_type: string };
  orderType: 'market' | 'entry';
  canAfford: boolean;
  parsedUnits: number;
}

export const TradePanelFooter = ({
  onExecuteTrade,
  isExecuting,
  tradeAction,
  selectedAsset,
  orderType,
  canAfford,
  parsedUnits,
}: TradePanelFooterProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const marketIsOpen = isMarketOpen(selectedAsset.market_type);

  const handleSubmit = (action: 'buy' | 'sell') => {
    if (!marketIsOpen && orderType === 'market') {
      toast({
        title: 'Market Closed',
        description:
          'The market is currently closed. Please try again during market hours or use an entry order.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to execute trades.',
        variant: 'destructive',
      });
      return;
    }

    if (!canAfford && action === 'buy') {
      toast({
        title: 'Insufficient Funds',
        description: 'You do not have enough funds to execute this trade.',
        variant: 'destructive',
      });
      return;
    }

    onExecuteTrade(action);
  };

  return (
    <div className="mt-6 flex flex-col space-y-4">
      <Button
        className="w-full bg-success text-white hover:bg-success/90"
        onClick={() => handleSubmit('buy')}
        disabled={
          isExecuting || (orderType === 'market' && !marketIsOpen) || !canAfford || parsedUnits <= 0
        }
      >
        {isExecuting && tradeAction === 'buy' ? 'Processing...' : `Buy ${selectedAsset.symbol}`}
      </Button>
      <Button
        className="w-full bg-warning text-white hover:bg-warning/90"
        onClick={() => handleSubmit('sell')}
        disabled={isExecuting || (orderType === 'market' && !marketIsOpen) || parsedUnits <= 0}
      >
        {isExecuting && tradeAction === 'sell' ? 'Processing...' : `Sell ${selectedAsset.symbol}`}
      </Button>
    </div>
  );
};
