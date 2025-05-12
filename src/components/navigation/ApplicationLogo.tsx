
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
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
    <div onClick={handleLogoClick} className="mr-4 flex items-center space-x-2 fixed cursor-pointer">
      <LineChart className="h-6 w-6 text-primary" />
      <span className="font-bold sm:inline-block">
        TradePro
      </span>
    </div>
  );
};

export default ApplicationLogo;
