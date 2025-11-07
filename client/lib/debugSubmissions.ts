import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Debug function to check submissions in the database
export const debugSubmissions = async (assignmentId?: string) => {
  try {
    console.log('=== DEBUGGING SUBMISSIONS ===');
    
    // Get all submissions
    const allSubmissionsQuery = query(collection(db, 'submissions'));
    const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
    
    console.log('Total submissions in database:', allSubmissionsSnapshot.size);
    
    const allSubmissions: any[] = [];
    allSubmissionsSnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      allSubmissions.push(data);
      console.log('Submission found:', data);
    });
    
    if (assignmentId) {
      console.log(`\n=== SUBMISSIONS FOR ASSIGNMENT: ${assignmentId} ===`);
      const specificSubmissions = allSubmissions.filter(sub => sub.assignmentId === assignmentId);
      console.log('Matching submissions:', specificSubmissions.length);
      specificSubmissions.forEach(sub => {
        console.log('- Submission:', sub);
      });
    }
    
    // Also check assignments collection to see what assignments exist
    const assignmentsQuery = query(collection(db, 'assignments'));
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    
    console.log('\n=== ALL ASSIGNMENTS ===');
    console.log('Total assignments in database:', assignmentsSnapshot.size);
    assignmentsSnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      console.log('Assignment:', data.id, '- Title:', (data as any).title);
    });
    
    return {
      totalSubmissions: allSubmissions.length,
      assignmentSubmissions: assignmentId ? allSubmissions.filter(sub => sub.assignmentId === assignmentId) : [],
      allSubmissions,
    };
  } catch (error) {
    console.error('Error debugging submissions:', error);
    return null;
  }
};

// Function to manually test submission retrieval
export const testSubmissionRetrieval = async (assignmentId: string) => {
  try {
    console.log(`Testing submission retrieval for assignment: ${assignmentId}`);
    
    const q = query(
      collection(db, 'submissions'),
      where('assignmentId', '==', assignmentId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log('Query result size:', querySnapshot.size);
    
    const submissions: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      submissions.push(data);
      console.log('Found submission:', data);
    });
    
    return submissions;
  } catch (error) {
    console.error('Error testing submission retrieval:', error);
    return [];
  }
};
