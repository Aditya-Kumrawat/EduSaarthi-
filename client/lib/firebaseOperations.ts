import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Assignment interface for Firebase
export interface FirebaseAssignment {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  teacherId: string;
  teacherName: string;
  status: 'active' | 'draft' | 'closed';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subject?: string;
  points?: number;
}

// Create new assignment in Firebase
export const createFirebaseAssignment = async (assignmentData: Omit<FirebaseAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseAssignment> => {
  try {
    const now = Timestamp.now();
    const assignment: Omit<FirebaseAssignment, 'id'> = {
      ...assignmentData,
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignment);
    
    return {
      id: docRef.id,
      ...assignment
    };
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw new Error('Failed to create assignment');
  }
};

// Get all assignments for a teacher
export const getTeacherAssignments = async (teacherId: string): Promise<FirebaseAssignment[]> => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'assignments'),
      where('teacherId', '==', teacherId)
    );
    
    const querySnapshot = await getDocs(q);
    const assignments: FirebaseAssignment[] = [];
    
    querySnapshot.forEach((doc) => {
      assignments.push({
        id: doc.id,
        ...doc.data()
      } as FirebaseAssignment);
    });
    
    return assignments;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw new Error('Failed to fetch assignments');
  }
};

// Get all assignments (for admin/overview)
export const getAllAssignments = async (): Promise<FirebaseAssignment[]> => {
  try {
    const q = query(
      collection(db, 'assignments'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const assignments: FirebaseAssignment[] = [];
    
    querySnapshot.forEach((doc) => {
      assignments.push({
        id: doc.id,
        ...doc.data()
      } as FirebaseAssignment);
    });
    
    return assignments;
  } catch (error) {
    console.error('Error fetching all assignments:', error);
    throw new Error('Failed to fetch assignments');
  }
};

// Update assignment
export const updateFirebaseAssignment = async (assignmentId: string, updates: Partial<FirebaseAssignment>): Promise<void> => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    await updateDoc(assignmentRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw new Error('Failed to update assignment');
  }
};

// Delete assignment
export const deleteFirebaseAssignment = async (assignmentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw new Error('Failed to delete assignment');
  }
};

// Student data operations
export interface FirebaseStudent {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive';
  lastActive: Timestamp;
  grade?: string;
  teacherId: string;
  createdAt: Timestamp;
}

// Create student
export const createFirebaseStudent = async (studentData: Omit<FirebaseStudent, 'id' | 'createdAt'>): Promise<FirebaseStudent> => {
  try {
    const student: Omit<FirebaseStudent, 'id'> = {
      ...studentData,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'students'), student);
    
    return {
      id: docRef.id,
      ...student
    };
  } catch (error) {
    console.error('Error creating student:', error);
    throw new Error('Failed to create student');
  }
};

// Get students for a teacher
export const getTeacherStudents = async (teacherId: string): Promise<FirebaseStudent[]> => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'students'),
      where('teacherId', '==', teacherId)
    );
    
    const querySnapshot = await getDocs(q);
    const students: FirebaseStudent[] = [];
    
    querySnapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data()
      } as FirebaseStudent);
    });
    
    // Sort by name in memory
    students.sort((a, b) => a.name.localeCompare(b.name));
    
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students');
  }
};

// Class posts operations
export interface FirebaseClassPost {
  id?: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorAvatar?: string;
  createdAt: Timestamp;
  attachments?: string[];
  comments: number;
  type: 'announcement' | 'material' | 'assignment';
  teacherId: string;
}

// Create class post
export const createFirebaseClassPost = async (postData: Omit<FirebaseClassPost, 'id' | 'createdAt' | 'comments'>): Promise<FirebaseClassPost> => {
  try {
    const post: Omit<FirebaseClassPost, 'id'> = {
      ...postData,
      comments: 0,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'classPosts'), post);
    
    return {
      id: docRef.id,
      ...post
    };
  } catch (error) {
    console.error('Error creating class post:', error);
    throw new Error('Failed to create class post');
  }
};

// Get class posts for a teacher
export const getTeacherClassPosts = async (teacherId: string): Promise<FirebaseClassPost[]> => {
  try {
    // Simple query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'classPosts'),
      where('teacherId', '==', teacherId)
    );
    
    const querySnapshot = await getDocs(q);
    const posts: FirebaseClassPost[] = [];
    
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      } as FirebaseClassPost);
    });
    
    // Sort by createdAt in memory
    posts.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return posts;
  } catch (error) {
    console.error('Error fetching class posts:', error);
    throw new Error('Failed to fetch class posts');
  }
};

// Classroom student interface
export interface ClassroomStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'inactive';
  lastActive: Timestamp;
  grade?: string;
  classroomId: string;
  classroomName: string;
  enrolledAt: Timestamp;
}

// Get teacher's classrooms
export const getTeacherClassrooms = async (teacherId: string) => {
  try {
    const q = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', teacherId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const classrooms: any[] = [];
    
    querySnapshot.forEach((doc) => {
      classrooms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return classrooms;
  } catch (error) {
    console.error('Error fetching teacher classrooms:', error);
    throw new Error('Failed to fetch classrooms');
  }
};

// Get students enrolled in teacher's classrooms
export const getTeacherClassroomStudents = async (teacherId: string): Promise<ClassroomStudent[]> => {
  try {
    // First, get all classrooms for this teacher
    const classroomsQuery = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', teacherId),
      where('isActive', '==', true)
    );
    
    const classroomsSnapshot = await getDocs(classroomsQuery);
    const classroomIds: string[] = [];
    const classroomMap = new Map<string, string>();
    
    classroomsSnapshot.forEach((doc) => {
      const data = doc.data();
      classroomIds.push(doc.id);
      classroomMap.set(doc.id, data.name);
    });
    
    if (classroomIds.length === 0) {
      return [];
    }
    
    // Get all enrollments for these classrooms
    const students: ClassroomStudent[] = [];
    
    // Process classrooms in batches to avoid Firestore 'in' query limit of 10
    const batchSize = 10;
    for (let i = 0; i < classroomIds.length; i += batchSize) {
      const batch = classroomIds.slice(i, i + batchSize);
      
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('classroomId', 'in', batch),
        where('status', '==', 'active')
      );
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      enrollmentsSnapshot.forEach((doc) => {
        const enrollment = doc.data();
        students.push({
          id: enrollment.studentId,
          name: enrollment.studentName || enrollment.studentEmail?.split('@')[0] || 'Student',
          email: enrollment.studentEmail,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${enrollment.studentEmail}`,
          status: 'active',
          lastActive: enrollment.enrolledAt,
          classroomId: enrollment.classroomId,
          classroomName: classroomMap.get(enrollment.classroomId) || 'Unknown Class',
          enrolledAt: enrollment.enrolledAt
        });
      });
    }
    
    // Remove duplicates (same student in multiple classes)
    const uniqueStudents = students.reduce((acc, student) => {
      const existing = acc.find(s => s.id === student.id);
      if (!existing) {
        acc.push(student);
      }
      return acc;
    }, [] as ClassroomStudent[]);
    
    // Sort by name
    uniqueStudents.sort((a, b) => a.name.localeCompare(b.name));
    
    return uniqueStudents;
  } catch (error) {
    console.error('Error fetching classroom students:', error);
    throw new Error('Failed to fetch classroom students');
  }
};
