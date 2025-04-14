
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PortfolioAsset {
  symbol: string;
  divident: string;
  chgPercentage: string;
  pepRatio: string;
}

interface WatchlistAsset {
  asset: string;
  price: string;
  chgPercentage: string;
  chgAmount: string;
  volume: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Dummy data for portfolio summary
  const portfolioAssets: PortfolioAsset[] = [
    { symbol: "NVDA", divident: "0.49", chgPercentage: "Chg %", pepRatio: "P/EP" },
    { symbol: "AMZN", divident: "0.62", chgPercentage: "Chg %", pepRatio: "Ratio" }
  ];

  // Dummy data for watchlist
  const watchlistAssets: WatchlistAsset[] = [
    { asset: "HEC", price: "89.23", chgPercentage: "1.2%", chgAmount: "+0.34", volume: "1.2M" },
    { asset: "CMS", price: "124.54", chgPercentage: "-0.8%", chgAmount: "-0.67", volume: "873K" },
    { asset: "CNVX", price: "45.12", chgPercentage: "2.1%", chgAmount: "+0.92", volume: "2.5M" }
  ];

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Divident</TableHead>
                  <TableHead className="text-right">Chg %</TableHead>
                  <TableHead className="text-right">P/EP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioAssets.map((asset) => (
                  <TableRow key={asset.symbol}>
                    <TableCell className="font-medium">{asset.symbol}</TableCell>
                    <TableCell className="text-right">{asset.divident}</TableCell>
                    <TableCell className="text-right">{asset.chgPercentage}</TableCell>
                    <TableCell className="text-right">{asset.pepRatio}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Watchlist</h2>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Chg %</TableHead>
                  <TableHead className="text-right">Chg</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlistAssets.map((asset) => (
                  <TableRow key={asset.asset}>
                    <TableCell className="font-medium">{asset.asset}</TableCell>
                    <TableCell className="text-right">{asset.price}</TableCell>
                    <TableCell className={`text-right ${asset.chgPercentage.startsWith('-') ? 'text-warning' : 'text-success'}`}>
                      {asset.chgPercentage.startsWith('-') ? 
                        <span className="flex items-center justify-end"><ChevronDown className="w-4 h-4 mr-1" />{asset.chgPercentage.substring(1)}</span> : 
                        <span className="flex items-center justify-end"><ChevronUp className="w-4 h-4 mr-1" />{asset.chgPercentage}</span>
                      }
                    </TableCell>
                    <TableCell className={`text-right ${asset.chgAmount.startsWith('-') ? 'text-warning' : 'text-success'}`}>
                      {asset.chgAmount}
                    </TableCell>
                    <TableCell className="text-right">{asset.volume}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
