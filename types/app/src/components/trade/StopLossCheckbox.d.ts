interface StopLossCheckboxProps {
    hasStopLoss: boolean;
    setHasStopLoss: (value: boolean) => void;
    isExecuting: boolean;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}
export declare const StopLossCheckbox: React.FC<StopLossCheckboxProps>;
export {};
