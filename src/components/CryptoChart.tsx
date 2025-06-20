import React from 'react'; // Added React import for FC

const CryptoChart: React.FC = () => { // Added React.FC type
  const symbol = "BINANCE:BTCUSDT";
  const theme = "dark";
  const locale = "en";
  const interval = "D";
  const toolbarbg = "141413"; // Removed #, as it's part of the URL encoding
  const hideSideToolbar = "0"; // false corresponds to 0
  const allowSymbolChange = "1"; // true corresponds to 1
  const saveImage = "0"; // false corresponds to 0
  // For hide_top_toolbar, its not a direct query param in basic widget embed.
  // Often, toolbars are controlled together or via 'disabled_features' or 'enabled_features'.
  // We'll rely on hidesidetoolbar and the default behavior for the top toolbar.
  // enable_publishing=false is generally default.

  // Construct the iframe URL
  const iframeSrc = `https://s.tradingview.com/widgetembed/?symbol=${symbol}&interval=${interval}&theme=${theme}&locale=${locale}&toolbarbg=${toolbarbg}&hidesidetoolbar=${hideSideToolbar}&symboledit=${allowSymbolChange}&saveimage=${saveImage}&style=1&timezone=exchange&withdateranges=1&studies=[]&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&utm_source=&utm_medium=widget&utm_campaign=chart`;

  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Bitcoin Price</h2>
      </div>
      <div className="h-[400px] w-full">
        <iframe
          title="TradingView Bitcoin Chart"
          src={iframeSrc}
          style={{ width: '100%', height: '100%', border: '0' }} // Added border: '0' for cleaner look
        />
      </div>
    </div>
  );
};

export default CryptoChart;