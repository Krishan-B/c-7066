
import * as React from "react"
import { useAuth } from "@/hooks/useAuth"
import AccountMetricsHeader from "./AccountMetricsHeader"

const MainNav = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) => {
  const { user } = useAuth();

  // Don't display metrics if user is not logged in
  if (!user) {
    return <div className="hidden md:flex flex-1"></div>;
  }

  return (
    <div className="hidden md:flex flex-1 items-center justify-center overflow-x-auto">
      <AccountMetricsHeader />
    </div>
  );
};

export default MainNav;
