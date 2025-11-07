import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  X, 
  Plus, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { uploadSubmissionFile } from '../lib/supabaseStorage';
import { submitAssignment, getStudentSubmission, updateSubmission } from '../lib/classroomOperations';
import { ClassroomAssignment, SubmissionFile, StudentSubmission as StudentSubmissionType } from '../types/classroom';

interface StudentSubmissionProps {
  assignment: ClassroomAssignment;
  isOpen: boolean;
  onClose: () => void;
  onSubmissionComplete: () => void;
}

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  url: string | null;
}

export const StudentSubmission: React.FC<StudentSubmissionProps> = ({
  assignment,
  isOpen,
  onClose,
  onSubmissionComplete,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [textSubmission, setTextSubmission] = useState('');
  const [currentFile, setCurrentFile] = useState<FileUploadState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<StudentSubmissionType | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing submission when component opens
  React.useEffect(() => {
    const loadExistingSubmission = async () => {
      if (!currentUser || !isOpen) return;
      
      setLoading(true);
      try {
        const submission = await getStudentSubmission(assignment.id, currentUser.uid);
        setExistingSubmission(submission);
        
        if (submission) {
          setTextSubmission(submission.textSubmission || '');
          // If there's an existing file, set it up for display/replacement
          if (submission.files && submission.files.length > 0) {
            const existingFile = submission.files[0];
            setCurrentFile({
              file: null, // We don't have the original File object
              uploading: false,
              uploaded: true,
              error: null,
              url: existingFile.url,
            });
          }
        }
      } catch (error) {
        console.error('Error loading existing submission:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingSubmission();
  }, [assignment.id, currentUser, isOpen]);

  const initializeFileSlot = () => {
    setCurrentFile({
      file: null,
      uploading: false,
      uploaded: false,
      error: null,
      url: null,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload files smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setCurrentFile({
      file,
      uploading: false,
      uploaded: false,
      error: null,
      url: null,
    });
  };

  const uploadFile = async () => {
    if (!currentFile?.file || !currentUser) return;

    setCurrentFile(prev => prev ? { ...prev, uploading: true, error: null } : null);

    try {
      const result = await uploadSubmissionFile(
        currentFile.file,
        assignment.id,
        currentUser.uid,
        currentFile.file.name
      );

      if (result.success) {
        setCurrentFile(prev => prev ? {
          ...prev,
          uploading: false,
          uploaded: true,
          url: result.publicUrl
        } : null);

        toast({
          title: existingSubmission ? 'File Replaced' : 'File Uploaded',
          description: existingSubmission 
            ? 'Your file has been replaced successfully!' 
            : 'Your file has been uploaded successfully!',
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      setCurrentFile(prev => prev ? {
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      } : null);

      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    }
  };

  const removeFile = () => {
    setCurrentFile(null);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    const hasFile = currentFile?.uploaded && currentFile?.url;
    const hasText = textSubmission.trim();
    
    if (!hasText && !hasFile) {
      toast({
        title: 'Nothing to Submit',
        description: 'Please add text or upload a file before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const submissionFiles: SubmissionFile[] = hasFile ? [{
        id: Date.now().toString() + Math.random(),
        name: currentFile.file?.name || existingSubmission?.files?.[0]?.name || 'File',
        url: currentFile.url!,
        size: currentFile.file?.size || existingSubmission?.files?.[0]?.size || 0,
        type: currentFile.file?.type || existingSubmission?.files?.[0]?.type || 'application/octet-stream',
        uploadedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
      }] : [];

      const submissionData = {
        files: submissionFiles,
        textSubmission: hasText ? textSubmission.trim() : undefined,
      };

      if (existingSubmission) {
        // Update existing submission
        await updateSubmission(existingSubmission.id, submissionData);
        toast({
          title: 'Assignment Updated',
          description: 'Your assignment has been updated successfully!',
        });
      } else {
        // Create new submission
        await submitAssignment(
          assignment.id,
          currentUser.uid,
          currentUser.displayName || currentUser.email || 'Student',
          submissionData
        );
        toast({
          title: 'Assignment Submitted',
          description: 'Your assignment has been submitted successfully!',
        });
      }

      onSubmissionComplete();
      onClose();
    } catch (error) {
      toast({
        title: existingSubmission ? 'Update Failed' : 'Submission Failed',
        description: error instanceof Error ? error.message : `Failed to ${existingSubmission ? 'update' : 'submit'} assignment`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.seconds) return 'No due date';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const isOverdue = () => {
    if (!assignment.dueDate?.seconds) return false;
    return new Date() > new Date(assignment.dueDate.seconds * 1000);
  };

  if (!isOpen) return null;
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="text-white">Loading submission...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {existingSubmission ? 'Update Assignment' : 'Submit Assignment'}: {assignment.title}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Due: {formatDate(assignment.dueDate)}</span>
              </div>
              {assignment.maxPoints && (
                <span>{assignment.maxPoints} points</span>
              )}
              {isOverdue() && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                  Overdue
                </span>
              )}
              {existingSubmission && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                  Previously Submitted
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Assignment Description */}
        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="font-medium text-white mb-2">Instructions</h3>
          <p className="text-gray-300 text-sm">{assignment.description}</p>
          {assignment.instructions && assignment.instructions !== assignment.description && (
            <p className="text-gray-300 text-sm mt-2">{assignment.instructions}</p>
          )}
        </div>

        {/* Assignment Materials */}
        {assignment.materials && assignment.materials.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-white mb-3">Assignment Materials</h3>
            <div className="space-y-2">
              {assignment.materials.map((material) => (
                <a
                  key={material.id}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
                >
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{material.name}</p>
                    <p className="text-gray-400 text-xs">{material.type}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Text Submission */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Answer (Optional)
          </label>
          <textarea
            value={textSubmission}
            onChange={(e) => setTextSubmission(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">
              {existingSubmission ? 'Replace File (Optional)' : 'Upload File (Optional)'}
            </label>
            {!currentFile && (
              <button
                onClick={initializeFileSlot}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                {existingSubmission ? 'Replace File' : 'Add File'}
              </button>
            )}
          </div>

          {currentFile && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              {!currentFile.file && currentFile.uploaded ? (
                // Show existing file from previous submission
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {existingSubmission?.files?.[0]?.name || 'Previous File'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {existingSubmission?.files?.[0]?.size ? 
                            (existingSubmission.files[0].size / 1024 / 1024).toFixed(2) + ' MB' : 
                            'Unknown size'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <button
                        onClick={removeFile}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                  />
                  <p className="text-xs text-gray-400">Select a new file to replace the current one</p>
                </div>
              ) : !currentFile.file ? (
                // Show file input for new file
                <div className="flex items-center justify-between">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="flex-1 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  <button
                    onClick={removeFile}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                // Show selected file with upload option
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white text-sm font-medium">{currentFile.file.name}</p>
                        <p className="text-gray-400 text-xs">
                          {(currentFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentFile.uploaded ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : currentFile.error ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : null}
                      <button
                        onClick={removeFile}
                        disabled={currentFile.uploading}
                        className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {currentFile.error && (
                    <p className="text-sm text-red-400">{currentFile.error}</p>
                  )}

                  {!currentFile.uploaded && !currentFile.error && (
                    <button
                      onClick={uploadFile}
                      disabled={currentFile.uploading}
                      className="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {currentFile.uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {existingSubmission ? 'Replace File' : 'Upload File'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || isOverdue()}
            className="flex-1 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {existingSubmission ? 'Update Assignment' : 'Submit Assignment'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
