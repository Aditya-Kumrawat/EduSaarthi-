import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { AssignmentDetailModal } from "@/components/AssignmentDetailModal";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  MoreVertical,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Pin,
  Eye,
  Upload,
  Brain,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStudentPendingAssignments, joinClassroom, getStudentClassrooms, getStudentDashboardStats } from "@/lib/classroomOperations";
import { ClassroomAssignment, Classroom } from "@/types/classroom";

interface ClassData {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  teacherAvatar?: string;
  section: string;
  room?: string;
  color: string;
  coverImage?: string;
  studentsCount: number;
  pendingWork: number;
  lastActivity: string;
  classCode: string;
  isArchived?: boolean;
  isPinned?: boolean;
}

export default function Dashboard2() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [joinClassOpen, setJoinClassOpen] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [enrolledClasses, setEnrolledClasses] = useState<Classroom[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<ClassroomAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassroomAssignment | null>(null);
  const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalClasses: 0,
    pendingWork: 0,
    completedAssignments: 0,
    totalClassmates: 0
  });

  // Load student data
  useEffect(() => {
    if (currentUser) {
      loadStudentData();
    }
  }, [currentUser]);

  const loadStudentData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Load dashboard stats (includes all metrics)
      const stats = await getStudentDashboardStats(currentUser.uid);
      setDashboardStats(stats);
      
      // Load pending assignments
      const assignments = await getStudentPendingAssignments(currentUser.uid);
      setPendingAssignments(assignments);
      
      // Load enrolled classrooms
      const classrooms = await getStudentClassrooms(currentUser.uid);
      setEnrolledClasses(classrooms);
      
    } catch (error) {
      console.error('Error loading student data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No due date';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle join class functionality
  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class code",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to join a class",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    try {
      await joinClassroom(
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Unknown Student',
        currentUser.email || '',
        classCode.trim()
      );
      
      toast({
        title: "Success",
        description: "Successfully joined the classroom!",
      });
      
      setClassCode("");
      setJoinClassOpen(false);
      loadStudentData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join classroom",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const filteredClasses = enrolledClasses.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.classCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ClassCard = ({ classData }: { classData: Classroom }) => (
    <motion.div
      className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/dashboard2/class/${classData.id}`)}
    >
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-wisteria to-amethyst opacity-90" />

        {/* Pinned indicator - placeholder */}
        <div className="absolute top-3 left-3">
          <BookOpen className="w-4 h-4 text-white" />
        </div>

        {/* More options */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Class name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <h3 className="text-white font-semibold text-lg truncate">
            {classData.name}
          </h3>
          <p className="text-white/80 text-sm">
            {classData.description || 'No description'}
          </p>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        {/* Pending work indicator */}
        {pendingAssignments.filter(a => a.classroomId === classData.id).length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">
              {pendingAssignments.filter(a => a.classroomId === classData.id).length} assignment
              {pendingAssignments.filter(a => a.classroomId === classData.id).length > 1 ? "s" : ""} due
            </span>
          </div>
        )}

        {/* Quick stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>Class Code: {classData.classCode}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Active</span>
          </div>
        </div>

        {/* Teacher info */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {(classData.teacherName || 'T')
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700 truncate">
            {classData.teacherName || 'Teacher'}
          </span>
        </div>
      </div>
    </motion.div>
  );

  const ClassListItem = ({ classData }: { classData: Classroom }) => (
    <motion.div
      className="group bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/dashboard2/class/${classData.id}`)}
    >
      <div className="flex items-center gap-4">
        {/* Class color indicator */}
        <div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-wisteria to-amethyst flex-shrink-0"
        />

        {/* Class info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {classData.name}
            </h3>
            {/* Pin functionality can be added later */}
          </div>
          <p className="text-sm text-gray-600 truncate">
            {classData.teacherName || 'Teacher'}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Active
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Recent
            </span>
          </div>
        </div>

        {/* Pending work */}
        <div className="flex items-center gap-2">
          {pendingAssignments.filter(a => a.classroomId === classData.id).length > 0 ? (
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700"
            >
              {pendingAssignments.filter(a => a.classroomId === classData.id).length} due
            </Badge>
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>

        {/* More options */}
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            // Handle more options
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-app">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType="student"
      />
      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-8 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! You have {dashboardStats.pendingWork} pending assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Join class button */}
            <Dialog open={joinClassOpen} onOpenChange={setJoinClassOpen}>
              <DialogTrigger asChild>
                {/* <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Join Class
                </Button> */}
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Join a Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="classCode">Class Code</Label>
                    <Input
                      id="classCode"
                      placeholder="Enter class code"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isJoining) {
                          handleJoinClass();
                        }
                      }}
                    />
                    <p className="text-sm text-gray-500">
                      Try these codes: abc123d, xyz789e, hist101a
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setJoinClassOpen(false)}
                      disabled={isJoining}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleJoinClass}
                      disabled={isJoining || !classCode.trim()}
                    >
                      {isJoining ? "Joining..." : "Join Class"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Educational Banner */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-perfume to-padua border border-gray-200/60">
            <img 
              src="/educational-banner.png" 
              alt="Educational Banner" 
              className="w-full h-36 object-cover object-center"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div> */}
            <div className="absolute inset-0 flex items-center justify-center">
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div
          className=""
          style={{ marginBottom: '-60px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="grid grid-cols-4 grid-rows-6 gap-2 h-[500px]">
            {/* div1 */}
            <motion.div 
              className="row-span-2 rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden" 
              style={{ backgroundColor: '#f3c5c5' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Decorative background elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
              
              {/* Icon at top left */}
              <div className="absolute top-2 left-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md z-10">
                <FileText className="w-4 h-4 text-rose-500" />
              </div>
              
              {/* Floating decorative icons */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center rotate-12">
                <BookOpen className="w-4 h-4 text-rose-400" />
              </div>
              <div className="absolute bottom-20 right-4 w-6 h-6 bg-white/40 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-rose-300" />
              </div>
              
              {/* Text in middle */}
              <div className="flex-1 flex flex-col items-center justify-center px-2 z-10 mb-1">
                <div className="mb-3 flex gap-2">
                  <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="w-8 h-8 bg-white/60 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-rose-600" />
                  </div>
                </div>
                <p className="text-center font-bold text-gray-800 text-base mb-1">
                  Scan a PDF and Learn
                </p>
                <p className="text-center text-xs text-gray-600">
                  AI-powered learning
                </p>
              </div>
              
              {/* Button at bottom */}
              <div className="mt-auto">
                <Button 
                  onClick={() => navigate('/dashboard/ai-lesson-studio')}
                  className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold shadow-md z-10"
                >
                  <span className="flex items-center justify-center gap-2">
                    Get Started
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </span>
                </Button>
              </div>
            </motion.div>

            {/* div5 */}
            <motion.div 
              className="row-span-2 col-start-2 row-start-1 rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 overflow-hidden" 
              style={{ backgroundColor: '#fadfc1' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Left side - Image */}
              <div className="flex-shrink-0 w-32 h-32">
                <img 
                  src="/lesson-illustration.png?v=1" 
                  alt="Continue Learning" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Right side - Text, Progress, Button */}
              <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                <h4 className="text-base font-bold text-gray-800 leading-tight font-heading">
                  Continue with your lessons
                </h4>
                
                {/* Progress Circle */}
                <div className="flex items-center gap-2">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-12 h-12 transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#f97316"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - 0.65)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-800">65%</span>
                    </div>
                  </div>
                </div>
                
                {/* Continue Button */}
                <Button 
                  className="bg-white hover:bg-gray-50 text-gray-800 font-semibold shadow-sm w-fit text-xs h-8 px-3"
                >
                  Continue
                </Button>
              </div>
            </motion.div>

            {/* div2 + div4 merged */}
            <motion.div 
              className="col-span-2 row-span-3 col-start-3 row-start-1 bg-white rounded-3xl shadow-sm border-2 border-gray-200 overflow-hidden flex items-center justify-between p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex flex-col justify-center gap-4 max-w-[45%] z-10">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    Get Personalized Answers
                  </h3>
                  <p className="text-sm text-gray-600">
                    From our multilingual chatbot
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/dashboard2/chatbot')}
                  className="bg-black hover:bg-gray-800 text-white font-semibold shadow-md w-fit"
                >
                  <span className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Try AI Chatbot
                  </span>
                </Button>
              </div>
              <video 
                key="monad-video"
                className="h-[130%] w-auto object-contain"
                autoPlay 
                loop 
                muted 
                playsInline
                preload="auto"
                src="/monad-video.mp4"
              />
            </motion.div>

            {/* div9 */}
            <motion.div 
              className="row-span-2 col-start-1 row-start-3 rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col justify-center items-center gap-3 relative overflow-hidden" 
              style={{ backgroundColor: '#d5d2fd' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/30 rounded-full blur-3xl"></div>
              
              {/* Icon */}
              <motion.div 
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg z-10"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </motion.div>
              
              {/* Text */}
              <div className="text-center z-10">
                <h4 className="text-xl font-bold text-gray-800 mb-1 font-heading">
                  Level Up
                </h4>
                <p className="text-base font-semibold text-purple-700">
                  Quiz Time!
                </p>
              </div>
              
              {/* Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => navigate('/dashboard2/tests')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md text-xs h-8 px-4 z-10"
                >
                  Start Quiz
                </Button>
              </motion.div>
              
              {/* Decorative stars */}
              <motion.div 
                className="absolute top-4 left-4 z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <motion.div 
                className="absolute bottom-4 right-4 z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
              >
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </motion.div>

            {/* div10 - Storybook Feature */}
            <motion.div 
              className="row-span-2 col-start-2 row-start-3 rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden" 
              style={{ backgroundColor: '#c0efda' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-emerald-300/20 rounded-full blur-2xl"></div>
              
              {/* Animated illustration */}
              <motion.div 
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 4, 0, -4, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 mx-auto mb-3 relative z-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-emerald-600" />
                {/* Floating sparkles */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: 0
                  }}
                  className="absolute -top-1 -right-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </motion.div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: 0.5
                  }}
                  className="absolute -bottom-1 -left-1">
                  <Star className="w-3 h-3 text-pink-500 fill-pink-500" />
                </motion.div>
              </motion.div>
              
              <h3 className="text-base font-bold text-center mb-2 text-gray-800 z-10" style={{ fontFamily: "'WT Volkolak Grotesque Light', sans-serif" }}>
                Try Our Storybook Feature
              </h3>
              <p className="text-xs text-gray-700 text-center mb-3 flex-grow z-10">
                Create magical AI stories! ✨
              </p>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="z-10 mt-auto">
                <Button 
                  onClick={() => navigate("/dashboard2/storybook")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md text-xs h-8 mb-2">
                  Explore Storybook 📚
                </Button>
              </motion.div>
            </motion.div>

            {/* div8 - Join Your Classroom */}
            <motion.div 
              className="col-span-2 col-start-3 row-start-4 bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/30 rounded-full blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-100/30 rounded-full blur-xl"></div>
              
              {/* Left side - Illustration */}
              <motion.div 
                animate={{ 
                  y: [0, -2, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center shadow-sm z-10">
                <Users className="w-8 h-8 text-blue-600" />
              </motion.div>
              
              {/* Right side - Content */}
              <div className="flex-1 flex items-center justify-between gap-4 min-w-0 z-10">
                <div className="flex flex-col justify-center gap-1">
                  <h3 className="text-base font-bold text-gray-800 text-left leading-tight" style={{ fontFamily: "'WT Volkolak Grotesque Light', sans-serif" }}>
                    Join Your<br />Classroom
                  </h3>
                  <p className="text-[10px] text-gray-600 text-left">
                    Enter class code to join
                  </p>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0">
                  <Button 
                    onClick={() => setJoinClassOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm text-xs h-7 px-3">
                    <Plus className="w-3 h-3 mr-1" />
                    Join Class
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Career Assessment Component */}
        <motion.div
          className="mb-6"
          style={{ marginTop: '-160px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex items-center justify-between overflow-hidden relative">
            {/* Left side - Content */}
            <div className="flex-1 max-w-md z-10">
              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                <span className="text-sm font-semibold text-purple-600">Recommended</span>
              </div>
              
              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-800 mb-3 font-heading">
                Take your Career Assessment
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Discover your strengths and get a personalized roadmap with next steps, skills, and resources.
              </p>
              
              {/* Buttons */}
              <div className="flex gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md"
                  >
                    Start Assessment
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    View Sample Report
                  </Button>
                </motion.div>
              </div>
            </div>
            
            {/* Right side - Illustration */}
            <div className="hidden md:block flex-shrink-0 ml-8">
              <div className="w-64 h-40 rounded-2xl overflow-hidden">
                <img 
                  src="/Screenshot 2025-11-07 030241.png" 
                  alt="Career Assessment" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-wisteria/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-wisteria" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.totalClasses}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-tacao/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-tacao" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Work</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.pendingWork}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-padua/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-padua" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.completedAssignments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sea-pink/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-sea-pink" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Classmates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardStats.totalClassmates}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Classes list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredClasses.map((classData, index) => (
                <motion.div
                  key={classData.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ClassCard classData={classData} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClasses.map((classData, index) => (
                <motion.div
                  key={classData.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ClassListItem classData={classData} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Empty state */}
        {filteredClasses.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No classes found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Join your first class to get started"}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
