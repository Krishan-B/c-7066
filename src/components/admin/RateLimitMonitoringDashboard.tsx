import { useCallback, useEffect, useState } from 'react';
import { RateLimitMonitoring } from '@/services/security/RateLimitMonitoring';
import { RefreshCcw, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';

interface RateLimitEvent {
  id: string;
  created_at: string;
  email: string;
  ip_address: string;
  event_type: string;
  attempts_count: number;
  block_duration_seconds: number;
  user_agent: string;
  country_code: string | null;
  resolved_at: string | null;
}

export function RateLimitMonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<string>('24');
  const [events, setEvents] = useState<RateLimitEvent[]>([]);
  const [activeBlocks, setActiveBlocks] = useState<RateLimitEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadEvents = useCallback(async () => {
    try {
      const [recentEvents, blocks] = await Promise.all([
        RateLimitMonitoring.getRecentEvents(parseInt(timeRange)),
        RateLimitMonitoring.getActiveBlocks(),
      ]);
      setEvents(recentEvents);
      setActiveBlocks(blocks);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to load rate limit events: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, toast]);

  useEffect(() => {
    loadEvents();
    // Refresh data every minute
    const intervalId = setInterval(loadEvents, 60000);
    return () => clearInterval(intervalId);
  }, [loadEvents]);

  const handleResolveBlock = async (eventId: string) => {
    try {
      await RateLimitMonitoring.resolveBlock(eventId, user?.id ?? '');
      toast({
        title: 'Success',
        description: 'Block has been resolved',
      });
      loadEvents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to resolve block: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const getEventStatus = (event: RateLimitEvent) => {
    if (event.resolved_at) {
      return (
        <span className="flex items-center gap-1 text-green-500">
          <ShieldCheck className="h-4 w-4" />
          Resolved
        </span>
      );
    }

    if (event.event_type.includes('BLOCKED')) {
      return (
        <span className="flex items-center gap-1 text-red-500">
          <ShieldAlert className="h-4 w-4" />
          Blocked
        </span>
      );
    }

    return <span className="text-gray-500">-</span>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rate Limit Monitoring
          </CardTitle>
          <CardDescription>Monitor and manage login attempt restrictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last hour</SelectItem>
                <SelectItem value="24">Last 24 hours</SelectItem>
                <SelectItem value="72">Last 3 days</SelectItem>
                <SelectItem value="168">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadEvents} disabled={isLoading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="space-y-6">
            {/* Active Blocks */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                Active Blocks ({activeBlocks.length})
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeBlocks.map((block) => (
                      <TableRow key={block.id}>
                        <TableCell>{block.email}</TableCell>
                        <TableCell>{block.ip_address}</TableCell>
                        <TableCell>{block.event_type}</TableCell>
                        <TableCell>{formatDuration(block.block_duration_seconds)}</TableCell>
                        <TableCell>{block.attempts_count}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveBlock(block.id)}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Resolve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {activeBlocks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No active blocks
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Recent Events */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5" />
                Recent Events
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{new Date(event.created_at).toLocaleString()}</TableCell>
                        <TableCell>{event.email}</TableCell>
                        <TableCell>{event.ip_address}</TableCell>
                        <TableCell>{event.event_type}</TableCell>
                        <TableCell>{event.attempts_count}</TableCell>
                        <TableCell>{getEventStatus(event)}</TableCell>
                      </TableRow>
                    ))}
                    {events.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
