// kyc_rls_policy.test.ts
// Integration tests for Supabase RLS policy using Jest

import "dotenv/config";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import {
  assertAuthSuccess,
  assertSuccess,
  assertError,
  formatError,
} from "../utils/error-utils";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://your-project.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "your-anon-key";

const userA = {
  email: process.env.TEST_USER_A_EMAIL || "userA@example.com",
  password: process.env.TEST_USER_A_PASSWORD || "passwordA",
};
const userB = {
  email: process.env.TEST_USER_B_EMAIL || "userB@example.com",
  password: process.env.TEST_USER_B_PASSWORD || "passwordB",
};

const bucket = "kyc-documents";
const testFile = Buffer.from("test file content");
const fileName = "test.pdf";

async function loginUser(user: {
  email: string;
  password: string;
}): Promise<{ supabase: SupabaseClient; user: User }> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const result = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  assertAuthSuccess(result);

  return {
    supabase: createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${result.data.session!.access_token}`,
        },
      },
    }),
    user: result.data.user,
  };
}

describe("Supabase KYC RLS Policy", () => {
  let supabaseA: SupabaseClient, userAData: User;
  let supabaseB: SupabaseClient, userBData: User;
  let pathA: string, pathB: string;

  beforeAll(async () => {
    // Login both users
    const loginA = await loginUser(userA);
    supabaseA = loginA.supabase;
    userAData = loginA.user;
    const loginB = await loginUser(userB);
    supabaseB = loginB.supabase;
    userBData = loginB.user;
    pathA = `${userAData.id}/test.pdf`;
    pathB = `${userBData.id}/test.pdf`;
  });

  test("User A can upload to their own folder", async () => {
    const res = await supabaseA.storage.from(bucket).upload(pathA, testFile, {
      contentType: "application/pdf",
      upsert: true,
    });
    expect(res.error).toBeNull();
  });

  test("User B cannot access User A file", async () => {
    const res = await supabaseB.storage.from(bucket).download(pathA);
    expect(res.error).not.toBeNull();
  });

  test("User A cannot access User B file", async () => {
    const res = await supabaseA.storage.from(bucket).download(pathB);
    expect(res.error).not.toBeNull();
  });

  test("Unauthenticated user cannot access User A file", async () => {
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const res = await supabaseAnon.storage.from(bucket).download(pathA);
    expect(res.error).not.toBeNull();
  });

  test("User A can list only their own files", async () => {
    // Upload test files for both users
    await supabaseA.storage
      .from(bucket)
      .upload(`${userAData.id}/doc1.pdf`, testFile);
    await supabaseA.storage
      .from(bucket)
      .upload(`${userAData.id}/doc2.pdf`, testFile);
    await supabaseB.storage
      .from(bucket)
      .upload(`${userBData.id}/doc3.pdf`, testFile);

    // User A should only see their files
    const { data: filesA, error: errorA } = await supabaseA.storage
      .from(bucket)
      .list(userAData.id);

    expect(errorA).toBeNull();
    expect(filesA).toHaveLength(3); // Including the test.pdf from earlier
    expect(filesA?.every((file) => !file.name.includes(userBData.id))).toBe(
      true
    );
  });

  test("KYC status updates are properly restricted", async () => {
    // Try to update own KYC status (should fail - only admin can do this)
    const { error: updateError } = await supabaseA
      .from("kyc_status")
      .update({ status: "APPROVED" })
      .eq("user_id", userAData.id);

    expect(updateError).not.toBeNull();

    // Verify can read own KYC status
    const { data: kycData, error: readError } = await supabaseA
      .from("kyc_status")
      .select()
      .eq("user_id", userAData.id)
      .single();

    expect(readError).toBeNull();
    expect(kycData).toBeDefined();

    // Try to read other user's KYC status (should fail)
    const { error: otherReadError } = await supabaseA
      .from("kyc_status")
      .select()
      .eq("user_id", userBData.id)
      .single();

    expect(otherReadError).not.toBeNull();
  });

  test("Document verification requests are properly restricted", async () => {
    // User can create verification request for themselves
    const { error: createError } = await supabaseA
      .from("document_verification_requests")
      .insert({
        user_id: userAData.id,
        document_type: "PASSPORT",
        document_path: pathA,
        status: "PENDING",
      });

    expect(createError).toBeNull();

    // User cannot create verification request for other user
    const { error: createOtherError } = await supabaseA
      .from("document_verification_requests")
      .insert({
        user_id: userBData.id,
        document_type: "PASSPORT",
        document_path: pathB,
        status: "PENDING",
      });

    expect(createOtherError).not.toBeNull();

    // User can read only their own verification requests
    const { data: requests, error: readError } = await supabaseA
      .from("document_verification_requests")
      .select();

    expect(readError).toBeNull();
    expect(requests).toBeDefined();
    expect(requests?.every((req) => req.user_id === userAData.id)).toBe(true);
  });

  test("Document metadata is properly restricted", async () => {
    // User can update metadata for their own documents
    const { error: metaError } = await supabaseA.storage
      .from(bucket)
      .update(pathA, testFile, {
        contentType: "application/pdf",
        upsert: true,
        metadata: {
          documentType: "PASSPORT",
          verified: "pending",
        },
      });

    expect(metaError).toBeNull();

    // User cannot update metadata for other user's documents
    const { error: otherMetaError } = await supabaseA.storage
      .from(bucket)
      .update(pathB, testFile, {
        contentType: "application/pdf",
        upsert: true,
        metadata: {
          documentType: "PASSPORT",
          verified: "pending",
        },
      });

    expect(otherMetaError).not.toBeNull();
  });

  afterAll(async () => {
    // Clean up all test files
    await supabaseA.storage
      .from(bucket)
      .remove([
        `${userAData.id}/test.pdf`,
        `${userAData.id}/doc1.pdf`,
        `${userAData.id}/doc2.pdf`,
      ]);
    await supabaseB.storage
      .from(bucket)
      .remove([`${userBData.id}/test.pdf`, `${userBData.id}/doc3.pdf`]);

    // Clean up verification requests
    await supabaseA
      .from("document_verification_requests")
      .delete()
      .eq("user_id", userAData.id);
    await supabaseB
      .from("document_verification_requests")
      .delete()
      .eq("user_id", userBData.id);
  });
});
