
import { useState } from 'react';
import { FileText, Trash2, Eye, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useKYC } from '@/hooks/useKYC';
import type { KYCDocument } from '@/types/kyc';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

const getDocumentTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    ID_PASSPORT: 'Passport',
    ID_FRONT: 'ID Card (Front)',
    ID_BACK: 'ID Card (Back)',
    DRIVERS_LICENSE: 'Driver\'s License',
    UTILITY_BILL: 'Utility Bill',
    BANK_STATEMENT: 'Bank Statement',
    CREDIT_CARD_STATEMENT: 'Credit Card Statement',
    TAX_BILL: 'Tax Bill',
    OTHER_ID: 'Other ID Document',
    OTHER_ADDRESS: 'Other Address Proof',
    OTHER_DOC: 'Other Document'
  };
  return labels[type] || type;
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    ID_VERIFICATION: 'ID Verification',
    ADDRESS_VERIFICATION: 'Address Verification',
    OTHER_DOCUMENTATION: 'Other Documentation'
  };
  return labels[category] || category;
};

interface DocumentListProps {
  documents: KYCDocument[];
}

const DocumentList = ({ documents }: DocumentListProps) => {
  const { deleteDocument } = useKYC();
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);

  const handleDelete = async (documentId: string) => {
    await deleteDocument(documentId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
          <p className="text-muted-foreground text-center">
            Upload your verification documents to complete the KYC process
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{getDocumentTypeLabel(document.document_type)}</h4>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(document.category)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Uploaded: {formatDate(document.uploaded_at)}</span>
                  </div>
                  {document.file_name && (
                    <span>File: {document.file_name}</span>
                  )}
                </div>

                {document.comments && (
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-sm">{document.comments}</p>
                  </div>
                )}

                {document.status === 'REJECTED' && document.reviewed_at && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">
                      <strong>Rejected on:</strong> {formatDate(document.reviewed_at)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {getDocumentTypeLabel(document.document_type)}
                      </DialogTitle>
                      <DialogDescription>
                        {getCategoryLabel(document.category)} • {document.status}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      {document.file_name?.toLowerCase().endsWith('.pdf') ? (
                        <embed
                          src={document.file_url}
                          type="application/pdf"
                          width="100%"
                          height="600px"
                          className="border rounded-md"
                        />
                      ) : (
                        <img
                          src={document.file_url}
                          alt={getDocumentTypeLabel(document.document_type)}
                          className="max-w-full h-auto border rounded-md"
                        />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {document.status === 'PENDING' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
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
                          onClick={() => handleDelete(document.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentList;
