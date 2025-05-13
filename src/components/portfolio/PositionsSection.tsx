
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PositionsTable from "@/components/portfolio/PositionsTable";
import ClosedPositionsTable from "@/components/portfolio/ClosedPositionsTable";
import PositionFilter from "@/components/portfolio/PositionFilter";
import { Asset as AccountAsset, ClosedPosition } from "@/types/account";

// Use a local interface that matches exactly what PositionsTable expects
interface Asset {
  symbol: string;
  name: string;
  price: number;
  amount: number;  // Required, not optional
  entryPrice?: number;
  value?: number;
  change?: number;
  pnl?: number;
  pnlPercentage?: number;
}

interface PositionsSectionProps {
  assets: AccountAsset[];
  closedPositions: ClosedPosition[];
  onViewDetails: (symbol: string) => void;
}

const PositionsSection = ({ 
  assets, 
  closedPositions,
  onViewDetails 
}: PositionsSectionProps) => {
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterPnl, setFilterPnl] = useState("all");

  // Convert assets to the expected format
  const formattedAssets: Asset[] = assets.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    price: asset.price,
    amount: asset.amount || 0,  // Ensure amount is always provided, even if it's 0
    entryPrice: asset.entryPrice,
    value: asset.value,
    change: asset.change,
    pnl: asset.pnl,
    pnlPercentage: asset.pnlPercentage
  }));

  // Filter closed positions
  const filteredClosedPositions = closedPositions.filter(position => {
    const symbolMatch = position.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
    
    if (filterPnl === "profit") {
      return symbolMatch && position.pnl > 0;
    } else if (filterPnl === "loss") {
      return symbolMatch && position.pnl < 0;
    }
    
    return symbolMatch;
  });

  return (
    <Tabs defaultValue="open" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="open">Open Positions</TabsTrigger>
        <TabsTrigger value="closed">Closed Positions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="open">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Open Positions</span>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Add Position
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PositionsTable 
              assets={formattedAssets}
              onViewDetails={onViewDetails}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="closed">
        <Card>
          <CardHeader>
            <CardTitle>Closed Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <PositionFilter 
              filterSymbol={filterSymbol}
              filterPnl={filterPnl}
              onSymbolChange={setFilterSymbol}
              onPnlChange={setFilterPnl}
            />
            
            <ClosedPositionsTable positions={filteredClosedPositions} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PositionsSection;
