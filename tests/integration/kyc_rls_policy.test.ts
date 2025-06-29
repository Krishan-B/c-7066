// kyc_rls_policy.test.ts
// Integration tests for Supabase RLS policy using Jest

import "dotenv/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { User, Session } from "@supabase/supabase-js";

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
  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  if (error) throw error;
  return {
    supabase: createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      },
    }),
    user: data.user as User,
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
});
