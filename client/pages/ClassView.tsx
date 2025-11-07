import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  Clock,
  Send,
  Paperclip,
  MoreVertical,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Settings,
  Pin,
  Link as LinkIcon,
  Video,
  Camera,
  Mic,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  type: "assignment" | "quiz" | "material";
  points: number;
  submitted?: boolean;
  grade?: number;
  feedback?: string;
  attachments?: string[];
}

interface StreamPost {
  id: string;
  type: "announcement" | "assignment" | "material";
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: "teacher" | "student";
  };
  timestamp: Date;
  attachments?: string[];
  comments?: number;
  assignment?: Assignment;
}

export default function ClassView() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();
  const { classId } = useParams();
  const [activeTab, setActiveTab] = useState<"stream" | "classwork" | "people">(
    "stream",
  );
  const [newPost, setNewPost] = useState("");
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submissionText, setSubmissionText] = useState("");

  // Sample class data
  const classData = {
    id: classId,
    name: "Advanced Mathematics",
    subject: "Mathematics",
    teacher: "Dr. Sarah Johnson",
    teacherAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    section: "Section A",
    room: "Room 201",
    color: "from-blue-500 to-blue-600",
    coverImage:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=300&fit=crop",
    studentsCount: 28,
    classCode: "abc123d",
    description:
      "Advanced mathematical concepts including calculus, linear algebra, and statistical analysis.",
  };

  // Sample stream posts
  const streamPosts: StreamPost[] = [
    {
      id: "1",
      type: "announcement",
      title: "Welcome to Advanced Mathematics!",
      content:
        "Welcome everyone to our Advanced Mathematics class! Please make sure to check the syllabus and upcoming assignments. Don't hesitate to reach out if you have any questions.",
      author: {
        name: "Dr. Sarah Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        role: "teacher",
      },
      timestamp: new Date(2024, 0, 15, 10, 30),
      comments: 5,
    },
    {
      id: "2",
      type: "assignment",
      title: "Calculus Problem Set #3",
      content:
        "Complete problems 1-15 from Chapter 7. Show all work and submit before the due date.",
      author: {
        name: "Dr. Sarah Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        role: "teacher",
      },
      timestamp: new Date(2024, 0, 14, 14, 15),
      attachments: ["calculus-problems.pdf"],
      assignment: {
        id: "assign-1",
        title: "Calculus Problem Set #3",
        description: "Complete problems 1-15 from Chapter 7",
        dueDate: new Date(2024, 0, 20, 23, 59),
        type: "assignment",
        points: 100,
        submitted: false,
      },
    },
    {
      id: "3",
      type: "material",
      title: "Linear Algebra Study Guide",
      content:
        "Here's the study guide for our upcoming linear algebra unit. Review this before next week's lecture.",
      author: {
        name: "Dr. Sarah Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        role: "teacher",
      },
      timestamp: new Date(2024, 0, 12, 9, 45),
      attachments: ["linear-algebra-guide.pdf", "practice-problems.pdf"],
    },
  ];

  // Sample assignments for classwork tab
  const assignments: Assignment[] = [
    {
      id: "assign-1",
      title: "Calculus Problem Set #3",
      description:
        "Complete problems 1-15 from Chapter 7. Show all work and explain your reasoning for each solution.",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      type: "assignment",
      points: 100,
      submitted: false,
    },
    {
      id: "assign-2",
      title: "Midterm Exam",
      description: "Comprehensive exam covering chapters 1-6",
      dueDate: new Date(2024, 0, 25, 14, 0),
      type: "quiz",
      points: 200,
      submitted: true,
      grade: 185,
      feedback:
        "Excellent work! Your understanding of integration techniques is particularly strong.",
    },
    {
      id: "assign-3",
      title: "Group Project: Real-world Applications",
      description:
        "Work in teams to find and present real-world applications of advanced mathematics in engineering or data science",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
      type: "assignment",
      points: 150,
      submitted: false,
    },
    {
      id: "assign-4",
      title: "Weekly Quiz: Derivatives",
      description: "Short quiz on derivative rules and applications",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Due tomorrow
      type: "quiz",
      points: 50,
      submitted: false,
    },
  ];

  // Sample class members
  const classMembers = {
    teachers: [
      {
        name: "Dr. Sarah Johnson",
        email: "s.johnson@university.edu",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        role: "teacher",
      },
    ],
    students: [
      {
        name: "Alex Chen",
        email: "a.chen@student.edu",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        role: "student",
      },
      {
        name: "Maria Rodriguez",
        email: "m.rodriguez@student.edu",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
        role: "student",
      },
      {
        name: "James Wilson",
        email: "j.wilson@student.edu",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
        role: "student",
      },
    ],
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  // Handle assignment submission
  const handleSubmitAssignment = async () => {
    if (!selectedAssignment) return;

    const formData = new FormData();
    formData.append("assignmentId", selectedAssignment.id);
    formData.append("submissionText", submissionText);

    selectedFiles.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    try {
      // Simulate API call
      console.log("Submitting assignment:", {
        assignmentId: selectedAssignment.id,
        submissionText,
        files: selectedFiles.map((f) => f.name),
      });

      // Here you would make the actual API call
      // const response = await fetch('/api/submit-assignment', {
      //   method: 'POST',
      //   body: formData
      // });

      alert("Assignment submitted successfully!");
      setIsSubmissionModalOpen(false);
      setSelectedFiles([]);
      setSubmissionText("");
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Error submitting assignment. Please try again.");
    }
  };

  // Check if assignment is due (within 7 days)
  const isAssignmentDue = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = assignment.dueDate;
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 7 && daysDiff >= 0 && !assignment.submitted;
  };

  // Handle assignment card click
  const handleAssignmentClick = (assignment: Assignment) => {
    if (!assignment.submitted && isAssignmentDue(assignment)) {
      setSelectedAssignment(assignment);
      setIsSubmissionModalOpen(true);
    }
  };

  const StreamTab = () => (
    <div className="space-y-6">
      {/* Post creation */}
      <Card className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Share something with your class..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach
                </Button>
                <Button variant="ghost" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
              </div>
              <Button disabled={!newPost.trim()}>
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stream posts */}
      <div className="space-y-4">
        {streamPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{post.author.name}</span>
                    <Badge
                      variant={
                        post.author.role === "teacher" ? "default" : "secondary"
                      }
                    >
                      {post.author.role}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {post.timestamp.toLocaleDateString()}
                    </span>
                  </div>

                  {post.type === "assignment" && (
                    <div className="mb-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        <FileText className="w-3 h-3 mr-1" />
                        Assignment
                      </Badge>
                    </div>
                  )}

                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-700 mb-4">{post.content}</p>

                  {post.attachments && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.attachments.map((attachment, idx) => (
                        <Button key={idx} variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          {attachment}
                          <Download className="w-4 h-4 ml-2" />
                        </Button>
                      ))}
                    </div>
                  )}

                  {post.assignment && (
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {post.assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Due: {post.assignment.dueDate.toLocaleDateString()}{" "}
                            • {post.assignment.points} points
                          </p>
                        </div>
                        <Button size="sm">
                          {post.assignment.submitted
                            ? "View Submission"
                            : "Submit"}
                        </Button>
                      </div>
                    </Card>
                  )}

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {post.comments || 0} comments
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const ClassworkTab = () => {
    const dueAssignments = assignments.filter(isAssignmentDue);
    const otherAssignments = assignments.filter(
      (assignment) => !isAssignmentDue(assignment),
    );

    return (
      <div className="space-y-6">
        {/* Due Assignments Section */}
        {dueAssignments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-red-700">Due Soon</h3>
              <Badge variant="destructive">{dueAssignments.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {dueAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-red-200 bg-red-50/50"
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <Badge variant="destructive" className="animate-pulse">
                        DUE SOON
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {assignment.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                        <Clock className="w-4 h-4" />
                        Due: {assignment.dueDate.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4" />
                        {assignment.points} points
                      </div>
                    </div>

                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Submit Assignment
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Assignments Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">All Assignments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                    isAssignmentDue(assignment)
                      ? "border-red-200 bg-red-50/30"
                      : ""
                  }`}
                  onClick={() => handleAssignmentClick(assignment)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        assignment.type === "assignment"
                          ? "bg-blue-100"
                          : assignment.type === "quiz"
                            ? "bg-purple-100"
                            : "bg-green-100"
                      }`}
                    >
                      {assignment.type === "assignment" ? (
                        <FileText className="w-6 h-6 text-blue-600" />
                      ) : assignment.type === "quiz" ? (
                        <GraduationCap className="w-6 h-6 text-purple-600" />
                      ) : (
                        <BookOpen className="w-6 h-6 text-green-600" />
                      )}
                    </div>

                    {assignment.submitted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isAssignmentDue(assignment) ? (
                      <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2">
                    {assignment.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {assignment.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isAssignmentDue(assignment)
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      Due: {assignment.dueDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4" />
                      {assignment.points} points
                    </div>
                  </div>

                  {assignment.submitted && assignment.grade && (
                    <div className="mb-4">
                      <Badge className="bg-green-100 text-green-800">
                        {assignment.grade}/{assignment.points} points
                      </Badge>
                    </div>
                  )}

                  <Button
                    className={`w-full ${
                      isAssignmentDue(assignment) && !assignment.submitted
                        ? "bg-red-600 hover:bg-red-700"
                        : ""
                    }`}
                    variant={assignment.submitted ? "outline" : "default"}
                  >
                    {assignment.submitted
                      ? "View Submission"
                      : isAssignmentDue(assignment)
                        ? "Submit Assignment"
                        : "Start Assignment"}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Assignment Submission Modal */}
        <Dialog
          open={isSubmissionModalOpen}
          onOpenChange={setIsSubmissionModalOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submit Assignment: {selectedAssignment?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedAssignment && (
              <div className="space-y-6">
                {/* Assignment Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Assignment Description</h4>
                  <p className="text-gray-700 text-sm">
                    {selectedAssignment.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Due: {selectedAssignment.dueDate.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {selectedAssignment.points} points
                    </span>
                  </div>
                </div>

                {/* Submission Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Submission Notes (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any notes or comments about your submission..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="min-h-20"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Attach Files
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Paperclip className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload files or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">
                        PDF, DOC, TXT, JPG, PNG up to 10MB each
                      </span>
                    </label>
                  </div>

                  {/* Selected Files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium">Selected Files:</h5>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded"
                        >
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="flex-1">{file.name}</span>
                          <span className="text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFiles((files) =>
                                files.filter((_, i) => i !== index),
                              );
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmissionModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAssignment}
                    disabled={selectedFiles.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Turn In Assignment
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  const PeopleTab = () => (
    <div className="space-y-6">
      {/* Teachers */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Teachers</h3>
        <div className="space-y-3">
          {classMembers.teachers.map((teacher, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={teacher.avatar} />
                  <AvatarFallback>
                    {teacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{teacher.name}</h4>
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Students */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Students ({classMembers.students.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classMembers.students.map((student, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{student.name}</h4>
                  <p className="text-sm text-gray-600 truncate">
                    {student.email}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-app">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType="student"
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard2")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Classes
            </Button>
          </div>

          {/* Class header */}
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <div
              className="h-48 bg-cover bg-center relative"
              style={{
                backgroundImage: `url(${classData.coverImage})`,
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${classData.color} opacity-80`}
              />
              <div className="absolute inset-0 bg-black/20" />

              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{classData.name}</h1>
                <p className="text-white/90">
                  {classData.section} • {classData.teacher} • Room{" "}
                  {classData.room}
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Class code: {classData.classCode}
                </p>
              </div>

              <div className="absolute top-6 right-6">
                <Button variant="secondary" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: "stream", label: "Stream", icon: MessageSquare },
              { id: "classwork", label: "Classwork", icon: FileText },
              { id: "people", label: "People", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "stream" && <StreamTab />}
          {activeTab === "classwork" && <ClassworkTab />}
          {activeTab === "people" && <PeopleTab />}
        </motion.div>
      </motion.div>
    </div>
  );
}
