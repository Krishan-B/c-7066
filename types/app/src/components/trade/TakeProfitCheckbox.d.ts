interface TakeProfitCheckboxProps {
    hasTakeProfit: boolean;
    setHasTakeProfit: (value: boolean) => void;
    isExecuting: boolean;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}
export declare const TakeProfitCheckbox: React.FC<TakeProfitCheckboxProps>;
export {};
