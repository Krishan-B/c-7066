import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ApplicationLogo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const linkTo = user ? "/dashboard" : "/";

  const handleLogoClick = () => {
    navigate(linkTo);
  };

  return (
    <div
      onClick={handleLogoClick}
      className="mr-4 flex items-center space-x-3 fixed cursor-pointer h-16 pl-2"
    >
      <LineChart
        className="h-10 w-10 text-primary drop-shadow-lg"
        style={{ color: "hsl(var(--primary))" }}
      />
      <span
        className="font-bold text-2xl sm:inline-block transition-colors duration-300
        text-neutral-900 dark:text-white"
      >
        TradePro
      </span>
    </div>
  );
};

export default ApplicationLogo;
