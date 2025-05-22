import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { KYCService } from '../services/kycService';
import { KYCFormData, KYCDocument } from '../types/kyc';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const KYCVerificationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<KYCFormData>({
    personalInfo: {
      dateOfBirth: '',
      nationality: '',
      residenceAddress: '',
      city: '',
      postalCode: '',
      country: ''
    },
    employmentInfo: {
      occupation: '',
      employer: '',
      annualIncome: ''
    },
    documents: []
  });

  const handlePersonalInfoChange = (field: keyof KYCFormData['personalInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleEmploymentInfoChange = (field: keyof KYCFormData['employmentInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      employmentInfo: {
        ...prev.employmentInfo,
        [field]: value
      }
    }));
  };

  const handleFileUpload = useCallback((type: KYCDocument['type'], file: File) => {
    setDocumentUploadStatus('uploading');
    setUploadProgress(0);
    setError('');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or PDF file.');
      setDocumentUploadStatus('error');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit.');
      setDocumentUploadStatus('error');
      return;
    }

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setDocumentUploadStatus('success');
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { type, file }]
      }));
      toast({
        title: 'Document Added',
        description: 'Your document has been successfully added to the form.',
        variant: 'default'
      });
    }, 2000);
  }, [toast]);

  const [documentUploadStatus, setDocumentUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateForm = () => {
    if (!formData.personalInfo.dateOfBirth) return 'Date of birth is required';
    if (!formData.personalInfo.nationality) return 'Nationality is required';
    if (!formData.personalInfo.residenceAddress) return 'Residence address is required';
    if (!formData.personalInfo.city) return 'City is required';
    if (!formData.personalInfo.postalCode) return 'Postal code is required';
    if (!formData.personalInfo.country) return 'Country is required';
    if (!formData.employmentInfo.occupation) return 'Occupation is required';
    if (!formData.employmentInfo.employer) return 'Employer is required';
    if (!formData.employmentInfo.annualIncome) return 'Annual income is required';
    if (formData.documents.length === 0) return 'At least one identification document is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit verification');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await KYCService.submitVerification(user.id, formData);

      if (!result.success) {
        throw new Error('Failed to submit KYC verification');
      }

      toast({
        title: 'KYC Verification Submitted',
        description: 'Your verification documents have been submitted for review.'
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to submit verification. Please try again.');
      console.error('KYC submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Please complete the verification process to access all trading features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    type="date"
                    id="dateOfBirth"
                    required
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    type="text"
                    id="nationality"
                    required
                    value={formData.personalInfo.nationality}
                    onChange={(e) => handlePersonalInfoChange('nationality', e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="residenceAddress">Residence Address</Label>
                  <Input
                    type="text"
                    id="residenceAddress"
                    required
                    value={formData.personalInfo.residenceAddress}
                    onChange={(e) => handlePersonalInfoChange('residenceAddress', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      type="text"
                      id="city"
                      required
                      value={formData.personalInfo.city}
                      onChange={(e) => handlePersonalInfoChange('city', e.target.value)}
                    />
                  </div>

                  <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      type="text"
                      id="postalCode"
                      required
                      value={formData.personalInfo.postalCode}
                      onChange={(e) => handlePersonalInfoChange('postalCode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    type="text"
                    id="country"
                    required
                    value={formData.personalInfo.country}
                    onChange={(e) => handlePersonalInfoChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Employment Information</h3>
              
              <div className="grid gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    type="text"
                    id="occupation"
                    required
                    value={formData.employmentInfo.occupation}
                    onChange={(e) => handleEmploymentInfoChange('occupation', e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    type="text"
                    id="employer"
                    required
                    value={formData.employmentInfo.employer}
                    onChange={(e) => handleEmploymentInfoChange('employer', e.target.value)}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Input
                    type="text"
                    id="annualIncome"
                    required
                    value={formData.employmentInfo.annualIncome}
                    onChange={(e) => handleEmploymentInfoChange('annualIncome', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Document Upload</h3>
              
              <div className="grid gap-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="idDocument">Identity Document</Label>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(value: KYCDocument['type']) => {
                        const fileInput = document.getElementById('idDocument') as HTMLInputElement;
                        if (fileInput.files?.[0]) {
                          handleFileUpload(value, fileInput.files[0]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="national_id">National ID</SelectItem>
                        <SelectItem value="drivers_license">Driver's License</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="relative">
                      <Input
                        type="file"
                        id="idDocument"
                        required
                        accept=".jpg,.jpeg,.png,.pdf"
                        className={documentUploadStatus === 'error' ? 'border-red-500' : ''}
                        disabled={documentUploadStatus === 'uploading'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          const select = document.querySelector('[data-value]');
                          const documentType = select?.getAttribute('data-value') as KYCDocument['type'];
                          if (file && documentType) {
                            handleFileUpload(documentType, file);
                          }
                        }}
                      />
                      {documentUploadStatus === 'uploading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <div className="h-1 w-full bg-gray-200 rounded">
                            <div
                              className="h-full bg-primary rounded transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {documentUploadStatus === 'success' && (
                      <p className="text-sm text-green-600">Document uploaded successfully</p>
                    )}
                    {documentUploadStatus === 'error' && (
                      <p className="text-sm text-red-600">Failed to upload document. Please try again.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerificationForm;
