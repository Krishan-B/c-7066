
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PositionsTable from "@/components/portfolio/PositionsTable";
import ClosedPositionsTable from "@/components/portfolio/ClosedPositionsTable";
import PositionFilter from "@/components/portfolio/PositionFilter";
import { Asset, ClosedPosition } from "@/types/account";
import { useTradePanel } from "@/components/trade/TradePanelProvider";
import { toast } from "sonner";

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
  const [filterSymbol, setFilterSymbol] = useState<string>("");
  const [filterPnl, setFilterPnl] = useState<string>("all");
  const { openPanel } = useTradePanel();

  // Filter closed positions
  const filteredClosedPositions = closedPositions.filter(position => {
    // Safely check if symbol exists
    const symbolMatch = position.symbol ? 
      position.symbol.toLowerCase().includes(filterSymbol.toLowerCase()) : 
      false;
    
    if (filterPnl === "profit") {
      return symbolMatch && position.pnl > 0;
    } else if (filterPnl === "loss") {
      return symbolMatch && position.pnl < 0;
    }
    
    return symbolMatch;
  });

  const handleAddPosition = () => {
    if (openPanel) {
      openPanel();
    } else {
      toast.error("Trade panel is not available");
    }
  };

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
              <Button variant="outline" size="sm" onClick={handleAddPosition}>
                <Plus className="h-4 w-4 mr-2" /> Add Position
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length > 0 ? (
              <PositionsTable 
                assets={assets}
                onViewDetails={onViewDetails}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No open positions. Click "Add Position" to start trading.
              </div>
            )}
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
            
            {filteredClosedPositions.length > 0 ? (
              <ClosedPositionsTable positions={filteredClosedPositions} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No closed positions match your filter criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PositionsSection;
