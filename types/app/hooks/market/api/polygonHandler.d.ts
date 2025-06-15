import { type Asset } from "../types";
export declare const fetchStockData: (symbols: string[]) => Promise<Asset[]>;
export declare const fetchCryptoData: (symbols: string[]) => Promise<Asset[]>;
export declare const fetchForexData: (symbols: string[]) => Promise<Asset[]>;
