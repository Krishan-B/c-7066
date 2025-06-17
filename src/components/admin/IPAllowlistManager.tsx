import { useCallback, useEffect, useState } from 'react';
import { IPAllowlistService, type IPAllowlistEntry } from '@/services/security/IPAllowlistService';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Shield, ShieldCheck, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  ipRange: z.string().refine((val) => IPAllowlistService.validateIPRange(val), {
    message: 'Invalid IP range format. Use single IP or CIDR notation (e.g., 192.168.1.0/24)',
  }),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
});

export function IPAllowlistManager() {
  const [entries, setEntries] = useState<IPAllowlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ipRange: '',
      description: '',
      expiresAt: '',
    },
  });

  const loadEntries = useCallback(async () => {
    try {
      const data = await IPAllowlistService.getAllEntries();
      setEntries(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to load IP allowlist: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await IPAllowlistService.addEntry(
        values.ipRange,
        values.description,
        values.expiresAt ? new Date(values.expiresAt) : undefined
      );
      toast({
        title: 'Success',
        description: 'IP range added to allowlist',
      });
      setShowAddDialog(false);
      form.reset();
      loadEntries();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to add IP range: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveEntry = async (id: string) => {
    try {
      await IPAllowlistService.removeEntry(id);
      toast({
        title: 'Success',
        description: 'IP range removed from allowlist',
      });
      loadEntries();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to remove IP range: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IP Allowlist Management
          </CardTitle>
          <CardDescription>
            Manage IP addresses and ranges that bypass rate limiting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Add IP Range
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add IP Range to Allowlist</DialogTitle>
                  <DialogDescription>
                    Enter an IP address or range in CIDR notation (e.g., 192.168.1.0/24)
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ipRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP Range</FormLabel>
                          <FormControl>
                            <Input placeholder="192.168.1.0/24" {...field} />
                          </FormControl>
                          <FormDescription>
                            Use CIDR notation for ranges or single IP addresses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Office network" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expires At (Optional)</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit">Add to Allowlist</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={loadEntries} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Range</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Use Count</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.ip_range}</TableCell>
                    <TableCell>{entry.description ?? '-'}</TableCell>
                    <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {entry.expires_at ? new Date(entry.expires_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>{entry.use_count}</TableCell>
                    <TableCell>
                      {entry.last_used_at
                        ? new Date(entry.last_used_at).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {entries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No IP ranges in allowlist
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
