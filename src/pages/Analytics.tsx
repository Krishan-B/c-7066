
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RiskMetrics from '@/components/analytics/RiskMetrics';
import PerformanceAnalytics from '@/components/analytics/PerformanceAnalytics';
import ReportingDashboard from '@/components/analytics/ReportingDashboard';

const Analytics = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Enhanced Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Risk metrics, performance analytics, and comprehensive reporting
        </p>
      </div>
      
      <Tabs defaultValue="risk" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="risk" className="space-y-6">
          <RiskMetrics />
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <PerformanceAnalytics />
        </TabsContent>
        
        <TabsContent value="reporting" className="space-y-6">
          <ReportingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
