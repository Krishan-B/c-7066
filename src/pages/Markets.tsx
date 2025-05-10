import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowUp, ArrowDown, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import TradingViewChart from "@/components/TradingViewChart";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

const Markets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<Asset>({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67432.21,
    change_percentage: 2.4,
    market_type: "Crypto",
    volume: "14.2B"
  });
  const [activeTab, setActiveTab] = useState("Crypto");
  const { toast } = useToast();

  // Function to fetch market data from Supabase
  const fetchMarketData = async (marketType: string): Promise<Asset[]> => {
    try {
      // First check if we already have recent data in our database
      const { data: existingData, error: fetchError } = await supabase
        .from('market_data')
        .select('*')
        .eq('market_type', marketType)
        .gt('last_updated', new Date(Date.now() - 60000 * 15).toISOString()); // Data not older than 15 minutes
      
      // If we have enough recent data, use it
      if (!fetchError && existingData && existingData.length > 5) {
        return existingData as Asset[];
      }

      // Otherwise, call our edge function to get fresh data
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: { market: marketType },
      });

      if (error) {
        throw new Error(error.message);
      }

      return data?.data || [];
    } catch (error) {
      console.error(`Error fetching ${marketType} data:`, error);
      throw error;
    }
  };

  // Use ReactQuery to manage data fetching
  const {
    data: marketData = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["market-data", activeTab],
    queryFn: () => fetchMarketData(activeTab),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  useEffect(() => {
    if (marketData.length > 0 && !selectedMarket.id) {
      setSelectedMarket(marketData[0]);
    }
  }, [marketData, selectedMarket.id]);

  const handleRefreshData = () => {
    refetch();
    toast({
      title: "Refreshing market data",
      description: `Fetching the latest ${activeTab} market data...`,
    });
  };

  // Filter market data based on search term
  const filteredMarketData = marketData.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Markets</h1>
            <p className="text-muted-foreground">
              Explore live price data and trends across different markets
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshData}
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Refresh Data
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search markets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
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
                {isLoading ? (
                  <div className="p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500">
                    Error loading market data. Please try again.
                  </div>
                ) : filteredMarketData.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No markets found matching your search.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">24h Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMarketData.map((asset) => (
                        <TableRow 
                          key={asset.symbol} 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => setSelectedMarket(asset)}
                        >
                          <TableCell className="font-medium">
                            {asset.name}
                            <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                          </TableCell>
                          <TableCell className="text-right">${typeof asset.price === 'number' ? asset.price.toLocaleString() : asset.price}</TableCell>
                          <TableCell className={`text-right ${asset.change_percentage >= 0 ? 'text-success' : 'text-warning'}`}>
                            <span className="flex items-center justify-end">
                              {asset.change_percentage >= 0 
                                ? <ArrowUp className="mr-1 h-4 w-4" />
                                : <ArrowDown className="mr-1 h-4 w-4" />
                              }
                              {Math.abs(asset.change_percentage).toFixed(2)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div>
                    {selectedMarket.name} ({selectedMarket.symbol})
                    <div className="text-sm text-muted-foreground font-normal mt-1">
                      Price: ${typeof selectedMarket.price === 'number' ? selectedMarket.price.toLocaleString() : selectedMarket.price} | 
                      <span className={selectedMarket.change_percentage >= 0 ? 'text-success' : 'text-warning'}>
                        {" "}{selectedMarket.change_percentage >= 0 ? "+" : ""}{selectedMarket.change_percentage.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Volume: {selectedMarket.volume}
                    </div>
                    {selectedMarket.market_cap && (
                      <div className="text-sm text-muted-foreground">
                        Market Cap: {selectedMarket.market_cap}
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <TradingViewChart symbol={selectedMarket.symbol} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
