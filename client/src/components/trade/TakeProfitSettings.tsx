import React from 'react';

interface TakeProfitSettingsProps {
  currentPrice: number;
}

export const TakeProfitSettings = ({ currentPrice }: TakeProfitSettingsProps) => {
  return (
    <div className="mb-4 ml-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Close rate:</label>
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-l-md border border-input bg-background px-3 py-2"
              onClick={() => {}}
            >
              -
            </button>
            <input
              type="text"
              className="flex-1 border-y border-input bg-background py-2 text-center"
              placeholder="Rate"
            />
            <button
              type="button"
              className="rounded-r-md border border-input bg-background px-3 py-2"
              onClick={() => {}}
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted-foreground">Close amount:</label>
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-l-md border border-input bg-background px-3 py-2"
              onClick={() => {}}
            >
              -
            </button>
            <input
              type="text"
              className="flex-1 border-y border-input bg-background py-2 text-center"
              placeholder="Amount"
            />
            <button
              type="button"
              className="rounded-r-md border border-input bg-background px-3 py-2"
              onClick={() => {}}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Rate should be between {(currentPrice * 1.05).toFixed(4)} and{' '}
        {(currentPrice * 1.1).toFixed(4)}
      </p>
    </div>
  );
};
