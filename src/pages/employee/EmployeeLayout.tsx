/**
 * Employee Layout
 * Simplified navigation for production floor
 * Limited to: My Jobs, Production Schedule, Machines, Help, Clock Out
 */

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { EmployeeSidebar } from './EmployeeSidebar';
import { EmployeeDashboard } from './EmployeeDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ProductionScheduleView } from '@/components/machines/ProductionScheduleView';
import { SkipNavLink, SkipNavContent } from '@/components/ui/skip-nav';

// My Jobs page - shows only jobs assigned to current employee
function MyJobsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Jobs</h1>
      <EmployeeDashboard />
    </div>
  );
}

// Simple help page for employees
function HelpPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Help & Resources</h1>
      <div className="space-y-4">
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Common Tasks</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Scan QR code on job bag to view job details</li>
            <li>Mark jobs complete using the button on job cards</li>
            <li>Report issues using the "Report Issue" button</li>
          </ul>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Need More Help?</h2>
          <p className="text-muted-foreground">
            Contact your supervisor for assistance with production issues.
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmployeeLayout() {
  const { logout, employee } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login/employee');
  };

  return (
    <ProtectedRoute allowedUserTypes={['employee', 'owner']}>
      <div className="flex min-h-screen bg-background">
        <SkipNavLink />
        <EmployeeSidebar 
          employeeName={employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'}
          onLogout={handleLogout}
        />
        <SkipNavContent>
          <main className="flex-1 lg:ml-64 overflow-auto" role="main" aria-label="Main content">
            <Routes>
              <Route path="/" element={<EmployeeDashboard />} />
              <Route path="/jobs" element={<MyJobsPage />} />
              <Route path="/schedule" element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-6">Production Schedule</h1>
                  <ProductionScheduleView />
                </div>
              } />
              <Route path="/help" element={<HelpPage />} />
              <Route path="*" element={<Navigate to="/production" replace />} />
            </Routes>
          </main>
        </SkipNavContent>
      </div>
    </ProtectedRoute>
  );
}

export default EmployeeLayout;
