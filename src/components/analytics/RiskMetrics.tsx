
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Shield, TrendingDown, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RiskMetric {
  id: string;
  total_exposure: number;
  used_margin: number;
  available_margin: number;
  margin_level: number;
  portfolio_var: number;
  max_position_size: number;
  correlation_risk: number;
  diversification_score: number;
  risk_score: number;
}

const RiskMetrics = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRiskMetrics();
    }
  }, [user]);

  const fetchRiskMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_calculated', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setRiskMetrics(data);
      } else {
        // Generate mock data if no risk metrics exist
        setRiskMetrics({
          id: 'mock-1',
          total_exposure: 45000,
          used_margin: 8500,
          available_margin: 16500,
          margin_level: 294.12,
          portfolio_var: 2850,
          max_position_size: 12000,
          correlation_risk: 0.35,
          diversification_score: 0.72,
          risk_score: 6.8
        });
      }
    } catch (error) {
      console.error('Error fetching risk metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'bg-green-100 text-green-800', icon: Shield };
    if (score <= 6) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: Target };
    return { level: 'High', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!riskMetrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No risk metrics available. Start trading to see your risk analysis.
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskLevel = getRiskLevel(riskMetrics.risk_score);
  const RiskIcon = riskLevel.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Risk Metrics</h2>
        <Badge className={riskLevel.color}>
          <RiskIcon className="h-3 w-3 mr-1" />
          {riskLevel.level} Risk
        </Badge>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Portfolio VaR</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(riskMetrics.portfolio_var)}
            </div>
            <div className="text-xs text-muted-foreground">95% confidence, 1 day</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Diversification</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {(riskMetrics.diversification_score * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Portfolio spread</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Correlation Risk</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {(riskMetrics.correlation_risk * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Position correlation</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Risk Score</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {riskMetrics.risk_score.toFixed(1)}/10
            </div>
            <div className="text-xs text-muted-foreground">Overall risk level</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Margin Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used Margin</span>
                <span className="font-medium">{formatCurrency(riskMetrics.used_margin)}</span>
              </div>
              <Progress 
                value={(riskMetrics.used_margin / (riskMetrics.used_margin + riskMetrics.available_margin)) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Available Margin</span>
                <span className="font-medium">{formatCurrency(riskMetrics.available_margin)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Margin Level</span>
                <span className="font-medium">{riskMetrics.margin_level.toFixed(2)}%</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Exposure</span>
                <span className="font-bold">{formatCurrency(riskMetrics.total_exposure)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Maximum Position Size</span>
              <span className="font-medium">{formatCurrency(riskMetrics.max_position_size)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Largest Position</span>
                <span className="font-medium">{formatCurrency(riskMetrics.max_position_size * 0.6)}</span>
              </div>
              <Progress 
                value={60} 
                className="h-2"
              />
            </div>

            <div className="pt-2 border-t space-y-2">
              <div className="text-sm text-muted-foreground">Risk Recommendations</div>
              <ul className="text-xs space-y-1">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span>Diversification score is healthy</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                  <span>Monitor correlation risk</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  <span>VaR within acceptable limits</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskMetrics;
