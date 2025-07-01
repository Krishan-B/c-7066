import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../src/integrations/supabase/types";
import {
  assertAuthSuccess,
  assertError,
  assertSuccess,
  formatError,
} from "../utils/error-utils";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "your-local-anon-key";

// Edge function specific types and guards
interface EdgeFunctionResponse<T = unknown> {
  data: T;
  error: null;
}

interface EdgeFunctionError {
  error: {
    message: string;
    status: number;
  };
  data: null;
}

function assertEdgeFunctionSuccess<T>(
  response: unknown
): asserts response is EdgeFunctionResponse<T> {
  expect(response).toBeDefined();
  expect(response).not.toBeNull();
  const resp = response as { data?: unknown; error?: unknown };
  expect(resp.data).toBeDefined();
  expect(resp.data).not.toBeNull();
  expect(resp.error).toBeNull();
}

function assertEdgeFunctionError(
  response: unknown
): asserts response is EdgeFunctionError {
  expect(response).toBeDefined();
  expect(response).not.toBeNull();
  const resp = response as { error?: unknown; data?: unknown };
  expect(resp.error).toBeDefined();
  expect(resp.error).not.toBeNull();
  expect(typeof resp.error).toBe("object");
  const error = resp.error as { message?: unknown; status?: unknown };
  expect(typeof error.message).toBe("string");
  expect(typeof error.status).toBe("number");
  expect(resp.data).toBeNull();
}

describe("Edge Functions", () => {
  let supabase: SupabaseClient<Database>;
  let userId: string;

  beforeAll(async () => {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    const result = await supabase.auth.signUp({
      email: "edgetest@example.com",
      password: "TestPassword123!",
    });
    assertAuthSuccess(result);
    userId = result.data.user!.id;
  });

  test("should calculate position metrics", async () => {
    const { data, error } = await supabase.functions.invoke(
      "calculate-position-metrics",
      {
        body: {
          symbol: "BTC/USD",
          entryPrice: 50000,
          currentPrice: 55000,
          quantity: 1,
          leverage: 10,
        },
      }
    );

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.pnl).toBeDefined();
    expect(data.marginLevel).toBeDefined();
    expect(data.liquidationPrice).toBeDefined();
  });

  test("should validate KYC documents", async () => {
    const testDoc = new File(["test content"], "passport.jpg", {
      type: "image/jpeg",
    });

    // First upload the document
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(`${userId}/passport.jpg`, testDoc);

    expect(uploadError).toBeNull();
    expect(uploadData).toBeDefined();

    // Then trigger the validation
    const { data, error } = await supabase.functions.invoke(
      "validate-kyc-document",
      {
        body: {
          userId,
          documentPath: uploadData?.path,
          documentType: "passport",
        },
      }
    );

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.status).toBe("PENDING");
    expect(data.validationId).toBeDefined();
  });

  test("should handle market data processing", async () => {
    const { data, error } = await supabase.functions.invoke(
      "process-market-data",
      {
        body: {
          symbol: "ETH/USD",
          price: 2000,
          timestamp: new Date().toISOString(),
        },
      }
    );

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.processed).toBe(true);
    expect(data.indicatorsCalculated).toBe(true);
  });

  test("should handle invalid position metrics calculation", async () => {
    const { data, error } = await supabase.functions.invoke(
      "calculate-position-metrics",
      {
        body: {
          symbol: "BTC/USD",
          entryPrice: -50000, // Invalid negative price
          currentPrice: 55000,
          quantity: 1,
          leverage: 10,
        },
      }
    );

    expect(error).not.toBeNull();
    expect(error?.message).toContain("Invalid entry price");
  });

  test("should reject invalid KYC document types", async () => {
    const { data, error } = await supabase.functions.invoke(
      "validate-kyc-document",
      {
        body: {
          userId,
          documentPath: "invalid/path.txt",
          documentType: "invalid_type",
        },
      }
    );

    expect(error).not.toBeNull();
    expect(error?.message).toContain("Invalid document type");
  });

  test("should handle market data validation", async () => {
    const { data, error } = await supabase.functions.invoke(
      "process-market-data",
      {
        body: {
          symbol: "ETH/USD",
          price: "invalid", // Invalid price type
          timestamp: "invalid-date",
        },
      }
    );

    expect(error).not.toBeNull();
    expect(error?.message).toContain("Invalid market data format");
  });

  test("should process batch market data", async () => {
    const { data, error } = await supabase.functions.invoke(
      "process-market-data-batch",
      {
        body: {
          updates: [
            {
              symbol: "BTC/USD",
              price: 50000,
              timestamp: new Date().toISOString(),
            },
            {
              symbol: "ETH/USD",
              price: 2000,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      }
    );

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.processed).toBe(true);
    expect(data.count).toBe(2);
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.storage
      .from("kyc-documents")
      .remove([`${userId}/passport.jpg`]);

    // Delete test user
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.error("Error cleaning up test user:", error);
  });
});
