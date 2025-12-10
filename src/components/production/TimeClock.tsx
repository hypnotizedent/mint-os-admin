/**
 * Time Clock Component
 * Main interface for employee time tracking
 */

import React, { useState, useEffect } from 'react';
import { PinPad } from './PinPad';
import { JobSelector } from './JobSelector';
import { TimeEntry } from './TimeEntry';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Employee {
  id: number;
  name: string;
  hourlyRate: number;
}

interface Job {
  id: number;
  jobNumber: string;
  title: string;
  customer: {
    name: string;
  };
  dueDate: string;
  status: string;
}

interface TimeClockEntry {
  id: number;
  employee: {
    id: number;
    name: string;
  };
  job: {
    id: number;
    jobNumber: string;
    customer: {
      name: string;
    };
  };
  taskType: string;
  machineId?: string;
  clockIn: string;
  status: 'Active' | 'Paused';
  breakTime: number;
}

type ViewState = 'pin' | 'jobs' | 'timer';

export function TimeClock() {
  const [view, setView] = useState<ViewState>('pin');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeClockEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for active entry on mount
  useEffect(() => {
    // In a real app, we'd check localStorage or URL params for a session
    // For now, we'll just start at PIN entry
  }, []);

  // Fetch active jobs when employee logs in
  useEffect(() => {
    if (employee && view === 'jobs') {
      fetchActiveJobs();
    }
  }, [employee, view]);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      // In a real app, this would call the Strapi API
      // For now, we'll use mock data
      const mockJobs: Job[] = [
        {
          id: 1,
          jobNumber: '12345',
          title: '500x Gildan 5000 - Black',
          customer: { name: 'ABC Company' },
          dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          status: 'InProduction',
        },
        {
          id: 2,
          jobNumber: '12344',
          title: '100x Bella Canvas - White',
          customer: { name: 'XYZ Corp' },
          dueDate: new Date(Date.now() + 3600000).toISOString(), // In 1 hour
          status: 'InProduction',
        },
        {
          id: 3,
          jobNumber: '12343',
          title: '250x Next Level 6210 - Navy',
          customer: { name: 'Smith LLC' },
          dueDate: new Date(Date.now() + 172800000).toISOString(), // In 2 days
          status: 'InProduction',
        },
      ];
      setJobs(mockJobs);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would verify PIN with the API
      // For now, we'll use mock authentication
      const mockEmployee: Employee = {
        id: 1,
        name: 'Sarah Johnson',
        hourlyRate: 20.0,
      };

      setEmployee(mockEmployee);
      setView('jobs');
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setError('Invalid PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelect = async (jobId: number, taskType: string) => {
    if (!employee) return;

    try {
      setLoading(true);
      setError(null);

      // In a real app, this would call the clock in API
      // For now, we'll create a mock entry
      const mockEntry: TimeClockEntry = {
        id: 1,
        employee: {
          id: employee.id,
          name: employee.name,
        },
        job: {
          id: jobId,
          jobNumber: jobs.find((j) => j.id === jobId)?.jobNumber || '',
          customer: {
            name: jobs.find((j) => j.id === jobId)?.customer.name || '',
          },
        },
        taskType,
        clockIn: new Date().toISOString(),
        status: 'Active',
        breakTime: 0,
      };

      setActiveEntry(mockEntry);
      setView('timer');
    } catch (err) {
      console.error('Error clocking in:', err);
      setError('Failed to clock in');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!activeEntry) return;

    try {
      setLoading(true);
      setError(null);

      // In a real app, this would call the pause API
      setActiveEntry({
        ...activeEntry,
        status: 'Paused',
      });
    } catch (err) {
      console.error('Error pausing timer:', err);
      setError('Failed to pause timer');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (!activeEntry) return;

    try {
      setLoading(true);
      setError(null);

      // In a real app, this would call the resume API
      // Calculate break time
      const breakMinutes = 15; // Mock 15 minute break

      setActiveEntry({
        ...activeEntry,
        status: 'Active',
        breakTime: activeEntry.breakTime + breakMinutes,
      });
    } catch (err) {
      console.error('Error resuming timer:', err);
      setError('Failed to resume timer');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async (notes: string, issues: string) => {
    if (!activeEntry) return;

    try {
      setLoading(true);
      setError(null);

      // In a real app, this would call the clock out API
      console.log('Clocking out:', { notes, issues });

      // Reset state
      setActiveEntry(null);
      setEmployee(null);
      setView('pin');
    } catch (err) {
      console.error('Error clocking out:', err);
      setError('Failed to clock out');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (view === 'jobs') {
      setEmployee(null);
      setView('pin');
    } else if (view === 'timer') {
      // Don't allow going back when timer is active
      // Employee must clock out first
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PRODUCTION TIME CLOCK
          </h1>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 max-w-2xl mx-auto">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {view === 'pin' && (
          <PinPad
            onSubmit={handlePinSubmit}
            title="Enter Employee PIN"
          />
        )}

        {view === 'jobs' && employee && (
          <JobSelector
            employeeName={employee.name}
            jobs={jobs}
            onJobSelect={handleJobSelect}
            onBack={handleBack}
            loading={loading}
          />
        )}

        {view === 'timer' && activeEntry && (
          <TimeEntry
            entry={activeEntry}
            onPause={handlePause}
            onResume={handleResume}
            onClockOut={handleClockOut}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>PrintShop OS Production Dashboard</p>
          <p className="mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
