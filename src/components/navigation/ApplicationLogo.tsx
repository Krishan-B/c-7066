
import * as React from "react"
import { Link } from "react-router-dom"
import { LayoutDashboard } from "lucide-react"

const ApplicationLogo = () => {
  return (
    <Link to="/" className="mr-4 flex items-center space-x-2">
      <LayoutDashboard className="h-6 w-6" />
      <span className="hidden font-bold sm:inline-block">
        Tradable
      </span>
    </Link>
  );
};

export default ApplicationLogo;
