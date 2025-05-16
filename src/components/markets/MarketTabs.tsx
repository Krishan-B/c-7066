
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketList from "./MarketList";
import { Asset } from "@/hooks/market/types";

interface MarketTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  marketData: Asset[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSelectAsset: (asset: Asset) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const MarketTabs = ({ 
  activeTab, 
  setActiveTab, 
  marketData, 
  isLoading, 
  error, 
  searchTerm, 
  onSelectAsset,
  containerRef
}: MarketTabsProps) => {
  // Filter market data based on search term - now checking both name and symbol
  const filteredMarketData = marketData.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle asset selection with auto-scroll
  const handleAssetSelect = (asset: Asset) => {
    onSelectAsset(asset);
    // Scroll to the chart section smoothly
    if (containerRef?.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Tabs 
      defaultValue="Crypto"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-5 mb-4">
        <TabsTrigger value="Crypto" className="font-medium">Crypto</TabsTrigger>
        <TabsTrigger value="Stock" className="font-medium">Stocks</TabsTrigger>
        <TabsTrigger value="Forex" className="font-medium">Forex</TabsTrigger>
        <TabsTrigger value="Index" className="font-medium">Indices</TabsTrigger>
        <TabsTrigger value="Commodity" className="font-medium">Commodities</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab}>
        <MarketList 
          isLoading={isLoading}
          error={error}
          filteredMarketData={filteredMarketData}
          onSelectAsset={handleAssetSelect}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MarketTabs;
