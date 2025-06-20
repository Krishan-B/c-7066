
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, FileText, Calendar as CalendarIcon, Filter, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ReportConfig {
  type: string;
  period: string;
  format: string;
  includeCharts: boolean;
  includePositions: boolean;
  includeRisk: boolean;
}

const ReportingDashboard = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'comprehensive',
    period: '1m',
    format: 'pdf',
    includeCharts: true,
    includePositions: true,
    includeRisk: true
  });
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [generating, setGenerating] = useState(false);

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Report', description: 'All trading data and analytics' },
    { value: 'performance', label: 'Performance Report', description: 'P&L and trading statistics' },
    { value: 'risk', label: 'Risk Report', description: 'Risk metrics and exposure analysis' },
    { value: 'tax', label: 'Tax Report', description: 'Tax-optimized trade summary' },
    { value: 'regulatory', label: 'Regulatory Report', description: 'Compliance and disclosure' }
  ];

  const periods = [
    { value: '1w', label: 'Last Week' },
    { value: '1m', label: 'Last Month' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${getReportTypeName(reportConfig.type)} generated successfully`);
      
      // In a real implementation, this would trigger a download
      console.log('Report generated with config:', reportConfig);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const scheduleReport = () => {
    toast.success('Report scheduled for weekly delivery');
  };

  const shareReport = () => {
    toast.success('Report sharing link copied to clipboard');
  };

  const getReportTypeName = (type: string) => {
    return reportTypes.find(rt => rt.value === type)?.label || 'Report';
  };

  const quickReports = [
    { name: 'Today\'s Activity', description: 'Current day trading summary', icon: FileText },
    { name: 'Weekly Summary', description: 'Last 7 days performance', icon: FileText },
    { name: 'Monthly P&L', description: 'Monthly profit & loss report', icon: FileText },
    { name: 'Risk Assessment', description: 'Current risk exposure', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reporting Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={scheduleReport}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button variant="outline" onClick={shareReport}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickReports.map((report, index) => {
              const IconComponent = report.icon;
              return (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-secondary/40 cursor-pointer transition-colors"
                  onClick={() => {
                    toast.success(`Generating ${report.name}...`);
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">{report.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Report Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select 
                value={reportConfig.type} 
                onValueChange={(value) => setReportConfig(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select 
                value={reportConfig.period} 
                onValueChange={(value) => setReportConfig(prev => ({ ...prev, period: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select 
                value={reportConfig.format} 
                onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportConfig.period === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Date Range</label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? format(dateRange.from, 'PPP') : 'From date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <span className="text-muted-foreground">to</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? format(dateRange.to, 'PPP') : 'To date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium">Include Sections</label>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={reportConfig.includeCharts ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setReportConfig(prev => ({ ...prev, includeCharts: !prev.includeCharts }))}
              >
                Charts & Graphs
              </Badge>
              <Badge 
                variant={reportConfig.includePositions ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setReportConfig(prev => ({ ...prev, includePositions: !prev.includePositions }))}
              >
                Position Details
              </Badge>
              <Badge 
                variant={reportConfig.includeRisk ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setReportConfig(prev => ({ ...prev, includeRisk: !prev.includeRisk }))}
              >
                Risk Metrics
              </Badge>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={generateReport}
              disabled={generating}
              className="min-w-[120px]"
            >
              {generating ? (
                <>Generating...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Monthly Performance Report', type: 'Performance', date: '2024-12-01', size: '2.4 MB' },
              { name: 'Risk Assessment Report', type: 'Risk', date: '2024-11-28', size: '1.8 MB' },
              { name: 'Comprehensive Trading Report', type: 'Comprehensive', date: '2024-11-25', size: '4.2 MB' },
              { name: 'Tax Summary Report', type: 'Tax', date: '2024-11-20', size: '1.2 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.type} • {report.date} • {report.size}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportingDashboard;
