/**
 * Employee PIN Login Component
 * For production dashboard access
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const pinSchema = z.object({
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits'),
});

type PINFormData = z.infer<typeof pinSchema>;

interface EmployeePINLoginProps {
  onSuccess?: () => void;
}

export function EmployeePINLogin({ onSuccess }: EmployeePINLoginProps) {
  const { validateEmployeePIN } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState('');

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<PINFormData>({
    resolver: zodResolver(pinSchema),
  });

  const onSubmit = async () => {
    if (!pinValue || pinValue.length < 4) {
      setError('Please enter a valid PIN (4-6 digits)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateEmployeePIN({ pin: pinValue });
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Invalid PIN. Please try again.');
        setPinValue(''); // Clear PIN on error
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('PIN validation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Production Dashboard</CardTitle>
        <CardDescription>
          Enter your 4-6 digit PIN to access the production dashboard
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center space-y-4">
            <Label htmlFor="pin" className="sr-only">PIN</Label>
            <InputOTP
              maxLength={6}
              value={pinValue}
              onChange={setPinValue}
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
            
            {errors.pin && (
              <p className="text-sm text-destructive">{errors.pin.message}</p>
            )}

            <p className="text-xs text-muted-foreground">
              Enter your employee PIN (4-6 digits)
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading || pinValue.length < 4}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Clock In
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            Contact your supervisor if you've forgotten your PIN
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
