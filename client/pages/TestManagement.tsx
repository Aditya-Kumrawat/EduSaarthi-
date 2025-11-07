import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  FileText,
  AlertTriangle,
  Shield,
  Flag,
  TestTube,
  Calendar,
  Code,
  Settings,
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  dueDate: Date;
  status: "draft" | "published" | "active" | "completed";
  type: "coding" | "quiz" | "assignment";
  isProctored: boolean;
  createdAt: Date;
  studentsEnrolled: number;
  studentsCompleted: number;
}

interface PasteViolation {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  testId: string;
  testTitle: string;
  violationType: "large-paste" | "rapid-typing" | "external-paste";
  severity: "Low" | "Medium" | "High" | "Critical";
  timestamp: Date;
  pasteLength: number;
  sessionId: string;
  ipAddress: string;
  status: "pending" | "escalated" | "dismissed";
}

export default function TestManagement() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("tests");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateTestOpen, setIsCreateTestOpen] = useState(false);

  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "Medium" as "Easy" | "Medium" | "Hard",
    duration: 60,
    totalQuestions: 10,
    totalMarks: 100,
    dueDate: "",
    type: "coding" as "coding" | "quiz" | "assignment",
    isProctored: true,
  });

  const [tests, setTests] = useState<Test[]>([
    {
      id: "test-1",
      title: "Data Structures & Algorithms",
      description: "Comprehensive coding test covering arrays, linked lists, trees, and sorting algorithms.",
      subject: "Computer Science",
      difficulty: "Hard",
      duration: 120,
      totalQuestions: 5,
      totalMarks: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "published",
      type: "coding",
      isProctored: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      studentsEnrolled: 45,
      studentsCompleted: 23,
    },
    {
      id: "test-2",
      title: "JavaScript Fundamentals",
      description: "Basic JavaScript concepts including functions, objects, and DOM manipulation.",
      subject: "Web Development",
      difficulty: "Medium",
      duration: 90,
      totalQuestions: 8,
      totalMarks: 80,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "active",
      type: "coding",
      isProctored: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      studentsEnrolled: 32,
      studentsCompleted: 15,
    },
  ]);

  const [violations, setViolations] = useState<PasteViolation[]>([
    {
      id: "v1",
      studentId: "s1",
      studentName: "John Smith",
      studentEmail: "john.smith@email.com",
      testId: "test-1",
      testTitle: "Data Structures & Algorithms",
      violationType: "large-paste",
      severity: "High",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      pasteLength: 450,
      sessionId: "sess-123",
      ipAddress: "192.168.1.100",
      status: "pending",
    },
    {
      id: "v2",
      studentId: "s2",
      studentName: "Aditya Kumrawat",
      studentEmail: "Aditya.Kumrawat@gmail.com",
      testId: "test-2",
      testTitle: "JavaScript Fundamentals",
      violationType: "rapid-typing",
      severity: "Critical",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      pasteLength: 280,
      sessionId: "sess-456",
      ipAddress: "192.168.1.101",
      status: "pending",
    },
    {
      id: "v3",
      studentId: "s3",
      studentName: "Michael Brown",
      studentEmail: "m.brown@email.com",
      testId: "test-1",
      testTitle: "Data Structures & Algorithms",
      violationType: "external-paste",
      severity: "Critical",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      pasteLength: 650,
      sessionId: "sess-789",
      ipAddress: "192.168.1.102",
      status: "pending",
    },
  ]);

  const handleCreateTest = () => {
    if (!newTest.title || !newTest.description || !newTest.subject) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const test: Test = {
      id: `test-${Date.now()}`,
      ...newTest,
      dueDate: new Date(newTest.dueDate),
      status: "draft",
      createdAt: new Date(),
      studentsEnrolled: 0,
      studentsCompleted: 0,
    };

    setTests([test, ...tests]);
    setNewTest({
      title: "",
      description: "",
      subject: "",
      difficulty: "Medium",
      duration: 60,
      totalQuestions: 10,
      totalMarks: 100,
      dueDate: "",
      type: "coding",
      isProctored: true,
    });
    setIsCreateTestOpen(false);

    toast({
      title: "Test Created",
      description: "Your test has been created successfully",
    });
  };

  const handleEscalateViolation = async (violationId: string) => {
    // Send empty POST request to webhook
    try {
      await fetch('https://hook.eu2.make.com/k0a9ssu7isyrn408dvt9p9jd4naoxmqa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
    } catch (error) {
      console.error('Webhook request failed:', error);
    }

    setViolations(violations.map(v => 
      v.id === violationId 
        ? { ...v, status: "escalated" as const }
        : v
    ));
    
    toast({
      title: "Violation Escalated",
      description: "The violation has been escalated to administration",
    });
  };

  const handleDeleteViolation = (violationId: string) => {
    setViolations(violations.filter(v => v.id !== violationId));
    
    toast({
      title: "Violation Dismissed",
      description: "The violation has been removed from the system",
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-800";
      case "escalated": return "bg-red-100 text-red-800";
      case "dismissed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || test.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredViolations = violations.filter(violation => {
    const matchesSearch = violation.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         violation.testTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType="teacher"
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div
        className={`${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Management</h1>
            <p className="text-gray-600 mt-1">Create and manage coding tests, monitor student activity</p>
          </div>

          <Dialog open={isCreateTestOpen} onOpenChange={setIsCreateTestOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Test
              </Button>
            </DialogTrigger>
          </Dialog>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tests.length}</p>
                  <p className="text-sm text-gray-600">Total Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {tests.reduce((sum, test) => sum + test.studentsEnrolled, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Students Enrolled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{violations.length}</p>
                  <p className="text-sm text-gray-600">Paste Violations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {violations.filter(v => v.severity === "High" || v.severity === "Critical").length}
                  </p>
                  <p className="text-sm text-gray-600">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tests">My Tests</TabsTrigger>
            <TabsTrigger value="violations">Paste Violations</TabsTrigger>
          </TabsList>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{test.title}</CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDifficultyColor(test.difficulty)}>
                              {test.difficulty}
                            </Badge>
                            <Badge variant="outline">{test.type}</Badge>
                            {test.isProctored && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Proctored
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge className={getStatusColor(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {test.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{test.duration} minutes • {test.totalQuestions} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{test.studentsEnrolled} enrolled • {test.studentsCompleted} completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {test.dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search violations by student name or test..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Paste Detection Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead>Violation Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredViolations.map((violation) => (
                      <TableRow key={violation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{violation.studentName}</div>
                            <div className="text-sm text-gray-500">{violation.studentEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{violation.testTitle}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {violation.violationType === "large-paste" && <FileText className="w-4 h-4" />}
                            {violation.violationType === "rapid-typing" && <Code className="w-4 h-4" />}
                            {violation.violationType === "external-paste" && <AlertTriangle className="w-4 h-4" />}
                            <span className="capitalize">{violation.violationType.replace("-", " ")}</span>
                          </div>
                          <div className="text-sm text-gray-500">{violation.pasteLength} chars</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {violation.timestamp.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {violation.timestamp.toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(violation.status)}>
                            {violation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {violation.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEscalateViolation(violation.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Flag className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteViolation(violation.id)}
                                  className="text-gray-600 hover:text-gray-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Test Dialog */}
        <Dialog open={isCreateTestOpen} onOpenChange={setIsCreateTestOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title *</Label>
                  <Input
                    id="title"
                    value={newTest.title}
                    onChange={(e) => setNewTest({...newTest, title: e.target.value})}
                    placeholder="Enter test title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={newTest.subject}
                    onChange={(e) => setNewTest({...newTest, subject: e.target.value})}
                    placeholder="Enter subject"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newTest.description}
                  onChange={(e) => setNewTest({...newTest, description: e.target.value})}
                  placeholder="Describe the test content and objectives"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newTest.difficulty}
                    onValueChange={(value: "Easy" | "Medium" | "Hard") => 
                      setNewTest({...newTest, difficulty: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Test Type</Label>
                  <Select
                    value={newTest.type}
                    onValueChange={(value: "coding" | "quiz" | "assignment") => 
                      setNewTest({...newTest, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({...newTest, duration: parseInt(e.target.value)})}
                    min="15"
                    max="300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questions">Total Questions</Label>
                  <Input
                    id="questions"
                    type="number"
                    value={newTest.totalQuestions}
                    onChange={(e) => setNewTest({...newTest, totalQuestions: parseInt(e.target.value)})}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marks">Total Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={newTest.totalMarks}
                    onChange={(e) => setNewTest({...newTest, totalMarks: parseInt(e.target.value)})}
                    min="10"
                    max="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newTest.dueDate}
                    onChange={(e) => setNewTest({...newTest, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="proctored"
                  checked={newTest.isProctored}
                  onChange={(e) => setNewTest({...newTest, isProctored: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="proctored">Enable proctoring and paste detection</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateTestOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateTest}>
                  Create Test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
