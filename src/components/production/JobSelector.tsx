/**
 * Job Selector Component
 * Shows active jobs for employee to clock into
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Job {
  id: number;
  jobNumber: string;
  title: string;
  customer: {
    name: string;
  };
  dueDate: string;
  status: string;
  mockupUrls?: string[];
}

interface JobSelectorProps {
  employeeName: string;
  jobs: Job[];
  onJobSelect: (jobId: number, taskType: string) => void;
  onBack?: () => void;
  loading?: boolean;
}

const taskTypes = [
  'Screen Prep',
  'Printing',
  'Heat Press',
  'Folding',
  'Packaging',
  'Quality Check',
  'Setup',
  'Cleanup',
  'Other',
];

export function JobSelector({
  employeeName,
  jobs,
  onJobSelect,
  onBack,
  loading = false,
}: JobSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedTask, setSelectedTask] = useState<string>('');

  const filteredJobs = jobs.filter(
    (job) =>
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDueDateBadge = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (hoursUntilDue < 24) {
      return <Badge className="bg-red-500">Due Today</Badge>;
    } else if (hoursUntilDue < 48) {
      return <Badge className="bg-orange-500">Due Tomorrow</Badge>;
    } else {
      return <Badge className="bg-green-500">On Track</Badge>;
    }
  };

  const formatDueDate = (dueDate: string) => {
    return new Date(dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleStartJob = () => {
    if (selectedJob && selectedTask) {
      onJobSelect(selectedJob.id, selectedTask);
    }
  };

  if (selectedJob) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Select Task Type</CardTitle>
          <p className="text-sm text-gray-500">
            Job #{selectedJob.jobNumber} - {selectedJob.customer?.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {taskTypes.map((task) => (
              <Button
                key={task}
                onClick={() => setSelectedTask(task)}
                variant={selectedTask === task ? 'default' : 'outline'}
                size="lg"
                className="h-16 text-lg"
              >
                {task}
              </Button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => {
                setSelectedJob(null);
                setSelectedTask('');
              }}
              variant="outline"
              className="flex-1"
            >
              Back to Jobs
            </Button>
            <Button
              onClick={handleStartJob}
              disabled={!selectedTask}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Start Timer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          Welcome, {employeeName}!
        </CardTitle>
        <p className="text-gray-500">Select a job to clock in</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search by job number, customer, or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        {/* Jobs List */}
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading jobs...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active jobs found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            Order #{job.jobNumber}
                          </h3>
                          {getDueDateBadge(job.dueDate)}
                        </div>
                        <p className="text-gray-700 mb-1">
                          {job.customer?.name}
                        </p>
                        <p className="text-gray-600 text-sm mb-2">
                          {job.title}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Due: {formatDueDate(job.dueDate)}
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedJob(job)}
                        size="lg"
                        className="ml-4"
                      >
                        Start →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Back button */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full mt-4"
          >
            Back
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
