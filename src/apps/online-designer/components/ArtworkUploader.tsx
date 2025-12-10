import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Image as ImageIcon, 
  FileImage, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ArtworkUploaderProps {
  onUpload: (file: File) => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/svg+xml': ['.svg'],
  'application/pdf': ['.pdf'],
};

export const ArtworkUploader = ({ onUpload }: ArtworkUploaderProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    const validTypes = Object.keys(ACCEPTED_TYPES);
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Use PNG, JPG, SVG, or PDF.' };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    return { valid: true };
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      toast.error(rejection.errors[0]?.message || 'File rejected');
    });

    // Process accepted files
    acceptedFiles.forEach((file) => {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      const preview = URL.createObjectURL(file);
      const newFile: UploadedFile = {
        file,
        preview,
        status: 'pending',
        progress: 0,
      };

      setUploadedFiles((prev) => [...prev, newFile]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const handleUpload = async (uploadedFile: UploadedFile, index: number) => {
    setIsUploading(true);
    
    // Update status to uploading
    setUploadedFiles((prev) => 
      prev.map((f, i) => i === index ? { ...f, status: 'uploading' as const } : f)
    );

    // Simulate upload progress (in real app, this would be actual upload)
    const progressInterval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((f, i) => 
          i === index && f.progress < 90 
            ? { ...f, progress: f.progress + 10 } 
            : f
        )
      );
    }, 100);

    try {
      // Add to canvas
      onUpload(uploadedFile.file);
      
      clearInterval(progressInterval);
      
      // Mark as success
      setUploadedFiles((prev) =>
        prev.map((f, i) => 
          i === index ? { ...f, status: 'success' as const, progress: 100 } : f
        )
      );
      
      toast.success('Artwork added to design!');
    } catch (error) {
      clearInterval(progressInterval);
      
      setUploadedFiles((prev) =>
        prev.map((f, i) => 
          i === index 
            ? { ...f, status: 'error' as const, error: 'Upload failed' } 
            : f
        )
      );
      
      toast.error('Failed to add artwork');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const file = prev[index];
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddToDesign = (index: number) => {
    const file = uploadedFiles[index];
    if (file && file.status === 'pending') {
      handleUpload(file, index);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600" />
          Upload Artwork
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDragActive ? 'Drop your files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-gray-500 mb-3">or click to browse</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">PNG</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">JPG</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">SVG</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">PDF</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Max file size: 10MB</p>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-amber-800 mb-1">Tips for best results:</h4>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>• Use PNG with transparent background</li>
            <li>• Minimum 300 DPI for print quality</li>
            <li>• Vector files (SVG) scale better</li>
          </ul>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
            {uploadedFiles.map((uploadedFile, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
              >
                {/* Preview */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                  {uploadedFile.file.type.startsWith('image/') ? (
                    <img
                      src={uploadedFile.preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileImage className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024).toFixed(1)} KB
                  </p>
                  
                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Status/Actions */}
                <div className="flex items-center gap-2">
                  {uploadedFile.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleAddToDesign(index)}
                      disabled={isUploading}
                    >
                      Add to Design
                    </Button>
                  )}
                  {uploadedFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  )}
                  {uploadedFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {uploadedFile.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
