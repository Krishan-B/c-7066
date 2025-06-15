interface OrderTypeSelectorProps {
    orderType: string;
    onOrderTypeChange: (orderType: string) => void;
    disabled?: boolean;
}
declare const OrderTypeSelector: React.FC<OrderTypeSelectorProps>;
export default OrderTypeSelector;
