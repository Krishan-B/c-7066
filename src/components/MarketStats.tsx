
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";

const MarketStats = () => {
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
          <h3 className="text-xs font-medium text-muted-foreground">S&P 500</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-lg font-semibold mt-1">5,204</p>
        <span className="text-xs text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          0.4%
        </span>
      </div>
      
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">Gold</h3>
          <TrendingUpIcon className="w-4 h-4 text-success" />
        </div>
        <p className="text-lg font-semibold mt-1">$2,326</p>
        <span className="text-xs text-success flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          1.3%
        </span>
      </div>
      
      <div className="glass-card p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground">EUR/USD</h3>
          <TrendingUpIcon className="w-4 h-4 text-warning" />
        </div>
        <p className="text-lg font-semibold mt-1">1.0934</p>
        <span className="text-xs text-warning flex items-center gap-1">
          <ArrowDownIcon className="w-3 h-3" />
          0.1%
        </span>
      </div>
    </div>
  );
};

export default MarketStats;
