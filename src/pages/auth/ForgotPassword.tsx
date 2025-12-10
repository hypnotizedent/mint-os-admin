import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
        <p className="text-muted-foreground mb-6">
          Password recovery coming soon.
        </p>
        <Link to="/customer/login">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
