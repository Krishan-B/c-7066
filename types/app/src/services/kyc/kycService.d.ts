import { KYCDocument, KYCStatus, DocumentUploadData } from './types';
export declare class KYCService {
    static uploadDocument(data: DocumentUploadData): Promise<KYCDocument>;
    static getUserDocuments(userId: string): Promise<KYCDocument[]>;
    static getKYCStatus(userId: string): Promise<KYCStatus>;
    static deleteDocument(documentId: string): Promise<void>;
    static updateDocumentStatus(documentId: string, status: 'pending' | 'approved' | 'rejected', comments?: string): Promise<void>;
    static getDocumentUrl(documentUrl: string): Promise<string>;
}
