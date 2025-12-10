/**
 * Main Authentication Page
 * Handles login/signup switching and employee PIN login
 */

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { EmployeePINLogin } from './EmployeePINLogin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthPageProps {
  onSuccess?: () => void;
  defaultMode?: 'customer' | 'employee';
}

export function AuthPage({ onSuccess, defaultMode = 'customer' }: AuthPageProps) {
  const [customerMode, setCustomerMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">PrintShop OS</h1>
          <p className="text-muted-foreground mt-2">
            Enterprise Print Shop Management System
          </p>
        </div>

        <Tabs defaultValue={defaultMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-4">
            {customerMode === 'login' ? (
              <LoginForm
                onSwitchToSignup={() => setCustomerMode('signup')}
                onSuccess={onSuccess}
              />
            ) : (
              <SignupForm
                onSwitchToLogin={() => setCustomerMode('login')}
                onSuccess={onSuccess}
              />
            )}
          </TabsContent>

          <TabsContent value="employee">
            <EmployeePINLogin onSuccess={onSuccess} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Secure authentication with JWT tokens and bcrypt password hashing
          </p>
        </div>
      </div>
    </div>
  );
}
