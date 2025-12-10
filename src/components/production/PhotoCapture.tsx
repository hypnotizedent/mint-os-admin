/**
 * PhotoCapture Component
 * 
 * Handles camera access and photo capture for checklist steps.
 * Supports both front and rear cameras with mobile optimization.
 */

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, X, RotateCw, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoCaptureProps {
  onCapture: (photoUrl: string) => void;
  onCancel: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const switchCamera = () => {
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Video/Image Display */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-white">Loading camera...</p>
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex gap-2">
          {!capturedImage ? (
            <>
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
                onClick={switchCamera}
                disabled={isLoading}
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={capturePhoto}
                disabled={isLoading || !!error}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="flex-1"
              >
                Retake
              </Button>
              <Button
                onClick={confirmPhoto}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Use Photo
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {!capturedImage 
            ? 'Position the item in frame and tap Capture'
            : 'Review the photo and confirm or retake'
          }
        </p>
      </div>
    </Card>
  );
};
