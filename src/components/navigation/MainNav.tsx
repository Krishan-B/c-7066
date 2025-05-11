
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

  // Selected metrics to display in the header
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

  // All metrics for the dropdown
  const allMetrics = [
    ...displayedMetrics,
    { 
      label: "Used Margin", 
      value: formatCurrency(metrics.usedMargin),
      tooltip: "The amount of funds that is held to keep the existing positions open"
    },
    { 
      label: "Realized P&L", 
      value: formatCurrency(metrics.realizedPL),
      tooltip: "Total profit and loss from the closed positions in the trading account"
    },
    { 
      label: "Exposure", 
      value: formatCurrency(metrics.exposure),
      tooltip: "The current market value of the open position multiplied by the position size"
    },
    { 
      label: "Bonus", 
      value: formatCurrency(metrics.bonus),
      tooltip: "Funds introduced by the broker that can be used to trade but are non-withdrawable"
    }
  ];

  return (
    <div className="hidden md:flex flex-1 items-center overflow-x-auto">
      <TooltipProvider>
        <div className="flex items-center gap-4">
          {displayedMetrics.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="p-1 h-auto flex items-center gap-1 text-xs hover:bg-accent" 
                  onClick={handleMetricClick}
                >
                  <span className="font-medium">{item.label}:</span>
                  <span className={`
                    ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) > 0 ? 'text-success' : ''}
                    ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) < 0 ? 'text-destructive' : ''}
                    ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 20 ? 'text-warning' : ''}
                    ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 5 ? 'text-destructive' : ''}
                  `}>{item.value}</span>
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
                className="p-1 h-auto flex items-center gap-1 text-xs hover:bg-accent"
              >
                <span>More</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allMetrics.map((item, index) => (
                <DropdownMenuItem key={index} onClick={handleMetricClick}>
                  <div className="flex justify-between w-full">
                    <span className="font-medium mr-4">{item.label}:</span>
                    <span className={`
                      ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) > 0 ? 'text-success' : ''}
                      ${item.label.includes('P&L') && parseFloat(item.value.replace('$', '')) < 0 ? 'text-destructive' : ''}
                      ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 20 ? 'text-warning' : ''}
                      ${item.label === 'Margin Level' && parseFloat(item.value.replace('%', '')) < 5 ? 'text-destructive' : ''}
                    `}>{item.value}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default MainNav;
