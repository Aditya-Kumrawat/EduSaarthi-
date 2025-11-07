import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  Classroom, 
  Enrollment, 
  ClassroomAssignment, 
  StudentSubmission, 
  ClassroomStats 
} from '../types/classroom';

// Generate unique 6-character classroom code
export const generateClassCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Check if class code is unique
export const isClassCodeUnique = async (classCode: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'classrooms'),
      where('classCode', '==', classCode),
      where('isActive', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking class code uniqueness:', error);
    return false;
  }
};

// Create a new classroom
export const createClassroom = async (
  teacherId: string,
  teacherName: string,
  name: string,
  description: string
): Promise<Classroom> => {
  try {
    let classCode = generateClassCode();
    
    // Ensure unique class code
    while (!(await isClassCodeUnique(classCode))) {
      classCode = generateClassCode();
    }

    const now = Timestamp.now();
    const classroomData = {
      name,
      description,
      teacherId,
      teacherName,
      classCode,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
    
    return {
      id: docRef.id,
      ...classroomData,
    };
  } catch (error) {
    console.error('Error creating classroom:', error);
    throw new Error('Failed to create classroom');
  }
};

// Get teacher's classrooms
export const getTeacherClassrooms = async (teacherId: string): Promise<Classroom[]> => {
  try {
    // First try with orderBy, if it fails due to index, try without
    let q = query(
      collection(db, 'classrooms'),
      where('teacherId', '==', teacherId),
      where('isActive', '==', true)
    );
    
    let querySnapshot;
    try {
      // Try with orderBy first
      q = query(
        collection(db, 'classrooms'),
        where('teacherId', '==', teacherId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.warn('Index not available for orderBy, fetching without sorting:', indexError);
      // Fallback without orderBy
      q = query(
        collection(db, 'classrooms'),
        where('teacherId', '==', teacherId),
        where('isActive', '==', true)
      );
      querySnapshot = await getDocs(q);
    }
    
    const classrooms: Classroom[] = [];
    
    querySnapshot.forEach((doc) => {
      classrooms.push({
        id: doc.id,
        ...doc.data()
      } as Classroom);
    });
    
    // Sort in memory if we couldn't sort in the query
    classrooms.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return classrooms;
  } catch (error) {
    console.error('Error fetching teacher classrooms:', error);
    throw new Error('Failed to fetch classrooms');
  }
};

// Join classroom with class code
export const joinClassroom = async (
  studentId: string,
  studentName: string,
  studentEmail: string,
  classCode: string
): Promise<Enrollment> => {
  try {
    // Find classroom by class code
    const classroomQuery = query(
      collection(db, 'classrooms'),
      where('classCode', '==', classCode.toUpperCase()),
      where('isActive', '==', true)
    );
    
    const classroomSnapshot = await getDocs(classroomQuery);
    
    if (classroomSnapshot.empty) {
      throw new Error('Invalid class code');
    }
    
    const classroomDoc = classroomSnapshot.docs[0];
    const classroomId = classroomDoc.id;
    
    // Check if student is already enrolled
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('classroomId', '==', classroomId),
      where('studentId', '==', studentId)
    );
    
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    
    if (!enrollmentSnapshot.empty) {
      throw new Error('Already enrolled in this classroom');
    }
    
    // Create enrollment
    const enrollmentData = {
      classroomId,
      studentId,
      studentName,
      studentEmail,
      enrolledAt: Timestamp.now(),
      status: 'active' as const,
    };
    
    const docRef = await addDoc(collection(db, 'enrollments'), enrollmentData);
    
    return {
      id: docRef.id,
      ...enrollmentData,
    };
  } catch (error) {
    console.error('Error joining classroom:', error);
    throw error;
  }
};

// Get student's enrolled classrooms
export const getStudentClassrooms = async (studentId: string): Promise<Classroom[]> => {
  try {
    // Get student's enrollments
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId),
      where('status', '==', 'active')
    );
    
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    const classroomIds: string[] = [];
    
    enrollmentSnapshot.forEach((doc) => {
      classroomIds.push(doc.data().classroomId);
    });
    
    if (classroomIds.length === 0) {
      return [];
    }
    
    // Get classroom details
    const classrooms: Classroom[] = [];
    
    for (const classroomId of classroomIds) {
      const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
      if (classroomDoc.exists()) {
        classrooms.push({
          id: classroomDoc.id,
          ...classroomDoc.data()
        } as Classroom);
      }
    }
    
    // Sort in memory with safe access to seconds
    return classrooms.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error fetching student classrooms:', error);
    throw new Error('Failed to fetch enrolled classrooms');
  }
};

// Create assignment for classroom
export const createClassroomAssignment = async (
  classroomId: string,
  teacherId: string,
  assignmentData: Omit<ClassroomAssignment, 'id' | 'classroomId' | 'teacherId' | 'createdAt' | 'updatedAt'>
): Promise<ClassroomAssignment> => {
  try {
    const now = Timestamp.now();
    const assignment = {
      classroomId,
      teacherId,
      ...assignmentData,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignment);
    
    return {
      id: docRef.id,
      ...assignment,
    };
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw new Error('Failed to create assignment');
  }
};

// Get classroom assignments
export const getClassroomAssignments = async (classroomId: string): Promise<ClassroomAssignment[]> => {
  try {
    // Try with orderBy first, fallback without if index doesn't exist
    let q = query(
      collection(db, 'assignments'),
      where('classroomId', '==', classroomId)
    );
    
    let querySnapshot;
    try {
      // Try with orderBy
      q = query(
        collection(db, 'assignments'),
        where('classroomId', '==', classroomId),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.warn('Index not available for assignments orderBy, fetching without sorting:', indexError);
      // Fallback without orderBy
      q = query(
        collection(db, 'assignments'),
        where('classroomId', '==', classroomId)
      );
      querySnapshot = await getDocs(q);
    }
    
    const assignments: ClassroomAssignment[] = [];
    
    querySnapshot.forEach((doc) => {
      assignments.push({
        id: doc.id,
        ...doc.data()
      } as ClassroomAssignment);
    });
    
    // Sort in memory if we couldn't sort in the query
    assignments.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return assignments;
  } catch (error) {
    console.error('Error fetching classroom assignments:', error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
};

// Submit assignment
export const submitAssignment = async (
  assignmentId: string,
  studentId: string,
  studentName: string,
  submissionData: Omit<StudentSubmission, 'id' | 'assignmentId' | 'studentId' | 'studentName' | 'submittedAt' | 'status'>
): Promise<StudentSubmission> => {
  try {
    const submission: Omit<StudentSubmission, 'id'> = {
      assignmentId,
      studentId,
      studentName,
      submittedAt: Timestamp.now(),
      status: 'submitted',
      ...submissionData,
    };

    const docRef = await addDoc(collection(db, 'submissions'), submission);
    
    return {
      id: docRef.id,
      ...submission,
    };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw new Error('Failed to submit assignment');
  }
};

// Update assignment (for teachers)
export const updateAssignment = async (
  assignmentId: string,
  updateData: Partial<Omit<ClassroomAssignment, 'id' | 'createdAt' | 'teacherId' | 'classroomId'>>
): Promise<void> => {
  try {
    const assignmentRef = doc(db, 'assignments', assignmentId);
    const updatedData = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(assignmentRef, updatedData);
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw new Error('Failed to update assignment');
  }
};

// Get student's pending assignments
export const getStudentPendingAssignments = async (studentId: string): Promise<ClassroomAssignment[]> => {
  try {
    // First get all classrooms the student is enrolled in
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('studentId', '==', studentId),
      where('status', '==', 'active')
    );
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    
    if (enrollmentSnapshot.empty) {
      return [];
    }

    const classroomIds: string[] = [];
    enrollmentSnapshot.forEach((doc) => {
      classroomIds.push(doc.data().classroomId);
    });

    // Get all assignments from enrolled classrooms
    const assignments: ClassroomAssignment[] = [];
    
    // Process in batches due to Firestore 'in' query limit
    const batchSize = 10;
    for (let i = 0; i < classroomIds.length; i += batchSize) {
      const batch = classroomIds.slice(i, i + batchSize);
      
      const assignmentQuery = query(
        collection(db, 'assignments'),
        where('classroomId', 'in', batch),
        where('status', '==', 'published')
      );
      
      const assignmentSnapshot = await getDocs(assignmentQuery);
      assignmentSnapshot.forEach((doc) => {
        assignments.push({
          id: doc.id,
          ...doc.data()
        } as ClassroomAssignment);
      });
    }

    // Get student's submissions to filter out already submitted assignments
    const submissionQuery = query(
      collection(db, 'submissions'),
      where('studentId', '==', studentId)
    );
    const submissionSnapshot = await getDocs(submissionQuery);
    
    const submittedAssignmentIds = new Set<string>();
    submissionSnapshot.forEach((doc) => {
      submittedAssignmentIds.add(doc.data().assignmentId);
    });

    // Filter out submitted assignments and return pending ones
    const pendingAssignments = assignments.filter(assignment => 
      !submittedAssignmentIds.has(assignment.id)
    );

    // Sort by due date (closest first)
    pendingAssignments.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.seconds - b.dueDate.seconds;
    });

    return pendingAssignments;
  } catch (error) {
    console.error('Error fetching student pending assignments:', error);
    return [];
  }
};

// Get student's submission for a specific assignment
export const getStudentSubmission = async (assignmentId: string, studentId: string): Promise<StudentSubmission | null> => {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('assignmentId', '==', assignmentId),
      where('studentId', '==', studentId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as StudentSubmission;
  } catch (error) {
    console.error('Error fetching student submission:', error);
    return null;
  }
};

// Update existing submission (for file replacement)
export const updateSubmission = async (
  submissionId: string,
  updateData: Partial<Omit<StudentSubmission, 'id' | 'assignmentId' | 'studentId' | 'studentName'>>
): Promise<void> => {
  try {
    const submissionRef = doc(db, 'submissions', submissionId);
    const updatedData = {
      ...updateData,
      submittedAt: Timestamp.now(),
    };
    
    await updateDoc(submissionRef, updatedData);
  } catch (error) {
    console.error('Error updating submission:', error);
    throw new Error('Failed to update submission');
  }
};

// Get assignment submissions
export const getAssignmentSubmissions = async (assignmentId: string): Promise<StudentSubmission[]> => {
  try {
    // Try with orderBy first, fallback without if index doesn't exist
    let q = query(
      collection(db, 'submissions'),
      where('assignmentId', '==', assignmentId)
    );
    
    let querySnapshot;
    try {
      // Try with orderBy
      q = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', assignmentId),
        orderBy('submittedAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.warn('Index not available for submissions orderBy, fetching without sorting:', indexError);
      // Fallback without orderBy
      q = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', assignmentId)
      );
      querySnapshot = await getDocs(q);
    }
    
    const submissions: StudentSubmission[] = [];
    
    querySnapshot.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      } as StudentSubmission);
    });
    
    // Sort in memory if we couldn't sort in the query
    submissions.sort((a, b) => {
      const aTime = a.submittedAt?.seconds || 0;
      const bTime = b.submittedAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return submissions;
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    // Return empty array instead of throwing to prevent crashes
    return [];
  }
};

// Get classroom statistics
export const getClassroomStats = async (classroomId: string): Promise<ClassroomStats> => {
  try {
    // Get total students
    const enrollmentQuery = query(
      collection(db, 'enrollments'),
      where('classroomId', '==', classroomId),
      where('status', '==', 'active')
    );
    const enrollmentSnapshot = await getDocs(enrollmentQuery);
    const totalStudents = enrollmentSnapshot.size;

    // Get total assignments
    const assignmentQuery = query(
      collection(db, 'assignments'),
      where('classroomId', '==', classroomId)
    );
    const assignmentSnapshot = await getDocs(assignmentQuery);
    const totalAssignments = assignmentSnapshot.size;

    // For now, return basic stats without submission counting to avoid complex queries
    // This prevents the page from failing to load
    return {
      totalStudents,
      totalAssignments,
      pendingSubmissions: 0, // Will be implemented later when submissions collection is populated
      gradedSubmissions: 0,  // Will be implemented later when submissions collection is populated
    };
  } catch (error) {
    console.error('Error fetching classroom stats:', error);
    return {
      totalStudents: 0,
      totalAssignments: 0,
      pendingSubmissions: 0,
      gradedSubmissions: 0,
    };
  }
};

// Get student's completed assignments count
export const getStudentCompletedAssignments = async (studentId: string): Promise<number> => {
  try {
    const submissionQuery = query(
      collection(db, 'submissions'),
      where('studentId', '==', studentId),
      where('status', '==', 'submitted')
    );
    const submissionSnapshot = await getDocs(submissionQuery);
    return submissionSnapshot.size;
  } catch (error) {
    console.error('Error fetching student completed assignments:', error);
    return 0;
  }
};

// Get student dashboard stats
export const getStudentDashboardStats = async (studentId: string) => {
  try {
    // Get enrolled classrooms
    const classrooms = await getStudentClassrooms(studentId);
    
    // Get pending assignments
    const pendingAssignments = await getStudentPendingAssignments(studentId);
    
    // Get completed assignments count
    const completedCount = await getStudentCompletedAssignments(studentId);
    
    // Calculate total classmates (excluding the student themselves)
    let totalClassmates = 0;
    for (const classroom of classrooms) {
      const enrollments = await getClassroomEnrollments(classroom.id);
      totalClassmates += Math.max(0, enrollments.length - 1); // Subtract 1 for the student themselves
    }
    
    return {
      totalClasses: classrooms.length,
      pendingWork: pendingAssignments.length,
      completedAssignments: completedCount,
      totalClassmates
    };
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    return {
      totalClasses: 0,
      pendingWork: 0,
      completedAssignments: 0,
      totalClassmates: 0
    };
  }
};

// Get classroom enrollments (for teachers)
export const getClassroomEnrollments = async (classroomId: string): Promise<Enrollment[]> => {
  try {
    // Try with orderBy first, fallback without if index doesn't exist
    let q = query(
      collection(db, 'enrollments'),
      where('classroomId', '==', classroomId),
      where('status', '==', 'active')
    );
    
    let querySnapshot;
    try {
      // Try with orderBy
      q = query(
        collection(db, 'enrollments'),
        where('classroomId', '==', classroomId),
        where('status', '==', 'active'),
        orderBy('enrolledAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      console.warn('Index not available for enrollments orderBy, fetching without sorting:', indexError);
      // Fallback without orderBy
      q = query(
        collection(db, 'enrollments'),
        where('classroomId', '==', classroomId),
        where('status', '==', 'active')
      );
      querySnapshot = await getDocs(q);
    }
    
    const enrollments: Enrollment[] = [];
    
    querySnapshot.forEach((doc) => {
      enrollments.push({
        id: doc.id,
        ...doc.data()
      } as Enrollment);
    });
    
    // Sort in memory if we couldn't sort in the query
    enrollments.sort((a, b) => {
      const aTime = a.enrolledAt?.seconds || 0;
      const bTime = b.enrolledAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return enrollments;
  } catch (error) {
    console.error('Error fetching classroom enrollments:', error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
};
