/**
 * Admin (Owner) Login Page
 * Email + password + 2FA code for secure admin access
 * Routes: /login/admin
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsOwner } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Get redirect path from location state, or default to admin
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitCredentials = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // First attempt without 2FA - if 2FA is required, the API should return a specific error
      const result = await loginAsOwner({ 
        email: data.email, 
        password: data.password 
      });
      
      if (result.success) {
        navigate(from, { replace: true });
      } else if (result.error?.includes('2FA') || result.error?.includes('two-factor')) {
        // 2FA required - move to 2FA step
        setCredentials({ email: data.email, password: data.password });
        setStep('2fa');
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit2FA = async () => {
    if (!credentials || twoFactorCode.length < 6) {
      setError('Please enter the complete 2FA code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loginAsOwner({ 
        email: credentials.email, 
        password: credentials.password,
        twoFactorCode 
      });
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Invalid verification code. Please try again.');
        setTwoFactorCode('');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setTwoFactorCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-primary-foreground" size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Secure access for shop owners
          </p>
        </div>

        {/* Security notice */}
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm">
            This is a restricted area. All login attempts are logged.
          </AlertDescription>
        </Alert>

        <Card className="w-full">
          {step === 'credentials' ? (
            <>
              <CardHeader>
                <CardTitle>Owner Login</CardTitle>
                <CardDescription>
                  Enter your admin credentials
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmitCredentials)}>
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
                      placeholder="admin@printshop.com"
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
                    Continue
                  </Button>
                </CardFooter>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Enter the 6-digit code from your authenticator app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col items-center space-y-4">
                  <InputOTP
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={setTwoFactorCode}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  <p className="text-xs text-muted-foreground text-center">
                    Enter the code from your authenticator app
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={onSubmit2FA}
                  disabled={isLoading || twoFactorCode.length < 6}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Sign In
                </Button>
                <Button 
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('credentials');
                    setCredentials(null);
                    setTwoFactorCode('');
                    setError(null);
                  }}
                  disabled={isLoading}
                >
                  Back to login
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-4">
            <Link to="/login/customer" className="hover:underline">Customer Login</Link>
            <span>•</span>
            <Link to="/login/employee" className="hover:underline">Employee Login</Link>
          </div>
          <p>
            Session timeout: 30 minutes of inactivity
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
