import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Calendar,
  User,
  AlertCircle,
  Play,
  BookOpen,
  Timer,
  CheckCircle,
  Star,
  Filter,
  Search,
} from "lucide-react";

interface Test {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  dueDate: Date;
  startTime?: Date;
  endTime?: Date;
  status: "pending" | "in-progress" | "completed" | "missed";
  difficulty: "easy" | "medium" | "hard";
  type: "quiz" | "midterm" | "final" | "assignment";
  description: string;
  isProctored: boolean;
  attempts: number;
  maxAttempts: number;
  score?: number;
}

export default function MyTests() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Sample test data
  const tests: Test[] = [
    {
      id: "test-1",
      title: "Calculus Integration Techniques",
      subject: "Advanced Mathematics",
      teacher: "Dr. Sarah Johnson",
      duration: 90,
      totalQuestions: 25,
      totalMarks: 100,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
      status: "pending",
      difficulty: "hard",
      type: "midterm",
      description:
        "Comprehensive test covering integration by parts, substitution methods, and trigonometric integrals.",
      isProctored: true,
      attempts: 0,
      maxAttempts: 1,
    },
    {
      id: "test-2",
      title: "Quantum Mechanics Quiz",
      subject: "Physics",
      teacher: "Prof. Michael Chen",
      duration: 45,
      totalQuestions: 15,
      totalMarks: 50,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Due tomorrow
      status: "pending",
      difficulty: "medium",
      type: "quiz",
      description:
        "Quick assessment on wave functions, uncertainty principle, and quantum states.",
      isProctored: false,
      attempts: 0,
      maxAttempts: 2,
    },
    {
      id: "test-3",
      title: "Machine Learning Algorithms",
      subject: "Computer Science",
      teacher: "Dr. Emily Rodriguez",
      duration: 120,
      totalQuestions: 30,
      totalMarks: 150,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Due in 5 days
      status: "pending",
      difficulty: "hard",
      type: "final",
      description:
        "Final exam covering supervised learning, neural networks, and deep learning concepts.",
      isProctored: true,
      attempts: 0,
      maxAttempts: 1,
    },
    {
      id: "test-4",
      title: "Literary Analysis: Shakespeare",
      subject: "English Literature",
      teacher: "Ms. Jessica Taylor",
      duration: 60,
      totalQuestions: 20,
      totalMarks: 75,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue
      status: "completed",
      difficulty: "medium",
      type: "assignment",
      description:
        "Analysis of themes, characters, and literary devices in Hamlet and Macbeth.",
      isProctored: false,
      attempts: 1,
      maxAttempts: 1,
      score: 68,
    },
  ];

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || test.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingTests = tests.filter((t) => t.status === "pending");
  const completedTests = tests.filter((t) => t.status === "completed");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "missed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTimeRemaining = (dueDate: Date) => {
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) return "Overdue";
    if (daysDiff === 0) return "Due today";
    if (daysDiff === 1) return "Due tomorrow";
    return `Due in ${daysDiff} days`;
  };

  const handleStartTest = (testId: string) => {
    navigate(`/dashboard2/test/${testId}`);
  };

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
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tests</h1>
            <p className="text-gray-600">
              View and attempt your pending tests and assessments
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tests</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingTests.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedTests.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedTests.length > 0
                    ? Math.round(
                        completedTests.reduce(
                          (acc, test) => acc + (test.score || 0),
                          0,
                        ) / completedTests.length,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tests List */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                {/* Test Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {test.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{test.subject}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status.replace("-", " ")}
                      </Badge>
                      <Badge className={getDifficultyColor(test.difficulty)}>
                        {test.difficulty}
                      </Badge>
                      {test.isProctored && (
                        <Badge variant="outline" className="text-xs">
                          Proctored
                        </Badge>
                      )}
                    </div>
                  </div>

                  {test.status === "pending" && (
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          getTimeRemaining(test.dueDate).includes("Overdue")
                            ? "text-red-600"
                            : "text-orange-600"
                        }`}
                      >
                        {getTimeRemaining(test.dueDate)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{test.teacher}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Timer className="w-4 h-4" />
                    <span>
                      {test.duration} minutes • {test.totalQuestions} questions
                      • {test.totalMarks} marks
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {test.dueDate.toLocaleDateString()}</span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2">
                    {test.description}
                  </p>

                  {test.attempts > 0 && (
                    <div className="text-sm text-gray-600">
                      Attempts: {test.attempts}/{test.maxAttempts}
                      {test.score && (
                        <span className="ml-2 font-medium text-green-600">
                          Score: {test.score}/{test.totalMarks} (
                          {Math.round((test.score / test.totalMarks) * 100)}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100">
                  {test.status === "pending" ? (
                    <Button
                      className="w-full"
                      onClick={() => handleStartTest(test.id)}
                      disabled={test.attempts >= test.maxAttempts}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {test.attempts > 0 ? "Retake Test" : "Attempt Test"}
                    </Button>
                  ) : test.status === "completed" ? (
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full" disabled>
                      Test {test.status}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredTests.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tests found
            </h3>
            <p className="text-gray-600">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "You don't have any tests at the moment"}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
