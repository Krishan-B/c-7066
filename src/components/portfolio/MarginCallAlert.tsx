
import React from "react";
import { AlertCircle, AlertTriangle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface MarginCallAlertProps {
  marginLevel: number;
  riskStatus: string;
  onDismiss?: () => void;
  onAddFunds?: () => void;
}

const MarginCallAlert = ({
  marginLevel,
  riskStatus,
  onDismiss,
  onAddFunds
}: MarginCallAlertProps) => {
  // Return null if no alert needed
  if (riskStatus === 'safe') {
    return null;
  }
  
  // Determine alert variant and content based on risk status
  const getAlertContent = () => {
    switch (riskStatus) {
      case 'critical':
        return {
          variant: 'destructive',
          icon: <XCircle className="h-5 w-5" />,
          title: 'Critical Margin Level',
          description: `Your margin level is critically low at ${marginLevel.toFixed(2)}%. Your positions are at risk of immediate liquidation.`,
          buttonText: 'Add Funds Now'
        };
      case 'danger':
        return {
          variant: 'destructive' as const,
          icon: <AlertCircle className="h-5 w-5" />,
          title: 'Margin Call Warning',
          description: `Your margin level has reached ${marginLevel.toFixed(2)}%. Add funds or reduce positions to avoid liquidation.`,
          buttonText: 'Add Funds'
        };
      case 'warning':
      default:
        return {
          variant: 'warning' as const,
          icon: <AlertTriangle className="h-5 w-5" />,
          title: 'Low Margin Level',
          description: `Your margin level is getting low at ${marginLevel.toFixed(2)}%. Consider adding funds to maintain your positions safely.`,
          buttonText: 'Add Funds'
        };
    }
  };
  
  const alertContent = getAlertContent();

  return (
    <Alert variant={alertContent.variant} className="mb-6">
      <div className="flex items-start gap-2">
        {alertContent.icon}
        <div className="flex-1">
          <AlertTitle>{alertContent.title}</AlertTitle>
          <AlertDescription>{alertContent.description}</AlertDescription>
        </div>
        <div className="flex gap-2">
          {onAddFunds && (
            <Button size="sm" variant={riskStatus === 'critical' ? 'destructive' : 'outline'} onClick={onAddFunds}>
              {alertContent.buttonText}
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default MarginCallAlert;
