import { Timestamp } from 'firebase/firestore';

export interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  classCode: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
}

export interface Enrollment {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrolledAt: Timestamp;
  status: 'active' | 'inactive';
}

export interface ClassroomAssignment {
  id: string;
  classroomId: string;
  teacherId: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: Timestamp;
  maxPoints?: number;
  materials: AssignmentMaterial[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'draft' | 'published' | 'closed';
}

export interface AssignmentMaterial {
  id: string;
  name: string;
  type: 'link' | 'file' | 'video' | 'document';
  url: string;
  size?: number;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  files: SubmissionFile[];
  textSubmission?: string;
  submittedAt: Timestamp;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  grade?: number;
  feedback?: string;
  gradedAt?: Timestamp;
  gradedBy?: string;
}

export interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Timestamp;
}

export interface ClassroomStats {
  totalStudents: number;
  totalAssignments: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
}
