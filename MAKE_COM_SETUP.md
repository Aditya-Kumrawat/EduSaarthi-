# Make.com Integration Setup Guide

## 🔧 Required Configuration

### 1. Environment Variables Setup
Add these variables to your `.env` file:

```bash
# Copy from .env.example and fill in your webhook URLs

# Existing submission webhook (already working)
VITE_MAKE_SUBMISSION_WEBHOOK_URL=https://hook.eu2.make.com/jku6pwlpbfh349x2jq1mnds2qebx4ruu

# NEW: AI Analysis webhook - YOU MUST CREATE THIS
VITE_MAKE_ANALYSIS_WEBHOOK_URL=https://hook.eu2.make.com/YOUR_ANALYSIS_WEBHOOK_URL_HERE

# Optional: Batch Analysis webhook
VITE_MAKE_BATCH_ANALYSIS_WEBHOOK_URL=https://hook.eu2.make.com/YOUR_BATCH_WEBHOOK_URL_HERE
```

### 2. Make.com Scenario Setup

#### For AI Analysis Webhook (`VITE_MAKE_ANALYSIS_WEBHOOK_URL`)

**Expected Input Data:**
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "webhook": "analysis",
  "assignmentId": "assignment_123",
  "assignmentTitle": "Math Assignment 1",
  "assignmentPdfUrl": "https://storage.url/assignment.pdf",
  "submissions": [
    {
      "studentId": "student_123",
      "studentName": "John Doe",
      "submissionPdfUrl": "https://storage.url/submission.pdf",
      "submittedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "analysisType": "comprehensive",
  "requestedAnalytics": [
    "performance_summary",
    "common_mistakes",
    "strength_areas",
    "improvement_suggestions",
    "grade_distribution",
    "plagiarism_check"
  ]
}
```

**Expected Response Format:**
```json
{
  "success": true,
  "analysisId": "analysis_123",
  "results": {
    "performanceSummary": {
      "averageScore": 78,
      "totalSubmissions": 5,
      "passRate": 85
    },
    "commonMistakes": [
      "Incomplete problem-solving steps",
      "Mathematical calculation errors"
    ],
    "strengthAreas": [
      "Strong conceptual understanding",
      "Good use of examples"
    ],
    "improvementSuggestions": [
      "Provide more detailed step-by-step solutions",
      "Include more practice problems"
    ],
    "gradeDistribution": {
      "excellent": 25,
      "good": 35,
      "average": 30,
      "needsWork": 10
    },
    "plagiarismFlags": {
      "flaggedSubmissions": 2,
      "suspiciousPatterns": ["Similar phrasing in conclusions"]
    }
  }
}
```

## 🚀 How It Works

### 1. Teacher Flow
1. Teacher clicks "View Submissions" on an assignment
2. Teacher sees all student submissions
3. Teacher clicks "Reports" button
4. Teacher clicks "Start AI Analysis" 
5. System sends data to Make.com webhook
6. Make.com processes PDFs with AI
7. Results displayed in beautiful interface

### 2. Data Flow
```
Assignment Submissions → Make.com Webhook → AI Processing → Analysis Results → UI Display
```

## 🛠️ Make.com Scenario Recommendations

### Modules to Use:
1. **Webhook** - Receive data from your app
2. **HTTP** - Download PDF files from URLs
3. **OpenAI/Claude** - Analyze PDF content
4. **Data Processing** - Format results
5. **HTTP Response** - Send results back

### Sample Make.com Flow:
1. Webhook receives assignment data
2. Download assignment PDF and all submission PDFs
3. Extract text from PDFs using OCR/PDF parser
4. Send to AI for analysis with prompts like:
   - "Analyze these student submissions against the assignment requirements"
   - "Identify common mistakes and strengths"
   - "Provide improvement suggestions"
5. Format AI response into expected JSON structure
6. Return results

## 🔍 Testing

### Test the Integration:
1. Create a simple Make.com scenario that just returns mock data
2. Set the webhook URL in your `.env` file
3. Test the "Start AI Analysis" button
4. Check browser console for webhook calls
5. Verify data is being sent correctly

### Debug Mode:
The app includes comprehensive logging. Check browser console for:
- Webhook URL configuration
- Data being sent to Make.com
- Response from Make.com
- Any errors

## 🚨 Important Notes

1. **PDF Processing**: Make sure your Make.com scenario can handle PDF URLs and extract text
2. **Error Handling**: The app gracefully handles webhook failures
3. **Timeout**: Webhooks timeout after 30 seconds
4. **Security**: Webhook URLs are exposed in frontend - consider adding authentication
5. **Rate Limiting**: Be mindful of AI API rate limits in Make.com

## 📋 Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Create Make.com scenario for AI analysis
- [ ] Add webhook URL to `VITE_MAKE_ANALYSIS_WEBHOOK_URL`
- [ ] Test with a simple assignment
- [ ] Verify PDF processing works
- [ ] Check AI analysis quality
- [ ] Deploy and test in production

## 🆘 Troubleshooting

**No webhook URL configured**: Add `VITE_MAKE_ANALYSIS_WEBHOOK_URL` to `.env`
**Webhook timeout**: Increase processing speed or implement async processing
**PDF processing fails**: Ensure PDFs are publicly accessible
**AI analysis poor**: Improve prompts in Make.com scenario
**Console errors**: Check browser console for detailed error messages
