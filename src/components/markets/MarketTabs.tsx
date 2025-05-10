
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketList from "./MarketList";

interface Asset {
  id?: string;
  name: string;
  symbol: string;
  price: number;
  change_percentage: number;
  volume: string;
  market_cap?: string;
  market_type: string;
}

interface MarketTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  marketData: Asset[];
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  onSelectAsset: (asset: Asset) => void;
}

const MarketTabs = ({ 
  activeTab, 
  setActiveTab, 
  marketData, 
  isLoading, 
  error, 
  searchTerm, 
  onSelectAsset 
}: MarketTabsProps) => {
  // Filter market data based on search term
  const filteredMarketData = marketData.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Tabs 
      defaultValue="Crypto"
      value={activeTab}
      onValueChange={(value) => setActiveTab(value)}
    >
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="Crypto">Crypto</TabsTrigger>
        <TabsTrigger value="Stock">Stocks</TabsTrigger>
        <TabsTrigger value="Forex">Forex</TabsTrigger>
        <TabsTrigger value="Index">Indices</TabsTrigger>
        <TabsTrigger value="Commodity">Commodities</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="border rounded-md">
        <MarketList 
          isLoading={isLoading}
          error={error}
          filteredMarketData={filteredMarketData}
          onSelectAsset={onSelectAsset}
        />
      </TabsContent>
    </Tabs>
  );
};

export default MarketTabs;
