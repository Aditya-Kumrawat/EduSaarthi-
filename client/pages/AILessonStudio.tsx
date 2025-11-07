import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<PDFFile | null>(null);
  const [topicName, setTopicName] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  
  // Video generation options
  const [voiceType, setVoiceType] = useState("female");
  const [videoStyle, setVideoStyle] = useState("avatar");
  const [videoDuration, setVideoDuration] = useState([120]); // in seconds
  

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile({
        name: file.name,
        size: file.size,
        pages: Math.floor(Math.random() * 50) + 10 // Mock page count
      });
      setTopicName(file.name.replace(".pdf", ""));
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  const handleExtractText = () => {
    setIsExtracting(true);
    // Simulate text extraction
    setTimeout(() => {
      setExtractedText(
        "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes (neurons) that process information using a connectionist approach. Deep learning is a subset of machine learning that uses neural networks with multiple layers..."
      );
      setIsExtracting(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleGenerateVideo = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedVideo("https://example.com/video.mp4");
      setIsGenerating(false);
      setCurrentStep(3);
    }, 3000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
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
            
            {/* Floating animation elements */}
            <motion.div
              className="absolute top-4 right-4 opacity-20"
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <BookOpen className="w-16 h-16" />
            </motion.div>
            <motion.div
              className="absolute bottom-4 right-20 opacity-20"
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
              <Brain className="w-12 h-12" />
            </motion.div>
          </motion.div>
        </div>

        {/* Grid Layout Container */}
        <div className="grid grid-cols-6 grid-rows-9 gap-2 min-h-[calc(100vh-12rem)] max-w-7xl mx-auto">
          
          {/* Upload Section - div8 (Top, spans full width, 2 rows) */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="col-span-6 row-span-2"
          >
              <GlassCard className="border-2 border-purple-300/50 shadow-2xl">
                <GlassCardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 backdrop-blur-sm rounded-lg">
                        <Upload className="w-5 h-5 text-purple-700" />
                      </div>
                      <div>
                        <GlassCardTitle className="text-xl">Step 1: Upload Your Study Material</GlassCardTitle>
                        <GlassCardDescription>Upload a PDF to get started</GlassCardDescription>
                      </div>
                    </div>
                    {uploadedFile && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="space-y-4">
                  {!uploadedFile ? (
                    <div className="border-2 border-dashed border-purple-400/50 rounded-xl p-8 text-center hover:border-purple-500 transition-all cursor-pointer bg-white/40 backdrop-blur-sm hover:bg-white/60">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          Drop your PDF here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PDF files up to 50MB
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-purple-200/50">
                        <FileText className="w-10 h-10 text-purple-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.pages} pages
                          </p>
                        </div>
                      </div>
                      
                      {uploadProgress < 100 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Uploading...</span>
                            <span className="text-purple-600 font-medium">{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="topic-name">Topic Name</Label>
                        <Input
                          id="topic-name"
                          value={topicName}
                          onChange={(e) => setTopicName(e.target.value)}
                          placeholder="e.g., Introduction to Neural Networks"
                          className="border-purple-200 focus:border-purple-500"
                        />
                      </div>
                      
                      <Button
                        onClick={handleExtractText}
                        disabled={isExtracting || uploadProgress < 100}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extracting key concepts...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Extract Text
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </GlassCardContent>
              </GlassCard>
            </motion.div>

            {/* Step 2: AI Learning Assistant */}
            {currentStep >= 2 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="border-2 border-blue-300/50 shadow-2xl">
                  <GlassCardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-lg">
                        <Brain className="w-5 h-5 text-blue-700" />
                      </div>
                      <div>
                        <GlassCardTitle className="text-xl">Step 2: AI Understanding Your Document</GlassCardTitle>
                        <GlassCardDescription>Analyze and visualize your content</GlassCardDescription>
                      </div>
                    </div>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary" className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Summary
                        </TabsTrigger>
                        <TabsTrigger value="qa" className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Q&A
                        </TabsTrigger>
                        <TabsTrigger value="visualization" className="flex items-center gap-2">
                          <Network className="w-4 h-4" />
                          Visualization
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="summary" className="space-y-4">
                        <div className="h-64 w-full rounded-lg border border-blue-200 p-4 bg-blue-50/30 overflow-y-auto">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {extractedText}
                          </p>
                        </div>
                        <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Detailed Summary
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="qa" className="space-y-4">
                        <div className="space-y-3">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              💡 Suggested Question:
                            </p>
                            <p className="text-sm text-gray-700">
                              "What are the key components of a neural network?"
                            </p>
                          </div>
                          <Input
                            placeholder="Ask AI a question about your document..."
                            className="border-blue-200 focus:border-blue-500"
                          />
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Ask AI
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="visualization" className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="border-purple-300 hover:bg-purple-50">
                            <Network className="w-4 h-4 mr-2" />
                            Mind Map
                          </Button>
                          <Button variant="outline" className="border-blue-300 hover:bg-blue-50">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Flowchart
                          </Button>
                          <Button variant="outline" className="border-pink-300 hover:bg-pink-50">
                            <Brain className="w-4 h-4 mr-2" />
                            Mnemonic
                          </Button>
                          <Button variant="outline" className="border-green-300 hover:bg-green-50">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Roadmap
                          </Button>
                        </div>
                        <div className="h-48 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center bg-blue-50/30">
                          <p className="text-gray-500 text-sm">
                            Select a visualization type to generate
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </GlassCardContent>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 3: Video Generation */}
            {currentStep >= 2 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <GlassCard className="border-2 border-pink-300/50 shadow-2xl">
                  <GlassCardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/20 backdrop-blur-sm rounded-lg">
                        <Video className="w-5 h-5 text-pink-700" />
                      </div>
                      <div>
                        <GlassCardTitle className="text-xl">Step 3: Create Learning Video</GlassCardTitle>
                        <GlassCardDescription>Customize and generate your AI video</GlassCardDescription>
                      </div>
                    </div>
                  </GlassCardHeader>
                  <GlassCardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Voice Selection */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-pink-600" />
                          Voice Type
                        </Label>
                        <Select value={voiceType} onValueChange={setVoiceType}>
                          <SelectTrigger className="border-pink-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male Voice</SelectItem>
                            <SelectItem value="female">Female Voice</SelectItem>
                            <SelectItem value="ai">AI Voice</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Style Selection */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-pink-600" />
                          Video Style
                        </Label>
                        <Select value={videoStyle} onValueChange={setVideoStyle}>
                          <SelectTrigger className="border-pink-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="avatar">Avatar</SelectItem>
                            <SelectItem value="animated">Animated</SelectItem>
                            <SelectItem value="slides">Slides</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Duration */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-pink-600" />
                          Duration: {formatDuration(videoDuration[0])}
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
                    </div>

                    {/* Preview Section */}
                    {!generatedVideo ? (
                      <div className="border-2 border-dashed border-pink-300 rounded-xl p-8 bg-pink-50/30">
                        <div className="text-center space-y-4">
                          <Video className="w-16 h-16 mx-auto text-pink-400" />
                          <div>
                            <p className="font-medium text-gray-900 mb-1">
                              Ready to generate your video
                            </p>
                            <p className="text-sm text-gray-500">
                              Click the button below to start rendering
                            </p>
                          </div>
                          <Button
                            onClick={handleGenerateVideo}
                            disabled={isGenerating}
                            size="lg"
                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Rendering your AI video...
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5 mr-2" />
                                Generate Video 🎬
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Video Player */}
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-16 h-16 text-white opacity-80" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white font-medium">{topicName}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-green-600 hover:bg-green-700">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                          onClick={() => {
                            setCurrentStep(1);
                            setUploadedFile(null);
                            setGeneratedVideo(null);
                            setUploadProgress(0);
                          }}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Another Lesson
                        </Button>
                      </div>
                    )}
                  </GlassCardContent>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AILessonStudio;
