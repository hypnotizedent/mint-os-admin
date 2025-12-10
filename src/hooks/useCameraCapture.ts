import { useState, useRef, useCallback } from 'react';

export const useCameraCapture = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async (facingMode: 'user' | 'environment' = 'environment') => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      return mediaStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Camera access denied';
      setError(errorMessage);
      console.error('Camera access denied', err);
      throw new Error(errorMessage);
    }
  }, []);

  const capturePhoto = useCallback(async (videoElement?: HTMLVideoElement): Promise<Blob> => {
    const video = videoElement || videoRef.current;
    
    if (!video) {
      throw new Error('No video element available');
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(video, 0, 0);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.8);
    });
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  return {
    startCamera,
    capturePhoto,
    stopCamera,
    stream,
    error,
    videoRef
  };
};
