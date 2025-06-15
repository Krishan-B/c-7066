import * as React from "react";
interface MobileNavItemProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    href: string;
}
declare const MobileNavItem: ({ title, href }: MobileNavItemProps) => import("react/jsx-runtime").JSX.Element;
export default MobileNavItem;
