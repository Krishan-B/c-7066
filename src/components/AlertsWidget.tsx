
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, BellOff, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface PriceAlert {
  id: string;
  assetSymbol: string;
  assetName: string;
  targetPrice: number;
  currentPrice: number;
  marketType: string;
  createdAt: string;
  triggered: boolean;
}

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  
  // Load alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);
  
  // Remove alert handler
  const removeAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(updatedAlerts));
  };
  
  // Format date 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <BellOff className="w-10 h-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No price alerts set</p>
        <p className="text-xs text-muted-foreground mt-1">Set alerts for assets to receive notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-secondary/10 p-3 rounded-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="font-medium">{alert.assetName} ({alert.assetSymbol})</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Target: ${alert.targetPrice.toFixed(2)} • Current: ${alert.currentPrice.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Set on {formatDate(alert.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-sm ${alert.targetPrice > alert.currentPrice ? 'text-success' : 'text-warning'}`}>
              {alert.targetPrice > alert.currentPrice ? (
                <div className="flex items-center">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {(((alert.targetPrice - alert.currentPrice) / alert.currentPrice) * 100).toFixed(1)}%
                </div>
              ) : (
                <div className="flex items-center">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  {(((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100).toFixed(1)}%
                </div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => removeAlert(alert.id)}
            >
              ✕
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsWidget;
