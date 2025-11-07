import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Brain,
  Video,
  Download,
  Share2,
  Sparkles,
  BookOpen,
  MessageSquare,
  Network,
  Loader2,
  CheckCircle2,
  Mic,
  Palette,
  Clock,
  Play,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PDFFile {
  name: string;
  size: number;
  pages?: number;
}

const AILessonStudio = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  
  // Determine user role from localStorage
  const userRole = currentUser 
    ? (localStorage.getItem(`user_${currentUser.uid}_role`) as 'teacher' | 'student' || 'teacher')
    : 'teacher';

  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<PDFFile | null>(null);
  const [topicName, setTopicName] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  
  // Video generation options
  const [language, setLanguage] = useState("english");
  const [videoDuration, setVideoDuration] = useState([120]); // in seconds

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile({
        name: file.name,
        size: file.size,
        pages: Math.floor(Math.random() * 50) + 10, // Mock page count
      });
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // Auto-extract text after upload completes
          handleExtractText();
        }
      }, 200);
    }
  };

  const handleExtractText = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setExtractedText(
        "This document covers the fundamentals of neural networks, including perceptrons, activation functions, backpropagation, and deep learning architectures. Key concepts include gradient descent, loss functions, and optimization techniques used in modern AI systems."
      );
      setIsExtracting(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleGenerateVideo = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedVideo("https://example.com/generated-video.mp4");
      setIsGenerating(false);
    }, 3000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-app relative overflow-hidden">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType={userRole === "student" ? "student" : "teacher"}
      />

      <motion.div
        className={`transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-72"
        } p-8`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-pink-600/90 p-8 text-white shadow-2xl backdrop-blur-xl border border-white/20"
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-4xl font-bold">AI Lesson Studio</h1>
              </div>
              <p className="text-lg text-white/90 max-w-2xl">
                Transform your study materials into AI-generated explainer videos in seconds.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Grid Layout Container - Following the CSS Grid Structure */}
        <div className="grid grid-cols-6 grid-rows-9 gap-2 min-h-[calc(100vh-16rem)] max-w-7xl mx-auto">
          
          {/* div8 - Upload Section (Top, Full Width, 2 rows) */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-6 row-span-2"
          >
            <GlassCard className="shadow-2xl h-full">
              <GlassCardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 backdrop-blur-sm rounded-lg">
                      <Upload className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <GlassCardTitle className="text-lg">Upload Study Material</GlassCardTitle>
                      <GlassCardDescription className="text-sm">Upload a PDF to get started</GlassCardDescription>
                    </div>
                  </div>
                  {uploadedFile && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-purple-400/50 rounded-xl p-6 text-center hover:border-purple-500 transition-all cursor-pointer bg-white/40 backdrop-blur-sm hover:bg-white/60">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Drop PDF or click to browse
                      </p>
                      <p className="text-xs text-gray-500">Up to 50MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-purple-200/50">
                    <FileText className="w-8 h-8 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.pages} pages
                      </p>
                    </div>
                    {uploadProgress === 100 && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </motion.div>

          {/* div14 - AI Assistant Section (Middle, Full Width, 3 rows) */}
          {currentStep >= 2 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="col-span-6 row-span-3 col-start-1 row-start-3"
            >
              <GlassCard className="shadow-2xl h-full">
                <GlassCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-lg">
                      <Brain className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <GlassCardTitle className="text-lg">AI Analysis</GlassCardTitle>
                      <GlassCardDescription className="text-sm">Understanding your content</GlassCardDescription>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary" className="text-xs">
                        <BookOpen className="w-3 h-3 mr-1" />
                        Summary
                      </TabsTrigger>
                      <TabsTrigger value="qa" className="text-xs">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Q&A
                      </TabsTrigger>
                      <TabsTrigger value="visualization" className="text-xs">
                        <Network className="w-3 h-3 mr-1" />
                        Visual
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="summary" className="space-y-3">
                      <div className="h-32 w-full rounded-lg border border-blue-200 p-3 bg-blue-50/30 overflow-y-auto">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {extractedText}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="qa" className="space-y-3">
                      <Input
                        placeholder="Ask AI about your document..."
                        className="border-blue-200 text-sm"
                      />
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <MessageSquare className="w-3 h-3 mr-2" />
                        Ask AI
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="visualization" className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <Network className="w-3 h-3 mr-1" />
                          Mind Map
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Flowchart
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          )}

          {/* div11 - Video Generation (Bottom Left, 4 cols, 4 rows) */}
          {currentStep >= 2 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="col-span-4 row-span-4 col-start-1 row-start-6"
            >
              <GlassCard className="shadow-2xl h-full">
                <GlassCardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/20 backdrop-blur-sm rounded-lg">
                      <Video className="w-5 h-5 text-pink-700" />
                    </div>
                    <div>
                      <GlassCardTitle className="text-lg">Create Video</GlassCardTitle>
                      <GlassCardDescription className="text-sm">Generate AI explainer video</GlassCardDescription>
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  {generatedVideo ? (
                    <div className="space-y-3">
                      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <Play className="w-12 h-12 text-white" />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600">Ready</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Share2 className="w-3 h-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center bg-pink-50/30">
                      <div className="text-center">
                        <Video className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                        <p className="text-xs text-gray-500">
                          Configure settings and click<br />"Generate Video" to create
                        </p>
                      </div>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          )}

          {/* div12 - Quick Actions (Bottom Right Top, 2 cols, 3 rows) - Show after upload */}
          {uploadedFile && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="col-span-2 row-span-3 col-start-5 row-start-6"
            >
              <GlassCard className="shadow-2xl h-full">
                <GlassCardHeader>
                  <GlassCardTitle className="text-lg">Quick Actions</GlassCardTitle>
                  <GlassCardDescription className="text-sm">Shortcuts & tools</GlassCardDescription>
                </GlassCardHeader>
                <GlassCardContent className="space-y-3">
                  {/* Language Selection */}
                  <div className="space-y-1">
                    <Label className="text-xs">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="arabic">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1">
                    <Label className="text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Duration
                      </span>
                      <span className="font-medium">{formatDuration(videoDuration[0])}</span>
                    </Label>
                    <Slider
                      value={videoDuration}
                      onValueChange={setVideoDuration}
                      min={30}
                      max={300}
                      step={30}
                      className="mt-2"
                    />
                  </div>
                  
                  {/* Generate Video Button */}
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={isGenerating || currentStep < 2}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Video className="w-3 h-3 mr-2" />
                        Generate Video
                      </>
                    )}
                  </Button>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          )}

          {/* div13 - Stats/Info (Bottom Right Bottom, 2 cols, 1 row) - Show after upload */}
          {uploadedFile && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="col-span-2 col-start-5 row-start-9"
            >
              <GlassCard className="shadow-2xl h-full">
                <GlassCardContent className="flex items-center justify-around p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{uploadedFile?.pages || 0}</p>
                    <p className="text-xs text-gray-600">Pages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentStep}</p>
                    <p className="text-xs text-gray-600">Step</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-pink-600">{generatedVideo ? '1' : '0'}</p>
                    <p className="text-xs text-gray-600">Videos</p>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AILessonStudio;
