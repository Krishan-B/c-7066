import "@testing-library/jest-dom";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/integrations/supabase/types";

// Mock global APIs
global.fetch = jest.fn();

// Mock WebSocket
class MockWebSocket implements Partial<WebSocket> {
  constructor(url: string | URL, protocols?: string | string[]) {}
  close = jest.fn();
  send = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  readyState = 0;
}

// Set up global mocks
(global as unknown as { WebSocket: typeof MockWebSocket }).WebSocket =
  MockWebSocket;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
