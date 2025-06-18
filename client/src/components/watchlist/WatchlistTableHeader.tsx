import React from 'react';

const WatchlistTableHeader = () => {
  return (
    <thead>
      <tr className="border-b border-secondary text-xs text-muted-foreground">
        <th className="px-2 py-3 text-left">Name</th>
        <th className="px-2 py-3 text-right">Price</th>
        <th className="px-2 py-3 text-right">24h Change</th>
        <th className="px-2 py-3 text-right">Market</th>
        <th className="px-2 py-3 text-right">Volume</th>
        <th className="px-2 py-3 text-center">Action</th>
      </tr>
    </thead>
  );
};

export default WatchlistTableHeader;
