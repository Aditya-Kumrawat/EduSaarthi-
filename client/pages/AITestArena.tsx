import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Clock,
  Flame,
  Trophy,
  Target,
  Zap,
  FileText,
  Settings,
  X,
  CheckCircle,
  XCircle,
  BarChart3,
  RotateCcw,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Fire border keyframes CSS
const fireAnimation = `
@keyframes fire-flicker {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 107, 0, 0.8),
                0 0 40px rgba(255, 107, 0, 0.6),
                0 0 60px rgba(255, 107, 0, 0.4),
                inset 0 0 20px rgba(255, 107, 0, 0.2);
  }
  50% { 
    box-shadow: 0 0 30px rgba(255, 193, 7, 0.9),
                0 0 50px rgba(255, 107, 0, 0.7),
                0 0 70px rgba(255, 107, 0, 0.5),
                inset 0 0 30px rgba(255, 193, 7, 0.3);
  }
}

@keyframes fire-border {
  0% { border-color: rgba(255, 107, 0, 0.8); }
  25% { border-color: rgba(255, 193, 7, 0.9); }
  50% { border-color: rgba(255, 87, 34, 1); }
  75% { border-color: rgba(255, 193, 7, 0.9); }
  100% { border-color: rgba(255, 107, 0, 0.8); }
}
`;

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  illustration: string;
  illustrationAlt: string;
}

type TestMode = "full" | "rapid" | null;

export default function AITestArena() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<TestMode>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isTestActive, setIsTestActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(90);
  const [isAnimating, setIsAnimating] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const sampleQuestions: Question[] = [
    {
      id: "1",
      text: "A ball is thrown upwards. What is its motion?",
      options: ["Linear", "Circular", "Uniformly Accelerated", "Random"],
      correctAnswer: 2,
      difficulty: "easy",
      illustration: "https://illustrations.popsy.co/amber/rocket-launch.svg",
      illustrationAlt: "Motion concept",
    },
    {
      id: "2",
      text: "What is the SI unit of force?",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      correctAnswer: 1,
      difficulty: "easy",
      illustration: "https://illustrations.popsy.co/amber/strength.svg",
      illustrationAlt: "Force concept",
    },
    {
      id: "3",
      text: "Which law states that for every action, there is an equal and opposite reaction?",
      options: ["First Law", "Second Law", "Third Law", "Law of Gravitation"],
      correctAnswer: 2,
      difficulty: "medium",
      illustration: "https://illustrations.popsy.co/amber/balance.svg",
      illustrationAlt: "Newton's laws",
    },
    {
      id: "4",
      text: "What is the acceleration due to gravity on Earth?",
      options: ["9.8 m/s²", "10 m/s²", "8.9 m/s²", "11 m/s²"],
      correctAnswer: 0,
      difficulty: "easy",
      illustration: "https://illustrations.popsy.co/amber/falling.svg",
      illustrationAlt: "Gravity concept",
    },
    {
      id: "5",
      text: "Which of the following is a vector quantity?",
      options: ["Speed", "Distance", "Velocity", "Time"],
      correctAnswer: 2,
      difficulty: "medium",
      illustration: "https://illustrations.popsy.co/amber/direction.svg",
      illustrationAlt: "Vector concept",
    },
  ];

  useEffect(() => {
    if (isTestActive && timer > 0 && !showResult) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            handleTestEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTestActive, timer, showResult]);

  const handleModeSelect = (selectedMode: TestMode) => {
    setMode(selectedMode);
    if (selectedMode === "rapid") {
      setShowInstructions(true);
    } else if (selectedMode === "full") {
      startTest();
    }
  };

  const startTest = () => {
    setQuestions(sampleQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setStreak(0);
    setBestStreak(0);
    setScore(0);
    setTimer(mode === "rapid" ? 90 : 1800);
    setIsTestActive(true);
    setShowInstructions(false);
    setAnsweredQuestions(0);
    setCorrectAnswers(0);
    setShowResult(false);
    setLastAnswerCorrect(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnimating || selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnimating) return;

    setIsAnimating(true);
    const isCorrect = selectedAnswer === questions[currentIndex].correctAnswer;
    setLastAnswerCorrect(isCorrect);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
      
      const basePoints = 10;
      const multiplier = Math.min(newStreak, 5);
      const points = basePoints * multiplier;
      setScore((prev) => prev + points);
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setAnsweredQuestions((prev) => prev + 1);

    setTimeout(() => {
      // Loop back to start if we reach the end, continue until timer runs out
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Loop back to first question
        setCurrentIndex(0);
      }
      setSelectedAnswer(null);
      setIsAnimating(false);
      setLastAnswerCorrect(null);
    }, 800);
  };

  const handleTestEnd = () => {
    setIsTestActive(false);
    setShowResult(true);
  };

  const handleTryAgain = () => {
    setShowResult(false);
    setMode(null);
  };

  const accuracy = answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType="student"
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {!mode && !isTestActive && !showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Test Arena
                </h1>
              </motion.div>
              <p className="text-xl text-gray-600 mt-2">
                Challenge yourself. Learn smarter, faster, and with fire streaks! 🔥
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="cursor-pointer"
                onClick={() => handleModeSelect("full")}
              >
                <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-xl overflow-hidden relative">
                  <div className="flex flex-col items-center text-center h-full relative z-10">
                    <img 
                      src="https://illustrations.popsy.co/amber/reading-list.svg"
                      alt="Full test"
                      className="w-32 h-32 object-contain mb-4"
                    />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      🧾 Full-Length Test
                    </h3>
                    <p className="text-gray-600 mb-6 flex-1">
                      Complete mock test with timer and detailed score report.
                    </p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      Start Full Test
                    </Button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="cursor-pointer"
                onClick={() => handleModeSelect("rapid")}
              >
                <Card className="p-8 h-full bg-white/80 backdrop-blur-sm border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-xl overflow-hidden relative">
                  <div className="flex flex-col items-center text-center h-full relative z-10">
                    <img 
                      src="https://illustrations.popsy.co/amber/timed-test.svg"
                      alt="Rapid fire"
                      className="w-32 h-32 object-contain mb-4"
                    />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      ⚡ Rapid Fire
                    </h3>
                    <p className="text-gray-600 mb-6 flex-1">
                      Quick, fun, timed quiz with streak bonuses!
                    </p>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold">
                      Start Rapid Fire
                    </Button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl" />
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowInstructions(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    Rapid Fire: Basic Physics
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstructions(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <img 
                    src="https://illustrations.popsy.co/amber/working.svg"
                    alt="Get ready"
                    className="w-40 h-40 object-contain"
                  />
                </div>

                <p className="text-lg text-gray-600 mb-6 text-center">
                  Answer as many as you can in 90 seconds. Build your fire streak! 🔥
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">Duration: 90 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl">
                    <Flame className="w-6 h-6 text-orange-600" />
                    <div>
                      <p className="font-semibold">Streak Bonus: 2×, 3×, 4×, 5×</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowInstructions(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={startTest}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white"
                  >
                    Start Now
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {isTestActive && !showResult && currentIndex < questions.length && (
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className={`w-6 h-6 ${streak > 0 ? "text-orange-600" : "text-gray-400"}`} />
                  <span className="text-lg font-bold">Streak: x{streak}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-bold">
                    {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600"
                  style={{ width: `${(timer / 90) * 100}%` }}
                />
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ x: 300, opacity: 0, rotateY: 15 }}
                animate={{ x: 0, opacity: 1, rotateY: 0 }}
                exit={{ 
                  x: lastAnswerCorrect ? 300 : -300, 
                  opacity: 0,
                  rotateY: lastAnswerCorrect ? 15 : -15,
                  scale: 0.9
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 120,
                  damping: 20,
                  duration: 0.6
                }}
              >
                <style>{fireAnimation}</style>
                <Card 
                  className={`p-8 bg-white/90 backdrop-blur-sm shadow-2xl border-4 transition-all duration-300 ${
                    streak >= 3 
                      ? "border-orange-500" 
                      : "border-gray-200"
                  }`}
                  style={{
                    borderRadius: "2rem",
                    ...(streak >= 3 && {
                      animation: "fire-flicker 2s ease-in-out infinite, fire-border 3s linear infinite",
                    })
                  }}
                >
                  {/* Illustration */}
                  <div className="flex items-center justify-center mb-6">
                    <motion.img
                      src={questions[currentIndex]?.illustration}
                      alt={questions[currentIndex]?.illustrationAlt}
                      className="w-48 h-48 object-contain"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-semibold text-gray-500">
                      Question {answeredQuestions + 1}
                    </span>
                    {streak >= 3 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
                      >
                        <Flame className="w-4 h-4 text-white" />
                        <span className="text-white font-bold text-sm">x{streak} FIRE!</span>
                      </motion.div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-8">
                    {questions[currentIndex]?.text}
                  </h3>

                  <div className="space-y-3 mb-8">
                    {questions[currentIndex]?.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 font-medium ${
                          selectedAnswer === index
                            ? "bg-blue-600 text-white shadow-lg border-2 border-blue-600"
                            : "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 text-gray-900"
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>

                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || isAnimating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-lg font-semibold disabled:opacity-50"
                  >
                    {isAnimating ? "Processing..." : "Submit Answer"}
                  </Button>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {showResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <img 
                  src="https://illustrations.popsy.co/amber/success.svg"
                  alt="Success"
                  className="w-48 h-48 object-contain mx-auto mb-6"
                />
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  🔥 You scored {score} points!
                </h2>
                <div className="space-y-3 mb-8">
                  <p className="text-xl text-gray-700">Best streak: x{bestStreak}</p>
                  <p className="text-xl text-gray-700">Accuracy: {accuracy}%</p>
                  <p className="text-xl text-gray-700">Questions answered: {answeredQuestions}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleTryAgain} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={() => navigate("/dashboard2")} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
