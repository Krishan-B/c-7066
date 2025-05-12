
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { LineChart } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

const ApplicationLogo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const linkTo = user ? "/dashboard" : "/";
  
  const handleLogoClick = () => {
    navigate(linkTo);
  };
  
  return (
    <div onClick={handleLogoClick} className="mr-4 flex items-center space-x-2 cursor-pointer">
      <LineChart className="h-6 w-6 text-primary" />
      <span className="font-bold text-foreground sm:inline-block">
        TradePro
      </span>
    </div>
  );
};

export default ApplicationLogo;
