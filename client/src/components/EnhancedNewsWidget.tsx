import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpRight, ChevronDown, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  image_url?: string;
  published_at: string;
  market_type: string;
  related_symbols: string[];
  sentiment?: string;
}

interface EnhancedNewsWidgetProps {
  marketType?: string;
  className?: string;
}

const EnhancedNewsWidget = ({ marketType, className }: EnhancedNewsWidgetProps) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.functions.invoke('fetch-market-news', {
        body: { market_type: marketType },
      });

      if (error) throw error;

      if (data?.data) {
        setNews(data.data);
      }
    } catch (error) {
      console.error('Error fetching market news:', error);
      toast({
        title: 'Error',
        description: 'Failed to load market news.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [marketType, toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const pubDate = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / (60 * 24))}d ago`;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'mixed':
      default:
        return 'text-amber-500';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-medium">Market News</h3>
          <Button variant="outline" size="sm" className="gap-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs">Latest</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {news.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No news available</div>
          ) : (
            <ul className="divide-y divide-border">
              {news.map((item) => (
                <li key={item.id} className="p-4 hover:bg-muted/50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium">
                        {item.market_type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {formatTime(item.published_at)}
                      </span>
                    </div>
                    <h4 className="line-clamp-2 text-sm font-medium">{item.title}</h4>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.source}</span>
                        {item.sentiment && (
                          <span className={`text-xs ${getSentimentColor(item.sentiment)}`}>
                            • {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ArrowUpRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsWidget;
