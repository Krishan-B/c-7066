import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import KYCVerificationBanner from '@/components/kyc/KYCVerificationBanner';
import EnhancedDocumentUpload from '@/components/kyc/EnhancedDocumentUpload';
import { useKYC } from '@/hooks/kyc/useKYC';
import { useAuth } from '@/hooks/auth';

// Mock the hooks
vi.mock('@/hooks/kyc/useKYC');
vi.mock('@/hooks/auth');
vi.mock('@/hooks/use-toast');

const mockUseKYC = vi.mocked(useKYC);
const mockUseAuth = vi.mocked(useAuth);

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Test wrapper with necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Enhanced KYC System', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock returns
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com' },
      isLoading: false,
      error: null,
    } as any);
  });

  describe('KYCVerificationBanner', () => {
    it('should show banner for pending KYC status', () => {
      mockUseKYC.mockReturnValue({
        kycStatus: { overall_status: 'pending' },
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <KYCVerificationBanner />
        </TestWrapper>
      );

      expect(screen.getByText('KYC Verification Pending')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Your documents are being reviewed. Trading will be enabled once approved.'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view status/i })).toBeInTheDocument();
    });

    it('should show banner for rejected KYC status', () => {
      mockUseKYC.mockReturnValue({
        kycStatus: { overall_status: 'rejected' },
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <KYCVerificationBanner />
        </TestWrapper>
      );

      expect(screen.getByText('KYC Verification Required')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Your verification was rejected. Please upload new documents to start trading.'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload documents/i })).toBeInTheDocument();
    });

    it('should show banner for not started KYC status', () => {
      mockUseKYC.mockReturnValue({
        kycStatus: { overall_status: 'not_started' },
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <KYCVerificationBanner />
        </TestWrapper>
      );

      expect(screen.getByText('One last step before trading')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Complete your KYC verification to unlock trading features and start your investment journey.'
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verify kyc/i })).toBeInTheDocument();
    });

    it('should not show banner for approved KYC status', () => {
      mockUseKYC.mockReturnValue({
        kycStatus: { overall_status: 'approved' },
        isLoading: false,
        error: null,
      } as any);

      const { container } = render(
        <TestWrapper>
          <KYCVerificationBanner />
        </TestWrapper>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('EnhancedDocumentUpload', () => {
    const mockOnUpload = vi.fn();

    beforeEach(() => {
      mockOnUpload.mockClear();
    });

    it('should render ID verification upload component', () => {
      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={mockOnUpload}
            isUploading={false}
            category="ID_VERIFICATION"
          />
        </TestWrapper>
      );

      expect(screen.getByText('ID Verification')).toBeInTheDocument();
      expect(screen.getByText('Upload a valid government-issued ID document')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render address verification upload component', () => {
      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={mockOnUpload}
            isUploading={false}
            category="ADDRESS_VERIFICATION"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Address Verification')).toBeInTheDocument();
      expect(
        screen.getByText('Upload a document showing your current address')
      ).toBeInTheDocument();
    });

    it('should render other documentation upload component with comments field', () => {
      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={mockOnUpload}
            isUploading={false}
            category="OTHER_DOCUMENTATION"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Other Documentation')).toBeInTheDocument();
      expect(screen.getByText('Upload any additional supporting documents')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Please describe the document you're uploading...")
      ).toBeInTheDocument();
    });

    it('should show upload button as disabled when no file selected', () => {
      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={mockOnUpload}
            isUploading={false}
            category="ID_VERIFICATION"
          />
        </TestWrapper>
      );

      const uploadButton = screen.getByRole('button', { name: /upload document/i });
      expect(uploadButton).toBeDisabled();
    });

    it('should enable upload button when file and document type selected', async () => {
      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={mockOnUpload}
            isUploading={false}
            category="ID_VERIFICATION"
          />
        </TestWrapper>
      );

      // Create a mock file
      const file = new File(['test content'], 'passport.jpg', { type: 'image/jpeg' });

      // Upload file
      const fileInput = screen.getByLabelText(/browse files/i);
      await userEvent.upload(fileInput, file);

      // Select document type
      const documentTypeSelect = screen.getByRole('combobox');
      await userEvent.click(documentTypeSelect);
      await userEvent.click(screen.getByRole('option', { name: /passport/i }));

      // Check upload button is enabled
      const uploadButton = screen.getByRole('button', { name: /upload document/i });
      expect(uploadButton).toBeEnabled();
    });
  });

  describe('Document Type Categories', () => {
    it('should have correct document types for ID verification', () => {
      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={vi.fn()}
            isUploading={false}
            category="ID_VERIFICATION"
          />
        </TestWrapper>
      );

      const documentTypeSelect = screen.getByRole('combobox');
      fireEvent.click(documentTypeSelect);

      expect(screen.getByRole('option', { name: /passport/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /id card \(front\)/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /id card \(back\)/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /driver's license/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /other id document/i })).toBeInTheDocument();
    });

    it('should have correct document types for address verification', () => {
      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={vi.fn()}
            isUploading={false}
            category="ADDRESS_VERIFICATION"
          />
        </TestWrapper>
      );

      const documentTypeSelect = screen.getByRole('combobox');
      fireEvent.click(documentTypeSelect);

      expect(screen.getByRole('option', { name: /utility bill/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /bank statement/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /credit card statement/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /local authority tax bill/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /other address proof/i })).toBeInTheDocument();
    });
  });

  describe('File Validation', () => {
    it('should accept valid file types (PDF, JPG, PNG)', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={vi.fn()}
            isUploading={false}
            category="ID_VERIFICATION"
          />
        </TestWrapper>
      );

      const pdfFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });

      const fileInput = screen.getByLabelText(/browse files/i);

      // Test PDF file upload
      await user.upload(fileInput, pdfFile);
      expect(screen.getByText('document.pdf')).toBeInTheDocument();

      // Verify the file is shown as selected
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('should accept JPG files', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={vi.fn()}
            isUploading={false}
            category="ID_VERIFICATION"
          />
        </TestWrapper>
      );

      const jpgFile = new File(['jpg content'], 'document.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/browse files/i);

      await user.upload(fileInput, jpgFile);
      expect(screen.getByText('document.jpg')).toBeInTheDocument();
    });

    it('should show file size in readable format', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedDocumentUpload
            onUpload={vi.fn()}
            isUploading={false}
            category="ID_VERIFICATION"
          />
        </TestWrapper>
      );

      // Create file with specific size (1MB)
      const fileContent = new Array(1024 * 1024).fill('a').join('');
      const file = new File([fileContent], 'large-document.pdf', { type: 'application/pdf' });

      const fileInput = screen.getByLabelText(/browse files/i);
      await user.upload(fileInput, file);

      expect(screen.getByText('1 MB')).toBeInTheDocument();
    });
  });
});
