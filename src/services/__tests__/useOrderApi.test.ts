import { renderHook, act } from "@testing-library/react";
import { useOrderApi } from "../services/tradingApi";

// Mock fetch and auth
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("useOrderApi", () => {
  it("fetches orders successfully", async () => {
    const { result } = renderHook(() => useOrderApi());
    let orders;
    await act(async () => {
      orders = await result.current.getOrders();
    });
    expect(orders).toEqual([]);
    expect(global.fetch).toHaveBeenCalled();
  });

  it("handles fetch errors", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );
    const { result } = renderHook(() => useOrderApi());
    await expect(result.current.getOrders()).rejects.toThrow("Network error");
  });
});
