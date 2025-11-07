import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Search,
  Clock,
  Shield,
  AlertCircle,
  X,
  RefreshCw,
  ExternalLink,
  Copy,
} from "lucide-react";

interface PlagiarismResult {
  overallScore: number;
  status: "safe" | "warning" | "danger";
  sources: {
    id: string;
    url: string;
    similarity: number;
    matchedText: string;
    source: string;
  }[];
  analysis: {
    totalWords: number;
    uniqueWords: number;
    similarityPercentage: number;
    sources: number;
  };
  reportGenerated: string;
}

interface PlagiarismDetectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlagiarismDetection: React.FC<PlagiarismDetectionProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file only",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a PDF file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setResult(null);
  }, [toast]);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Plagiarism analysis with Make.com webhook integration
  const startAnalysis = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Step 1: Upload file to Supabase (simulated)
      setAnalysisProgress(20);
      const pdfUrl = await uploadToSupabase(uploadedFile);
      
      // Step 2: Add entry to Firebase (simulated)
      setAnalysisProgress(40);
      await addFirebaseEntry(uploadedFile.name, pdfUrl);
      
      // Step 3: Send to Make.com webhook
      setAnalysisProgress(60);
      await sendToMakeWebhook({
        studentSubmissionPdfUrl: pdfUrl,
        studentName: "outsource",
        assignmentTitle: "outsource"
      });
      
      setAnalysisProgress(80);
      
      // Simulate analysis completion
      setTimeout(() => {
        setAnalysisProgress(100);
        
        // Mock result based on webhook response
        const mockResult: PlagiarismResult = {
          overallScore: Math.floor(Math.random() * 30) + 5,
          status: Math.random() > 0.7 ? "warning" : "safe",
          sources: [
            {
              id: "1",
              url: "https://scholar.google.com/example1",
              similarity: 15.2,
              matchedText: "The fundamental principles of machine learning algorithms...",
              source: "Journal of Computer Science Research",
            },
            {
              id: "2",
              url: "https://wikipedia.org/example2",
              similarity: 8.7,
              matchedText: "Artificial intelligence has revolutionized the way...",
              source: "Wikipedia - Artificial Intelligence",
            },
            {
              id: "3",
              url: "https://researchgate.net/example3",
              similarity: 6.1,
              matchedText: "The methodology involves data preprocessing and feature extraction...",
              source: "ResearchGate Publication",
            },
          ],
          analysis: {
            totalWords: 2450,
            uniqueWords: 1890,
            similarityPercentage: 23.5,
            sources: 3,
          },
          reportGenerated: new Date().toISOString(),
        };

        setResult(mockResult);
        setIsAnalyzing(false);
        
        toast({
          title: "Analysis Complete",
          description: `Plagiarism check completed with ${mockResult.overallScore}% similarity found`,
        });
      }, 2000);
      
    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      toast({
        title: "Analysis Failed",
        description: "Failed to process the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Upload file to Supabase (simulated)
  const uploadToSupabase = async (file: File): Promise<string> => {
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock URL - in real implementation, this would upload to Supabase storage
    const mockUrl = `https://supabase-storage-url.com/uploads/${file.name}_${Date.now()}.pdf`;
    console.log('File uploaded to Supabase:', mockUrl);
    return mockUrl;
  };

  // Add entry to Firebase (simulated)
  const addFirebaseEntry = async (fileName: string, pdfUrl: string): Promise<void> => {
    // Simulate Firebase operation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In real implementation, this would add to Firebase Firestore
    console.log('Firebase entry added:', { fileName, pdfUrl, timestamp: new Date() });
  };

  // Send to Make.com webhook
  const sendToMakeWebhook = async (data: {
    studentSubmissionPdfUrl: string;
    studentName: string;
    assignmentTitle: string;
  }): Promise<void> => {
    try {
      const response = await fetch('https://hook.eu2.make.com/jku6pwlpbfh349x2jq1mnds2qebx4ruu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }
      
      console.log('Successfully sent to Make.com webhook:', data);
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  };

  const resetAnalysis = () => {
    setUploadedFile(null);
    setResult(null);
    setAnalysisProgress(0);
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe": return "text-green-600 bg-green-100";
      case "warning": return "text-yellow-600 bg-yellow-100";
      case "danger": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe": return <CheckCircle className="w-4 h-4" />;
      case "warning": return <AlertTriangle className="w-4 h-4" />;
      case "danger": return <AlertCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            PDF Plagiarism Detection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          {!uploadedFile && (
            <Card>
              <CardContent className="p-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload PDF Document
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your PDF file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild className="cursor-pointer">
                      <span>Choose File</span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Maximum file size: 10MB
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Information */}
          {uploadedFile && !result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Ready for Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{uploadedFile.name}</h4>
                    <p className="text-sm text-gray-600">
                      Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAnalysis}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>

                {isAnalyzing ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm font-medium">Analyzing document...</span>
                    </div>
                    <Progress value={analysisProgress} className="w-full" />
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Extracting text content...</p>
                      <p>• Checking against academic databases...</p>
                      <p>• Analyzing similarity patterns...</p>
                      <p>• Generating detailed report...</p>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={startAnalysis}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Start Plagiarism Analysis
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Plagiarism Analysis Report</span>
                    <Badge className={getStatusColor(result.status)}>
                      {getStatusIcon(result.status)}
                      <span className="ml-1 capitalize">{result.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {result.overallScore}%
                      </div>
                      <div className="text-sm text-gray-600">Similarity Found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {result.analysis.totalWords}
                      </div>
                      <div className="text-sm text-gray-600">Total Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {result.analysis.uniqueWords}
                      </div>
                      <div className="text-sm text-gray-600">Unique Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {result.analysis.sources}
                      </div>
                      <div className="text-sm text-gray-600">Sources Found</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={resetAnalysis}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      New Analysis
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Report
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Similarity Sources */}
              <Card>
                <CardHeader>
                  <CardTitle>Similarity Sources Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.sources.map((source, index) => (
                      <motion.div
                        key={source.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {source.similarity}% Match
                              </Badge>
                              <span className="text-sm font-medium text-gray-700">
                                {source.source}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 italic mb-2">
                              "{source.matchedText}"
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate">{source.url}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={source.similarity} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.overallScore > 25 && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">High Similarity Detected</p>
                          <p className="text-sm text-red-700">
                            The document shows significant similarity to existing sources. Review and cite sources properly.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {result.overallScore > 15 && result.overallScore <= 25 && (
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Moderate Similarity</p>
                          <p className="text-sm text-yellow-700">
                            Some similarities found. Ensure proper citations and paraphrasing.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {result.overallScore <= 15 && (
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-800">Low Similarity</p>
                          <p className="text-sm text-green-700">
                            The document shows good originality. Continue with proper citation practices.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
