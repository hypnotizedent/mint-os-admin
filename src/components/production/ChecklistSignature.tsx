/**
 * ChecklistSignature Component
 * 
 * Signature pad for manager sign-off on checklists.
 * Touch-optimized with clear and save functionality.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Eraser, Check } from 'lucide-react';

interface ChecklistSignatureProps {
  onSave: (signatureUrl: string) => void;
  onCancel: () => void;
}

export const ChecklistSignature: React.FC<ChecklistSignatureProps> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2; // High DPI
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        
        // Set drawing style
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const point = getPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureUrl = canvas.toDataURL('image/png');
    onSave(signatureUrl);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Manager Signature</h3>
          <p className="text-sm text-muted-foreground">
            Sign below to approve this checklist
          </p>
        </div>

        {/* Signature Canvas */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-48 touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              startDrawing(e);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              draw(e);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopDrawing();
            }}
          />
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Sign with your finger or stylus
        </p>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            onClick={saveSignature}
            disabled={!hasSignature}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
};
