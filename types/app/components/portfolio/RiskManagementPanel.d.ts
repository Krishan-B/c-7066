interface RiskManagementPanelProps {
    marginLevel: number;
    equity: number;
    usedMargin: number;
    marginStatus: string;
}
declare const RiskManagementPanel: ({ marginLevel, equity, usedMargin, marginStatus }: RiskManagementPanelProps) => import("react/jsx-runtime").JSX.Element;
export default RiskManagementPanel;
