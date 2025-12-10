import { useState } from 'react';
import { useCameraCapture } from '../../../hooks/useCameraCapture';
import { saveChecklistOffline } from '../../../offline/offline-storage';
import { useOffline } from '../../../hooks/useOffline';
import { v4 as uuidv4 } from 'uuid';

interface ChecklistStep {
  id: string;
  title: string;
  requiresPhoto: boolean;
  completed: boolean;
}

export const MobileChecklist = () => {
  const { isOnline } = useOffline();
  const { startCamera, capturePhoto, stopCamera, stream, videoRef } = useCameraCapture();
  const [showCamera, setShowCamera] = useState(false);
  const [currentPhotoStep, setCurrentPhotoStep] = useState<string | null>(null);
  const [photos, setPhotos] = useState<{ [key: string]: string }>({});

  const [steps, setSteps] = useState<ChecklistStep[]>([
    { id: '1', title: 'Check ink levels', requiresPhoto: false, completed: false },
    { id: '2', title: 'Take photo of ink colors', requiresPhoto: true, completed: false },
    { id: '3', title: 'Verify paper alignment', requiresPhoto: false, completed: false },
    { id: '4', title: 'Take photo of first print', requiresPhoto: true, completed: false },
    { id: '5', title: 'Clean print heads', requiresPhoto: false, completed: false }
  ]);

  const handleToggleStep = (stepId: string) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ));
  };

  const handleOpenCamera = async (stepId: string) => {
    try {
      setCurrentPhotoStep(stepId);
      await startCamera('environment');
      setShowCamera(true);
    } catch (error) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !currentPhotoStep) return;

    try {
      const blob = await capturePhoto(videoRef.current);
      const photoUrl = URL.createObjectURL(blob);
      
      setPhotos({ ...photos, [currentPhotoStep]: photoUrl });
      
      // Mark step as completed
      setSteps(steps.map(step =>
        step.id === currentPhotoStep ? { ...step, completed: true } : step
      ));
      
      stopCamera();
      setShowCamera(false);
      setCurrentPhotoStep(null);
    } catch (error) {
      console.error('Failed to capture photo:', error);
      alert('Failed to capture photo. Please try again.');
    }
  };

  const handleCancelCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCurrentPhotoStep(null);
  };

  const handleSubmitChecklist = async () => {
    const completedSteps = steps.filter(s => s.completed).length;
    
    if (completedSteps === 0) {
      alert('Please complete at least one step before submitting.');
      return;
    }

    try {
      const entry = {
        id: uuidv4(),
        checklistId: 'default-checklist',
        completed: steps.every(s => s.completed),
        timestamp: Date.now(),
        photos: Object.values(photos),
        synced: false
      };

      await saveChecklistOffline(entry);
      
      alert(`Checklist saved! (${completedSteps}/${steps.length} steps completed)`);
      
      // Reset checklist
      setSteps(steps.map(step => ({ ...step, completed: false })));
      setPhotos({});
    } catch (error) {
      console.error('Failed to save checklist:', error);
      alert('Failed to save checklist. Please try again.');
    }
  };

  if (showCamera && stream) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 bg-gray-900 flex gap-4">
          <button
            onClick={handleCancelCamera}
            className="flex-1 min-h-[60px] bg-gray-600 text-white text-lg font-bold rounded-md hover:bg-gray-700 active:bg-gray-800 active:scale-95 transition-transform touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCapture}
            className="flex-1 min-h-[60px] bg-blue-600 text-white text-lg font-bold rounded-md hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-transform touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            📷 Capture
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Production Checklist</h1>
        {!isOnline && (
          <div className="mt-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm">
            ⚠️ Offline Mode - Will sync when online
          </div>
        )}
      </div>

      {/* Checklist Steps */}
      <div className="space-y-3 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-5"
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleToggleStep(step.id)}
                className="min-w-[44px] min-h-[44px] sm:min-w-[60px] sm:min-h-[60px] border-2 border-gray-300 rounded-md flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                {step.completed && (
                  <span className="text-green-600 text-2xl">✓</span>
                )}
              </button>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Step {index + 1}: {step.title}
                </h3>
                {step.requiresPhoto && (
                  <button
                    onClick={() => handleOpenCamera(step.id)}
                    className="mt-2 min-h-[48px] px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-transform touch-manipulation"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {photos[step.id] ? '📷 Retake Photo' : '📷 Take Photo'}
                  </button>
                )}
                {photos[step.id] && (
                  <img
                    src={photos[step.id]}
                    alt={`Photo for step ${index + 1}`}
                    className="mt-2 w-full max-w-xs rounded-md border-2 border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitChecklist}
        className="w-full min-h-[60px] bg-green-600 text-white text-xl font-bold rounded-md hover:bg-green-700 active:bg-green-800 active:scale-95 transition-transform touch-manipulation"
        style={{ touchAction: 'manipulation' }}
      >
        Submit Checklist
      </button>

      {/* Progress */}
      <div className="mt-4 text-center text-gray-600">
        {steps.filter(s => s.completed).length} / {steps.length} steps completed
      </div>
    </div>
  );
};
