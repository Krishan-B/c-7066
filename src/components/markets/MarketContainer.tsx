
import React, { useState, useRef } from "react";
import { Separator } from "@/components/ui/separator";
import { Asset } from "@/hooks/useMarketData";
import { isMarketOpen } from "@/utils/marketHours";
import MarketHeader from "@/components/markets/MarketHeader";
import MarketSearch from "@/components/markets/MarketSearch";
import MarketTabs from "@/components/markets/MarketTabs";
import MarketChartSection from "@/components/markets/MarketChartSection";
import { useToast } from "@/components/ui/use-toast";

interface MarketContainerProps {
  marketData: Asset[];
  isLoading: boolean;
  error: Error | null;
}

const MarketContainer = ({ marketData, isLoading, error }: MarketContainerProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Crypto");
  const [selectedAsset, setSelectedAsset] = useState<Asset>({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67432.21,
    change_percentage: 2.4,
    market_type: "Crypto",
    volume: "14.2B"
  });

  const chartSectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Check if the selected market is open
  const marketIsOpen = selectedAsset ? isMarketOpen(selectedAsset.market_type) : false;

  // Handle adding to watchlist
  const handleAddToWatchlist = async (asset: Asset) => {
    try {
      // Add to watchlist in localStorage for persistence
      const existingWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
      
      // Check if asset is already in watchlist
      const isAlreadyInWatchlist = existingWatchlist.some((item: Asset) => 
        item.symbol === asset.symbol && item.market_type === asset.market_type
      );
      
      if (isAlreadyInWatchlist) {
        toast({
          title: "Already in watchlist",
          description: `${asset.name} is already in your watchlist.`,
        });
        return;
      }
      
      // Add to watchlist
      const updatedWatchlist = [...existingWatchlist, asset];
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
      
      toast({
        title: "Added to watchlist",
        description: `${asset.name} has been added to your watchlist.`,
      });
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to add to watchlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Market header section */}
        <MarketHeader 
          selectedAsset={selectedAsset}
          marketIsOpen={marketIsOpen}
        />
        
        {/* Market search and table section */}
        <div className="mb-8">
          <MarketSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <div className="mt-4">
            <MarketTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              marketData={marketData}
              isLoading={isLoading}
              error={error}
              searchTerm={searchTerm}
              onSelectAsset={setSelectedAsset}
              onAddToWatchlist={handleAddToWatchlist}
              containerRef={chartSectionRef}
            />
          </div>
        </div>
        
        <Separator className="my-8" />
        
        {/* Chart and details section */}
        <MarketChartSection 
          chartSectionRef={chartSectionRef}
          selectedAsset={selectedAsset}
          marketIsOpen={marketIsOpen}
        />
      </div>
    </div>
  );
};

export default MarketContainer;
