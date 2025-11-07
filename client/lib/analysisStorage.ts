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

export interface AnalysisResult {
  id?: string;
  assignmentId: string;
  assignmentTitle: string;
  totalSubmissions: number;
  analyzedSubmissions: number;
  results: {
    performanceSummary?: {
      averageScore: number;
      totalSubmissions: number;
      passRate: number;
    };
    commonMistakes?: string[];
    strengthAreas?: string[];
    improvementSuggestions?: string[];
    gradeDistribution?: {
      excellent: number;
      good: number;
      average: number;
      needsWork: number;
    };
    plagiarismFlags?: {
      flaggedSubmissions: number;
      suspiciousPatterns: string[];
    };
  };
  individualAnalyses: Array<{
    studentId: string;
    studentName: string;
    analysis: any;
    error?: string;
  }>;
  status: 'completed' | 'failed' | 'partial';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Save analysis results to Firebase
export const saveAnalysisResult = async (
  assignmentId: string,
  assignmentTitle: string,
  analysisData: any[],
  processedResults: any
): Promise<string> => {
  try {
    const now = Timestamp.now();
    
    const analysisResult: Omit<AnalysisResult, 'id'> = {
      assignmentId,
      assignmentTitle,
      totalSubmissions: analysisData.length,
      analyzedSubmissions: analysisData.filter(r => r.analysis && !r.error).length,
      results: processedResults,
      individualAnalyses: analysisData,
      status: analysisData.some(r => r.analysis && !r.error) ? 'completed' : 'failed',
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(collection(db, 'analysisResults'), analysisResult);
    console.log('Analysis result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis result:', error);
    throw new Error('Failed to save analysis result');
  }
};

// Get analysis results for an assignment
export const getAnalysisResults = async (assignmentId: string): Promise<AnalysisResult[]> => {
  try {
    // Try with orderBy first, fallback to simple query if index doesn't exist
    let q;
    try {
      q = query(
        collection(db, 'analysisResults'),
        where('assignmentId', '==', assignmentId),
        orderBy('createdAt', 'desc')
      );
    } catch (indexError) {
      console.warn('Using simple query due to missing index:', indexError);
      q = query(
        collection(db, 'analysisResults'),
        where('assignmentId', '==', assignmentId)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const results: AnalysisResult[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        results.push({
          id: doc.id,
          ...data
        } as AnalysisResult);
      }
    });
    
    // Sort in memory if we couldn't sort in the query
    results.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    // Try simple query without any ordering as final fallback
    try {
      const simpleQ = query(
        collection(db, 'analysisResults'),
        where('assignmentId', '==', assignmentId)
      );
      const querySnapshot = await getDocs(simpleQ);
      const results: AnalysisResult[] = [];
      
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as AnalysisResult);
      });
      
      return results;
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return [];
    }
  }
};

// Get the latest analysis result for an assignment
export const getLatestAnalysisResult = async (assignmentId: string): Promise<AnalysisResult | null> => {
  try {
    const results = await getAnalysisResults(assignmentId);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching latest analysis result:', error);
    return null;
  }
};

// Update analysis result
export const updateAnalysisResult = async (
  analysisId: string,
  updateData: Partial<Omit<AnalysisResult, 'id' | 'createdAt'>>
): Promise<void> => {
  try {
    const analysisRef = doc(db, 'analysisResults', analysisId);
    const updatedData = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(analysisRef, updatedData);
  } catch (error) {
    console.error('Error updating analysis result:', error);
    throw new Error('Failed to update analysis result');
  }
};
