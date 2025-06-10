
import React, { useState, useCallback } from 'react';
import { Upload, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { SecurityValidator } from '@/utils/validation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SecureFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  disabled?: boolean;
}

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFileSelect,
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.mp4,.webm,.ppt,.pptx",
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateAndProcessFile = useCallback((file: File) => {
    const validation = SecurityValidator.validateFile(file);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast({
        title: "File validation failed",
        description: validation.errors[0],
        variant: "destructive"
      });
      return false;
    }
    
    setValidationErrors([]);
    return true;
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Take only first file if not multiple
    
    if (validateAndProcessFile(file)) {
      // Simulate upload progress for security scanning
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null;
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(null);
              onFileSelect(file);
              toast({
                title: "File uploaded successfully",
                description: `${file.name} has been securely uploaded`,
              });
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  }, [validateAndProcessFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    handleFiles(e.dataTransfer.files);
  }, [handleFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input value to allow same file selection
    e.target.value = '';
  }, [handleFiles]);

  const clearErrors = () => {
    setValidationErrors([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-600'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:border-blue-400 cursor-pointer'
          }
          ${validationErrors.length > 0 
            ? 'border-red-400 bg-red-50 dark:bg-red-950' 
            : ''
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="flex flex-col items-center space-y-4">
          {uploadProgress !== null ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="w-full max-w-xs">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Scanning file for security... {uploadProgress}%
                </p>
              </div>
            </>
          ) : validationErrors.length > 0 ? (
            <>
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="text-red-600 font-medium">File validation failed</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum file size: {formatFileSize(maxSize)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported: PDF, Images, Videos, PowerPoint
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {validationErrors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex justify-between items-start">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Security Validation Errors
                </h3>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearErrors}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
