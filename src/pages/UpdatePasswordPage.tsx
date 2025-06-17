import UpdatePasswordForm from '@/features/auth/components/UpdatePasswordForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpdatePasswordPage = () => {
  const navigate = useNavigate();
  const navigateToHome = () => {
    navigate('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <button
            onClick={navigateToHome}
            onKeyDown={(e) => e.key === 'Enter' && navigateToHome()}
            className="flex items-center justify-center mb-2 cursor-pointer bg-transparent border-none p-0"
            aria-label="Go to homepage"
            tabIndex={0}
          >
            <LineChart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold ml-2">TradePro</h1>
          </button>
          <p className="text-muted-foreground">Set your new password.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Enter and confirm your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;
