import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  Clock,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ArrowLeft,
  ArrowRight,
  Flag,
  AlertTriangle,
  CheckCircle,
  Send,
  Monitor,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Question {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "essay";
  question: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  timeLimit?: number;
}

interface TestData {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  isProctored: boolean;
  questions: Question[];
}

export default function TestTaking() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Test state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Sample test data
  const testData: TestData = {
    id: testId || "test-1",
    title: "Calculus Integration Techniques",
    subject: "Advanced Mathematics",
    duration: 90,
    totalQuestions: 10,
    totalMarks: 100,
    isProctored: true,
    questions: [
      {
        id: "q1",
        type: "multiple-choice",
        question: "What is the integral of x² with respect to x?",
        options: ["x³/3 + C", "2x + C", "x³ + C", "3x² + C"],
        marks: 10,
      },
      {
        id: "q2",
        type: "multiple-choice",
        question:
          "Which integration technique is most suitable for ∫x·sin(x) dx?",
        options: [
          "Substitution",
          "Integration by parts",
          "Partial fractions",
          "Direct integration",
        ],
        marks: 10,
      },
      {
        id: "q3",
        type: "true-false",
        question:
          "The integral of a constant function is always a linear function.",
        marks: 5,
      },
      {
        id: "q4",
        type: "short-answer",
        question: "Evaluate the integral: ∫(3x² + 2x - 1) dx",
        marks: 15,
      },
      {
        id: "q5",
        type: "essay",
        question:
          "Explain the fundamental theorem of calculus and provide an example of its application.",
        marks: 20,
      },
    ],
  };

  const currentQuestion = testData.questions[currentQuestionIndex];

  // Initialize camera and timer
  useEffect(() => {
    if (testData.isProctored) {
      initializeCamera();
    }
    setTimeRemaining(testData.duration * 60); // Convert minutes to seconds
    setTestStarted(true);

    // Add beforeunload event to cleanup camera when user closes tab/window
    const handleBeforeUnload = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to stop camera when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`Cleanup: Stopped ${track.kind} track`);
        });
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Timer countdown
  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, timeRemaining]);

  const initializeCamera = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 240, height: 180 },
        audio: micEnabled,
      });
      setStream(mediaStream);
      streamRef.current = mediaStream; // Store in ref for reliable cleanup
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraEnabled(true);

      // Show success notification
      toast({
        title: "Camera enabled",
        description: "Camera access granted successfully.",
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraEnabled(false);

      // Handle different types of camera errors
      let errorMessage = "Camera access failed";
      let actionMessage = "Please check your camera settings and try again.";

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage = "Camera permission denied";
        actionMessage =
          "Please allow camera access in your browser settings and refresh the page. For proctored tests, camera access is required.";
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        errorMessage = "No camera found";
        actionMessage = "Please connect a camera device and try again.";
      } else if (
        error.name === "NotReadableError" ||
        error.name === "TrackStartError"
      ) {
        errorMessage = "Camera is being used by another application";
        actionMessage =
          "Please close other applications using the camera and try again.";
      } else if (
        error.name === "OverconstrainedError" ||
        error.name === "ConstraintNotSatisfiedError"
      ) {
        errorMessage = "Camera doesn't support required settings";
        actionMessage =
          "Your camera doesn't support the required resolution. Please try with a different camera.";
      } else if (error.message.includes("not supported")) {
        errorMessage = "Camera not supported";
        actionMessage =
          "Your browser doesn't support camera access. Please use a modern browser like Chrome, Firefox, or Safari.";
      }

      // Show user-friendly error notification
      toast({
        title: errorMessage,
        description: actionMessage,
        variant: "destructive",
      });
    }
  };

  const toggleCamera = async () => {
    if (cameraEnabled && streamRef.current) {
      // Stop camera
      streamRef.current.getVideoTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setCameraEnabled(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } else {
      // Start camera
      await initializeCamera();
    }
  };

  const retryCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    await initializeCamera();
  };

  // Clean up camera and microphone streams
  const cleanupMediaStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      streamRef.current = null;
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    setCameraEnabled(false);
    setMicEnabled(false);
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micEnabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < testData.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleSubmitTest = () => {
    // Confirm test submission
    const confirmed = window.confirm(
      "Are you sure you want to submit your test? This will end the test session and turn off your camera and microphone.",
    );

    if (!confirmed) {
      return;
    }

    // Clean up camera and microphone before submitting
    cleanupMediaStreams();

    // Show completion notification
    toast({
      title: "Test submitted successfully",
      description:
        "Your answers have been saved. Camera and microphone turned off.",
    });

    // Process answers and submit
    console.log("Submitting test with answers:", answers);

    // Small delay to ensure camera cleanup is visible before navigation
    setTimeout(() => {
      navigate("/dashboard2/tests");
    }, 500);
  };

  const getQuestionStatus = (questionId: string) => {
    if (answers[questionId]) return "answered";
    if (flaggedQuestions.has(questionId)) return "flagged";
    return "unanswered";
  };

  const getTimeColor = () => {
    if (timeRemaining < 300) return "text-red-600"; // Less than 5 minutes
    if (timeRemaining < 900) return "text-orange-600"; // Less than 15 minutes
    return "text-green-600";
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-3">
            {["True", "False"].map((option) => (
              <label
                key={option}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case "short-answer":
        return (
          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion.id, e.target.value)
            }
            placeholder="Enter your answer here..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
        );

      case "essay":
        return (
          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion.id, e.target.value)
            }
            placeholder="Write your detailed answer here..."
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={8}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-app">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard2/tests")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Test
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{testData.title}</h1>
              <p className="text-sm text-gray-600">{testData.subject}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className={`flex items-center gap-2 font-mono text-lg font-bold ${getTimeColor()}`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitTest}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Test
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Question Card */}
            <Card className="p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline">
                      Question {currentQuestionIndex + 1} of{" "}
                      {testData.questions.length}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {currentQuestion.marks} marks
                    </Badge>
                    {flaggedQuestions.has(currentQuestion.id) && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Flag className="w-3 h-3 mr-1" />
                        Flagged
                      </Badge>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h2>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={
                    flaggedQuestions.has(currentQuestion.id)
                      ? "bg-yellow-50"
                      : ""
                  }
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              {renderQuestion()}
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of{" "}
                  {testData.questions.length}
                </span>
              </div>

              <Button
                onClick={() => goToQuestion(currentQuestionIndex + 1)}
                disabled={
                  currentQuestionIndex === testData.questions.length - 1
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Question Navigator</h3>

          <div className="grid grid-cols-5 gap-2 mb-6">
            {testData.questions.map((question, index) => {
              const status = getQuestionStatus(question.id);
              return (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-blue-500 text-white border-blue-500"
                      : status === "answered"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : status === "flagged"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                          : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Flagged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded"></div>
              <span>Not answered</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {Object.keys(answers).length}/{testData.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(Object.keys(answers).length / testData.questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Proctoring Component */}
      {testData.isProctored && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-3 bg-white shadow-lg border">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">
                  Proctoring
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCamera}
                  className="w-6 h-6 p-0"
                >
                  {cameraEnabled ? (
                    <Camera className="w-3 h-3" />
                  ) : (
                    <CameraOff className="w-3 h-3 text-red-500" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMic}
                  className="w-6 h-6 p-0"
                >
                  {micEnabled ? (
                    <Mic className="w-3 h-3" />
                  ) : (
                    <MicOff className="w-3 h-3 text-red-500" />
                  )}
                </Button>
              </div>
            </div>

            <div className="w-48 h-36 bg-gray-900 rounded-lg overflow-hidden">
              {cameraEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                  <CameraOff className="w-8 h-8 text-red-400 mb-2" />
                  <p className="text-xs text-gray-300 mb-2">
                    Camera access denied or unavailable
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryCamera}
                    className="h-6 px-2 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-2 text-xs text-gray-600 text-center">
              Your activity is being monitored
            </div>
          </Card>
        </motion.div>
      )}

      {/* Warning for leaving tab/fullscreen */}
      <AnimatePresence>
        {testData.isProctored && !document.hasFocus() && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 max-w-md mx-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">Test Security Warning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                You have left the test window. This action has been recorded.
                Please return to the test immediately.
              </p>
              <Button className="w-full" onClick={() => window.focus()}>
                Return to Test
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
