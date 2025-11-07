import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// Function to get PDF URL from Supabase/Firebase Storage using submission ID
export const getSubmissionPdfUrl = async (submissionId: string): Promise<string | null> => {
  try {
    // Get submission document from Firebase
    const submissionDoc = await getDoc(doc(db, 'submissions', submissionId));
    
    if (!submissionDoc.exists()) {
      console.error('Submission not found:', submissionId);
      return null;
    }
    
    const submissionData = submissionDoc.data();
    
    // Extract PDF URL from submission files
    if (submissionData.files && submissionData.files.length > 0) {
      const pdfFile = submissionData.files.find((file: any) => 
        file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfFile && pdfFile.url) {
        return pdfFile.url;
      }
    }
    
    console.error('No PDF file found in submission:', submissionId);
    return null;
  } catch (error) {
    console.error('Error fetching submission PDF URL:', error);
    return null;
  }
};

// Function to get multiple submission PDF URLs
export const getMultipleSubmissionPdfUrls = async (submissionIds: string[]): Promise<Array<{id: string, url: string | null}>> => {
  const results = [];
  
  for (const id of submissionIds) {
    const url = await getSubmissionPdfUrl(id);
    results.push({ id, url });
  }
  
  return results;
};
