/**
 * Department Management Page
 * Admin page for managing departments, employees, and job assignments
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Types
type Department = 'screen_printing' | 'embroidery' | 'digital';

interface DepartmentInfo {
  name: Department;
  displayName: string;
  employeeCount: number;
  activeJobCount: number;
}

interface DepartmentOverview {
  departments: DepartmentInfo[];
  totalEmployees: number;
  totalActiveJobs: number;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  department: Department | null;
  isActive: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DEPARTMENT_COLORS: Record<Department, string> = {
  screen_printing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  embroidery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  digital: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const DEPARTMENT_ICONS: Record<Department, string> = {
  screen_printing: '🖨️',
  embroidery: '🧵',
  digital: '💻',
};

export function DepartmentManagement() {
  const [overview, setOverview] = useState<DepartmentOverview | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningEmployee, setAssigningEmployee] = useState<string | null>(null);

  // Fetch department overview
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch department overview
        const overviewRes = await fetch(`${API_BASE}/api/departments/overview`);
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setOverview(overviewData);
        }

        // Fetch employees from Strapi
        const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
        const employeesRes = await fetch(`${strapiUrl}/api/employees?pagination[limit]=100`);
        if (employeesRes.ok) {
          const employeesData = await employeesRes.json() as { data?: Array<{
            documentId?: string;
            id?: number;
            firstName?: string;
            lastName?: string;
            department?: Department | null;
            isActive?: boolean;
          }> };
          const transformedEmployees: Employee[] = (employeesData.data || []).map((e) => ({
            id: e.documentId || e.id?.toString() || '',
            firstName: e.firstName || '',
            lastName: e.lastName || '',
            department: e.department as Department | null,
            isActive: e.isActive ?? true,
          }));
          setEmployees(transformedEmployees);
        }
      } catch (error) {
        console.error('Failed to fetch department data:', error);
        toast.error('Failed to load department data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Assign employee to department
  const handleAssignEmployee = async (employeeId: string, department: Department) => {
    setAssigningEmployee(employeeId);
    try {
      const response = await fetch(`${API_BASE}/api/departments/assign-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId, department }),
      });

      if (response.ok) {
        // Update local state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId ? { ...emp, department } : emp
          )
        );
        toast.success('Employee department updated');
        
        // Refresh overview
        const overviewRes = await fetch(`${API_BASE}/api/departments/overview`);
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setOverview(overviewData);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign employee');
      }
    } catch (error) {
      console.error('Failed to assign employee:', error);
      toast.error('Failed to assign employee');
    } finally {
      setAssigningEmployee(null);
    }
  };

  // Detect department for a print method
  const handleDetectDepartment = async (printMethod: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/departments/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ printMethod }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result.department) {
          toast.success(`Detected: ${data.displayName}`, {
            description: `Matched pattern: "${data.result.matchedPattern}"`,
          });
        } else {
          toast.info('No department match found');
        }
        return data;
      }
    } catch (error) {
      console.error('Failed to detect department:', error);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Department Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage departments, assign employees, and configure auto-routing
        </p>
      </div>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {overview?.departments.map((dept) => (
          <Card key={dept.name} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{DEPARTMENT_ICONS[dept.name]}</span>
                <h3 className="font-semibold text-lg">{dept.displayName}</h3>
              </div>
              <Badge className={DEPARTMENT_COLORS[dept.name]}>{dept.name}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{dept.employeeCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{dept.activeJobCount}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Active Employees</p>
            <p className="text-3xl font-bold">{overview?.totalEmployees || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Active Jobs</p>
            <p className="text-3xl font-bold">{overview?.totalActiveJobs || 0}</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="employees" className="space-y-6">
        <TabsList>
          <TabsTrigger value="employees">Employee Assignments</TabsTrigger>
          <TabsTrigger value="routing">Auto-Routing Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assign Employees to Departments</h2>
            <div className="space-y-4">
              {employees.length === 0 ? (
                <p className="text-muted-foreground">No employees found</p>
              ) : (
                employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          employee.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <div>
                        <p className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </p>
                        {employee.department && (
                          <Badge
                            variant="outline"
                            className={DEPARTMENT_COLORS[employee.department]}
                          >
                            {employee.department.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Select
                      value={employee.department || ''}
                      onValueChange={(value) =>
                        handleAssignEmployee(employee.id, value as Department)
                      }
                      disabled={assigningEmployee === employee.id}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="screen_printing">
                          🖨️ Screen Printing
                        </SelectItem>
                        <SelectItem value="embroidery">🧵 Embroidery</SelectItem>
                        <SelectItem value="digital">💻 Digital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Auto-Routing Rules</h2>
            <p className="text-muted-foreground mb-6">
              Jobs are automatically assigned to departments based on print method keywords.
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🖨️</span>
                  <h3 className="font-semibold">Screen Printing</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Triggered by: <code className="bg-background px-1 rounded">screen print</code>,{' '}
                  <code className="bg-background px-1 rounded">silk screen</code>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🧵</span>
                  <h3 className="font-semibold">Embroidery</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Triggered by: <code className="bg-background px-1 rounded">embroidery</code>,{' '}
                  <code className="bg-background px-1 rounded">embroidered</code>
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">💻</span>
                  <h3 className="font-semibold">Digital</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Triggered by: <code className="bg-background px-1 rounded">dtg</code>,{' '}
                  <code className="bg-background px-1 rounded">vinyl</code>,{' '}
                  <code className="bg-background px-1 rounded">heat press</code>,{' '}
                  <code className="bg-background px-1 rounded">sublimation</code>
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Department Detection</h2>
            <div className="flex gap-2">
              <input
                type="text"
                id="test-print-method"
                placeholder="Enter a print method to test..."
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleDetectDepartment((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.getElementById(
                    'test-print-method'
                  ) as HTMLInputElement;
                  if (input?.value) {
                    handleDetectDepartment(input.value);
                  }
                }}
              >
                Detect
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Try: "screen print on black shirts", "custom embroidery", "dtg printing"
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DepartmentManagement;
