/**
 * Employee Login Page
 * Large PIN pad interface for production floor access
 * Touch-friendly design optimized for tablets
 * Routes: /login/employee
 */

import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Printer, Delete, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function EmployeeLogin() {
  const navigate = useNavigate();
  const { validateEmployeePIN } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clockIn, setClockIn] = useState(true);

  const handleDigit = useCallback((digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setError(null);
    }
  }, [pin]);

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setPin('');
    setError(null);
  }, []);

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError('Please enter at least 4 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateEmployeePIN({ pin });
      
      if (result.success) {
        // Could track clock-in status here if needed
        navigate('/production', { replace: true });
      } else {
        setError(result.error || 'Invalid PIN. Please try again.');
        setPin(''); // Clear PIN on error
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  // Render PIN display dots
  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <div
          key={i}
          className={`w-4 h-4 rounded-full transition-all duration-150 ${
            i < pin.length
              ? 'bg-primary scale-110'
              : 'bg-muted border-2 border-muted-foreground/20'
          }`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-sm">
        {/* Header with branding */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="text-primary-foreground" size={28} />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Production Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Enter your PIN to clock in
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">Employee Login</CardTitle>
            <CardDescription className="text-center">
              Enter your 4-6 digit PIN
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* PIN Display */}
            <div className="flex justify-center gap-3 py-4">
              {renderPinDots()}
            </div>

            {/* Number Pad - Touch friendly with 44px minimum */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <Button
                  key={digit}
                  type="button"
                  variant="outline"
                  className="h-16 text-2xl font-semibold hover:bg-muted active:scale-95 transition-transform"
                  onClick={() => handleDigit(digit)}
                  disabled={isLoading}
                >
                  {digit}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                className="h-16 hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-transform"
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-16 text-2xl font-semibold hover:bg-muted active:scale-95 transition-transform"
                onClick={() => handleDigit('0')}
                disabled={isLoading}
              >
                0
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-16 hover:bg-muted active:scale-95 transition-transform"
                onClick={handleBackspace}
                disabled={isLoading}
              >
                <Delete className="h-6 w-6" />
              </Button>
            </div>

            {/* Clock In Toggle */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Switch
                id="clock-in"
                checked={clockIn}
                onCheckedChange={setClockIn}
                disabled={isLoading}
              />
              <Label htmlFor="clock-in" className="flex items-center gap-2 cursor-pointer">
                <Clock className="h-4 w-4" />
                Clock in when logging in
              </Label>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="button"
              className="w-full h-14 text-lg"
              onClick={handleSubmit}
              disabled={isLoading || pin.length < 4}
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {clockIn ? 'Clock In' : 'Sign In'}
            </Button>
            
            <div className="text-xs text-center text-muted-foreground">
              Contact your supervisor if you've forgotten your PIN
            </div>
          </CardFooter>
        </Card>

        {/* Footer links */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-y-2">
          <div className="flex items-center justify-center gap-4">
            <Link to="/login/customer" className="hover:underline">Customer Login</Link>
            <span>•</span>
            <Link to="/login/admin" className="hover:underline">Admin Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLogin;
