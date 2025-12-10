# Frontend Authentication - Quick Start Guide

## ✅ Status: Phase 1 Complete

All authentication infrastructure is built and ready to use.

## 🚀 Quick Integration (3 Steps)

### Step 1: Wrap App with AuthProvider

Update `frontend/src/main.tsx`:

```tsx
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>
)
```

### Step 2: Add Auth Check to App

Update `frontend/src/App.tsx`:

```tsx
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth/AuthPage';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show auth page if not logged in
  if (!isAuthenticated && !isLoading) {
    return <AuthPage />;
  }

  // Show loading spinner
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>;
  }

  // Your existing app code here...
  return (
    <div>... existing app ...</div>
  );
}
```

### Step 3: Start the Services

```bash
# Terminal 1: Start Strapi CMS
cd printshop-strapi && npm run develop

# Terminal 2: Start API service
cd services/api && npm run dev

# Terminal 3: Start Frontend
cd frontend && npm run dev

# Browser: http://localhost:5173
```

## 🎯 What You Get

### Customer Auth
- ✅ Email/password signup
- ✅ Login with validation
- ✅ JWT tokens (7-day expiration)
- ✅ Bcrypt password hashing
- ✅ Automatic session persistence

### Employee Auth
- ✅ 4-6 digit PIN entry
- ✅ Production dashboard access
- ✅ Separate employee tokens

### Security
- ✅ Token stored in localStorage + httpOnly cookies
- ✅ Automatic token verification on app load
- ✅ Protected routes
- ✅ Role-based access (customer vs employee)

## 📦 Available Components

```tsx
// Auth page with login/signup tabs
import { AuthPage } from '@/components/auth/AuthPage';

// Individual forms
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { EmployeePINLogin } from '@/components/auth/EmployeePINLogin';

// Protected routes
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Auth context & hook
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
```

## 🔒 Protect Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Protect entire sections
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Customer-only pages
<ProtectedRoute allowedUserTypes={['customer']}>
  <CustomerPortal />
</ProtectedRoute>

// Employee-only pages
<ProtectedRoute allowedUserTypes={['employee']}>
  <ProductionDashboard />
</ProtectedRoute>
```

## 🎨 Use Auth State

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { 
    isAuthenticated, 
    userType, 
    customer, 
    employee,
    logout 
  } = useAuth();

  return (
    <div>
      {userType === 'customer' && <p>Welcome, {customer?.name}!</p>}
      {userType === 'employee' && <p>Employee: {employee?.name}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🧪 Test It

```bash
# Run auth tests
cd frontend && npm test auth-integration

# Manual testing:
# 1. Go to http://localhost:5173
# 2. Click "Create Account" tab
# 3. Fill in: name, email, password
# 4. Submit → should auto-login
# 5. Refresh page → should stay logged in
# 6. Click logout → should return to login
```

## 🔧 Backend Configuration

The backend auth endpoints are already complete and tested:
- `POST http://localhost:3002/auth/customer/signup`
- `POST http://localhost:3002/auth/customer/login`
- `POST http://localhost:3002/auth/employee/validate-pin`
- `GET http://localhost:3002/auth/verify`

If CORS errors occur, add this to `services/api/src/index.ts`:

```typescript
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

## 📝 Environment Variables

Already configured in `frontend/.env`:
```
VITE_API_URL=http://localhost:3002
VITE_STRAPI_URL=http://localhost:1337
```

## 🎉 You're Done!

Your app now has enterprise-grade authentication:
- Secure password storage (bcrypt)
- JWT token management
- Persistent sessions
- Role-based access control
- Production-ready UI components

Next steps: Test the auth flow and integrate logout buttons into your UI!
