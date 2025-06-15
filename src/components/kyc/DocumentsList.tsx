import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Download, Clock, CheckCircle, XCircle } from 'lucide-react';
import { type KYCDocument } from '@/services/kyc/types';
import { KYCService } from '@/services/kyc/kycService';
import { useToast } from '@/hooks/use-toast';
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

interface DocumentsListProps {
  documents: KYCDocument[];
  onDelete: (documentId: string) => void;
  isDeleting: boolean;
}

const DocumentsList = ({ documents, onDelete, isDeleting }: DocumentsListProps) => {
  const { toast } = useToast();

  const handleDownload = async (document: KYCDocument) => {
    try {
      const url = await KYCService.getDocumentUrl(document.document_url);
      window.open(url, '_blank');
    } catch {
      toast({
        title: 'Download failed',
        description: 'Unable to download the document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: KYCDocument['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: KYCDocument['status']) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const documentTypeLabels = {
    passport: 'Passport',
    id_card: 'National ID Card',
    drivers_license: "Driver's License",
    proof_of_address: 'Proof of Address',
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>No documents uploaded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Upload your first document to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Documents</CardTitle>
        <CardDescription>Manage your uploaded verification documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{documentTypeLabels[document.document_type]}</h4>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(document.status)}
                      <Badge variant={getStatusVariant(document.status)}>{document.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {document.file_name} • {formatFileSize(document.file_size)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                  </p>
                  {document.status === 'rejected' && document.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1">Reason: {document.rejection_reason}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(document)}>
                  <Download className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Document</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this document? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(document.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsList;
