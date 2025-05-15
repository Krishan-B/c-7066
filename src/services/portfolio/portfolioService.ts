
import { supabase } from "@/integrations/supabase/client";
import { 
  Asset, 
  ClosedPosition, 
  AllocationData,
  PerformanceData,
  PortfolioData 
} from '@/types/account';
import { toast } from "sonner";

/**
 * Get full portfolio data from analytics edge function
 */
export async function getPortfolioData(userId: string): Promise<PortfolioData> {
  try {
    const { data, error } = await supabase.functions.invoke('portfolio-analytics', {
      body: { userId }
    });
    
    if (error) {
      throw new Error(`Failed to fetch portfolio data: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Portfolio data fetch error:', error);
    throw error;
  }
}

/**
 * Update portfolio position with latest market price
 */
export async function updatePortfolioPosition(
  userId: string, 
  assetSymbol: string, 
  currentPrice: number
): Promise<boolean> {
  try {
    // Get the existing position first
    const { data: position, error: fetchError } = await supabase
      .from('user_portfolio')
      .select('units, average_price')
      .eq('user_id', userId)
      .eq('asset_symbol', assetSymbol)
      .single();
      
    if (fetchError) {
      throw fetchError;
    }
    
    // Calculate values directly rather than using RPC
    const totalValue = position.units * currentPrice;
    const pnl = position.units * (currentPrice - position.average_price);
    const pnlPercentage = ((currentPrice - position.average_price) / position.average_price) * 100;
    
    // Now update the position with calculated values
    const { error } = await supabase
      .from('user_portfolio')
      .update({
        current_price: currentPrice,
        total_value: totalValue,
        pnl: pnl,
        pnl_percentage: pnlPercentage,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('asset_symbol', assetSymbol);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating portfolio position:', error);
    return false;
  }
}

/**
 * Export portfolio report as CSV
 */
export async function exportPortfolioReport(userId: string): Promise<string> {
  try {
    const { data: portfolioData, error } = await supabase
      .from('user_portfolio')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Format CSV header
    const headers = [
      'Asset Symbol',
      'Asset Name',
      'Market Type',
      'Units',
      'Average Price',
      'Current Price',
      'Total Value',
      'P&L',
      'P&L %',
      'Last Updated'
    ];
    
    // Format CSV rows
    const rows = portfolioData.map(item => [
      item.asset_symbol,
      item.asset_name,
      item.market_type,
      item.units,
      item.average_price,
      item.current_price,
      item.total_value,
      item.pnl,
      item.pnl_percentage,
      item.last_updated
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success("Portfolio report exported successfully");
    return url;
  } catch (error) {
    console.error('Error exporting portfolio report:', error);
    toast.error("Failed to export portfolio report");
    throw error;
  }
}
