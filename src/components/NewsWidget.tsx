
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NewsWidget = () => {
  const news = [
    {
      title: "Bitcoin surges past $67K as institutional adoption increases",
      source: "CryptoNews",
      time: "2 hours ago",
      tag: "Crypto"
    },
    {
      title: "Fed signals potential interest rate cuts later this year",
      source: "MarketWatch",
      time: "4 hours ago",
      tag: "Economy"
    },
    {
      title: "Oil prices stabilize after recent volatility in Middle East",
      source: "Reuters",
      time: "5 hours ago",
      tag: "Commodities"
    },
    {
      title: "Tech stocks rally as AI investments continue to grow",
      source: "Bloomberg",
      time: "6 hours ago",
      tag: "Stocks"
    },
    {
      title: "Dollar weakens against major currencies ahead of jobs data",
      source: "Financial Times",
      time: "7 hours ago",
      tag: "Forex"
    }
  ];

  return (
    <div className="space-y-4">
      {news.map((item, index) => (
        <div key={index} className="border-b border-secondary/40 pb-3 last:border-0">
          <div className="flex gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded bg-secondary/60 text-muted-foreground">
              {item.tag}
            </span>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
          <h3 className="font-medium text-sm mb-1">{item.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{item.source}</span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Read <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </div>
        </div>
      ))}
      <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
        View All News
      </Button>
    </div>
  );
};

export default NewsWidget;
