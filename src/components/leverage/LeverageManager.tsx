
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Calculator, BarChart3 } from 'lucide-react';
import LeverageCalculator from './LeverageCalculator';
import MarginTracker from './MarginTracker';

interface LeverageManagerProps {
  assetClass?: string;
  symbol?: string;
  positionValue?: number;
}

const LeverageManager = ({ 
  assetClass = 'crypto',
  symbol = 'BTC',
  positionValue = 1000
}: LeverageManagerProps) => {
  const [calculationResult, setCalculationResult] = useState<any>(null);

  const handleCalculationChange = (calculation: any) => {
    setCalculationResult(calculation);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Leverage Calculator
          </TabsTrigger>
          <TabsTrigger value="tracker" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Margin Tracker
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LeverageCalculator
              assetClass={assetClass}
              symbol={symbol}
              positionValue={positionValue}
              onCalculationChange={handleCalculationChange}
            />
            
            {/* Calculation Summary */}
            {calculationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Calculation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 font-medium">Leverage Applied</div>
                      <div className="text-xl font-bold text-blue-800">
                        {calculationResult.leverage_used}:1
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 font-medium">Margin Efficiency</div>
                      <div className="text-xl font-bold text-green-800">
                        {((calculationResult.leverage_used / calculationResult.max_leverage) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Maximum Available:</span>
                      <span className="font-medium">{calculationResult.max_leverage}:1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Margin Requirement:</span>
                      <span className="font-medium">
                        {((1 / calculationResult.leverage_used) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Position Multiplier:</span>
                      <span className="font-medium">×{calculationResult.leverage_used}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="tracker" className="space-y-6">
          <MarginTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeverageManager;
