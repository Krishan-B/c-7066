import {
  createClient,
  SupabaseClient,
  PostgrestError,
} from "@supabase/supabase-js";
import { Database } from "../../src/integrations/supabase/types";
import {
  assertError,
  assertSuccess,
  assertAuthSuccess,
  formatError,
  isPostgrestError,
} from "../utils/error-utils";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "your-local-anon-key";

async function ensureError<T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<PostgrestError> {
  const { error } = await promise;
  expect(error).not.toBeNull();
  expect(isPostgrestError(error)).toBe(true);
  return error as PostgrestError;
}

// Test data types
interface TestUser {
  email: string;
  password: string;
  id?: string;
}

describe("Database Operations", () => {
  let supabase: SupabaseClient<Database>;
  const testUser: TestUser = {
    email: "dbtest@example.com",
    password: "TestPassword123!",
  };

  beforeAll(async () => {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    const result = await supabase.auth.signUp(testUser);
    assertAuthSuccess(result);
  });

  test("should create and retrieve a profile", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) throw new Error("No authenticated user");

    const { data: profile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: "testuser",
        avatar_url: "https://example.com/avatar.jpg",
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(profile).toBeDefined();
    expect(profile?.username).toBe("testuser");

    const { data: fetchedProfile, error: fetchError } = await supabase
      .from("profiles")
      .select()
      .eq("username", "testuser")
      .single();

    expect(fetchError).toBeNull();
    expect(fetchedProfile).toEqual(profile);
  });

  test("should enforce RLS policies", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) throw new Error("No authenticated user");

    // Try to read another user's profile (should fail)
    const { data: otherProfile, error: rlsError } = await supabase
      .from("profiles")
      .select()
      .neq("id", user.id)
      .single();

    expect(rlsError).not.toBeNull();
    expect(otherProfile).toBeNull();
  });

  test("should handle concurrent transactions", async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) throw new Error("No authenticated user");

    // Create test order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        symbol: "BTC",
        direction: "LONG",
        asset_class: "CRYPTO",
        order_type: "MARKET",
        units: 1,
        requested_price: 50000,
        margin_required: 5000, // 10% margin requirement
        position_value: 50000,
        status: "CREATED",
      })
      .select()
      .single();

    expect(orderError).toBeNull();
    expect(order).toBeDefined();

    // Test concurrent updates (should maintain consistency)
    if (!order?.id) throw new Error("Order ID is undefined");
    const updates = Promise.all([
      supabase
        .from("orders")
        .update({ status: "PENDING" })
        .eq("id", order.id)
        .select(),
      supabase
        .from("orders")
        .update({ status: "FILLED" })
        .eq("id", order.id)
        .select(),
    ]);

    const results = await updates;
    const finalStatuses = results.map((r) => r.data?.[0]?.status);

    // Only one update should succeed
    expect(finalStatuses.filter((s) => s !== null).length).toBe(1);
  });

  afterAll(async () => {
    const { error } = await supabase.auth.admin.deleteUser(
      (await supabase.auth.getUser()).data.user?.id || ""
    );
    if (error) console.error("Error cleaning up test user:", error);
  });
});
