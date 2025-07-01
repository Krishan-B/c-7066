import { createClient } from "@supabase/supabase-js";

import { Database } from "../../src/integrations/supabase/types";

describe("Integration Test Setup", () => {
  it("should have access to the Supabase client", () => {
    const supabase = createClient<Database>(
      process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321",
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"
    );
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.storage).toBeDefined();
    expect(supabase.functions).toBeDefined();
  });

  it("should have working mocks", () => {
    const mockFetch = global.fetch as jest.Mock;
    expect(mockFetch).toBeDefined();
    expect(typeof mockFetch).toBe("function");

    const ws = new WebSocket("ws://localhost:8080");
    expect(ws.send).toBeDefined();
    expect(ws.close).toBeDefined();
    expect(ws.addEventListener).toBeDefined();
    expect(ws.readyState).toBeDefined();
  });

  it("should have required environment variables", () => {
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.VITE_SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
  });
});
