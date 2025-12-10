/**
 * Mint OS Admin Dashboard
 * Internal production management dashboard
 * Port 3333
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "./contexts/AuthContext"

// Admin Layout with sidebar
import { AdminLayout } from "./pages/admin/AdminLayout"

// Auth pages
import { EmployeeLogin } from "./pages/auth/EmployeeLogin"
import { ForgotPassword } from "./pages/auth/ForgotPassword"

// Auth gate - redirects to login if not authenticated
function AuthGate() {
  const { isAuthenticated, userType, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // Require employee/owner authentication for admin dashboard
  if (!isAuthenticated || (userType !== 'employee' && userType !== 'owner')) {
    return <Navigate to="/login" replace />
  }

  return <AdminLayout />
}

// Admin Dashboard App - Internal only
function App() {
  return (
    <Router>
      <Routes>
        {/* ===== Admin Auth Routes ===== */}
        <Route path="/login" element={<EmployeeLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ===== Admin Dashboard Routes ===== */}
        <Route path="/*" element={<AuthGate />} />

        {/* ===== Redirects ===== */}
        {/* Customer routes redirect to external portal */}
        <Route path="/customer/*" element={
          <div className="flex h-screen items-center justify-center flex-col gap-4 bg-background">
            <h1 className="text-2xl font-bold">Customer Portal</h1>
            <p className="text-muted-foreground">Please use the customer portal at:</p>
            <a
              href="http://docker-host:3334"
              className="text-primary hover:underline"
            >
              http://docker-host:3334
            </a>
          </div>
        } />
      </Routes>
      <Toaster />
    </Router>
  )
}

export default App
