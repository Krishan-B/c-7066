import RegisterForm from "@/features/auth/components/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (session) navigate("/dashboard");
  }, [session, navigate]);
  return <RegisterForm />;
};

export default Register;
