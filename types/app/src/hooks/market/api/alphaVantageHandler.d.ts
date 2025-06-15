import { type Asset } from "../types";
export declare function fetchAlphaVantageData(marketTypes: string[], symbols: Record<string, string[]>): Promise<Asset[]>;
