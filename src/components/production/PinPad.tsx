/**
 * PIN Pad Component
 * Touch-friendly employee authentication
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PinPadProps {
  onSubmit: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
}

export function PinPad({ onSubmit, onCancel, title = 'Enter Employee PIN' }: PinPadProps) {
  const [pin, setPin] = useState('');
  const maxLength = 6;

  const handleNumberClick = (num: string) => {
    if (pin.length < maxLength) {
      setPin(pin + num);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onSubmit(pin);
      setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length >= 4) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      if (onCancel) {
        onCancel();
      }
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PIN Display */}
        <div className="flex justify-center gap-2 mb-8">
          {[...Array(maxLength)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border-2 border-gray-400"
              style={{
                backgroundColor: i < pin.length ? '#3b82f6' : 'transparent',
              }}
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              onKeyDown={handleKeyPress}
              size="lg"
              variant="outline"
              className="h-16 w-full text-2xl font-semibold hover:bg-blue-50"
            >
              {num}
            </Button>
          ))}

          {/* Bottom row: Clear, 0, Submit */}
          <Button
            onClick={handleClear}
            size="lg"
            variant="outline"
            className="h-16 w-full text-xl font-semibold hover:bg-red-50"
          >
            Clear
          </Button>
          <Button
            onClick={() => handleNumberClick('0')}
            onKeyDown={handleKeyPress}
            size="lg"
            variant="outline"
            className="h-16 w-full text-2xl font-semibold hover:bg-blue-50"
          >
            0
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={pin.length < 4}
            size="lg"
            variant="default"
            className="h-16 w-full text-xl font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
          >
            ✓
          </Button>
        </div>

        {/* Cancel button */}
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full mt-4"
          >
            Cancel
          </Button>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          PIN must be 4-6 digits
        </p>
      </CardContent>
    </Card>
  );
}
