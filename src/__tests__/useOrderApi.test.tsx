import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useOrderApi } from "../services/tradingApi";
import { vi, Mock } from "vitest";
import { AuthContext } from "../components/AuthContext";
import type { Session, User } from "@supabase/supabase-js";
import type { UserProfile } from "@/features/profile/types";

// Helper to create a minimal Response-like mock
function createFetchResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
    // ...other Response properties as needed
  } as unknown as Response;
}

beforeEach(() => {
  global.fetch = vi.fn(() => Promise.resolve(createFetchResponse([])));
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("useOrderApi", () => {
  // Minimal mock AuthContext value
  const mockAuthContext = {
    session: null as Session | null,
    user: null as User | null,
    profile: null as UserProfile | null,
    loading: false,
    profileLoading: false,
    signOut: async () => {},
    refreshSession: async () => null,
    updateProfile: async () => {},
    refreshProfile: async () => {},
  };

  // Wrapper to provide AuthContext
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );

  it("fetches orders successfully", async () => {
    const { result } = renderHook(() => useOrderApi(), { wrapper });
    let orders;
    await act(async () => {
      orders = await result.current.getOrders();
    });
    expect(orders).toEqual([]);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("handles fetch errors", async () => {
    (global.fetch as Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );
    const { result } = renderHook(() => useOrderApi(), { wrapper });
    await expect(result.current.getOrders()).rejects.toThrow("Network error");
  });
});
