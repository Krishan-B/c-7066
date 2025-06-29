# KYC Documents Table & Plexop Integration Guide

## Table: `kyc_documents`

This table stores all user-uploaded KYC documents and their review status. It is the central
integration point for the Plexop internal management tool to review, approve, and manage KYC
submissions.

### Schema

| Column        | Type      | Description                                       |
| ------------- | --------- | ------------------------------------------------- |
| id            | UUID      | Primary key. Unique document ID.                  |
| user_id       | UUID      | Foreign key to `users(id)`. Document owner.       |
| document_type | ENUM      | Type of document (see below).                     |
| category      | ENUM      | Document category (see below).                    |
| file_url      | VARCHAR   | Public URL to the file in Supabase Storage.       |
| file_name     | VARCHAR   | Original file name.                               |
| status        | ENUM      | Review status: 'PENDING', 'APPROVED', 'REJECTED'. |
| comments      | TEXT      | Optional comments (user or reviewer).             |
| uploaded_at   | TIMESTAMP | When the document was uploaded.                   |
| reviewed_at   | TIMESTAMP | When the document was reviewed (nullable).        |
| reviewed_by   | UUID      | Reviewer (staff) user ID (nullable).              |
| created_at    | TIMESTAMP | Record creation timestamp.                        |
| updated_at    | TIMESTAMP | Last update timestamp.                            |

#### ENUM Values

- `document_type`: 'ID_PASSPORT', 'ID_FRONT', 'ID_BACK', 'DRIVERS_LICENSE', 'UTILITY_BILL',
  'BANK_STATEMENT', 'CREDIT_CARD_STATEMENT', 'TAX_BILL', 'OTHER_ID', 'OTHER_ADDRESS', 'OTHER_DOC'
- `category`: 'ID_VERIFICATION', 'ADDRESS_VERIFICATION', 'OTHER_DOCUMENTATION'
- `status`: 'PENDING', 'APPROVED', 'REJECTED'

---

## Integration Points for Plexop

### 1. Document Review Queue

- Query all documents with `status = 'PENDING'` for review.
- Filter by `category`, `document_type`, or `uploaded_at` as needed.

### 2. Document Viewer

- Use `file_url` to display the document (PDF/JPG/PNG) in the Plexop UI.
- Show `file_name`, `uploaded_at`, and user info (join with `users` table).

### 3. Approve/Reject Actions

- Update `status` to 'APPROVED' or 'REJECTED'.
- Set `reviewed_at` to current timestamp and `reviewed_by` to staff user ID.
- Optionally, update `comments` with reviewer notes.

### 4. Bulk Processing

- Support batch updates for multiple documents (e.g., approve/reject many at once).

### 5. Review History & Analytics

- Track all changes to `status`, `reviewed_at`, and `reviewed_by` for audit purposes.
- Use timestamps and reviewer IDs for performance metrics.

---

## Example SQL Queries

### Fetch Pending Documents

```sql
SELECT * FROM kyc_documents WHERE status = 'PENDING' ORDER BY uploaded_at ASC;
```

### Approve a Document

```sql
UPDATE kyc_documents
SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = '<staff_user_id>', comments = 'Verified and approved.'
WHERE id = '<document_id>';
```

### Reject a Document

```sql
UPDATE kyc_documents
SET status = 'REJECTED', reviewed_at = NOW(), reviewed_by = '<staff_user_id>', comments = 'Document is blurry.'
WHERE id = '<document_id>';
```

### Fetch Documents for a User

```sql
SELECT * FROM kyc_documents WHERE user_id = '<user_id>' ORDER BY uploaded_at DESC;
```

---

## Notes

- All file uploads are stored in the `kyc-documents` bucket in Supabase Storage. The `file_url`
  field provides direct access.
- Only Plexop (internal tool) should update `status`, `reviewed_at`, and `reviewed_by` fields.
- User-facing app can only upload, view, update comments, or delete their own documents.
- Ensure proper access control for Plexop integration (use service role or secure DB connection).

---

For further details, see the PRD and database schema documentation.
