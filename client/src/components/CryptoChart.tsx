import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

const CryptoChart = () => {
  return (
    <div className="glass-card mb-8 animate-fade-in rounded-lg p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Bitcoin Price</h2>
      </div>
      <div className="h-[400px] w-full">
        <AdvancedRealTimeChart
          symbol="BINANCE:BTCUSDT"
          theme="dark"
          locale="en"
          autosize
          hide_side_toolbar={false}
          allow_symbol_change={true}
          interval="D"
          toolbar_bg="#141413"
          enable_publishing={false}
          hide_top_toolbar={false}
          save_image={false}
        />
      </div>
    </div>
  );
};

export default CryptoChart;
