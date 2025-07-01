import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/integrations/supabase/types";
import {
  assertAuthSuccess,
  assertAuthError,
  formatError,
} from "../utils/error-utils";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "your-local-anon-key";

interface TestUser {
  email: string;
  password: string;
}

describe("Supabase Auth Integration Tests", () => {
  let supabase: SupabaseClient<Database>;

  const testUser: TestUser = {
    email: "test@example.com",
    password: "TestPassword123!",
  };

  beforeAll(async () => {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Clean up any existing test users
    const result = await supabase.auth.signInWithPassword(testUser);
    if (result.data?.user) {
      const deleteResult = await supabase.auth.admin.deleteUser(
        result.data.user.id
      );
      expect(deleteResult.error).toBeNull();
    }
  });

  it("should successfully sign up a new user", async () => {
    const { data, error } = await supabase.auth.signUp(testUser);
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testUser.email);
  });

  it("should successfully sign in the user", async () => {
    const { data, error } = await supabase.auth.signInWithPassword(testUser);
    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(testUser.email);
  });

  it("should fail to sign up with invalid email", async () => {
    const { data, error } = await supabase.auth.signUp({
      email: "invalid-email",
      password: testUser.password,
    });
    expect(error).not.toBeNull();
    expect(error?.message).toContain("Invalid email");
    expect(data.user).toBeNull();
  });

  it("should fail to sign up with weak password", async () => {
    const { data, error } = await supabase.auth.signUp({
      email: "test2@example.com",
      password: "weak",
    });
    expect(error).not.toBeNull();
    expect(error?.message).toContain("password");
    expect(data.user).toBeNull();
  });

  it("should fail to sign in with incorrect password", async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: "WrongPassword123!",
    });
    expect(error).not.toBeNull();
    expect(error?.message).toContain("Invalid login credentials");
    expect(data.user).toBeNull();
  });

  it("should successfully sign out", async () => {
    // First sign in
    await supabase.auth.signInWithPassword(testUser);

    // Then sign out
    const { error } = await supabase.auth.signOut();
    expect(error).toBeNull();

    // Verify we're signed out by checking the session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    expect(session).toBeNull();
  });

  it("should handle password reset flow", async () => {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      testUser.email
    );
    expect(resetError).toBeNull();
  });

  afterAll(async () => {
    // Clean up test user
    const { data } = await supabase.auth.signInWithPassword(testUser);
    if (data?.user) {
      await supabase.auth.admin.deleteUser(data.user.id);
    }
  });
});
