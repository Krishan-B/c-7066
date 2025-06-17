import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  UserRiskService,
  type UserRiskProfile,
  type RiskFactor,
  type RiskLevel,
} from '@/services/security/UserRiskService';
import { AlertTriangle, RefreshCw, Shield, Activity } from 'lucide-react';

const getRiskLevelColor = (level: RiskLevel) => {
  const colors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
  };
  return colors[level];
};

export function UserRiskMonitor() {
  const [highRiskUsers, setHighRiskUsers] = useState<UserRiskProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadHighRiskUsers = useCallback(async () => {
    try {
      const users = await UserRiskService.getHighRiskUsers();
      setHighRiskUsers(users);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to load high risk users: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadRiskFactors = useCallback(
    async (email: string) => {
      try {
        const factors = await UserRiskService.getRiskFactors(email);
        setRiskFactors(factors);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({
          title: 'Error',
          description: `Failed to load risk factors: ${errorMessage}`,
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    loadHighRiskUsers();
    const intervalId = setInterval(loadHighRiskUsers, 60000); // Refresh every minute
    return () => clearInterval(intervalId);
  }, [loadHighRiskUsers]);

  useEffect(() => {
    if (selectedUser) {
      loadRiskFactors(selectedUser);
    } else {
      setRiskFactors([]);
    }
  }, [selectedUser, loadRiskFactors]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            High Risk Users
          </CardTitle>
          <CardDescription>Monitor users with elevated risk levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={() => loadHighRiskUsers()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Failed Attempts</TableHead>
                  <TableHead>Suspicious Activities</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRiskUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRiskLevelColor(user.risk_level)}>
                        {user.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.risk_score}/100</TableCell>
                    <TableCell>{user.failed_attempts}</TableCell>
                    <TableCell>{user.suspicious_activities}</TableCell>
                    <TableCell>{new Date(user.last_updated).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user.email)}>
                        <Activity className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {highRiskUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No high risk users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Factors for {selectedUser}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {riskFactors.map((factor) => (
                        <TableRow key={`${factor.factor_type}-${factor.timestamp}`}>
                          <TableCell>{new Date(factor.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{factor.factor_type}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                factor.weight > 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }
                            >
                              {factor.weight > 0 ? '+' : ''}
                              {factor.weight}
                            </Badge>
                          </TableCell>
                          <TableCell>{factor.description}</TableCell>
                        </TableRow>
                      ))}
                      {riskFactors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No risk factors found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
