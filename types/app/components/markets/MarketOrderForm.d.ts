interface MarketOrderFormProps {
    selectedAsset: {
        name: string;
        symbol: string;
        price: number;
    };
}
declare const MarketOrderForm: ({ selectedAsset }: MarketOrderFormProps) => import("react/jsx-runtime").JSX.Element;
export default MarketOrderForm;
