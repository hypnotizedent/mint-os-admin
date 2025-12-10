/**
 * Main Checklist Component
 * 
 * Displays and manages a checklist instance for production jobs.
 * Mobile/tablet optimized with touch-friendly interface.
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChecklistStep } from './ChecklistStep';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface ChecklistStepData {
  id: string;
  order: number;
  title: string;
  description?: string;
  required: boolean;
  type: 'checkbox' | 'photo' | 'text' | 'signature' | 'number';
  completed: boolean;
  value?: any;
  photoUrls?: string[];
  notes?: string;
  conditionalOn?: string;
  conditionalValue?: any;
}

export interface ChecklistData {
  id: string;
  jobNumber: string;
  templateName: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Approved';
  steps: ChecklistStepData[];
  startedAt?: Date;
  startedBy?: string;
  completedAt?: Date;
  completedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
}

interface ChecklistProps {
  checklist: ChecklistData;
  onStepUpdate: (stepId: string, data: Partial<ChecklistStepData>) => void;
  onComplete: () => void;
  onApprove?: () => void;
  isManager?: boolean;
}

export const Checklist: React.FC<ChecklistProps> = ({
  checklist,
  onStepUpdate,
  onComplete,
  onApprove,
  isManager = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Calculate visible steps based on conditional logic
  const visibleSteps = checklist.steps.filter((step) => {
    if (!step.conditionalOn) return true;
    
    const conditionalStep = checklist.steps.find(s => s.id === step.conditionalOn);
    if (!conditionalStep) return false;
    
    if (step.conditionalValue !== undefined) {
      return conditionalStep.value === step.conditionalValue;
    }
    
    return conditionalStep.completed;
  });

  const currentStep = visibleSteps[currentStepIndex];
  const totalSteps = visibleSteps.length;
  const completedSteps = visibleSteps.filter(s => s.completed).length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const canComplete = visibleSteps
    .filter(s => s.required)
    .every(s => s.completed);

  const getStatusBadge = () => {
    switch (checklist.status) {
      case 'Not Started':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Not Started</Badge>;
      case 'In Progress':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'Completed':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'Approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Press Ready Checklist</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Order #{checklist.jobNumber} | {checklist.templateName}
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{completedSteps}/{totalSteps} steps complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStep && checklist.status !== 'Approved' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Step {currentStepIndex + 1}/{totalSteps}
              </CardTitle>
              {currentStep.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ChecklistStep
              step={currentStep}
              onUpdate={(data) => onStepUpdate(currentStep.id, data)}
            />
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentStepIndex === totalSteps - 1}
            >
              Next Step
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Missing Steps Alert */}
      {!canComplete && checklist.status === 'In Progress' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Complete all required steps before finishing the checklist.
            {visibleSteps.filter(s => s.required && !s.completed).length} required step(s) remaining.
          </AlertDescription>
        </Alert>
      )}

      {/* Complete/Approve Actions */}
      {checklist.status === 'In Progress' && canComplete && (
        <Card>
          <CardContent className="pt-6">
            <Button
              className="w-full"
              size="lg"
              onClick={onComplete}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Complete Checklist
            </Button>
          </CardContent>
        </Card>
      )}

      {checklist.status === 'Completed' && isManager && onApprove && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Checklist completed by {checklist.completedBy}. 
                Review all steps and approve to allow production to begin.
              </AlertDescription>
            </Alert>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={onApprove}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Approve & Allow Production
            </Button>
          </CardContent>
        </Card>
      )}

      {checklist.status === 'Approved' && (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-600">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Checklist approved by {checklist.approvedBy}. Production can begin.
          </AlertDescription>
        </Alert>
      )}

      {/* All Steps Summary (for completed/approved checklists) */}
      {(checklist.status === 'Completed' || checklist.status === 'Approved') && (
        <Card>
          <CardHeader>
            <CardTitle>All Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visibleSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-sm text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      {step.description && (
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                  {step.photoUrls && step.photoUrls.length > 0 && (
                    <Badge variant="outline">{step.photoUrls.length} photo(s)</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
