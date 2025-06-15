interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: string[];
    ctaText: string;
    highlighted?: boolean;
    onClick?: () => void;
}
declare const PricingCard: ({ title, price, description, features, ctaText, highlighted, onClick }: PricingCardProps) => import("react/jsx-runtime").JSX.Element;
export default PricingCard;
