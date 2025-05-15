
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskManagementPanelProps {
  marginLevel: number;
  equity: number;
  usedMargin: number;
  marginStatus: string;
}

const RiskManagementPanel = ({
  marginLevel,
  equity,
  usedMargin,
  marginStatus,
}: RiskManagementPanelProps) => {
  // Format numbers for display
  const formattedEquity = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(equity);
  
  const formattedUsedMargin = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(usedMargin);
  
  // Calculate margin percentage (capped at 100 for progress bar)
  const marginLevelCapped = Math.min(marginLevel, 200);
  
  // Determine risk level styles and messaging
  const getRiskColor = () => {
    switch(marginStatus) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'danger':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };
  
  const getProgressColor = () => {
    switch(marginStatus) {
      case 'critical':
        return 'bg-red-600';
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };
  
  const getRiskMessage = () => {
    switch(marginStatus) {
      case 'critical':
        return 'IMMEDIATE ACTION REQUIRED: Your positions are at risk of automatic liquidation. Add funds or close positions immediately.';
      case 'danger':
        return 'MARGIN CALL: Your account equity is critically low. Add funds or reduce positions to avoid liquidation.';
      case 'warning':
        return 'CAUTION: Your margin level is approaching unsafe levels. Consider adding funds or reducing position sizes.';
      default:
        return 'Your account has a healthy margin level. Risk is well managed.';
    }
  };
  
  const getRiskIcon = () => {
    switch(marginStatus) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5" />;
      case 'danger':
        return <AlertTriangle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader className={cn("rounded-t-lg", getRiskColor())}>
        <CardTitle className="flex items-center gap-2 text-white">
          {getRiskIcon()}
          <span>Risk Management</span>
        </CardTitle>
        <CardDescription className="text-white opacity-90">
          Margin Level: {marginLevel.toFixed(2)}%
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Margin Level</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="underline decoration-dotted">
                      {marginLevel.toFixed(2)}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Margin level is the ratio of equity to used margin, expressed as a percentage. 
                      A higher percentage indicates lower risk.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Progress 
              value={marginLevelCapped / 2} 
              className="h-2" 
              indicatorClassName={getProgressColor()}
            />
          </div>
          
          <div className="border rounded-md p-3">
            <div className="text-sm font-medium mb-2">Account Metrics</div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Equity:</span>
              <span className="text-right font-medium">{formattedEquity}</span>
              <span className="text-muted-foreground">Used Margin:</span>
              <span className="text-right font-medium">{formattedUsedMargin}</span>
            </div>
          </div>
          
          <div className={cn("text-sm p-3 rounded-md", {
            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': marginStatus === 'critical' || marginStatus === 'danger',
            'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300': marginStatus === 'warning',
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': marginStatus === 'safe',
          })}>
            {getRiskMessage()}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p className="mb-1">Risk Levels:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Critical: Below 50% - Immediate liquidation risk</li>
              <li>Danger: 50-80% - Margin call zone</li>
              <li>Warning: 80-120% - Caution advised</li>
              <li>Safe: Above 120% - Well-capitalized</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskManagementPanel;
