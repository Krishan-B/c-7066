import LoginForm from "@/features/auth/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (session) navigate("/dashboard");
  }, [session, navigate]);
  return <LoginForm />;
};

export default Login;
