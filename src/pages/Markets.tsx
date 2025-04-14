
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import TradingViewChart from "@/components/TradingViewChart";

const Markets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67432.21,
    change: 2.4
  });

  // Mock data for markets
  const cryptoMarkets = [
    { name: "Bitcoin", symbol: "BTCUSD", price: 67432.21, change: 2.4, volume: "14.2B" },
    { name: "Ethereum", symbol: "ETHUSD", price: 3401.52, change: -0.8, volume: "8.7B" },
    { name: "Cardano", symbol: "ADAUSD", price: 0.54, change: 1.2, volume: "921M" },
    { name: "Solana", symbol: "SOLUSD", price: 142.87, change: 3.7, volume: "2.1B" },
    { name: "Polkadot", symbol: "DOTUSD", price: 7.32, change: -1.5, volume: "427M" },
  ];

  const stockMarkets = [
    { name: "Apple Inc.", symbol: "AAPL", price: 182.63, change: 0.3, volume: "52.1M" },
    { name: "Microsoft", symbol: "MSFT", price: 416.78, change: 1.1, volume: "21.3M" },
    { name: "Amazon", symbol: "AMZN", price: 178.32, change: -0.5, volume: "31.7M" },
    { name: "Tesla", symbol: "TSLA", price: 172.63, change: -2.3, volume: "86.2M" },
    { name: "Meta", symbol: "META", price: 474.99, change: 1.8, volume: "19.4M" },
  ];

  // Filter markets based on search term
  const filteredCrypto = cryptoMarkets.filter(market => 
    market.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    market.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredStocks = stockMarkets.filter(market => 
    market.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    market.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Markets</h1>
          <p className="text-muted-foreground">
            Explore live price data and trends across different markets
          </p>
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
            
            <Tabs defaultValue="crypto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="crypto" className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">24h Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCrypto.map((market) => (
                      <TableRow 
                        key={market.symbol} 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedMarket(market)}
                      >
                        <TableCell className="font-medium">{market.name} ({market.symbol})</TableCell>
                        <TableCell className="text-right">${market.price.toLocaleString()}</TableCell>
                        <TableCell className={`text-right ${market.change >= 0 ? 'text-success' : 'text-warning'}`}>
                          <span className="flex items-center justify-end">
                            {market.change >= 0 
                              ? <ArrowUp className="mr-1 h-4 w-4" />
                              : <ArrowDown className="mr-1 h-4 w-4" />
                            }
                            {Math.abs(market.change)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="stocks" className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">24h Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStocks.map((market) => (
                      <TableRow 
                        key={market.symbol} 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setSelectedMarket(market)}
                      >
                        <TableCell className="font-medium">{market.name} ({market.symbol})</TableCell>
                        <TableCell className="text-right">${market.price.toLocaleString()}</TableCell>
                        <TableCell className={`text-right ${market.change >= 0 ? 'text-success' : 'text-warning'}`}>
                          <span className="flex items-center justify-end">
                            {market.change >= 0 
                              ? <ArrowUp className="mr-1 h-4 w-4" />
                              : <ArrowDown className="mr-1 h-4 w-4" />
                            }
                            {Math.abs(market.change)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="md:w-2/3">
            <Card>
              <CardHeader>
                <CardTitle>{selectedMarket.name} ({selectedMarket.symbol})</CardTitle>
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
