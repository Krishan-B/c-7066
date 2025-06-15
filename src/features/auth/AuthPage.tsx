import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart } from 'lucide-react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from || '/dashboard';

  // Set default tab based on URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [location]);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          toast({
            title: 'Session Error',
            description: 'There was a problem checking your session',
            variant: 'destructive',
          });
          return;
        }

        if (data.session) {
          navigate(from, { replace: true });
        }
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        navigate(from, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, from, toast]);

  const navigateToHome = () => {
    navigate('/');
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LineChart className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div
            onClick={navigateToHome}
            className="flex items-center justify-center mb-2 cursor-pointer"
          >
            <LineChart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold ml-2">TradePro</h1>
          </div>
          <p className="text-muted-foreground">
            {activeTab === 'signin'
              ? 'Sign in to your account to continue'
              : 'Create a new account to get started'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Authentication</CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'signin'
                ? 'Welcome back! Please enter your credentials'
                : 'Join thousands of traders worldwide'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
