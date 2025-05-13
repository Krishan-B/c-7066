
import React from "react";

interface EntryRateInputProps {
  currentPrice: number;
}

export const EntryRateInput = ({ currentPrice }: EntryRateInputProps) => {
  return (
    <div className="mb-4">
      <label className="text-sm text-muted-foreground mb-1 block">Order rate:</label>
      <div className="flex items-center">
        <button 
          type="button" 
          className="px-3 py-2 border border-input bg-background rounded-l-md"
          onClick={() => {}}
        >
          -
        </button>
        <input 
          type="text" 
          className="flex-1 text-center border-y border-input bg-background py-2"
          placeholder="Enter rate"
          defaultValue={currentPrice.toFixed(4)}
        />
        <button 
          type="button" 
          className="px-3 py-2 border border-input bg-background rounded-r-md"
          onClick={() => {}}
        >
          +
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Rate should be above {(currentPrice * 0.98).toFixed(4)} or below {(currentPrice * 1.02).toFixed(4)}
      </p>
    </div>
  );
};
