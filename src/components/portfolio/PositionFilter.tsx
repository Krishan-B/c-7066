
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface PositionFilterProps {
  filterSymbol: string;
  filterPnl: string;
  onSymbolChange: (value: string) => void;
  onPnlChange: (value: string) => void;
}

const PositionFilter = ({
  filterSymbol,
  filterPnl,
  onSymbolChange,
  onPnlChange
}: PositionFilterProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by symbol..."
          className="pl-8"
          value={filterSymbol}
          onChange={(e) => onSymbolChange(e.target.value)}
        />
      </div>
      <Select value={filterPnl} onValueChange={onPnlChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by P&L" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All P&L</SelectItem>
          <SelectItem value="profit">Profitable</SelectItem>
          <SelectItem value="loss">Loss</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PositionFilter;
