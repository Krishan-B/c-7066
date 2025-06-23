import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Define a type for the watchlist item (customize as needed)
export interface WatchlistItem {
  id: string;
  symbol: string;
  [key: string]: unknown;
}

// Define a type for the API response (array of items or object)
export type WatchlistResponse = WatchlistItem[] | Record<string, unknown>;

export const getWatchlist = async (): Promise<WatchlistResponse> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");

    const accessToken = String(session.access_token);

    const response = await fetch(`${API_BASE_URL}/watchlist`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WatchlistResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw error;
  }
};

export const addToWatchlist = async (
  symbol: string
): Promise<WatchlistResponse> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");

    // Fix TypeScript error by converting access_token to string
    const accessToken = String(session.access_token);

    const response = await fetch(`${API_BASE_URL}/watchlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ symbol }),
    });

    if (!response.ok) {
      throw new Error(`Could not add ${symbol} to watchlist`);
    }

    const data: WatchlistResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

export const removeFromWatchlist = async (
  symbol: string
): Promise<WatchlistResponse> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");

    // Fix TypeScript error by converting access_token to string
    const accessToken = String(session.access_token);

    const response = await fetch(`${API_BASE_URL}/watchlist/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ symbol }),
    });

    if (!response.ok) {
      throw new Error(`Could not remove ${symbol} from watchlist`);
    }

    const data: WatchlistResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
};
