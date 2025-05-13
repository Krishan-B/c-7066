
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignUpButtonProps {
  loading: boolean;
}

const SignUpButton = ({ loading }: SignUpButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={loading}
    >
      {loading ? "Creating account..." : (
        <span className="flex items-center">
          Sign Up
          <ArrowRight className="ml-2 h-4 w-4" />
        </span>
      )}
    </Button>
  );
};

export default SignUpButton;
