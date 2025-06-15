interface TradeSlidePanelOptionCheckboxProps {
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: () => void;
    tooltip: string;
    disabled?: boolean;
}
export declare const TradeSlidePanelOptionCheckbox: ({ id, label, checked, onCheckedChange, tooltip, disabled, }: TradeSlidePanelOptionCheckboxProps) => import("react/jsx-runtime").JSX.Element;
export {};
