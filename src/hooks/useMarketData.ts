
// This file is kept for backward compatibility
// Components should gradually migrate to using the new import path
import { useMarketData } from './market/useMarketData';
import { Asset } from './market/types';

export { useMarketData, Asset };
export * from './market/types';
