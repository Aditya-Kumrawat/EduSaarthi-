import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Save,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code,
  FileText,
  TestTube,
  Zap,
  Shield,
} from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface CodeTestData {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number; // in minutes
  description: string;
  constraints: string[];
  testCases: TestCase[];
  sampleInput: string;
  sampleOutput: string;
  explanation: string;
}

export default function CodeTest() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentCode, setCurrentCode] = useState("");
  const [pasteDetected, setPasteDetected] = useState(false);
  const [pasteCount, setPasteCount] = useState(0);

  // Sample coding problem data
  const problemData: CodeTestData = {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    timeLimit: 60,
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists."
    ],
    testCases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
        isHidden: false
      },
      {
        input: "nums = [3,3], target = 6",
        expectedOutput: "[0,1]",
        isHidden: false
      },
      {
        input: "nums = [1,5,3,7,9,2], target = 8",
        expectedOutput: "[0,3]",
        isHidden: true
      },
      {
        input: "nums = [10,20,30,40], target = 50",
        expectedOutput: "[1,2]",
        isHidden: true
      }
    ],
    sampleInput: "[2,7,11,15]\n9",
    sampleOutput: "[0,1]",
    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
  };

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      toast({
        title: "Time's Up!",
        description: "Your coding session has ended.",
        variant: "destructive",
      });
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, toast]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Paste detection functionality
  useEffect(() => {
    let prevCodeLength = 0;
    let accumulatedIncrease = 0;
    let timer: NodeJS.Timeout;
    let firstSnapshot = true;

    // Generate UUID for user tracking
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    const userUUID = generateUUID();

    // Outside iframe paste detection
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = (e.clipboardData || (window as any).clipboardData).getData("text");
      if (pastedText.length > 100) {
        setPasteDetected(true);
        setPasteCount(prev => prev + 1);
        toast({
          title: "Paste Detected!",
          description: "Large paste operation detected. This has been logged.",
          variant: "destructive",
        });
      }
    };

    // OneCompiler iframe message listener
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://onecompiler.com") return;

      const data = event.data;
      let code = null;

      if (typeof data.code === "string") {
        code = data.code;
      } else if (data.files && data.files[0] && typeof data.files[0].content === "string") {
        code = data.files[0].content;
      }

      if (code !== null) {
        setCurrentCode(code);

        // Skip first snapshot
        if (firstSnapshot) {
          prevCodeLength = code.length;
          firstSnapshot = false;
          return;
        }

        const diff = code.length - prevCodeLength;

        if (diff > 0) {
          accumulatedIncrease += diff;

          // Start/reset timer (1 second window)
          clearTimeout(timer);
          timer = setTimeout(() => {
            accumulatedIncrease = 0;
          }, 1000);

          if (accumulatedIncrease > 100) {
            setPasteDetected(true);
            setPasteCount(prev => prev + 1);
            toast({
              title: "Paste Detected!",
              description: "Large code paste detected in editor. This has been logged.",
              variant: "destructive",
            });
            accumulatedIncrease = 0;
          }
        }

        prevCodeLength = code.length;
      }
    };

    window.addEventListener("paste", handlePaste);
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("paste", handlePaste);
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
    };
  }, [toast]);

  const handleRunCode = () => {
    toast({
      title: "Running Code...",
      description: "Executing your solution against test cases.",
    });
    
    // Simulate test execution
    setTimeout(() => {
      const mockResults = [
        { passed: true, input: "nums = [2,7,11,15], target = 9", output: "[0,1]", expected: "[0,1]" },
        { passed: true, input: "nums = [3,2,4], target = 6", output: "[1,2]", expected: "[1,2]" },
        { passed: false, input: "nums = [3,3], target = 6", output: "[0,0]", expected: "[0,1]" },
      ];
      setTestResults(mockResults);
    }, 2000);
  };

  const handleSubmit = () => {
    toast({
      title: "Solution Submitted!",
      description: "Your solution has been submitted for evaluation.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType="student"
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
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{problemData.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={getDifficultyColor(problemData.difficulty)}>
                  {problemData.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{problemData.timeLimit} minutes</span>
                </div>
                {pasteDetected && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <Shield className="w-4 h-4" />
                    <span>Paste detected ({pasteCount})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="font-mono text-lg font-bold text-gray-900">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? "Pause" : "Start"} Timer
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Problem Description */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Problem Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100%-80px)]">
                <div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {problemData.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Constraints:</h4>
                  <ul className="space-y-1">
                    {problemData.constraints.map((constraint, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        <span>{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <Tabs defaultValue="examples" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                    <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="examples" className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Example 1:</h5>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Input:</span>
                          <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                            {problemData.testCases[0].input}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Output:</span>
                          <code className="ml-2 bg-gray-200 px-2 py-1 rounded">
                            {problemData.testCases[0].expectedOutput}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Explanation:</span>
                          <span className="ml-2 text-gray-600">{problemData.explanation}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="testcases" className="space-y-3">
                    {testResults.length > 0 && (
                      <div className="space-y-2">
                        {testResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              result.passed
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {result.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="font-medium text-sm">
                                Test Case {index + 1}
                              </span>
                            </div>
                            <div className="text-xs space-y-1">
                              <div>Input: <code className="bg-gray-200 px-1 rounded">{result.input}</code></div>
                              <div>Expected: <code className="bg-gray-200 px-1 rounded">{result.expected}</code></div>
                              <div>Got: <code className="bg-gray-200 px-1 rounded">{result.output}</code></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Code Editor */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Code Editor
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRunCode}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Run
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <div className="h-full rounded-lg overflow-hidden">
                  <iframe
                    ref={iframeRef}
                    src="https://onecompiler.com/embed/cpp?listenToEvents=true&codeChangeEvent=true"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="clipboard-write; clipboard-read"
                    title="Code Editor"
                    className="w-full h-full"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
