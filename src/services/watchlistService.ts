import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getWatchlist = async (): Promise<any> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");

    const accessToken = String(session.access_token);

    const response = await fetch(`${API_BASE_URL}/watchlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error: any) {
    console.error("Error fetching watchlist:", error);
    throw error;
  }
};

export const addToWatchlist = async (symbol: string): Promise<any> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");
    
    // Fix TypeScript error by converting access_token to string
    const accessToken = String(session.access_token);
    
    const response = await fetch(`${API_BASE_URL}/watchlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ symbol })
    });

    if (!response.ok) {
      throw new Error(`Could not add ${symbol} to watchlist`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};

export const removeFromWatchlist = async (symbol: string): Promise<any> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No session found");
    
    // Fix TypeScript error by converting access_token to string
    const accessToken = String(session.access_token);
    
    const response = await fetch(`${API_BASE_URL}/watchlist/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ symbol })
    });

    if (!response.ok) {
      throw new Error(`Could not remove ${symbol} from watchlist`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error removing from watchlist:", error);
    throw error;
  }
};
