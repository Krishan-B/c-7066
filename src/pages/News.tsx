import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Card } from "@/shared/ui/card";
import EnhancedNewsWidget from "@/components/EnhancedNewsWidget";
import AlertsWidget from "@/components/AlertsWidget";

const News = () => {
  const [activeTab, setActiveTab] = useState("market-news");

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">News & Market Insights</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest market news, alerts, and economic
            events
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="market-news">Market News</TabsTrigger>
            <TabsTrigger value="alerts">Market Alerts</TabsTrigger>
            <TabsTrigger value="economic-calendar">
              Economic Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market-news" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Latest Market News</h2>
              <EnhancedNewsWidget />
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Market Alerts</h2>
              <AlertsWidget />
            </Card>
          </TabsContent>

          <TabsContent value="economic-calendar" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Economic Calendar</h2>
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <p className="text-muted-foreground">
                  Connect your API key to access the economic calendar data
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default News;
