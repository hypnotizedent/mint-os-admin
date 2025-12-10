/**
 * ChecklistStep Component
 * 
 * Renders an individual step in the checklist with appropriate input type.
 * Supports checkbox, photo, text, signature, and number inputs.
 */

import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Camera, Check } from 'lucide-react';
import { PhotoCapture } from './PhotoCapture';
import { ChecklistSignature } from './ChecklistSignature';

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
}

interface ChecklistStepProps {
  step: ChecklistStepData;
  onUpdate: (data: Partial<ChecklistStepData>) => void;
}

export const ChecklistStep: React.FC<ChecklistStepProps> = ({ step, onUpdate }) => {
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [notes, setNotes] = useState(step.notes || '');
  const [value, setValue] = useState(step.value || '');

  const handleCheckboxChange = (checked: boolean) => {
    onUpdate({
      completed: checked,
      value: checked,
    });
  };

  const handleValueChange = (newValue: any) => {
    setValue(newValue);
  };

  const handleMarkComplete = () => {
    onUpdate({
      completed: true,
      value,
      notes: notes.trim() || undefined,
    });
  };

  const handlePhotoCapture = (photoUrl: string) => {
    const photoUrls = [...(step.photoUrls || []), photoUrl];
    onUpdate({
      photoUrls,
      value: photoUrls[0], // Set first photo as value
      completed: true,
    });
    setShowPhotoCapture(false);
  };

  const handleSignatureCapture = (signatureUrl: string) => {
    onUpdate({
      value: signatureUrl,
      completed: true,
    });
    setShowSignature(false);
  };

  const renderInput = () => {
    switch (step.type) {
      case 'checkbox':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={step.id}
                checked={step.completed}
                onCheckedChange={handleCheckboxChange}
              />
              <Label
                htmlFor={step.id}
                className="text-base font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {step.title}
              </Label>
            </div>
            {step.description && (
              <p className="text-sm text-muted-foreground pl-6">{step.description}</p>
            )}
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{step.title}</h3>
              {step.description && (
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
              )}
            </div>

            {step.photoUrls && step.photoUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {step.photoUrls.map((url, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {showPhotoCapture ? (
              <PhotoCapture
                onCapture={handlePhotoCapture}
                onCancel={() => setShowPhotoCapture(false)}
              />
            ) : (
              <Button
                onClick={() => setShowPhotoCapture(true)}
                variant={step.completed ? 'outline' : 'default'}
                className="w-full"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                {step.photoUrls && step.photoUrls.length > 0 ? 'Add Another Photo' : 'Take Photo'}
              </Button>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{step.title}</h3>
              {step.description && (
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
              )}
            </div>

            <Textarea
              placeholder="Enter details..."
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              rows={4}
              disabled={step.completed}
            />

            {!step.completed && (
              <Button
                onClick={handleMarkComplete}
                disabled={!value.trim()}
                className="w-full"
                size="lg"
              >
                <Check className="w-5 h-5 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{step.title}</h3>
              {step.description && (
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
              )}
            </div>

            <Input
              type="number"
              placeholder="Enter number..."
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={step.completed}
              className="text-lg"
            />

            {!step.completed && (
              <Button
                onClick={handleMarkComplete}
                disabled={!value}
                className="w-full"
                size="lg"
              >
                <Check className="w-5 h-5 mr-2" />
                Mark Complete
              </Button>
            )}
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">{step.title}</h3>
              {step.description && (
                <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
              )}
            </div>

            {step.value ? (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <img
                  src={step.value}
                  alt="Signature"
                  className="w-full max-w-sm mx-auto"
                />
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Signed ✓
                </p>
              </div>
            ) : showSignature ? (
              <ChecklistSignature
                onSave={handleSignatureCapture}
                onCancel={() => setShowSignature(false)}
              />
            ) : (
              <Button
                onClick={() => setShowSignature(true)}
                className="w-full"
                size="lg"
              >
                Sign Here
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderInput()}

      {/* Notes section for non-checkbox types */}
      {step.type !== 'checkbox' && (
        <div className="pt-4 border-t">
          <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes or observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={step.completed}
            className="mt-2"
          />
        </div>
      )}

      {step.completed && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 pt-2">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Step Completed</span>
        </div>
      )}
    </div>
  );
};
