
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KYCDocument } from "@/services/kyc/types";

interface DocumentUploadProps {
  onUpload: (file: File, documentType: KYCDocument['document_type']) => void;
  isUploading: boolean;
}

const DocumentUpload = ({ onUpload, isUploading }: DocumentUploadProps) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState<KYCDocument['document_type']>('passport');
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    
    if (acceptedFiles.length === 0) {
      setError('Please select a valid file (JPEG, PNG, or PDF)');
      return;
    }

    const file = acceptedFiles[0];
    
    if (!file) {
      setError('No file selected');
      return;
    }
    
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    onUpload(file, selectedDocumentType);
  }, [onUpload, selectedDocumentType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isUploading
  });

  const documentTypeLabels = {
    passport: 'Passport',
    id_card: 'National ID Card',
    drivers_license: "Driver's License",
    proof_of_address: 'Proof of Address'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload your identification documents for verification. Supported formats: JPEG, PNG, PDF (max 10MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Document Type</label>
          <Select 
            value={selectedDocumentType} 
            onValueChange={(value) => setSelectedDocumentType(value as KYCDocument['document_type'])}
            disabled={isUploading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            
            <div>
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to select a file
              </p>
            </div>
            
            <Button variant="outline" disabled={isUploading}>
              <FileText className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Accepted formats: JPEG, PNG, PDF</p>
          <p>• Maximum file size: 10MB</p>
          <p>• For best results, ensure documents are clearly visible and well-lit</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
