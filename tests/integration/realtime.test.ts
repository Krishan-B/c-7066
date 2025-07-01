import {
  createClient,
  SupabaseClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { Database } from "../../src/integrations/supabase/types";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY || "your-local-anon-key";

interface MarketData {
  id?: number;
  symbol: string;
  price: number;
  timestamp: string;
  change_percentage: number;
  market_type: string;
  name: string;
  volume: string;
  high_price: number;
  low_price: number;
  last_price: number;
  last_updated: string;
  [key: string]: unknown;
}

type MarketDataPayload = RealtimePostgresChangesPayload<MarketData>;
type PositionPayload = RealtimePostgresChangesPayload<
  Database["public"]["Tables"]["positions"]["Row"]
>;

// Type guards
function isMarketData(data: unknown): data is MarketData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.symbol === "string" &&
    typeof d.price === "number" &&
    typeof d.timestamp === "string" &&
    typeof d.change_percentage === "number" &&
    typeof d.market_type === "string" &&
    typeof d.name === "string" &&
    typeof d.volume === "string" &&
    typeof d.high_price === "number" &&
    typeof d.low_price === "number" &&
    typeof d.last_price === "number" &&
    typeof d.last_updated === "string"
  );
}

function isPosition(
  data: unknown
): data is Database["public"]["Tables"]["positions"]["Row"] {
  if (!data || typeof data !== "object") return false;
  const p = data as Record<string, unknown>;
  return (
    typeof p.user_id === "string" &&
    typeof p.symbol === "string" &&
    typeof p.units === "number" &&
    typeof p.entry_price === "number" &&
    typeof p.direction === "string" &&
    typeof p.asset_class === "string" &&
    typeof p.current_price === "number" &&
    typeof p.margin_used === "number" &&
    typeof p.position_value === "number" &&
    typeof p.leverage_ratio === "number" &&
    typeof p.status === "string"
  );
}

function isValidPayload<T extends { [key: string]: unknown }>(
  payload: RealtimePostgresChangesPayload<T>,
  typeGuard: (data: unknown) => data is T
): payload is RealtimePostgresChangesPayload<T> & { new: T } {
  return payload.new !== null && typeGuard(payload.new);
}

describe("Real-time Subscriptions", () => {
  let supabase: SupabaseClient<Database>;
  let userId: string;

  beforeAll(async () => {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signUp({
      email: "realtimetest@example.com",
      password: "TestPassword123!",
    });
    if (error) throw error;
    userId = data.user!.id;
  });

  test("should receive real-time updates for market data", async () => {
    const channel = supabase.channel("market-data");
    const marketData: MarketData[] = [];

    await new Promise<void>((resolve, reject) => {
      channel
        .on("presence", { event: "sync" }, () => {
          resolve();
        })
        .on(
          "postgres_changes" as const,
          { event: "INSERT", schema: "public", table: "market_data" },
          (payload: MarketDataPayload) => {
            if (isValidPayload(payload, isMarketData)) {
              marketData.push(payload.new);
            }
          }
        )
        .subscribe(async (status) => {
          if (status !== "SUBSCRIBED") {
            reject(new Error(`Subscription failed: ${status}`));
          }

          // Insert test market data
          const { error: insertError } = await supabase
            .from("market_data")
            .insert({
              symbol: "BTC/USD",
              price: 50000,
              timestamp: new Date().toISOString(),
              change_percentage: 0,
              market_type: "spot",
              name: "Bitcoin/US Dollar",
              volume: "1000",
              high_price: 51000,
              low_price: 49000,
              last_price: 50000,
              last_updated: new Date().toISOString(),
            });

          if (insertError) reject(insertError);
        });
    });

    // Wait for data to be received
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify we received the update
    expect(marketData.length).toBeGreaterThan(0);
    expect(marketData[0].symbol).toBe("BTC/USD");
    expect(marketData[0].price).toBe(50000);

    await channel.unsubscribe();
  });

  test("should handle multiple market data updates", async () => {
    const channel = supabase.channel("market-data-multi");
    const marketUpdates: MarketData[] = [];
    const symbols = ["BTC/USD", "ETH/USD", "XRP/USD"];

    await new Promise<void>((resolve, reject) => {
      channel
        .on("presence", { event: "sync" }, () => {
          resolve();
        })
        .on(
          "postgres_changes" as const,
          {
            event: "*",
            schema: "public",
            table: "market_data",
            filter: `symbol=in.(${symbols.map((s) => `'${s}'`).join(",")})`,
          },
          (payload: MarketDataPayload) => {
            if (isValidPayload(payload, isMarketData)) {
              marketUpdates.push(payload.new);
            }
          }
        )
        .subscribe(async (status) => {
          if (status !== "SUBSCRIBED") {
            reject(new Error(`Subscription failed: ${status}`));
          }

          // Insert multiple market data entries
          const updates = symbols.map((symbol) => ({
            symbol,
            price: 1000 + Math.random() * 50000,
            timestamp: new Date().toISOString(),
            change_percentage: Math.random() * 10 - 5,
            market_type: "spot",
            name: `${symbol.split("/")[0]}/US Dollar`,
            volume: Math.floor(Math.random() * 10000).toString(),
            high_price: 52000,
            low_price: 48000,
            last_price: 50000,
            last_updated: new Date().toISOString(),
          }));

          const { error: insertError } = await supabase
            .from("market_data")
            .insert(updates);

          if (insertError) reject(insertError);
        });
    });

    // Wait for updates
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify we received all updates
    expect(marketUpdates.length).toBe(symbols.length);
    expect(new Set(marketUpdates.map((u) => u.symbol))).toEqual(
      new Set(symbols)
    );

    await channel.unsubscribe();
  });

  test("should handle position updates with calculations", async () => {
    const channel = supabase.channel("positions-complex");
    const updates: Database["public"]["Tables"]["positions"]["Row"][] = [];

    await new Promise<void>((resolve, reject) => {
      channel
        .on("presence", { event: "sync" }, () => {
          resolve();
        })
        .on(
          "postgres_changes" as const,
          {
            event: "*",
            schema: "public",
            table: "positions",
            filter: `user_id=eq.${userId}`,
          },
          (payload: PositionPayload) => {
            if (isValidPayload(payload, isPosition)) {
              updates.push(payload.new);
            }
          }
        )
        .subscribe(async (status) => {
          if (status !== "SUBSCRIBED") {
            reject(new Error(`Subscription failed: ${status}`));
          }

          // Create initial position
          const { data: position, error: createError } = await supabase
            .from("positions")
            .insert({
              user_id: userId,
              symbol: "BTC/USD",
              units: 1,
              entry_price: 50000,
              direction: "LONG",
              asset_class: "CRYPTO",
              current_price: 50000,
              margin_used: 5000,
              position_value: 50000,
              leverage_ratio: 10,
              status: "OPEN",
            })
            .select()
            .single();

          if (createError || !position) {
            reject(createError || new Error("Failed to create position"));
            return;
          }

          // Simulate price movement and PnL updates
          const priceUpdates = [
            { current_price: 51000, unrealized_pnl: 1000 },
            { current_price: 52000, unrealized_pnl: 2000 },
            { current_price: 53000, unrealized_pnl: 3000 },
          ];

          for (const update of priceUpdates) {
            await supabase
              .from("positions")
              .update(update)
              .eq("id", position.id);
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        });
    });

    // Wait for all updates
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Verify we received all updates with correct calculations
    expect(updates.length).toBe(4); // Initial + 3 updates
    expect(updates[updates.length - 1].current_price).toBe(53000);
    expect(updates[updates.length - 1].unrealized_pnl).toBe(3000);

    await channel.unsubscribe();
  });

  test("should handle subscription reconnection", async () => {
    const channel = supabase.channel("reconnect-test");
    const updates: MarketData[] = [];

    await new Promise<void>((resolve, reject) => {
      channel
        .on("presence", { event: "sync" }, () => {
          resolve();
        })
        .on(
          "postgres_changes" as const,
          {
            event: "INSERT",
            schema: "public",
            table: "market_data",
          },
          (payload: MarketDataPayload) => {
            if (isValidPayload(payload, isMarketData)) {
              updates.push(payload.new);
            }
          }
        )
        .subscribe();
    });

    // Simulate disconnect/reconnect
    await channel.unsubscribe();
    await new Promise((resolve) => setTimeout(resolve, 100));
    await channel.subscribe();

    // Insert data after reconnection
    const { error: insertError } = await supabase.from("market_data").insert({
      symbol: "LTC/USD",
      price: 100,
      timestamp: new Date().toISOString(),
      change_percentage: 0,
      market_type: "spot",
      name: "Litecoin/US Dollar",
      volume: "500",
      high_price: 105,
      low_price: 95,
      last_price: 100,
      last_updated: new Date().toISOString(),
    });

    expect(insertError).toBeNull();

    // Wait for update
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify we received the update after reconnection
    expect(updates.length).toBeGreaterThan(0);
    expect(updates[updates.length - 1].symbol).toBe("LTC/USD");

    await channel.unsubscribe();
  });

  afterAll(async () => {
    // Clean up test data
    await supabase.from("positions").delete().eq("user_id", userId);
    await supabase
      .from("market_data")
      .delete()
      .in("symbol", ["BTC/USD", "ETH/USD", "XRP/USD", "LTC/USD"]);

    // Delete test user
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.error("Error cleaning up test user:", error);
  });
});
