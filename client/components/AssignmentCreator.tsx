import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { uploadAssignmentMaterial } from '@/lib/supabaseStorage'
import { createClassroomAssignment } from '@/lib/classroomOperations'
import { useAuth } from '@/contexts/AuthContext'
import {
  Upload,
  FileText,
  X,
  Plus,
  Calendar,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface AssignmentCreatorProps {
  isOpen: boolean
  onClose: () => void
  onAssignmentCreated: () => void
  classroomId?: string
}

interface FileUploadState {
  file: File | null
  uploading: boolean
  uploaded: boolean
  error: string | null
  url: string | null
}

export const AssignmentCreator: React.FC<AssignmentCreatorProps> = ({
  isOpen,
  onClose,
  onAssignmentCreated,
  classroomId,
}) => {
  const { toast } = useToast()
  const { currentUser } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    subject: '',
    points: 100,
  })
  
  const [fileUpload, setFileUpload] = useState<FileUploadState>({
    file: null,
    uploading: false,
    uploaded: false,
    error: null,
    url: null,
  })
  
  const [isCreating, setIsCreating] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload PDF, PPT, PPTX, DOC, or DOCX files only.',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload files smaller than 10MB.',
        variant: 'destructive',
      })
      return
    }

    setFileUpload({
      file,
      uploading: false,
      uploaded: false,
      error: null,
      url: null,
    })
  }

  const handleFileUpload = async () => {
    if (!fileUpload.file) return

    setFileUpload(prev => ({ ...prev, uploading: true, error: null }))

    try {
      const result = await uploadAssignmentMaterial(fileUpload.file, 'temp-assignment', formData.title || 'assignment')
      
      if (result.success) {
        setFileUpload(prev => ({
          ...prev,
          uploading: false,
          uploaded: true,
          url: result.publicUrl,
        }))
        
        toast({
          title: 'File Uploaded',
          description: 'Assignment file uploaded successfully!',
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      setFileUpload(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }))
      
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveFile = () => {
    setFileUpload({
      file: null,
      uploading: false,
      uploaded: false,
      error: null,
      url: null,
    })
  }

  const handleCreateAssignment = async () => {
    if (!formData.title || !formData.description || !formData.dueDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    if (!fileUpload.uploaded || !fileUpload.url) {
      toast({
        title: 'Missing Assignment File',
        description: 'Please upload an assignment file before creating the assignment.',
        variant: 'destructive',
      })
      return
    }

    if (!currentUser) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in to create assignments.',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)

    try {
      if (!classroomId) {
        throw new Error('Classroom ID is required');
      }

      const assignmentData = {
        title: formData.title,
        description: formData.description,
        instructions: formData.description,
        dueDate: formData.dueDate ? { seconds: new Date(formData.dueDate).getTime() / 1000, nanoseconds: 0 } as any : undefined,
        maxPoints: formData.points,
        materials: fileUpload.url ? [{
          id: Date.now().toString(),
          name: fileUpload.file?.name || 'Assignment File',
          type: 'file' as const,
          url: fileUpload.url,
          size: fileUpload.file?.size,
        }] : [],
        status: 'published' as const,
      }

      await createClassroomAssignment(classroomId, currentUser.uid, assignmentData)
      onAssignmentCreated()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        subject: '',
        points: 100,
      })
      setFileUpload({
        file: null,
        uploading: false,
        uploaded: false,
        error: null,
        url: null,
      })
      
      onClose()
      
      toast({
        title: 'Assignment Created',
        description: 'Your assignment has been created successfully!',
      })
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create assignment',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return <FileText className="w-5 h-5 text-blue-600" />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Create New Assignment
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                placeholder="Enter assignment title"
                value={formData.title}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, subject: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the assignment requirements and instructions"
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      points: parseInt(e.target.value) || 100,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <Label>Assignment Files *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {!fileUpload.file ? (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload PDF, PPT, or DOC files (Max 10MB) - Required
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Plus className="w-4 h-4 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </Label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFileIcon(fileUpload.file.name)}
                      <div>
                        <p className="font-medium text-sm">{fileUpload.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fileUpload.uploaded ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : fileUpload.error ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveFile}
                        disabled={fileUpload.uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {fileUpload.error && (
                    <p className="text-sm text-red-600">{fileUpload.error}</p>
                  )}

                  {!fileUpload.uploaded && !fileUpload.error && (
                    <Button
                      onClick={handleFileUpload}
                      disabled={fileUpload.uploading}
                      size="sm"
                      className="w-full"
                    >
                      {fileUpload.uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssignment}
              disabled={isCreating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
