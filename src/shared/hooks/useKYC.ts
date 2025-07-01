import { useState, useEffect } from "react";

interface KYCStatus {
  isVerified: boolean;
  level: "none" | "basic" | "intermediate" | "advanced";
  requiredLevel: "none" | "basic" | "intermediate" | "advanced";
  canTrade: boolean;
}

export const useKYC = () => {
  const [status, setStatus] = useState<KYCStatus>({
    isVerified: false,
    level: "none",
    requiredLevel: "basic",
    canTrade: false,
  });

  const getKYCStatus = async () => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newStatus: {
        verified: boolean;
        level: KYCStatus["level"];
        requiredLevel: KYCStatus["requiredLevel"];
        canTrade: boolean;
      } = {
        verified: true,
        level: "basic",
        requiredLevel: "basic",
        canTrade: true,
      };

      setStatus({
        isVerified: newStatus.verified,
        level: newStatus.level,
        requiredLevel: newStatus.requiredLevel,
        canTrade: newStatus.canTrade,
      });

      return newStatus;
    } catch (error) {
      console.error("Error checking KYC status:", error);
      return "Error fetching KYC status";
    }
  };

  useEffect(() => {
    getKYCStatus();
  }, []);

  return {
    ...status,
    getKYCStatus,
  };
};
