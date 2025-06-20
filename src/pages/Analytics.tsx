
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeverageAnalytics from '@/components/analytics/LeverageAnalytics';
import MarginOptimizer from '@/components/analytics/MarginOptimizer';

const Analytics = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Enhanced Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Advanced analytics for asset-specific leverage ratios and margin optimization
        </p>
      </div>
      
      <Tabs defaultValue="leverage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leverage">Leverage Analytics</TabsTrigger>
          <TabsTrigger value="optimizer">Margin Optimizer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leverage" className="space-y-6">
          <LeverageAnalytics />
        </TabsContent>
        
        <TabsContent value="optimizer" className="space-y-6">
          <MarginOptimizer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
