import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/ui/button";
import { ErrorHandler } from "@/services/errorHandling";

const fetchCryptoData = async () => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    ErrorHandler.handleError({
      code: "market_data_fetch_error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch cryptocurrency data",
      details: error,
      retryable: true,
    });
    throw error;
  }
};

const CryptoList = () => {
  const { data: cryptos, isLoading } = useQuery({
    queryKey: ["cryptos"],
    queryFn: fetchCryptoData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-10 w-10 rounded-full bg-secondary"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary rounded w-1/4"></div>
            <div className="h-3 bg-secondary rounded w-1/6"></div>
          </div>
          <div className="h-6 bg-secondary rounded w-16"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-secondary"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-secondary rounded w-24"></div>
                  <div className="h-2 bg-secondary rounded w-12"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-secondary rounded w-16"></div>
                <div className="h-2 bg-secondary rounded w-10"></div>
              </div>
              <div className="h-8 bg-secondary rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-4 animate-fade-in">
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
            {cryptos?.map((crypto, index) => (
              <tr
                key={crypto.id}
                className="border-t border-secondary/40 hover:bg-secondary/20"
              >
                <td className="py-3 pl-1 text-xs text-muted-foreground">
                  {index + 1}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{crypto.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {crypto.symbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">
                  ${crypto.current_price.toLocaleString()}
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`flex items-center gap-1 justify-end ${
                      crypto.price_change_percentage_24h >= 0
                        ? "text-success"
                        : "text-warning"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                  >
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
