
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useKYC } from '@/hooks/useKYC';
import type { DocumentType, DocumentCategory, DocumentCategoryInfo } from '@/types/kyc';

const DOCUMENT_CATEGORIES: DocumentCategoryInfo[] = [
  {
    category: 'ID_VERIFICATION',
    title: 'ID Verification',
    description: 'Upload government-issued identification documents',
    required: true,
    documentTypes: [
      { value: 'ID_PASSPORT', label: 'Passport', required: false },
      { value: 'ID_FRONT', label: 'ID Card (Front)', required: false },
      { value: 'ID_BACK', label: 'ID Card (Back)', required: false },
      { value: 'DRIVERS_LICENSE', label: 'Driver\'s License', required: false },
      { value: 'OTHER_ID', label: 'Other ID Document', required: false },
    ]
  },
  {
    category: 'ADDRESS_VERIFICATION',
    title: 'Address Verification',
    description: 'Upload proof of address documents',
    required: true,
    documentTypes: [
      { value: 'UTILITY_BILL', label: 'Utility Bill', required: false },
      { value: 'BANK_STATEMENT', label: 'Bank Statement', required: false },
      { value: 'CREDIT_CARD_STATEMENT', label: 'Credit Card Statement', required: false },
      { value: 'TAX_BILL', label: 'Local Authority Tax Bill', required: false },
      { value: 'OTHER_ADDRESS', label: 'Other Address Proof', required: false },
    ]
  },
  {
    category: 'OTHER_DOCUMENTATION',
    title: 'Other Documentation',
    description: 'Upload any additional supporting documents',
    required: false,
    documentTypes: [
      { value: 'OTHER_DOC', label: 'Other Document', required: false },
    ]
  }
];

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('ID_VERIFICATION');
  const [selectedType, setSelectedType] = useState<DocumentType>('ID_PASSPORT');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  
  const { uploadDocument, uploading } = useKYC();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadDocument(selectedFile, selectedType, selectedCategory, comments);
      setSelectedFile(null);
      setComments('');
      onUploadComplete?.();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const selectedCategoryInfo = DOCUMENT_CATEGORIES.find(cat => cat.category === selectedCategory);
  const availableTypes = selectedCategoryInfo?.documentTypes || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Select document type and upload your verification documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Document Category</Label>
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => {
              setSelectedCategory(value as DocumentCategory);
              // Reset document type when category changes
              const newCategory = DOCUMENT_CATEGORIES.find(cat => cat.category === value);
              if (newCategory && newCategory.documentTypes.length > 0) {
                setSelectedType(newCategory.documentTypes[0].value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORIES.map((category) => (
                <SelectItem key={category.category} value={category.category}>
                  {category.title} {category.required && '*'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCategoryInfo && (
            <p className="text-sm text-muted-foreground">
              {selectedCategoryInfo.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Document Type</Label>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as DocumentType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="flex-1"
            />
            {selectedFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Supported formats: PDF, JPG, PNG. Maximum size: 10MB
          </p>
        </div>

        {(selectedType === 'OTHER_DOC' || selectedType === 'OTHER_ID' || selectedType === 'OTHER_ADDRESS') && (
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              placeholder="Please describe the document you're uploading..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
