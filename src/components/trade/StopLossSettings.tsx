
import React from "react";

interface StopLossSettingsProps {
  currentPrice: number;
}

export const StopLossSettings = ({ currentPrice }: StopLossSettingsProps) => {
  return (
    <div className="ml-6 mb-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Close rate:</label>
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
              placeholder="Rate"
            />
            <button 
              type="button" 
              className="px-3 py-2 border border-input bg-background rounded-r-md"
              onClick={() => {}}
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Close amount:</label>
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
              placeholder="Amount"
            />
            <button 
              type="button" 
              className="px-3 py-2 border border-input bg-background rounded-r-md"
              onClick={() => {}}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Rate should be between {(currentPrice * 0.9).toFixed(4)} and {(currentPrice * 0.95).toFixed(4)}
      </p>
    </div>
  );
};
