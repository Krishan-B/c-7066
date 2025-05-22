
declare module 'react-ts-tradingview-widgets' {
  import * as React from 'react';

  export interface AdvancedRealTimeChartProps {
    symbol?: string;
    theme?: string;
    interval?: string;
    range?: string;
    timezone?: string;
    style?: string;
    autosize?: boolean;
    allow_symbol_change?: boolean;
    save_image?: boolean;
    hide_side_toolbar?: boolean;
    details?: boolean;
    hotlist?: boolean;
    calendar?: boolean;
    enable_publishing?: boolean;
    hide_top_toolbar?: boolean;
    width?: string | number;
    height?: string | number;
    container_id?: string;
  }

  export class AdvancedRealTimeChart extends React.Component<AdvancedRealTimeChartProps> {}

  // Add other components from the library as needed
}
