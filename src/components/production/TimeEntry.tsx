/**
 * Time Entry Component
 * Shows active timer with controls
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface TimeEntryProps {
  entry: {
    id: number;
    employee: {
      name: string;
    };
    job: {
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
  };
  onPause: () => void;
  onResume: () => void;
  onClockOut: (notes: string, issues: string) => void;
  onCancel?: () => void;
}

export function TimeEntry({
  entry,
  onPause,
  onResume,
  onClockOut,
  onCancel,
}: TimeEntryProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [issues, setIssues] = useState('');
  const [showClockOut, setShowClockOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const clockIn = new Date(entry.clockIn);
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - clockIn.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [entry.clockIn]);

  useEffect(() => {
    if (entry.status === 'Paused') {
      const interval = setInterval(() => {
        setPauseTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setPauseTime(0);
    }
  }, [entry.status]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatClockInTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleClockOut = () => {
    onClockOut(notes, issues);
    setShowClockOut(false);
  };

  if (showClockOut) {
    const totalMinutes = Math.floor(elapsedTime / 60);
    const breakMinutes = entry.breakTime;
    const productiveMinutes = totalMinutes - breakMinutes;
    const laborCost = (productiveMinutes / 60) * 20; // Assuming $20/hr, should come from employee data

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Clock Out Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              Order #{entry.job.jobNumber}
            </h3>
            <p className="text-gray-600">{entry.job.customer.name}</p>
            <p className="text-gray-600">Task: {entry.taskType}</p>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Started:</span>
              <span className="font-semibold">
                {formatClockInTime(entry.clockIn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Time:</span>
              <span className="font-semibold">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Break Time:</span>
              <span className="font-semibold">{breakMinutes}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Productive Time:</span>
              <span className="font-semibold text-green-600">
                {Math.floor(productiveMinutes / 60)}h {productiveMinutes % 60}m
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600 font-semibold">Labor Cost:</span>
              <span className="font-bold text-lg text-green-600">
                ${laborCost.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Notes (optional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this work session..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Issues (optional)
              </label>
              <Textarea
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                placeholder="Report any problems or issues..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowClockOut(false)}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClockOut}
              className="flex-1 bg-red-600 hover:bg-red-700"
              size="lg"
            >
              Confirm Clock Out
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {entry.status === 'Paused' ? 'BREAK TIME' : 'CLOCKED IN'}
          </CardTitle>
          <Badge
            variant={entry.status === 'Active' ? 'default' : 'secondary'}
            className="text-lg px-4 py-1"
          >
            {entry.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Employee and Job Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{entry.employee.name}</h3>
          <p className="text-gray-600">
            Order #{entry.job.jobNumber} | {entry.job.customer.name}
          </p>
          <p className="text-gray-600">Task: {entry.taskType}</p>
          {entry.machineId && (
            <p className="text-gray-600">Machine: {entry.machineId}</p>
          )}
        </div>

        {/* Timer Display */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          {entry.status === 'Paused' ? (
            <>
              <p className="text-sm text-gray-500 mb-2">Break Duration</p>
              <p className="text-5xl font-bold text-orange-600 mb-2">
                {formatTime(pauseTime)}
              </p>
              <p className="text-sm text-gray-500">
                Work Timer Paused: {formatTime(elapsedTime)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-2">Time Elapsed</p>
              <p className="text-5xl font-bold text-blue-600 mb-2">
                {formatTime(elapsedTime)}
              </p>
              <p className="text-sm text-gray-500">
                Started: {formatClockInTime(entry.clockIn)}
              </p>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          {entry.status === 'Active' ? (
            <>
              <Button
                onClick={onPause}
                variant="outline"
                size="lg"
                className="h-16"
              >
                Pause Break
              </Button>
              <Button
                onClick={() => setShowClockOut(true)}
                className="bg-red-600 hover:bg-red-700 h-16"
                size="lg"
              >
                Clock Out
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={onResume}
                className="bg-green-600 hover:bg-green-700 col-span-2 h-16"
                size="lg"
              >
                Resume Work
              </Button>
            </>
          )}
        </div>

        {/* Notes section for active work */}
        {entry.status === 'Active' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                Production Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about progress, issues, etc..."
                rows={3}
              />
            </div>
          </div>
        )}

        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
