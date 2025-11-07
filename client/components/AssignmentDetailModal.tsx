import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  Download,
  Edit3,
  Save,
  X,
  Paperclip,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { ClassroomAssignment } from '@/types/classroom';
import { submitAssignment, updateAssignment } from '@/lib/classroomOperations';
import { useAuth } from '@/contexts/AuthContext';
import { uploadSubmissionFile, downloadFile } from '@/lib/supabaseStorage';
import { Timestamp } from 'firebase/firestore';

interface AssignmentDetailModalProps {
  assignment: ClassroomAssignment | null;
  isOpen: boolean;
  onClose: () => void;
  isTeacher: boolean;
  onAssignmentUpdate?: () => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  isOpen,
  onClose,
  isTeacher,
  onAssignmentUpdate,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDownloadMaterial = async (material: any) => {
    try {
      await downloadFile(material.url, material.name);
      toast({
        title: 'Download Started',
        description: `Downloading ${material.name}...`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 0,
  });

  useEffect(() => {
    if (assignment) {
      setEditForm({
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate ? new Date(assignment.dueDate.seconds * 1000).toISOString().split('T')[0] : '',
        points: 0, // Default points
      });
    }
  }, [assignment]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No due date';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveEdit = async () => {
    if (!assignment || !currentUser) return;

    try {
      setIsSubmitting(true);
      
      const updatedData = {
        title: editForm.title,
        description: editForm.description,
        dueDate: editForm.dueDate ? Timestamp.fromDate(new Date(editForm.dueDate)) : null,
        points: editForm.points,
      };

      await updateAssignment(assignment.id, updatedData);
      
      toast({
        title: 'Success',
        description: 'Assignment updated successfully',
      });
      
      setIsEditing(false);
      onAssignmentUpdate?.();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!assignment || !currentUser) return;

    if (!submissionFiles?.length) {
      toast({
        title: 'Error',
        description: 'Please attach a PDF file for your submission',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type (only PDF)
    const file = submissionFiles[0];
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Error',
        description: 'Please upload a PDF file only',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload file to Supabase storage
      const file = submissionFiles[0];
      
      const uploadResult = await uploadSubmissionFile(
        file,
        assignment.id,
        currentUser.uid,
        `submission_${Date.now()}`
      );
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file');
      }
      
      const submissionData = {
        content: '', // No text content needed
        files: [{
          id: `${Date.now()}_${file.name}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: uploadResult.publicUrl || '',
          uploadedAt: Timestamp.now(),
        }],
      };

      await submitAssignment(
        assignment.id,
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Unknown Student',
        submissionData
      );

      // Note: Removed Make.com webhook call from student submission
      // Make.com requests should only happen when teacher clicks "Analyze with AI"

      toast({
        title: 'Success',
        description: 'Assignment submitted successfully',
      });

      setSubmissionFiles(null);
      onClose();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit assignment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            {isEditing ? (
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-white border-gray-300 text-gray-900"
              />
            ) : (
              assignment.title
            )}
            <span>Assignment</span>
            {isTeacher && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="ml-auto text-gray-700 hover:bg-gray-100"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Due Date</span>
              </div>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formatDate(assignment.dueDate)}</p>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Points</span>
              </div>
              {isEditing ? (
                <Input
                  type="number"
                  value={editForm.points}
                  onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })}
                  className="bg-white border-gray-300 text-gray-900"
                />
              ) : (
                <p className="text-gray-900 font-medium">{(assignment as any).points || 0} points</p>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Status</span>
              </div>
              <Badge className={`${
                assignment.status === 'published' 
                  ? 'bg-green-500/20 text-green-400'
                  : assignment.status === 'draft'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {assignment.status}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/60">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            {isEditing ? (
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="bg-white border-gray-300 text-gray-900 min-h-[120px]"
                placeholder="Assignment description..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {assignment.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Materials */}
          {assignment.materials && assignment.materials.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/60">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Materials
              </h3>
              <div className="space-y-2">
                {assignment.materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-lg hover:bg-white/80 transition-colors border border-gray-200/40"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-900 flex-1">{material.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => handleDownloadMaterial(material)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Submission Section */}
          {!isTeacher && assignment.status === 'published' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200/60">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Submit Assignment
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900 mb-2 block">Upload Your Submission (PDF Required) *</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setSubmissionFiles(e.target.files ? Array.from(e.target.files) : [])}
                    className="bg-white border-gray-300 text-gray-900 file:bg-blue-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Please upload your assignment as a PDF file
                  </p>
                </div>

                <Button
                  onClick={handleSubmitAssignment}
                  disabled={isSubmitting || !submissionFiles?.length}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading & Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isTeacher && isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
