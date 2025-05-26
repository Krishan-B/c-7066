
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Shield, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRiskLevel, RISK_LEVELS } from '@/utils/riskManagementUtils';

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
  marginStatus
}: RiskManagementPanelProps) => {
  const { text, color } = formatRiskLevel(marginStatus);
  
  // Calculate progress color based on margin level
  const getProgressColor = () => {
    if (marginLevel > 100) return 'bg-green-500';
    if (marginLevel > 50) return 'bg-amber-500';
    if (marginLevel > 20) return 'bg-red-500';
    return 'bg-red-700';
  };
  
  // Calculate liquidation threshold
  const liquidationThreshold = usedMargin * 0.2; // 20% of used margin
  const marginCallThreshold = usedMargin * 0.5; // 50% of used margin
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Risk Management</CardTitle>
          <Badge variant={marginStatus === RISK_LEVELS.SAFE ? 'default' : 'destructive'}>
            {text}
          </Badge>
        </div>
        <CardDescription>
          Monitor your account risk levels and margin status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Margin Level Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Margin Level:</span>
            </div>
            <span className={`font-bold ${color}`}>{marginLevel.toFixed(2)}%</span>
          </div>
          <Progress
            value={Math.min(marginLevel, 150)}
            max={150}
            className="h-2"
            indicatorClassName={getProgressColor()}
          />
        </div>
        
        {/* Risk Thresholds */}
        <div className="grid grid-cols-2 gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col p-3 rounded-md border bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-xs">Margin Call</span>
                  </div>
                  <span className="font-bold">{marginCallThreshold.toFixed(2)} USD</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>When equity falls to this level, you'll receive a margin call warning</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col p-3 rounded-md border bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-xs">Liquidation</span>
                  </div>
                  <span className="font-bold">{liquidationThreshold.toFixed(2)} USD</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>When equity falls to this level, positions will be automatically liquidated</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Risk Status */}
        <div className="flex items-start gap-2 p-3 rounded-md bg-muted text-sm">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            {marginStatus === RISK_LEVELS.SAFE ? (
              <p>Your account has a healthy margin level. You have room to open more positions.</p>
            ) : marginStatus === RISK_LEVELS.WARNING ? (
              <p className="text-amber-500">Your margin level is getting low. Consider adding funds or closing some positions.</p>
            ) : marginStatus === RISK_LEVELS.DANGER ? (
              <p className="text-destructive">Margin call warning! Add funds or reduce positions to avoid liquidation.</p>
            ) : (
              <p className="text-destructive font-bold">Liquidation risk! Your positions may be automatically closed if equity decreases further.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskManagementPanel;
