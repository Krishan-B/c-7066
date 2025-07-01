import React from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Download, Calendar } from "lucide-react";
import { TradeButton } from "@/components/trade";

interface QuickActionsProps {
  onExport: () => void;
  onTaxEvents: () => void;
}

const QuickActions = ({ onExport, onTaxEvents }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <TradeButton
          variant="outline"
          className="w-full justify-start"
          label="Add New Position"
        />
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start"
          onClick={onExport}
        >
          <Download className="h-4 w-4 mr-2" /> Export Report
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-start"
          onClick={onTaxEvents}
        >
          <Calendar className="h-4 w-4 mr-2" /> Set Tax Events
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
