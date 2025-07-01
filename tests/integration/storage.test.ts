import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../src/integrations/supabase/types";
import {
  assertAuthSuccess,
  assertSuccess,
  assertError,
  formatError,
} from "../utils/error-utils";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "your-local-anon-key";

// Storage utilities and type guards
interface StorageFile {
  name: string;
  bucket: string;
  owner: string;
  metadata: {
    size: number;
    mimetype: string;
    cacheControl?: string;
  };
}

function isStorageFile(obj: unknown): obj is StorageFile {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "bucket" in obj &&
    "owner" in obj &&
    "metadata" in obj &&
    typeof obj.metadata === "object" &&
    obj.metadata !== null &&
    "size" in obj.metadata &&
    "mimetype" in obj.metadata
  );
}

async function createTestFile(
  content: string,
  name: string,
  type = "text/plain"
): Promise<File> {
  return new File([content], name, { type });
}

async function cleanupStorage(
  supabase: SupabaseClient<Database>,
  bucket: string,
  prefix?: string
): Promise<void> {
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list(prefix || "");
  if (error) throw error;

  for (const file of files) {
    await supabase.storage
      .from(bucket)
      .remove([prefix ? `${prefix}/${file.name}` : file.name]);
  }
}

describe("Storage Operations", () => {
  let supabase: SupabaseClient<Database>;
  let userId: string;
  const testBucket = "test-bucket";
  const testFile = new File(["test content"], "test.txt", {
    type: "text/plain",
  });

  beforeAll(async () => {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    const result = await supabase.auth.signUp({
      email: "storagetest@example.com",
      password: "TestPassword123!",
    });
    assertAuthSuccess(result);
    userId = result.data.user!.id;

    // Create test bucket
    const { error: bucketError } = await supabase.storage.createBucket(
      testBucket,
      {
        public: false,
      }
    );
    if (bucketError) throw bucketError;
  });

  test("should upload and download a file", async () => {
    const filePath = `${userId}/test.txt`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(testBucket)
      .upload(filePath, testFile);

    expect(uploadError).toBeNull();
    expect(uploadData).toBeDefined();
    expect(uploadData?.path).toBe(filePath);

    // Download file
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from(testBucket)
      .download(filePath);

    expect(downloadError).toBeNull();
    expect(downloadData).toBeDefined();
    expect(downloadData instanceof Blob).toBe(true);

    // Verify content
    const content = await downloadData!.text();
    expect(content).toBe("test content");
  });

  test("should enforce RLS policies for storage", async () => {
    const otherFilePath = "other-user/test.txt";

    // Try to access file in another user's folder
    const { data, error } = await supabase.storage
      .from(testBucket)
      .download(otherFilePath);

    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });

  test("should list files in user's folder", async () => {
    const { data, error } = await supabase.storage
      .from(testBucket)
      .list(userId);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.some((file) => file.name === "test.txt")).toBe(true);
  });

  test("should handle file updates and moves", async () => {
    const originalPath = `${userId}/original.txt`;
    const newPath = `${userId}/moved.txt`;

    // Upload initial file
    await supabase.storage
      .from(testBucket)
      .upload(originalPath, new File(["original content"], "original.txt"));

    // Update file content
    const { error: updateError } = await supabase.storage
      .from(testBucket)
      .update(originalPath, new File(["updated content"], "original.txt"));

    expect(updateError).toBeNull();

    // Verify updated content
    const { data: updatedData } = await supabase.storage
      .from(testBucket)
      .download(originalPath);
    const updatedContent = await updatedData!.text();
    expect(updatedContent).toBe("updated content");

    // Move file
    const { error: moveError } = await supabase.storage
      .from(testBucket)
      .move(originalPath, newPath);

    expect(moveError).toBeNull();

    // Verify file was moved
    const { data: movedData } = await supabase.storage
      .from(testBucket)
      .download(newPath);
    expect(movedData).toBeDefined();

    // Original path should no longer exist
    const { data: originalData, error: notFoundError } = await supabase.storage
      .from(testBucket)
      .download(originalPath);
    expect(notFoundError).not.toBeNull();
    expect(originalData).toBeNull();
  });

  test("should handle file metadata", async () => {
    const filePath = `${userId}/metadata-test.txt`;
    const file = new File(["test content"], "metadata-test.txt", {
      type: "text/plain",
    });

    // Upload with metadata
    const { data: uploadData } = await supabase.storage
      .from(testBucket)
      .upload(filePath, file, {
        metadata: {
          contentType: "text/plain",
          cacheControl: "3600",
          customMetadata: {
            testKey: "testValue",
          },
        },
      });

    expect(uploadData).toBeDefined();

    // Get file metadata
    const { data: metadata } = await supabase.storage
      .from(testBucket)
      .getPublicUrl(filePath);

    expect(metadata).toBeDefined();
  });

  test("should enforce file size limits", async () => {
    const largePath = `${userId}/large.txt`;
    const largeContent = "x".repeat(10 * 1024 * 1024); // 10MB
    const largeFile = new File([largeContent], "large.txt");

    const { error: sizeError } = await supabase.storage
      .from(testBucket)
      .upload(largePath, largeFile);

    expect(sizeError).not.toBeNull();
    expect(sizeError?.message).toContain("size");
  });

  test("should handle concurrent uploads", async () => {
    const basePath = `${userId}/concurrent`;
    const files = Array.from({ length: 5 }, (_, i) => ({
      path: `${basePath}/${i}.txt`,
      content: new File([`content ${i}`], `${i}.txt`),
    }));

    const results = await Promise.all(
      files.map(({ path, content }) =>
        supabase.storage.from(testBucket).upload(path, content)
      )
    );

    // All uploads should succeed
    results.forEach(({ error }, i) => {
      expect(error).toBeNull();
    });

    // Verify all files exist
    const { data: fileList } = await supabase.storage
      .from(testBucket)
      .list(`${userId}/concurrent`);

    expect(fileList?.length).toBe(5);
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.storage.emptyBucket(testBucket);
    await supabase.storage.deleteBucket(testBucket);

    // Delete test user
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.error("Error cleaning up test user:", error);
  });
});
