export declare enum DataSource {
    POLYGON = "polygon",
    FINNHUB = "finnhub",
    ALPHA_VANTAGE = "alpha_vantage",
    EDGE_FUNCTION = "edge_function"
}
export declare const setApiKey: (provider: string, apiKey: string) => boolean;
export declare const hasApiKey: (provider: string) => boolean;
export declare const getApiKeyStatus: () => {
    polygon: boolean;
    alphaVantage: boolean;
    finnhub: boolean;
};
export declare const determineDataSource: () => Promise<{
    dataSource: DataSource;
}>;
