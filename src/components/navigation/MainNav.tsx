
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

// Types for account metrics
interface AccountMetrics {
  balance: number;
  equity: number;
  unrealizedPL: number;
  marginLevel: number;
  usedMargin: number;
  realizedPL: number;
  availableFunds: number;
  exposure: number;
  bonus: number;
  buyingPower: number;
}

// Mock data - This would normally come from an API
const mockAccountMetrics: AccountMetrics = {
  balance: 10000,
  equity: 10250,
  unrealizedPL: 250,
  marginLevel: 85,
  usedMargin: 1200,
  realizedPL: 750,
  availableFunds: 8800,
  exposure: 12000,
  bonus: 500,
  buyingPower: 20000
}

const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = React.useState<AccountMetrics>(mockAccountMetrics);

  // This would be replaced with a real API call or websocket connection
  React.useEffect(() => {
    // Simulated real-time updates (just for demo)
    const interval = setInterval(() => {
      // Small random fluctuations to simulate real-time changes
      const randomChange = () => (Math.random() - 0.5) * 20;
      
      setMetrics(prev => ({
        ...prev,
        unrealizedPL: Math.round((prev.unrealizedPL + randomChange()) * 100) / 100,
        equity: Math.round((prev.balance + prev.unrealizedPL + randomChange()) * 100) / 100,
        marginLevel: Math.round(Math.max(0, (prev.marginLevel + (Math.random() - 0.5) * 2)) * 10) / 10,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Format currency with $ and 2 decimal places
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  // Navigate to portfolio page when a metric is clicked
  const handleMetricClick = () => {
    navigate("/portfolio");
  };

  // Don't display metrics if user is not logged in
  if (!user) {
    return <div className="hidden md:flex flex-1"></div>;
  }

  // Selected metrics to display in the header (based on the reference image)
  const displayedMetrics = [
    { 
      label: "Unrealized P&L", 
      value: formatCurrency(metrics.unrealizedPL),
      tooltip: "Total profit and loss from the open positions in the trading account"
    },
    { 
      label: "Margin Level", 
      value: `${metrics.marginLevel}%`,
      tooltip: "Indicates whether there are sufficient funds to keep the positions open"
    },
    { 
      label: "Account Equity", 
      value: formatCurrency(metrics.equity),
      tooltip: "The sum of the balance and unrealized P&L"
    },
    { 
      label: "Balance", 
      value: formatCurrency(metrics.balance),
      tooltip: "The deposit and the realized P&L in the trading account"
    },
    { 
      label: "Available", 
      value: formatCurrency(metrics.availableFunds),
      tooltip: "The amount of funds that can be used to open new trades"
    }
  ];

  // All metrics for the dropdown (based on the reference images)
  const allMetrics = [
    {
      label: "Buying Power",
      value: formatCurrency(metrics.buyingPower),
      tooltip: "Your available margin multiplied by the maximum leverage rate of your trading account"
    },
    { 
      label: "Unrealized P&L", 
      value: formatCurrency(metrics.unrealizedPL),
      tooltip: "Total profit and loss from the open positions in the trading account"
    },
    { 
      label: "Realized P&L", 
      value: formatCurrency(metrics.realizedPL),
      tooltip: "Total profit and loss from the closed positions in the trading account"
    },
    { 
      label: "Balance", 
      value: formatCurrency(metrics.balance),
      tooltip: "Your deposits and the realized P&L in your trading account"
    },
    { 
      label: "Available", 
      value: formatCurrency(metrics.availableFunds),
      tooltip: "The amount of funds in your trading account that you can use to open new or additional trades"
    },
    { 
      label: "Used", 
      value: formatCurrency(metrics.usedMargin),
      tooltip: "The amount of funds in your trading account that is held to keep your existing positions open"
    },
    { 
      label: "Exposure", 
      value: formatCurrency(metrics.exposure),
      tooltip: "The current market value of your open position multiplied by the position size converted to your trading account currency"
    },
    { 
      label: "Margin Level", 
      value: `${metrics.marginLevel}%`,
      tooltip: "Indicates whether there are sufficient funds to keep your positions open in your trading account. When your margin level drops below 1%, you will be notified"
    },
    { 
      label: "Account Equity", 
      value: formatCurrency(metrics.equity),
      tooltip: "The sum of your balance and unrealized P&L"
    }
  ];

  return (
    <div className="hidden md:flex flex-1 items-center overflow-x-auto">
      <TooltipProvider>
        <div className="flex items-center gap-6">
          {displayedMetrics.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto flex flex-col items-center hover:bg-transparent" 
                  onClick={handleMetricClick}
                >
                  <span className={`text-base font-semibold
                    ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) > 0 ? 'text-success' : ''}
                    ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) < 0 ? 'text-destructive' : ''}
                    ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 20 ? 'text-warning' : ''}
                    ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 5 ? 'text-destructive' : ''}
                  `}>{item.value}</span>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto flex items-center hover:bg-transparent"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background w-[400px] p-4">
              <div className="font-semibold text-lg mb-2 border-b pb-2">Account Details</div>
              <div className="space-y-4">
                {allMetrics.map((item, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    onClick={handleMetricClick}
                    className="flex flex-col items-start cursor-pointer p-0 focus:bg-transparent hover:bg-transparent"
                  >
                    <div className="flex w-full">
                      <span className="font-semibold text-base mr-3">{item.value}</span>
                      <span className="font-semibold text-base">{item.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.tooltip}</p>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MainNav;
