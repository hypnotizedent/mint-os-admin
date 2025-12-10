/**
 * Label Formatter Component
 * 
 * Provides a user interface for automatically formatting shipping labels
 * for thermal printer output.
 */

import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCw, Check, AlertCircle } from 'lucide-react';

interface LabelFormatterProps {
  apiUrl?: string;
}

interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
}

export default function LabelFormatter({ 
  apiUrl = 'http://localhost:5001' 
}: LabelFormatterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<ProcessingState>({ status: 'idle' });
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'png'>('pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setState({ status: 'idle' });
      
      // Generate preview for image files
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(null);
      setState({ status: 'idle' });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFormat = async () => {
    if (!file) return;

    setState({ status: 'uploading', message: 'Uploading label...' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', outputFormat);
    formData.append('auto_rotate', 'true');
    formData.append('optimize_bw', 'true');

    try {
      setState({ status: 'processing', message: 'Formatting label...' });
      
      const response = await fetch(`${apiUrl}/api/labels/format`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to format label');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Trigger download
      if (downloadLinkRef.current) {
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.download = `formatted_label.${outputFormat}`;
        downloadLinkRef.current.click();
      }

      setState({ 
        status: 'success', 
        message: 'Label formatted successfully! Download started.' 
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setState({ status: 'idle' });
      }, 3000);

    } catch (error) {
      setState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'An error occurred' 
      });
    }
  };

  const handleGeneratePreview = async () => {
    if (!file) return;

    setState({ status: 'processing', message: 'Generating preview...' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${apiUrl}/api/labels/preview`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreview(url);

      setState({ status: 'idle' });
    } catch (error) {
      setState({ 
        status: 'error', 
        message: 'Failed to generate preview' 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Label Formatter</h1>
        <p className="text-gray-600 mt-2">
          Automatically format shipping labels for your Rollo printer
        </p>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg text-gray-700 mb-2">
          {file ? file.name : 'Drop shipping label here or click to upload'}
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF, PNG, JPG, TIFF (max 10MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.tiff"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Options */}
      {file && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Options</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-gray-700">Output Format:</span>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'pdf' | 'png')}
                className="border border-gray-300 rounded px-3 py-1"
              >
                <option value="pdf">PDF</option>
                <option value="png">PNG</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Preview</h3>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <img 
              src={preview} 
              alt="Label preview" 
              className="max-w-full mx-auto"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {file && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleFormat}
            disabled={state.status === 'uploading' || state.status === 'processing'}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {state.status === 'processing' || state.status === 'uploading' ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                {state.message}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Format & Download
              </>
            )}
          </button>
          
          <button
            onClick={handleGeneratePreview}
            disabled={state.status === 'processing'}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Preview
          </button>
        </div>
      )}

      {/* Status Messages */}
      {state.status === 'success' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">{state.message}</span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{state.message}</span>
        </div>
      )}

      {/* Hidden download link */}
      <a ref={downloadLinkRef} className="hidden" />

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Upload your shipping label (from email, carrier website, etc.)</li>
          <li>The tool automatically detects orientation and rotates if needed</li>
          <li>Excess whitespace is cropped away</li>
          <li>Label is resized to standard 4x6 inches</li>
          <li>Optimized for black & white thermal printing</li>
          <li>Download and print directly to your Rollo printer!</li>
        </ol>
      </div>
    </div>
  );
}
