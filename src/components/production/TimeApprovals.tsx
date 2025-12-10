/**
 * Time Approvals Component
 * Manager interface for approving time entry edits
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface TimeEntryEdit {
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
  originalClockIn: string;
  originalClockOut: string;
  originalBreakTime: number;
  clockIn: string;
  clockOut: string;
  breakTime: number;
  editReason: string;
  editedBy: {
    name: string;
  };
  status: string;
}

interface TimeApprovalsProps {
  pendingEdits: TimeEntryEdit[];
  onApprove: (entryId: number) => void;
  onReject: (entryId: number) => void;
  onRequestInfo: (entryId: number, message: string) => void;
  loading?: boolean;
}

export function TimeApprovals({
  pendingEdits,
  onApprove,
  onReject,
  onRequestInfo,
  loading = false,
}: TimeApprovalsProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntryEdit | null>(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const formatDateTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const calculateTime = (clockIn: string, clockOut: string, breakTime: number) => {
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    const productiveMinutes = totalMinutes - breakTime;
    const hours = Math.floor(productiveMinutes / 60);
    const minutes = productiveMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleRequestInfo = () => {
    if (selectedEntry && infoMessage.trim()) {
      onRequestInfo(selectedEntry.id, infoMessage);
      setShowInfoDialog(false);
      setInfoMessage('');
      setSelectedEntry(null);
    }
  };

  if (showInfoDialog && selectedEntry) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Request More Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Employee: <span className="font-semibold">{selectedEntry.employee.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Job: <span className="font-semibold">#{selectedEntry.job.jobNumber}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Message to Employee
            </label>
            <Textarea
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="What additional information do you need?"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowInfoDialog(false);
                setInfoMessage('');
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestInfo}
              disabled={!infoMessage.trim()}
              className="flex-1"
            >
              Send Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedEntry) {
    const originalTime = calculateTime(
      selectedEntry.originalClockIn,
      selectedEntry.originalClockOut,
      selectedEntry.originalBreakTime
    );
    const editedTime = calculateTime(
      selectedEntry.clockIn,
      selectedEntry.clockOut,
      selectedEntry.breakTime
    );

    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Review Time Entry Edit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee and Job Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">
              {selectedEntry.employee.name}
            </h3>
            <p className="text-gray-600">
              Order #{selectedEntry.job.jobNumber} - {selectedEntry.job.customer.name}
            </p>
            <p className="text-gray-600">Task: {selectedEntry.taskType}</p>
            <p className="text-sm text-gray-500">
              Edited by: {selectedEntry.editedBy.name}
            </p>
          </div>

          {/* Edit Reason */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="font-semibold mb-2">Reason for Edit:</p>
            <p className="text-gray-700">{selectedEntry.editReason}</p>
          </div>

          {/* Comparison */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-3 text-gray-700">Original Entry</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clock In:</span>
                  <span className="font-medium">
                    {formatDateTime(selectedEntry.originalClockIn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clock Out:</span>
                  <span className="font-medium">
                    {formatDateTime(selectedEntry.originalClockOut)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break Time:</span>
                  <span className="font-medium">{selectedEntry.originalBreakTime}m</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">Total:</span>
                  <span className="font-semibold">{originalTime}</span>
                </div>
              </div>
            </div>

            {/* Edited */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold mb-3 text-blue-700">Edited Entry</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clock In:</span>
                  <span className="font-medium">
                    {formatDateTime(selectedEntry.clockIn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clock Out:</span>
                  <span className="font-medium">
                    {formatDateTime(selectedEntry.clockOut)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break Time:</span>
                  <span className="font-medium">{selectedEntry.breakTime}m</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">Total:</span>
                  <span className="font-semibold text-blue-700">{editedTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => setSelectedEntry(null)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                onReject(selectedEntry.id);
                setSelectedEntry(null);
              }}
              variant="destructive"
              className="flex-1"
            >
              Reject
            </Button>
            <Button
              onClick={() => setShowInfoDialog(true)}
              variant="outline"
              className="flex-1"
            >
              Request Info
            </Button>
            <Button
              onClick={() => {
                onApprove(selectedEntry.id);
                setSelectedEntry(null);
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Approve
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
          Time Entry Edits - Pending Approval
        </CardTitle>
        <p className="text-gray-500">
          {pendingEdits.length} {pendingEdits.length === 1 ? 'edit' : 'edits'} waiting for review
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading pending edits...
            </div>
          ) : pendingEdits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No pending edits</p>
              <p className="text-sm">All time entries have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEdits.map((edit) => {
                const originalTime = calculateTime(
                  edit.originalClockIn,
                  edit.originalClockOut,
                  edit.originalBreakTime
                );
                const editedTime = calculateTime(
                  edit.clockIn,
                  edit.clockOut,
                  edit.breakTime
                );

                return (
                  <Card
                    key={edit.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEntry(edit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">
                              {edit.employee.name}
                            </h3>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">
                            Order #{edit.job.jobNumber} - {edit.job.customer.name}
                          </p>
                          <p className="text-gray-500 text-sm mb-2">
                            {formatDateTime(edit.originalClockIn)}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="line-through">{originalTime}</span>
                            {' → '}
                            <span className="font-semibold text-blue-600">
                              {editedTime}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500 mt-2 italic">
                            Reason: {edit.editReason}
                          </p>
                        </div>
                        <Button
                          onClick={() => setSelectedEntry(edit)}
                          size="sm"
                        >
                          Review →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
