
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MarketSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const MarketSearch = ({ searchTerm, setSearchTerm }: MarketSearchProps) => {
  return (
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
  );
};

export default MarketSearch;
