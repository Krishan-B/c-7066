import React from "react";

interface TradingViewChartProps {
  symbol?: string;
}

/**
 * TradingViewChart Component
 * Displays an interactive trading chart using TradingView widget
 */
export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = "BINANCE:BTCUSDT",
}) => {
  return (
    <div className="h-[500px] w-full relative z-10">
      <div id="tradingview_chart" className="h-full w-full" />
      <div className="w-full h-full absolute top-0 left-0">
        {/* We're using the TradingView widget directly here */}
        <iframe
          title="Trading Chart"
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=exchange&withdateranges=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart`}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

export default TradingViewChart;
