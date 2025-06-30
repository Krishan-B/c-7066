import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RiskMetrics from "@/components/analytics/RiskMetrics";
import PerformanceAnalytics from "@/components/analytics/PerformanceAnalytics";
import ReportingDashboard from "@/components/analytics/ReportingDashboard";
import LeverageAnalytics from "@/components/analytics/LeverageAnalytics";
import LeverageManager from "@/components/leverage/LeverageManager";
import { withErrorBoundary } from "@/components/hoc/withErrorBoundary";

const AnalyticsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Enhanced Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Risk metrics, performance analytics, leverage management, and
          comprehensive reporting
        </p>
      </div>

      <Tabs defaultValue="risk" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leverage">Leverage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="mt-6">
          <RiskMetrics />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <PerformanceAnalytics />
        </TabsContent>

        <TabsContent value="leverage" className="mt-6">
          <div className="grid gap-6">
            <LeverageAnalytics />
            <LeverageManager />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AnalyticsWrapped = withErrorBoundary(AnalyticsPage, "analytics_page");
export { AnalyticsWrapped as Analytics };
export default AnalyticsWrapped;
