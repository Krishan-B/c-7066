import { useState } from 'react';
import type { ConsentType, DataRequestType } from '@/services/gdpr/GDPRService';
import { AlertTriangle, Download, Lock, RefreshCw, Shield } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGDPR } from '@/hooks/use-gdpr';

const CONSENT_TYPES: { type: ConsentType; description: string }[] = [
  {
    type: 'ESSENTIAL',
    description: 'Required for basic account functionality and security',
  },
  {
    type: 'FUNCTIONAL',
    description: 'Enables enhanced features and personalization',
  },
  {
    type: 'ANALYTICS',
    description: 'Helps us improve our service through anonymous usage data',
  },
  {
    type: 'MARKETING',
    description: 'Allows us to send you relevant offers and updates',
  },
  {
    type: 'THIRD_PARTY',
    description: 'Enables integration with third-party services',
  },
];

const REQUEST_TYPES: { type: DataRequestType; description: string }[] = [
  {
    type: 'ACCESS',
    description: 'View all personal data we hold about you',
  },
  {
    type: 'EXPORT',
    description: 'Download your data in machine-readable format',
  },
  {
    type: 'DELETE',
    description: 'Request complete deletion of your account and data',
  },
  {
    type: 'RECTIFY',
    description: 'Correct inaccurate personal data',
  },
  {
    type: 'RESTRICT',
    description: 'Limit how we process your data',
  },
  {
    type: 'OBJECT',
    description: 'Object to processing of your data',
  },
];

const getStatusClassName = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PROCESSING':
      return 'bg-yellow-100 text-yellow-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function PrivacyCenter() {
  const { consents, requests, loading, updateConsent, createRequest, exportData, deleteAccount } =
    useGDPR();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getConsentStatus = (type: ConsentType) => {
    const consent = consents.find((c) => c.consent_type === type);
    return consent?.granted ?? false;
  };

  return (
    <div className="space-y-6">
      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Preferences
          </CardTitle>
          <CardDescription>Manage how we collect and use your personal data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CONSENT_TYPES.map(({ type, description }) => (
              <div key={type} className="flex items-center justify-between space-x-4">
                <div>
                  <h4 className="font-medium">{type}</h4>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={getConsentStatus(type)}
                  onCheckedChange={(checked) => updateConsent(type, checked)}
                  disabled={type === 'ESSENTIAL' || loading}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Subject Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Your Privacy Rights
          </CardTitle>
          <CardDescription>Exercise your rights under data protection laws</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {REQUEST_TYPES.map(({ type, description }) => (
                <Button
                  key={type}
                  variant="outline"
                  className="flex h-auto flex-col items-start space-y-2 p-4 text-left"
                  onClick={() => createRequest(type)}
                  disabled={loading}
                >
                  <span className="font-medium">{type}</span>
                  <span className="text-sm text-muted-foreground">{description}</span>
                </Button>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={exportData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export All Data
              </Button>

              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={loading}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will initiate the complete deletion of your account and all
                      associated data. This process cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deleteAccount();
                        setShowDeleteConfirm(false);
                      }}
                      className="bg-destructive text-destructive-foreground"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Request History
          </CardTitle>
          <CardDescription>Track the status of your privacy-related requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.request_type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusClassName(request.status)}>{request.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {request.completed_at
                        ? new Date(request.completed_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {request.response_details ?? request.request_details ?? '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No requests found
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
