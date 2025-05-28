import { useQuery } from "@tanstack/react-query";
const fetchBitcoinPrices = async () => {
  const response = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=180&interval=daily");
  const data = await response.json();

const PortfolioCard = () => {
  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <h2 className="text-xl font-semibold mb-6">Bitcoin Performance</h2>
      <div className="w-full h-[200px] flex items-center justify-center">
        <span className="text-muted-foreground">Chart loading...</span>
      </div>
    </div>
  );
};

export default PortfolioCard;
