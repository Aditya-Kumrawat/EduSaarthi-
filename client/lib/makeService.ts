// Centralized Make.com service for webhook integrations
export interface MakeWebhookResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Configuration for Make.com webhooks
const MAKE_WEBHOOKS = {
  // Existing submission webhook (already in use)
  submission: import.meta.env.VITE_MAKE_SUBMISSION_WEBHOOK_URL || 'https://hook.eu2.make.com/jku6pwlpbfh349x2jq1mnds2qebx4ruu',
  
  // NEW: Analysis webhook for AI-powered assignment analysis
  analysis: import.meta.env.VITE_MAKE_ANALYSIS_WEBHOOK_URL || '',
  
  // NEW: Batch analysis webhook for multiple submissions
  batchAnalysis: import.meta.env.VITE_MAKE_BATCH_ANALYSIS_WEBHOOK_URL || '',
};

// Generic function to send data to Make.com webhooks
export const sendToMake = async (
  webhook: keyof typeof MAKE_WEBHOOKS, 
  data: any,
  timeout: number = 30000
): Promise<MakeWebhookResponse> => {
  try {
    const url = MAKE_WEBHOOKS[webhook];
    
    if (!url) {
      console.warn(`Make.com webhook URL not configured for: ${webhook}`);
      return { 
        success: false, 
        error: `Webhook URL not configured for ${webhook}. Please add VITE_MAKE_${webhook.toUpperCase()}_WEBHOOK_URL to your .env file.` 
      };
    }

    console.log(`Sending data to Make.com ${webhook} webhook:`, data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        webhook: webhook,
        ...data
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log(`Make.com ${webhook} webhook response:`, responseData);
    console.log(`Make.com ${webhook} response type:`, typeof responseData);
    console.log(`Make.com ${webhook} response keys:`, Object.keys(responseData || {}));

    return { 
      success: true, 
      data: responseData 
    };

  } catch (error) {
    console.error(`Make.com ${webhook} webhook error:`, error);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Request timeout - Make.com webhook took too long to respond' 
      };
    }

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

// Specific function for assignment submission (existing functionality)
export const sendSubmissionToMake = async (assignmentPdfUrl: string, studentSubmissionPdfUrl: string) => {
  return sendToMake('submission', {
    assignmentPdfUrl,
    studentSubmissionPdfUrl
  });
};

// NEW: Function for AI analysis of single submission (matches your Make.com scenario)
export const sendSubmissionForAnalysis = async (
  studentSubmissionPdfUrl: string,
  studentName: string,
  assignmentTitle: string
) => {
  return sendToMake('analysis', {
    studentSubmissionPdfUrl,
    studentName,
    assignmentTitle,
    timestamp: new Date().toISOString()
  });
};

// Function to analyze multiple submissions one by one and store results
export const analyzeAllSubmissions = async (
  assignmentId: string,
  assignmentTitle: string,
  submissions: Array<{
    studentId: string;
    studentName: string;
    submissionPdfUrl: string;
    submittedAt: string;
  }>
) => {
  const results = [];
  
  for (const submission of submissions) {
    if (!submission.submissionPdfUrl) continue;
    
    try {
      // Send studentSubmissionPdfUrl parameter to match Make.com scenario
      const result = await sendSubmissionForAnalysis(
        submission.submissionPdfUrl, // This gets sent as studentSubmissionPdfUrl parameter
        submission.studentName,
        assignmentTitle
      );
      
      results.push({
        studentId: submission.studentId,
        studentName: submission.studentName,
        analysis: result.success ? result.data : null,
        error: result.success ? null : result.error
      });
      
      // Small delay to avoid overwhelming Make.com
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        studentId: submission.studentId,
        studentName: submission.studentName,
        analysis: null,
        error: error instanceof Error ? error.message : 'Analysis failed'
      });
    }
  }
  
  return results;
};

// NEW: Function for batch analysis of multiple assignments
export const sendBatchAnalysis = async (
  classroomId: string,
  assignments: Array<{
    assignmentId: string;
    title: string;
    pdfUrl: string;
    submissions: Array<{
      studentId: string;
      studentName: string;
      submissionPdfUrl: string;
    }>;
  }>
) => {
  return sendToMake('batchAnalysis', {
    classroomId,
    assignments,
    analysisType: 'classroom_overview'
  });
};

// Helper function to check if Make.com webhooks are properly configured
export const checkMakeConfiguration = () => {
  const config = {
    submission: !!MAKE_WEBHOOKS.submission,
    analysis: !!MAKE_WEBHOOKS.analysis,
    batchAnalysis: !!MAKE_WEBHOOKS.batchAnalysis,
  };

  console.log('Make.com webhook configuration:', config);
  return config;
};
