
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface LoginButtonProps {
  loading: boolean;
}

const LoginButton = ({ loading }: LoginButtonProps) => {
  return (
    <Button type="submit" className="w-full" disabled={loading}>      {loading ? "Signing in..." : (
        <span className="flex items-center">
          Sign in
          <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      )}
    </Button>
  );
};

export default LoginButton;
