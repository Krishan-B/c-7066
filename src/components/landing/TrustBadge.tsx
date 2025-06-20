
import React from "react";
import { Shield } from "lucide-react";

interface TrustBadgeProps {
  text: string;
}

const TrustBadge = ({ text }: TrustBadgeProps) => {
  return (
    <div className="flex items-center text-sm">
      <Shield className="h-4 w-4 text-success mr-2" />
      <span>{text}</span>
    </div>
  );
};

export default TrustBadge;
