import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail } from '@/utils/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuthRateLimiting } from '@/utils/rateLimiter';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    blocked: boolean;
    waitTime: number;
    attemptsLeft: number;
  }>({
    blocked: false,
    waitTime: 0,
    attemptsLeft: 5,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check for existing rate limit blocks
  useAuthRateLimiting((waitTime) => {
    setRateLimitInfo((prev) => ({
      ...prev,
      blocked: true,
      waitTime,
      attemptsLeft: 0,
    }));
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (rateLimitInfo.blocked) {
      toast({
        variant: 'destructive',
        title: 'Access Blocked',
        description: `Too many login attempts. Please try again in ${Math.ceil(
          rateLimitInfo.waitTime / 60
        )} minutes.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error, attemptsLeft } = await signInWithEmail(values.email, values.password);

      if (error) {
        // Update attempts remaining
        setRateLimitInfo((prev) => ({
          ...prev,
          attemptsLeft: attemptsLeft || prev.attemptsLeft - 1,
        }));

        if ('code' in error && error.code === 'RATE_LIMIT_EXCEEDED') {
          const rateLimitError = error as { waitTime: number };
          setRateLimitInfo({
            blocked: true,
            waitTime: rateLimitError.waitTime,
            attemptsLeft: 0,
          });
          toast({
            variant: 'destructive',
            title: 'Too Many Attempts',
            description: error.message,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid email or password.',
          });
        }
        return;
      }

      // Success
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {rateLimitInfo.blocked && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Account temporarily locked. Please try again in{' '}
              {Math.ceil(rateLimitInfo.waitTime / 60)} minutes.
            </AlertDescription>
          </Alert>
        )}

        {!rateLimitInfo.blocked && rateLimitInfo.attemptsLeft < 3 && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {rateLimitInfo.attemptsLeft} login attempts remaining before temporary lockout.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  disabled={isLoading || rateLimitInfo.blocked}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your password"
                  type="password"
                  disabled={isLoading || rateLimitInfo.blocked}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || rateLimitInfo.blocked}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}
