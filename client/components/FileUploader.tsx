import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, X, Check, AlertCircle, FileText, Image, Video } from 'lucide-react';
import { uploadFileToGoogleDrive, validateFile, FileUploadResponse } from '../utils/fileUpload';

interface FileUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  className?: string;
}

interface UploadingFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadComplete,
  maxFiles = 5,
  maxSizeMB = 100,
  allowedTypes,
  className = '',
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={16} />;
    if (fileType.startsWith('video/')) return <Video size={16} />;
    return <FileText size={16} />;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, maxFiles);
    
    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const validation = validateFile(file, maxSizeMB, allowedTypes);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(`Upload errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    // Initialize uploading state
    const initialFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...initialFiles]);

    // Upload files
    const uploadResults: FileUploadResponse[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        const result = await uploadFileToGoogleDrive(file);
        uploadResults.push(result);

        // Update file status
        setUploadingFiles(prev => prev.map(f => 
          f.file === file 
            ? { 
                ...f, 
                status: result.success ? 'success' : 'error',
                url: result.url,
                error: result.error
              }
            : f
        ));
      } catch (error) {
        uploadResults.push({
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        });

        setUploadingFiles(prev => prev.map(f => 
          f.file === file 
            ? { 
                ...f, 
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ));
      }
    }

    // Call completion callback with successful URLs
    const successfulUrls = uploadResults
      .filter(result => result.success && result.url)
      .map(result => result.url!);

    if (successfulUrls.length > 0 && onUploadComplete) {
      onUploadComplete(successfulUrls);
    }
  }, [maxFiles, maxSizeMB, allowedTypes, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((fileToRemove: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== fileToRemove));
  }, []);

  const clearAll = useCallback(() => {
    setUploadingFiles([]);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <motion.div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.01 }}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Files to Google Drive
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <Button
          variant="outline"
          className="mb-2"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          Select Files
        </Button>
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept={allowedTypes?.join(',')}
        />
        <p className="text-xs text-gray-400">
          Max {maxFiles} files, {maxSizeMB}MB each
        </p>
      </motion.div>

      {/* File List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Files ({uploadingFiles.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          {uploadingFiles.map((uploadFile, index) => (
            <motion.div
              key={`${uploadFile.file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex-shrink-0">
                {getFileIcon(uploadFile.file.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadFile.url && (
                  <a
                    href={uploadFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-800"
                  >
                    View File
                  </a>
                )}
                {uploadFile.error && (
                  <p className="text-xs text-red-500">{uploadFile.error}</p>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                {uploadFile.status === 'uploading' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                )}
                {uploadFile.status === 'success' && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {uploadFile.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(uploadFile.file)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
