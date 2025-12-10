/**
 * Customer Login Page
 * Email + password form with clean, welcoming design
 * Routes: /login/customer
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Printer, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCustomer } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get redirect path from location state, or default to portal
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/portal';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginCustomer({ email: data.email, password: data.password });
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Login failed. Please check your credentials and try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="text-primary-foreground" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">PrintShop OS</span>
          </Link>
          <p className="text-muted-foreground">
            Sign in to your customer account
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              {/* Social login buttons - disabled but prepared for future */}
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <Button variant="outline" disabled className="opacity-50">
                  Google
                </Button>
                <Button variant="outline" disabled className="opacity-50">
                  Apple
                </Button>
              </div>
              
              <div className="text-sm text-center text-muted-foreground">
                New customer?{' '}
                <Link 
                  to="/designer" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Start designing <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-4">
            <Link to="/login/employee" className="hover:underline">Employee Login</Link>
            <span>•</span>
            <Link to="/login/admin" className="hover:underline">Admin Login</Link>
          </div>
          <p>
            Secure authentication with encrypted credentials
          </p>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;
