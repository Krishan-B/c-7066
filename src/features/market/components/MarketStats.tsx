import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";

/**
 * MarketStats Component
 * Displays key market statistics in a grid layout
 */
export const MarketStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">BTC/USD</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-lg font-semibold mt-1">$67,543</p>
        <span className="text-xs text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          2.4%
        </span>
      </div>

      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">ETH/USD</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-lg font-semibold mt-1">$3,211</p>
        <span className="text-xs text-warning flex items-center gap-1">
          <ArrowDownIcon className="w-3 h-3" />
          1.2%
        </span>
      </div>

      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">SOL/USD</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-lg font-semibold mt-1">$142.87</p>
        <span className="text-xs text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          5.8%
        </span>
      </div>

      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">AAPL</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-lg font-semibold mt-1">$189.84</p>
        <span className="text-xs text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          0.9%
        </span>
      </div>

      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">TSLA</h3>
          <TrendingUpIcon className="w-4 h-4 text-destructive" />
        </div>
        <p className="text-lg font-semibold mt-1">$248.42</p>
        <span className="text-xs text-destructive flex items-center gap-1">
          <ArrowDownIcon className="w-3 h-3" />
          1.7%
        </span>
      </div>
    </div>
  );
};

export default MarketStats;
