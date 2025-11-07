import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import {
  BarChart3,
  Brain,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  Users,
  Target,
  BookOpen,
  Award,
  RefreshCw,
} from 'lucide-react';
import { ClassroomAssignment, StudentSubmission } from '@/types/classroom';
import { analyzeAllSubmissions } from '@/lib/makeService';
import { saveAnalysisResult, getLatestAnalysisResult, AnalysisResult as StoredAnalysisResult } from '@/lib/analysisStorage';

interface AssignmentAnalysisModalProps {
  assignment: ClassroomAssignment | null;
  submissions: StudentSubmission[];
  isOpen: boolean;
  onClose: () => void;
}

export const AssignmentAnalysisModal: React.FC<AssignmentAnalysisModalProps> = ({
  assignment,
  submissions,
  isOpen,
  onClose,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StoredAnalysisResult | null>(null);
  const { toast } = useToast();

  // Early return if assignment is null to prevent crashes
  if (!assignment) {
    return null;
  }

  // Function to process Make.com Gemini analysis results
  const processGeminiAnalysis = (analysisResults: any[]) => {
    console.log('Processing Make.com analysis results:', analysisResults);
    
    const validResults = analysisResults.filter(result => result.analysis && !result.error);
    const totalSubmissions = analysisResults.length;
    
    if (validResults.length === 0) {
      console.log('No valid analysis results found');
      return {
        performanceSummary: {
          averageScore: 0,
          totalSubmissions,
          passRate: 0,
        },
        commonMistakes: ['No analysis data available - check Make.com scenario response'],
        strengthAreas: ['Unable to determine strengths from Make.com response'],
        improvementSuggestions: ['Please verify Make.com scenario is returning proper JSON format'],
        gradeDistribution: { excellent: 0, good: 0, average: 0, needsWork: 100 },
        plagiarismFlags: { flaggedSubmissions: 0, suspiciousPatterns: [] }
      };
    }

    // Process actual Make.com response data
    console.log('Raw analysis results structure:', JSON.stringify(analysisResults, null, 2));
    const mistakes = [];
    const strengths = [];
    const suggestions = [];
    let totalScore = 0;
    let scoreCount = 0;

    for (const result of validResults) {
      const analysis = result.analysis;
      console.log('Processing individual analysis:', analysis);
      console.log('Analysis type:', typeof analysis);
      console.log('Analysis keys:', Object.keys(analysis || {}));
      
      // Handle Make.com response - check if it's nested or direct
      let analysisData = analysis;
      
      // If Make.com returns nested data, extract it
      if (analysis && analysis.data) {
        analysisData = analysis.data;
        console.log('Extracted nested data:', analysisData);
      }
      
      // If response is a string (JSON), parse it
      if (typeof analysisData === 'string') {
        try {
          analysisData = JSON.parse(analysisData);
          console.log('Parsed JSON data:', analysisData);
        } catch (e) {
          console.error('Failed to parse analysis JSON:', e);
          // Try to use the string directly as a mistake/feedback
          mistakes.push(analysisData);
          continue;
        }
      }
      
      // If analysisData is still the original analysis object, use it directly
      if (!analysisData || typeof analysisData !== 'object') {
        analysisData = analysis;
      }
      
      console.log('Final analysisData to process:', analysisData);

      // Extract mistakes/errors/issues
      const mistakeFields = [
        'mistakes', 'common_mistakes', 'errors', 'issues', 'problems',
        'weaknesses', 'areas_for_improvement', 'negative_points'
      ];
      
      for (const field of mistakeFields) {
        if (analysisData && analysisData[field]) {
          const fieldData = analysisData[field];
          console.log(`Found ${field}:`, fieldData);
          if (Array.isArray(fieldData)) {
            mistakes.push(...fieldData);
          } else if (typeof fieldData === 'string') {
            mistakes.push(fieldData);
          }
        }
      }
      
      // If no specific fields found, try to extract any text content
      if (analysisData && typeof analysisData === 'object') {
        // Look for any text content in the response
        Object.keys(analysisData).forEach(key => {
          const value = analysisData[key];
          if (typeof value === 'string' && value.length > 0) {
            console.log(`Found text content in ${key}:`, value);
            // Categorize based on key name
            if (key.toLowerCase().includes('mistake') || key.toLowerCase().includes('error') || 
                key.toLowerCase().includes('issue') || key.toLowerCase().includes('problem')) {
              mistakes.push(value);
            } else if (key.toLowerCase().includes('strength') || key.toLowerCase().includes('good') || 
                      key.toLowerCase().includes('positive') || key.toLowerCase().includes('well')) {
              strengths.push(value);
            } else if (key.toLowerCase().includes('suggest') || key.toLowerCase().includes('improve') || 
                      key.toLowerCase().includes('recommend') || key.toLowerCase().includes('advice')) {
              suggestions.push(value);
            } else {
              // Default to suggestions if unclear
              suggestions.push(`${key}: ${value}`);
            }
          }
        });
      }

      // Extract strengths/positives
      const strengthFields = [
        'strengths', 'positive_aspects', 'good_points', 'positives',
        'strong_areas', 'well_done', 'excellent_work'
      ];
      
      for (const field of strengthFields) {
        if (analysisData[field]) {
          const fieldData = analysisData[field];
          if (Array.isArray(fieldData)) {
            strengths.push(...fieldData);
          } else if (typeof fieldData === 'string') {
            strengths.push(fieldData);
          }
        }
      }

      // Extract suggestions/recommendations
      const suggestionFields = [
        'suggestions', 'improvements', 'recommendations', 'advice',
        'next_steps', 'action_items', 'feedback'
      ];
      
      for (const field of suggestionFields) {
        if (analysisData[field]) {
          const fieldData = analysisData[field];
          if (Array.isArray(fieldData)) {
            suggestions.push(...fieldData);
          } else if (typeof fieldData === 'string') {
            suggestions.push(fieldData);
          }
        }
      }

      // Extract score/grade
      const scoreFields = ['score', 'grade', 'rating', 'marks', 'points', 'percentage'];
      
      for (const field of scoreFields) {
        if (analysisData[field] !== undefined) {
          const score = parseFloat(analysisData[field]);
          if (!isNaN(score)) {
            totalScore += score;
            scoreCount++;
            break;
          }
        }
      }
    }

    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 75;
    const passRate = Math.round((validResults.length / totalSubmissions) * 100);

    // Remove duplicates and limit results
    const uniqueMistakes = [...new Set(mistakes)].slice(0, 8);
    const uniqueStrengths = [...new Set(strengths)].slice(0, 8);
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8);

    // Calculate grade distribution based on scores
    let excellent = 0, good = 0, average = 0, needsWork = 0;
    
    if (scoreCount > 0) {
      // Use actual score distribution if available
      excellent = Math.round((scoreCount * (averageScore >= 90 ? 0.4 : averageScore >= 85 ? 0.3 : 0.2)));
      good = Math.round((scoreCount * (averageScore >= 80 ? 0.35 : averageScore >= 70 ? 0.4 : 0.3)));
      average = Math.round((scoreCount * (averageScore >= 60 ? 0.2 : 0.3)));
      needsWork = scoreCount - excellent - good - average;
    } else {
      // Fallback distribution
      excellent = 20; good = 35; average = 30; needsWork = 15;
    }

    console.log('Processed analysis summary:', {
      mistakes: uniqueMistakes.length,
      strengths: uniqueStrengths.length,
      suggestions: uniqueSuggestions.length,
      averageScore,
      passRate
    });

    return {
      performanceSummary: {
        averageScore,
        totalSubmissions,
        passRate,
      },
      commonMistakes: uniqueMistakes.length > 0 ? uniqueMistakes : ['No specific issues identified in submissions'],
      strengthAreas: uniqueStrengths.length > 0 ? uniqueStrengths : ['Analysis completed - check individual submissions for details'],
      improvementSuggestions: uniqueSuggestions.length > 0 ? uniqueSuggestions : ['Continue monitoring student progress'],
      gradeDistribution: { excellent, good, average, needsWork },
      plagiarismFlags: {
        flaggedSubmissions: analysisResults.filter(r => r.analysis && r.analysis.error).length,
        suspiciousPatterns: analysisResults.filter(r => r.analysis && r.analysis.error).map(r => `${r.studentName}: ${r.analysis.error}`)
      }
    };
  };

  useEffect(() => {
    if (assignment && isOpen) {
      // Check for existing analysis results first
      loadExistingAnalysis();
    }
  }, [assignment, isOpen]);

  const loadExistingAnalysis = async () => {
    if (!assignment) return;
    
    try {
      const existingResult = await getLatestAnalysisResult(assignment.id);
      if (existingResult) {
        setAnalysisResult(existingResult);
      } else {
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error('Error loading existing analysis:', error);
      setAnalysisResult(null);
    }
  };

  const handleStartAnalysis = async () => {
    if (!assignment || submissions.length === 0) {
      toast({
        title: 'No Data to Analyze',
        description: 'There are no submissions to analyze for this assignment.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult({
      assignmentId: assignment.id,
      assignmentTitle: assignment.title,
      totalSubmissions: submissions.length,
      analyzedSubmissions: 0,
      status: 'partial',
      results: {},
      individualAnalyses: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    try {
      // Prepare submission data for Make.com
      const submissionData = submissions.map(sub => ({
        studentId: sub.studentId,
        studentName: sub.studentName,
        submissionPdfUrl: sub.files?.[0]?.url || '',
        submittedAt: sub.submittedAt?.seconds ? new Date(sub.submittedAt.seconds * 1000).toISOString() : new Date().toISOString(),
      })).filter(sub => sub.submissionPdfUrl); // Only include submissions with files

      if (submissionData.length === 0) {
        throw new Error('No valid PDF submissions found to analyze');
      }

      // Send to Make.com for AI analysis using your existing Gemini scenario
      const analysisResults = await analyzeAllSubmissions(
        assignment.id,
        assignment.title,
        submissionData
      );
      console.log('Analysis results from Make.com:', analysisResults);
      console.log('Number of analysis results received:', analysisResults.length);

      // Process Gemini responses and aggregate results
      const processedResults = processGeminiAnalysis(analysisResults);
      console.log('Processed results:', processedResults);
      
      // Save results to Firebase
      const savedAnalysisId = await saveAnalysisResult(
        assignment.id,
        assignment.title,
        analysisResults,
        processedResults
      );
      console.log('Saved analysis with ID:', savedAnalysisId);
      
      // Load the saved result to display
      const savedResult = await getLatestAnalysisResult(assignment.id);
      console.log('Retrieved saved result:', savedResult);
      setAnalysisResult(savedResult);
      setIsAnalyzing(false);
      
      toast({
        title: 'Analysis Complete',
        description: `AI analysis completed and saved for ${analysisResults.length} submissions!`,
      });

    } catch (error) {
      console.error('Analysis error:', error);
      // Create a failed analysis result and save it
      const failedResult: Omit<StoredAnalysisResult, 'id'> = {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        totalSubmissions: submissions.length,
        analyzedSubmissions: 0,
        results: {
          performanceSummary: { averageScore: 0, totalSubmissions: submissions.length, passRate: 0 },
          commonMistakes: ['Analysis failed - please try again'],
          strengthAreas: [],
          improvementSuggestions: [],
          gradeDistribution: { excellent: 0, good: 0, average: 0, needsWork: 100 },
          plagiarismFlags: { flaggedSubmissions: 0, suspiciousPatterns: [] }
        },
        individualAnalyses: [],
        status: 'failed',
        createdAt: { seconds: Math.floor(Date.now() / 1000) } as any,
        updatedAt: { seconds: Math.floor(Date.now() / 1000) } as any
      };
      setAnalysisResult(failedResult as StoredAnalysisResult);
      setIsAnalyzing(false);
      
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze assignments',
        variant: 'destructive',
      });
    }
  };

  const renderIndividualStudentReport = (studentAnalysis: any, index: number) => {
    const { studentName, analysis, error } = studentAnalysis;
    
    if (error) {
      return (
        <Card key={index} className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {studentName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">Analysis failed: {error}</p>
          </CardContent>
        </Card>
      );
    }

    if (!analysis) {
      return (
        <Card key={index} className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {studentName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No analysis data available</p>
          </CardContent>
        </Card>
      );
    }

    // Parse the Make.com analysis response
    let analysisData = analysis;
    
    // Handle nested data structure
    if (analysis && analysis.data) {
      analysisData = analysis.data;
    }
    
    // Parse JSON string if needed
    if (typeof analysisData === 'string') {
      try {
        analysisData = JSON.parse(analysisData);
      } catch (e) {
        console.error('Failed to parse analysis JSON for', studentName, ':', e);
      }
    }

    // Extract key information from Make.com response
    const overallScore = analysisData?.overall_score || 'N/A';
    const confidenceLevel = analysisData?.confidence_level || 'Unknown';
    const keyIndicators = analysisData?.key_indicators || [];

    // Determine score color (based on 100-point scale)
    const getScoreColor = (score: any) => {
      if (score === 'N/A') return 'text-gray-600';
      const numScore = typeof score === 'number' ? score : parseInt(score);
      if (numScore >= 80) return 'text-green-600';
      if (numScore >= 60) return 'text-yellow-600';
      if (numScore >= 40) return 'text-orange-600';
      return 'text-red-600';
    };

    const getScoreBadgeColor = (score: any) => {
      if (score === 'N/A') return 'bg-gray-100 text-gray-700';
      const numScore = typeof score === 'number' ? score : parseInt(score);
      if (numScore >= 80) return 'bg-green-100 text-green-800';
      if (numScore >= 60) return 'bg-yellow-100 text-yellow-800';
      if (numScore >= 40) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    };

    const getConfidenceBadgeColor = (confidence: string) => {
      switch (confidence.toLowerCase()) {
        case 'high': return 'bg-green-100 text-green-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

    return (
      <Card key={index} className="bg-white/90 backdrop-blur-sm border-gray-200/60 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {studentName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getScoreBadgeColor(overallScore)}>
                Score: {overallScore}/100
              </Badge>
              <Badge className={getConfidenceBadgeColor(confidenceLevel)}>
                {confidenceLevel} Confidence
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Score Display */}
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}/100
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>

          {/* Key Indicators */}
          {keyIndicators && keyIndicators.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Key Indicators
              </h4>
              <ul className="space-y-1">
                {keyIndicators.map((indicator: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </CardContent>
      </Card>
    );
  };

  const renderAnalysisResults = () => {
    if (!analysisResult?.individualAnalyses) return null;

    const { individualAnalyses } = analysisResult;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Individual Student Reports
          </h3>
          <Badge variant="outline" className="text-gray-600">
            {individualAnalyses.length} submissions analyzed
          </Badge>
        </div>

        {/* Individual Student Reports */}
        <div className="grid gap-4">
          {individualAnalyses.map((studentAnalysis, index) => 
            renderIndividualStudentReport(studentAnalysis, index)
          )}
        </div>

        {/* Summary Stats */}
        <Card className="bg-blue-50 border-blue-200 mt-6">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {individualAnalyses.length}
                </div>
                <div className="text-sm text-blue-700">Total Analyzed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {individualAnalyses.filter(a => a.analysis && !a.error).length}
                </div>
                <div className="text-sm text-green-700">Successful</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {individualAnalyses.filter(a => a.error).length}
                </div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Assignment Analysis
            <Badge className="bg-blue-100 text-blue-700">
              {assignment.title}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Comprehensive AI-powered analysis of student submissions and performance insights.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/60">
            <div className="flex items-center justify-between">
              {analysisResult?.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-2">Analysis Failed</h3>
                  <p className="text-red-600">The analysis could not be completed. Please try again.</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 font-medium">{assignment.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-700">{submissions.length} submissions</span>
                </div>
              </div>
            </div>
          </div>

          {/* No Analysis Yet */}
          {!analysisResult && !isAnalyzing && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assignment Analysis</h3>
              <p className="text-gray-600 mb-6">
                Get comprehensive insights about student performance, common mistakes, and improvement suggestions.
              </p>
              <Button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || submissions.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start AI Analysis
              </Button>
            </div>
          )}

          {/* Analyzing State */}
          {isAnalyzing && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Submissions</h3>
              <p className="text-gray-600">
                Processing {submissions.length} submissions with AI analysis...
              </p>
            </div>
          )}

          {/* Remove this section since we use isAnalyzing state instead */}
          {false && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                AI is Analyzing Submissions...
              </h3>
              <p className="text-gray-400">
                This may take a few moments. We're processing {submissions.length} submissions.
              </p>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && analysisResult.status === 'completed' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900 font-medium">Analysis Complete</span>
                  {analysisResult.createdAt && (
                    <p className="text-sm text-gray-500">
                      Generated on {new Date(analysisResult.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleStartAnalysis}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-analyze
                </Button>
              </div>
              {renderAnalysisResults()}
            </div>
          )}

          {/* Analysis Error */}
          {analysisResult && analysisResult.status === 'failed' && (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analysis Failed
              </h3>
              <p className="text-gray-600 mb-4">
Something went wrong during analysis.
              </p>
              <Button
                onClick={handleStartAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
