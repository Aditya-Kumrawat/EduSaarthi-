import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Timestamp } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { PlagiarismDetection } from "@/components/PlagiarismDetection";
import { AnomalyDetection } from "@/components/AnomalyDetection";
import { AssignmentCreator } from "@/components/AssignmentCreator";
import { getTeacherAssignments, getTeacherStudents, getTeacherClassPosts, getTeacherClassroomStudents, getTeacherClassrooms, FirebaseAssignment, FirebaseStudent, FirebaseClassPost, ClassroomStudent, createFirebaseClassPost } from "@/lib/firebaseOperations";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  Plus,
  MoreVertical,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Bell,
  TrendingUp,
  Award,
  UserCheck,
  ClipboardList,
  PlusCircle,
  CalendarDays,
  BookMarked,
  GraduationCap,
  Shield,
  ScanLine,
  School,
  Folder,
  ChevronRight,
} from "lucide-react";

// Use Firebase types
type Assignment = FirebaseAssignment;
type Student = FirebaseStudent;
type ClassPost = FirebaseClassPost;


interface Classroom {
  id: string;
  name: string;
  subject: string;
  students: number;
  color: string;
  lastActivity: string;
  code: string;
  status: "active" | "archived";
}

export default function Dashboard() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State management
  const [assignments, setAssignments] = useState<FirebaseAssignment[]>([]);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [classPosts, setClassPosts] = useState<FirebaseClassPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedView, setSelectedView] = useState<
    "overview" | "assignments" | "students" | "posts" | "classrooms"
  >("overview");

  // Dialog states
  const [isNewAssignmentOpen, setIsNewAssignmentOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isPlagiarismOpen, setIsPlagiarismOpen] = useState(false);
  const [isAnomalyOpen, setIsAnomalyOpen] = useState(false);

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    subject: "",
    points: 100,
  });

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "announcement" as "announcement" | "material",
  });

  // Initialize real data from Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // Load data from Firebase
        const [assignmentsData, studentsData, postsData, classroomsData] = await Promise.all([
          getTeacherAssignments(currentUser.uid),
          getTeacherClassroomStudents(currentUser.uid),
          getTeacherClassPosts(currentUser.uid),
          getTeacherClassrooms(currentUser.uid)
        ]);
        
        setAssignments(assignmentsData);
        setStudents(studentsData);
        setClassPosts(postsData);
        setClassrooms(classroomsData);
        
        // If no class posts exist, add a sample welcome post
        if (postsData.length === 0) {
          console.log('No class posts found, adding welcome post');
          
          setClassPosts([
            {
              id: '1',
              title: "Welcome to your dashboard!",
              content: "Create classrooms and assignments to get started. Students can join your classes using classroom codes.",
              author: currentUser?.displayName || "Teacher",
              authorId: currentUser?.uid || '',
              authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher",
              createdAt: Timestamp.fromDate(new Date()),
              comments: 0,
              type: "announcement",
              teacherId: currentUser?.uid || '',
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays on error
        setStudents([]);
        setAssignments([]);
        setClassPosts([]);
        setClassrooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, toast]);


  // Handle new assignment creation
  const handleAssignmentCreated = () => {
    // Refresh assignments list after creation
    // The assignment will be automatically updated via real-time listeners
  };

  // Handle new post creation
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !currentUser) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        author: currentUser.displayName || currentUser.email?.split('@')[0] || 'Teacher',
        authorId: currentUser.uid,
        authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher",
        type: newPost.type,
        teacherId: currentUser.uid,
      };

      const createdPost = await createFirebaseClassPost(postData);
      setClassPosts((prev) => [createdPost, ...prev]);
      setNewPost({ title: "", content: "", type: "announcement" });
      setIsNewPostOpen(false);

      toast({
        title: "Post Created",
        description: "Your post has been published to the class",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  // Dashboard stats
  const dashboardStats = {
    totalStudents: students.length,
    activeAssignments: assignments.filter((a) => a.status === "active").length,
    totalAssignments: assignments.length,
  };

  // Main dashboard blocks (2x2 grid)
  const DashboardBlocks = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Assignments Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg text-blue-800">
                Assignments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-blue-800">
                {assignments.length}
              </div>
              <div className="text-sm text-blue-600">
                {assignments.filter((a) => a.status === "active").length}{" "}
                Active •{" "}
                {assignments.filter((a) => a.status === "draft").length} Drafts
              </div>
              <div className="space-y-2">
                {assignments.slice(0, 2).map((assignment, index) => (
                  <div
                    key={assignment.id || `assignment-${index}`}
                    className="flex items-center justify-between bg-white/60 rounded-lg p-2"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {assignment.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        Due: {assignment.dueDate instanceof Timestamp ? assignment.dueDate.toDate().toLocaleDateString() : new Date(assignment.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedView("assignments")}
                className="w-full text-blue-600 hover:text-blue-700"
              >
                View All Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Students Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="h-full bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg text-green-800">Students</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => navigate('/dashboard/classrooms')}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-800">
                {students.length}
              </div>
              <div className="text-sm text-green-600">
                {students.filter((s) => s.status === "active").length} Active •{" "}
                {students.filter((s) => s.status === "inactive").length}{" "}
                Inactive
              </div>
              <div className="space-y-2">
                {students.slice(0, 2).map((student, index) => (
                  <div
                    key={student.id || `student-${index}`}
                    className="flex items-center gap-2 bg-white/60 rounded-lg p-2"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{student.name}</div>
                      <div className="text-xs text-gray-600">
                        Class: {student.classroomName}
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${student.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedView("students")}
                className="w-full text-green-600 hover:text-green-700"
              >
                View All Students
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Posts Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Card className="h-full bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg text-purple-800">
                Community Posts
              </CardTitle>
            </div>
            <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Post
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-purple-800">
                {classPosts.length}
              </div>
              <div className="text-sm text-purple-600">
                {classPosts.filter((p) => p.type === "announcement").length}{" "}
                Announcements •{" "}
                {classPosts.filter((p) => p.type === "material").length}{" "}
                Materials
              </div>
              <div className="space-y-2">
                {classPosts.slice(0, 2).map((post, index) => (
                  <div key={post.id || `post-${index}`} className="bg-white/60 rounded-lg p-2">
                    <div className="font-medium text-sm line-clamp-1">
                      {post.title}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center gap-2">
                      <span>{post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Today'}</span>
                      <Badge variant="outline" className="text-xs">
                        {post.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedView("posts")}
                className="w-full text-purple-600 hover:text-purple-700"
              >
                View All Posts
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Your Classrooms Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="h-full bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <School className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg text-orange-800">
                Your Classrooms
              </CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
              onClick={() => navigate('/dashboard/classrooms')}
            >
              <Folder className="w-4 h-4 mr-1" />
              Manage
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-orange-800">
                {classrooms.filter((c) => c.isActive === true).length}
              </div>
              <div className="text-sm text-orange-600">
                {classrooms.filter((c) => c.isActive === true).length} Active
                • {classrooms.filter((c) => c.isActive === false).length} Archived
              </div>
              <div className="space-y-2">
                {classrooms.slice(0, 2).map((classroom, index) => (
                  <div
                    key={classroom.id || `classroom-${index}`}
                    className="flex items-center justify-between bg-white/60 rounded-lg p-2 hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-blue-500`}
                      />
                      <div>
                        <div className="font-medium text-sm">
                          {classroom.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          Code: {classroom.classCode}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedView("classrooms")}
                className="w-full text-orange-600 hover:text-orange-700"
              >
                View All Classrooms
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div
        className={`${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dashboard-title">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 mt-1 dashboard-text">
              Manage your classes, assignments, and student progress
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPlagiarismOpen(true)}
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Plagiarism Check
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnomalyOpen(true)}
            >
              <Shield className="w-4 h-4 mr-2" />
              AI Monitoring
            </Button>
            <Button variant="outline" size="sm">
              <CalendarDays className="w-4 h-4 mr-2" />
              Schedule
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </div>
        </motion.div>

        {/* Educational Banner */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200/60">
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

        {/* Quick Stats Bar */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalStudents}
                  </p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.activeAssignments}
                  </p>
                  <p className="text-sm text-gray-600">Active Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {dashboardStats.totalAssignments}
                  </p>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {classrooms.filter(c => c.isActive === true).length}
                  </p>
                  <p className="text-sm text-gray-600">Active Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main 4-Block Dashboard */}
        {selectedView === "overview" && <DashboardBlocks />}
        
        {/* View All Assignments */}
        {selectedView === "assignments" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Assignments</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedView("overview")}
              >
                Back to Overview
              </Button>
            </div>
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">{assignment.description}</p>
                      <p className="text-xs text-gray-500">
                        Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                    <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* View All Students */}
        {selectedView === "students" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Students</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedView("overview")}
              >
                Back to Overview
              </Button>
            </div>
            <div className="grid gap-4">
              {students.map((student) => (
                <Card key={student.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.email}</h3>
                        <p className="text-sm text-gray-600">Student ID: {student.id}</p>
                      </div>
                    </div>
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* View All Posts */}
        {selectedView === "posts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Community Posts</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedView("overview")}
              >
                Back to Overview
              </Button>
            </div>
            <div className="grid gap-4">
              {classPosts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge variant={post.type === 'announcement' ? 'default' : 'secondary'}>
                        {post.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Posted: {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* View All Classrooms */}
        {selectedView === "classrooms" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Classrooms</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedView("overview")}
              >
                Back to Overview
              </Button>
            </div>
            <div className="grid gap-4">
              {classrooms.map((classroom) => (
                <Card key={classroom.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{classroom.name}</h3>
                      <p className="text-sm text-gray-600">{classroom.description}</p>
                      <p className="text-xs text-gray-500">Code: {classroom.classCode}</p>
                    </div>
                    <Badge variant={classroom.isActive ? 'default' : 'secondary'}>
                      {classroom.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}


        {/* Assignment Creator */}
        <AssignmentCreator
          isOpen={isNewAssignmentOpen}
          onClose={() => setIsNewAssignmentOpen(false)}
          onAssignmentCreated={handleAssignmentCreated}
        />

        {/* New Post Dialog */}
        <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Class Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="postType">Post Type</Label>
                <Select
                  value={newPost.type}
                  onValueChange={(value: "announcement" | "material") =>
                    setNewPost((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select post type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postTitle">Title *</Label>
                <Input
                  id="postTitle"
                  placeholder="Enter post title"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postContent">Content *</Label>
                <Textarea
                  id="postContent"
                  placeholder="Write your message to the class"
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost((prev) => ({ ...prev, content: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewPostOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post to Class
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Plagiarism Detection Component */}
        <PlagiarismDetection
          isOpen={isPlagiarismOpen}
          onClose={() => setIsPlagiarismOpen(false)}
        />

        {/* Anomaly Detection Component */}
        <AnomalyDetection
          isOpen={isAnomalyOpen}
          onClose={() => setIsAnomalyOpen(false)}
        />
      </motion.div>
    </div>
  );
}
