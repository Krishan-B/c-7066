
import * as React from "react"
import { Link } from "react-router-dom"
import { LineChart } from "lucide-react"

const ApplicationLogo = () => {
  return (
    <Link to="/" className="mr-4 flex items-center space-x-2">
      <LineChart className="h-6 w-6 text-primary" />
      <span className="font-bold sm:inline-block">
        TradePro
      </span>
    </Link>
  );
};

export default ApplicationLogo;
