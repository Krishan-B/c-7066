import { useQuery } from '@tanstack/react-query';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}

const fetchCryptoData = async (): Promise<CryptoData[]> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const CryptoList = () => {
  const { data: cryptos, isLoading } = useQuery({
    queryKey: ['cryptos'],
    queryFn: fetchCryptoData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse rounded-lg p-6">
        <div className="mb-4 flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-secondary"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/4 rounded bg-secondary"></div>
            <div className="h-3 w-1/6 rounded bg-secondary"></div>
          </div>
          <div className="h-6 w-16 rounded bg-secondary"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-secondary"></div>
                <div className="space-y-1">
                  <div className="h-3 w-24 rounded bg-secondary"></div>
                  <div className="h-2 w-12 rounded bg-secondary"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-3 w-16 rounded bg-secondary"></div>
                <div className="h-2 w-10 rounded bg-secondary"></div>
              </div>
              <div className="h-8 w-16 rounded bg-secondary"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in rounded-lg p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-3 pl-1">#</th>
              <th className="pb-3">Name</th>
              <th className="pb-3 text-right">Price</th>
              <th className="pb-3 text-right">24h Change</th>
              <th className="pb-3 text-right">Market Cap</th>
              <th className="pb-3 text-right">Volume (24h)</th>
              <th className="pb-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {cryptos?.map((crypto: CryptoData, index: number) => (
              <tr key={crypto.id} className="border-t border-secondary/40 hover:bg-secondary/20">
                <td className="py-3 pl-1 text-xs text-muted-foreground">{index + 1}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <img src={crypto.image} alt={crypto.name} className="h-6 w-6 rounded-full" />
                    <div>
                      <p className="font-medium">{crypto.name}</p>
                      <p className="text-xs text-muted-foreground">{crypto.symbol.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">${crypto.current_price.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <span
                    className={`flex items-center justify-end gap-1 ${
                      crypto.price_change_percentage_24h >= 0 ? 'text-success' : 'text-warning'
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <ArrowUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  ${(crypto.market_cap / 1e9).toFixed(1)}B
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  ${(crypto.total_volume / 1e9).toFixed(1)}B
                </td>
                <td className="py-3 text-center">
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                    Trade
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CryptoList;
