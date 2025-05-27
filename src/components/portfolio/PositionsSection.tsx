
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PositionsTable from "@/components/portfolio/PositionsTable";
import ClosedPositionsTable from "@/components/portfolio/ClosedPositionsTable";
import PositionFilter from "@/components/portfolio/PositionFilter";
import { type Asset, type ClosedPosition } from "@/types/account";

interface PositionsSectionProps {
  assets: Asset[];
  closedPositions: ClosedPosition[];
  onViewDetails: (asset: Asset) => void;
}

const PositionsSection = ({ 
  assets, 
  closedPositions,
  onViewDetails 
}: PositionsSectionProps) => {
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterPnl, setFilterPnl] = useState("all");

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
              assets={assets}
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
