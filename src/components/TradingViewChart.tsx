
import * as React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

type Interval = string;
type Range = string;

interface TradingViewChartProps {
  symbol?: string;
  interval?: Interval;
  range?: Range;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "BINANCE:BTCUSDT",
  interval = "D",
  range
}) => {
  return (
    <div className="h-[500px] w-full relative z-10">
      <AdvancedRealTimeChart
        symbol={symbol}
        theme="dark"
        interval={interval}
        range={range as any}
        autosize
        allow_symbol_change={true}
        save_image={true}
        hide_side_toolbar={false}
        details={true}
        hotlist={true}
        calendar={true}
      />
    </div>
  );
};

export default TradingViewChart;
