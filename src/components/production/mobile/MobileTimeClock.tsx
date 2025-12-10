import { useState, useEffect } from 'react';
import { saveTimeEntryOffline } from '../../../offline/offline-storage';
import { useOffline } from '../../../hooks/useOffline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337';

// UUID generator that works over HTTP (crypto.randomUUID requires HTTPS)
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface Employee {
  id: number;
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  hourlyRate: number;
  role: string;
  department: string;
  isActive: boolean;
  pin?: string;
}

interface TimeClockEntry {
  id: number;
  documentId: string;
  clockIn: string;
  clockOut: string | null;
  status: string;
}

export const MobileTimeClock = () => {
  const [pin, setPin] = useState('');
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [activeEntry, setActiveEntry] = useState<TimeClockEntry | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { isOnline } = useOffline();

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(`${API_URL}/api/employees`);
        const json = await res.json();
        setEmployees(json.data || []);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Find employee by PIN (for demo, using last 4 digits of employee ID or a simple lookup)
  const findEmployeeByPin = (enteredPin: string): Employee | null => {
    // Demo: Match PIN to employee ID (e.g., PIN 0001 = employee ID 1, PIN 0002 = employee ID 2)
    const employeeId = parseInt(enteredPin, 10);
    return employees.find(e => e.id === employeeId && e.isActive) || null;
  };

  const handleClockIn = async () => {
    if (pin.length !== 4) {
      return;
    }

    setIsClockingIn(true);
    try {
      // Find employee by PIN
      const employee = findEmployeeByPin(pin);
      
      if (!employee) {
        showMessage('error', 'Invalid PIN. Please try again.');
        setPin('');
        setIsClockingIn(false);
        return;
      }

      setCurrentEmployee(employee);

      // Check if employee has active clock-in (online mode)
      if (isOnline) {
        const existingRes = await fetch(
          `${API_URL}/api/time-clock-entries?filters[employee][id][$eq]=${employee.id}&filters[status][$eq]=Active&filters[clockOut][$null]=true`
        );
        const existingJson = await existingRes.json();
        
        if (existingJson.data && existingJson.data.length > 0) {
          // Employee already clocked in - clock them out
          const entry = existingJson.data[0];
          const clockOutRes = await fetch(`${API_URL}/api/time-clock-entries/${entry.documentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                clockOut: new Date().toISOString(),
                status: 'Completed'
              }
            })
          });
          
          if (clockOutRes.ok) {
            showMessage('success', `${employee.firstName} clocked OUT!`);
          } else {
            throw new Error('Failed to clock out');
          }
        } else {
          // Clock in - create new entry
          const clockInRes = await fetch(`${API_URL}/api/time-clock-entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: {
                employee: employee.id,
                clockIn: new Date().toISOString(),
                status: 'Active',
                taskType: 'production'
              }
            })
          });
          
          if (clockInRes.ok) {
            showMessage('success', `${employee.firstName} clocked IN!`);
          } else {
            throw new Error('Failed to clock in');
          }
        }
      } else {
        // Offline mode - save locally
        await saveTimeEntryOffline({
          id: generateId(),
          userId: employee.documentId,
          timestamp: Date.now(),
          type: 'clock-in',
          synced: false
        });
        showMessage('success', `${employee.firstName} clocked in (offline)`);
      }
      
      setPin('');
    } catch (error) {
      console.error('Clock in/out failed:', error);
      showMessage('error', 'Failed. Please try again.');
    } finally {
      setIsClockingIn(false);
      setTimeout(() => setCurrentEmployee(null), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">PRODUCTION</h1>
        <h2 className="text-xl sm:text-2xl font-semibold">TIME CLOCK</h2>
        {!isOnline && (
          <div className="mt-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm">
            ⚠️ Offline Mode - Will sync when online
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-md text-center text-lg font-semibold ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Employee Display */}
      {currentEmployee && (
        <div className="mb-4 text-center text-lg font-semibold text-blue-600">
          {currentEmployee.firstName} {currentEmployee.lastName}
        </div>
      )}

      {/* PIN Input Display */}
      <div className="mb-8 text-center">
        <p className="text-lg mb-4">Enter Employee PIN:</p>
        <p className="text-sm text-gray-500 mb-4">(Use 0001 for ID 1, 0002 for ID 2)</p>
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-300 rounded-md flex items-center justify-center text-2xl"
            >
              {pin[i] ? '•' : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <button
            key={digit}
            onClick={() => handlePinInput(digit.toString())}
            className="aspect-square min-h-[60px] bg-white border-2 border-gray-300 rounded-md text-2xl font-semibold hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-transform touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            {digit}
          </button>
        ))}
        <button
          onClick={handleBackspace}
          className="aspect-square min-h-[60px] bg-white border-2 border-gray-300 rounded-md text-xl font-semibold hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-transform touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          ◄
        </button>
        <button
          onClick={() => handlePinInput('0')}
          className="aspect-square min-h-[60px] bg-white border-2 border-gray-300 rounded-md text-2xl font-semibold hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-transform touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          0
        </button>
        <button
          onClick={handleClockIn}
          disabled={pin.length !== 4 || isClockingIn}
          className="aspect-square min-h-[60px] bg-green-600 text-white border-2 border-green-700 rounded-md text-xl font-semibold hover:bg-green-700 active:bg-green-800 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          ✓
        </button>
      </div>

      {/* Clock In Button */}
      <button
        onClick={handleClockIn}
        disabled={pin.length !== 4 || isClockingIn}
        className="w-full max-w-sm mx-auto min-h-[60px] bg-blue-600 text-white text-xl font-bold rounded-md hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        style={{ touchAction: 'manipulation' }}
      >
        {isClockingIn ? 'CLOCKING IN...' : 'CLOCK IN'}
      </button>
    </div>
  );
};
