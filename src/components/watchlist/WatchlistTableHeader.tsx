
import React from 'react';

const WatchlistTableHeader = () => {
  return (
    <thead>
      <tr className="border-b border-secondary text-xs text-muted-foreground">
        <th className="py-3 px-2 text-left">Name</th>
        <th className="py-3 px-2 text-right">Price</th>
        <th className="py-3 px-2 text-right">24h Change</th>
        <th className="py-3 px-2 text-right">Market</th>
        <th className="py-3 px-2 text-right">Volume</th>
        <th className="py-3 px-2 text-center">Action</th>
      </tr>
    </thead>
  );
};

export default WatchlistTableHeader;
