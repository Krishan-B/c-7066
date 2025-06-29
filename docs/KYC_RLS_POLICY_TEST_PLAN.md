# Test Plan: RLS Policy for `kyc-documents` Bucket

## Objective

Ensure that the Row Level Security (RLS) policy on the `kyc-documents` bucket in Supabase Storage
strictly enforces that:

- Only authenticated users can access documents in the bucket.
- Users can only access their own documents (files in their user ID folder).
- No user can access another user's documents.
- Unauthenticated users have no access.

## RLS Policy Under Test

```sql
create policy "KYC users can access their own documents"
on storage.objects
for all
using (
  bucket_id = 'kyc-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()
);
```

## Test Cases

### 1. Authenticated User Accesses Own Document

- **Setup:** User A uploads a document to `kyc-documents/<userA-uuid>/file.pdf`.
- **Action:** User A attempts to download/view their own file.
- **Expected Result:** Access is allowed.

### 2. Authenticated User Accesses Another User's Document

- **Setup:** User A and User B both have documents in their respective folders.
- **Action:** User A attempts to access `kyc-documents/<userB-uuid>/file.pdf`.
- **Expected Result:** Access is denied (403 Forbidden).

### 3. Unauthenticated User Access

- **Setup:** No authentication token provided.
- **Action:** Attempt to access any file in `kyc-documents`.
- **Expected Result:** Access is denied (401 Unauthorized or 403 Forbidden).

### 4. Authenticated User Lists Bucket Root

- **Setup:** User A is authenticated.
- **Action:** User A attempts to list all files in the `kyc-documents` bucket root.
- **Expected Result:** Only files/folders under `kyc-documents/<userA-uuid>/` are visible.

### 5. Authenticated User Uploads to Own Folder

- **Setup:** User A is authenticated.
- **Action:** User A uploads a file to `kyc-documents/<userA-uuid>/file.pdf`.
- **Expected Result:** Upload is allowed.

### 6. Authenticated User Uploads to Another User's Folder

- **Setup:** User A is authenticated.
- **Action:** User A attempts to upload a file to `kyc-documents/<userB-uuid>/file.pdf`.
- **Expected Result:** Upload is denied.

### 7. Service Role Key Access (Bypasses RLS)

- **Setup:** Use Supabase service role key.
- **Action:** Attempt to access any file in the bucket.
- **Expected Result:** Access is allowed (service role bypasses RLS, for backend/admin use only).

## Manual Test Steps

1. Use Supabase client SDK or REST API to perform the above actions as different users.
2. Attempt file operations (upload, download, list) with and without authentication.
3. Verify HTTP status codes and error messages.
4. Check Supabase logs for denied/allowed access attempts.

## Automation

- Optionally, implement automated integration tests using Supabase client SDK and test users.

## Notes

- RLS policy should be reviewed after any schema or auth changes.
- Service role key should be kept secure and never exposed to clients.

---

For more details, see the migration file and Supabase documentation.
