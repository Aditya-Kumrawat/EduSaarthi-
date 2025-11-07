import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Clock, Flame, Trophy, Target, Zap, FileText, X, CheckCircle,
  XCircle, RotateCcw, Home, AlertCircle, Sparkles, TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Fire animation CSS
const fireAnimation = `
@keyframes fire-flicker {
  0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 0, 0.8), 0 0 40px rgba(255, 107, 0, 0.6); }
  50% { box-shadow: 0 0 30px rgba(255, 193, 7, 0.9), 0 0 50px rgba(255, 107, 0, 0.7); }
}
@keyframes fire-border {
  0% { border-color: rgba(255, 107, 0, 0.8); }
  50% { border-color: rgba(255, 87, 34, 1); }
  100% { border-color: rgba(255, 107, 0, 0.8); }
}
@keyframes shake { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-10px); } }
`;

interface Question {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  difficulty?: "easy" | "medium" | "hard";
  illustration?: string;
}

// Diverse illustration sources - using reliable SVG illustrations
const illustrations = [
  "https://illustrations.popsy.co/amber/question-mark.svg",
  "https://illustrations.popsy.co/amber/studying.svg",
  "https://illustrations.popsy.co/amber/education.svg",
  "https://illustrations.popsy.co/amber/book-lover.svg",
  "https://illustrations.popsy.co/amber/learning.svg",
  "https://illustrations.popsy.co/amber/science.svg",
  "https://illustrations.popsy.co/amber/mathematics.svg",
  "https://illustrations.popsy.co/amber/reading.svg",
  "https://illustrations.popsy.co/amber/graduation.svg",
  "https://illustrations.popsy.co/amber/professor.svg",
  "https://illustrations.popsy.co/amber/working.svg",
  "https://illustrations.popsy.co/amber/thinking.svg",
  "https://illustrations.popsy.co/amber/success.svg",
  "https://illustrations.popsy.co/amber/creative-thinking.svg",
  "https://illustrations.popsy.co/amber/idea.svg",
];

type TestMode = "rapid" | "full" | null;

const getSubjectsForGrade = (grade: number): string[] => {
  if (grade <= 10) return ["English", "Social Studies", "Science", "Maths"];
  return ["Physics", "Chemistry", "Biology", "Maths", "English", "Accounts", "Business Studies", "Entrepreneurship", "Computer Science", "Physical Education", "Social Studies"];
};

const generateFallbackQuestion = (subject: string, grade: number): Question => ({
  id: `fallback-${Date.now()}-${Math.random()}`,
  question: `What is a fundamental concept in ${subject} for Class ${grade}?`,
  options: ["Concept A", "Concept B", "Concept C", "Concept D"],
  answerIndex: Math.floor(Math.random() * 4),
  difficulty: "medium",
  illustration: illustrations[Math.floor(Math.random() * illustrations.length)],
});

const fetchMultipleQuestionsFromGemini = async (subject: string, grade: number, count: number = 10, signal?: AbortSignal): Promise<Question[]> => {
  try {
    const GEMINI_API_KEY = "AIzaSyCSmGAAojxkMN1zTGuUDPRVaXDvEHm-0jY";
    if (!GEMINI_API_KEY) {
      return Array.from({ length: count }, () => generateFallbackQuestion(subject, grade));
    }

    const prompt = `You are an expert teacher creating a quiz for Class ${grade} students studying ${subject}.

Generate ${count} multiple-choice questions appropriate for this grade level. Each question should be unique and educational.
Include a mix of easy, medium, and hard difficulty questions.

IMPORTANT: Respond with ONLY valid JSON in this exact format (no markdown, no code blocks, no extra text):
{
  "questions": [
    {
      "question": "Your first question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "difficulty": "easy"
    },
    {
      "question": "Your second question here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 2,
      "difficulty": "medium"
    }
  ]
}

Generate exactly ${count} questions. The answerIndex should be a number from 0-3 indicating which option is correct.
The difficulty should be "easy", "medium", or "hard".
Make all questions educational and appropriate for Class ${grade} ${subject}.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: prompt }] 
        }], 
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 2048,
          topP: 0.95,
          topK: 40
        } 
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API response:", data);
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error("No text in response:", data);
      throw new Error("No response text");
    }
    
    console.log("Raw response text (first 500 chars):", text.substring(0, 500));
    
    // Clean the response - remove markdown code blocks and extra whitespace
    let cleanText = text.trim();
    cleanText = cleanText.replace(/```json\s*/g, "");
    cleanText = cleanText.replace(/```\s*/g, "");
    cleanText = cleanText.trim();
    
    // Try to find the JSON object if there's extra text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }
    
    console.log("Cleaned text (first 500 chars):", cleanText.substring(0, 500));
    
    let responseData;
    try {
      responseData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed text:", cleanText);
      throw new Error("Invalid JSON response from API");
    }
    
    // Validate the response structure
    if (!responseData.questions || !Array.isArray(responseData.questions)) {
      console.error("Invalid response structure:", responseData);
      throw new Error("Invalid response format");
    }
    
    // Map and validate each question
    const questions: Question[] = responseData.questions.map((q: any, index: number) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.answerIndex !== 'number') {
        console.warn(`Invalid question ${index + 1}, using fallback`);
        return generateFallbackQuestion(subject, grade);
      }
      return {
        id: `gemini-${Date.now()}-${index}`,
        question: q.question,
        options: q.options,
        answerIndex: q.answerIndex,
        difficulty: q.difficulty || "medium",
        illustration: illustrations[index % illustrations.length]
      };
    });
    
    console.log(`Successfully fetched ${questions.length} questions from Gemini`);
    return questions;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    console.error("Error fetching from Gemini:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.log("Using fallback questions instead");
    return Array.from({ length: count }, () => generateFallbackQuestion(subject, grade));
  }
};

export default function TestArena() {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const [mode, setMode] = useState<TestMode>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<"correct" | "wrong" | null>(null);
  const [questionCache, setQuestionCache] = useState<Map<string, Question[]>>(new Map());
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const getTestDuration = (testMode: TestMode): number => testMode === "rapid" ? 90 : 1800;

  useEffect(() => {
    if (running && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev <= 1 ? (setRunning(false), setShowResult(true), 0) : prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [running, timeLeft]);

  const loadNextQuestion = useCallback(() => {
    if (questionQueue.length > 0) {
      const [next, ...rest] = questionQueue;
      setCurrentQuestion(next);
      setQuestionQueue(rest);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
    }
  }, [questionQueue]);

  const handleStartTest = async () => {
    setShowInstructions(false);
    setIsLoadingQuestions(true);
    
    // Fetch 10 questions at once when test starts
    if (selectedSubject && selectedGrade !== null) {
      const cacheKey = `${selectedSubject}-${selectedGrade}`;
      
      // Check if we have cached questions for this subject
      if (questionCache.has(cacheKey)) {
        console.log(`Using cached questions for ${selectedSubject} - Class ${selectedGrade}`);
        const cachedQuestions = questionCache.get(cacheKey)!;
        setCurrentQuestion(cachedQuestions[0]);
        setQuestionQueue(cachedQuestions.slice(1));
        setIsLoadingQuestions(false);
        setRunning(true);
        setTimeLeft(getTestDuration(mode));
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setAnsweredCount(0);
        setCorrectCount(0);
        return;
      }
      
      console.log(`Fetching 10 NEW questions for ${selectedSubject} - Class ${selectedGrade}...`);
      try {
        abortControllerRef.current = new AbortController();
        const questions = await fetchMultipleQuestionsFromGemini(
          selectedSubject, 
          selectedGrade, 
          10, 
          abortControllerRef.current.signal
        );
        console.log(`Loaded ${questions.length} questions for ${selectedSubject}`);
        
        // Cache the questions for this subject
        setQuestionCache(prev => new Map(prev).set(cacheKey, questions));
        
        // Set first question and queue the rest
        if (questions.length > 0) {
          setCurrentQuestion(questions[0]);
          setQuestionQueue(questions.slice(1));
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
        // Use fallback questions
        const fallbackQuestions = Array.from({ length: 10 }, () => generateFallbackQuestion(selectedSubject, selectedGrade));
        setCurrentQuestion(fallbackQuestions[0]);
        setQuestionQueue(fallbackQuestions.slice(1));
      } finally {
        setIsLoadingQuestions(false);
        setRunning(true);
        setTimeLeft(getTestDuration(mode));
        setScore(0);
        setStreak(0);
        setBestStreak(0);
        setAnsweredCount(0);
        setCorrectCount(0);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion || isAnimating) return;
    setIsAnimating(true);
    const isCorrect = selectedAnswer === currentQuestion.answerIndex;
    setAnswerFeedback(isCorrect ? "correct" : "wrong");
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const multiplier = Math.min(Math.floor(newStreak / 3) + 1, 5);
      setScore((prev) => prev + 10 * multiplier);
      setCorrectCount((prev) => prev + 1);
    } else setStreak(0);
    
    setAnsweredCount((prev) => prev + 1);
    setTimeout(() => { setIsAnimating(false); loadNextQuestion(); }, 800);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <style>{fireAnimation}</style>
      <FloatingSidebar isCollapsed={isCollapsed} setIsCollapsed={() => {}} userType="student" />
      <FloatingTopBar />

      <div className={`transition-all duration-300 pt-20 pb-8 px-4 ${isCollapsed ? "ml-20" : "ml-72"}`}>
        {/* Mode Selection */}
        {!mode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">🎯 AI Test Arena</h1>
              <p className="text-xl text-gray-700">Challenge yourself with AI-generated questions! 🔥</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <motion.div whileHover={{ scale: 1.02, y: -5 }} onClick={() => setMode("full")} className="cursor-pointer">
                <Card className="p-8 bg-white backdrop-blur-lg border-2 border-blue-200 hover:border-blue-400 transition-all shadow-xl">
                  <div className="w-40 h-40 mx-auto mb-6 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-20 h-20 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 text-center">🧾 Full-Length Test</h3>
                  <p className="text-gray-600 mb-6 text-center">30-minute comprehensive test with detailed analytics</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-white">Start Full Test</Button>
                </Card>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02, y: -5 }} onClick={() => setMode("rapid")} className="cursor-pointer">
                <Card className="p-8 bg-white backdrop-blur-lg border-2 border-orange-200 hover:border-orange-400 transition-all shadow-xl">
                  <div className="w-40 h-40 mx-auto mb-6 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Zap className="w-20 h-20 text-orange-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 text-center">⚡ Rapid Fire</h3>
                  <p className="text-gray-600 mb-6 text-center">90-second quiz with streak bonuses!</p>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 py-6 text-white">Start Rapid Fire</Button>
                </Card>
              </motion.div>
              
              {/* Storybook Feature Card */}
              <motion.div 
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => navigate("/dashboard2/storybook")}
                className="cursor-pointer relative overflow-hidden">
                <Card className="p-8 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 backdrop-blur-lg border-2 border-purple-300 hover:border-purple-500 transition-all shadow-xl h-full flex flex-col">
                  {/* Animated illustration */}
                  <motion.div 
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, 0, -5, 0]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-32 h-32 mx-auto mb-4 relative">
                    <img 
                      src="https://illustrations.popsy.co/amber/book-lover.svg"
                      alt="Storybook"
                      className="w-full h-full object-contain"
                    />
                    {/* Floating sparkles */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: 0
                      }}
                      className="absolute -top-2 -right-2">
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        delay: 0.5
                      }}
                      className="absolute -bottom-2 -left-2">
                      <Sparkles className="w-5 h-5 text-pink-500" />
                    </motion.div>
                  </motion.div>
                  
                  <h3 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Grotesque, sans-serif' }}>
                    Try Our Storybook Feature
                  </h3>
                  <p className="text-gray-700 mb-6 text-center flex-grow">
                    Create magical stories with AI! ✨ Personalized tales for every learner
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 py-6 text-white font-bold shadow-lg">
                      Explore Storybook 📚
                    </Button>
                  </motion.div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Grade Selection */}
        {mode && selectedGrade === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white backdrop-blur-lg border-2 border-gray-200 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Select Your Grade</h2>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <motion.button key={grade} whileHover={{ scale: 1.1 }} onClick={() => setSelectedGrade(grade)}
                    className="aspect-square rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-2xl shadow-lg">
                    {grade}
                  </motion.button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setMode(null)} className="mt-6 border-gray-300 hover:bg-gray-100">Back</Button>
            </Card>
          </motion.div>
        )}

        {/* Subject Selection */}
        {mode && selectedGrade !== null && !selectedSubject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <Card className="p-8 bg-white backdrop-blur-lg border-2 border-gray-200 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Select Subject (Class {selectedGrade})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getSubjectsForGrade(selectedGrade).map((subject) => (
                  <motion.button key={subject} whileHover={{ scale: 1.05 }} onClick={() => { setSelectedSubject(subject); setShowInstructions(true); }}
                    className="p-6 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-600 hover:from-indigo-600 hover:to-pink-700 text-white font-semibold text-lg shadow-lg">
                    {subject}
                  </motion.button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setSelectedGrade(null)} className="mt-6 border-gray-300 hover:bg-gray-100">Back</Button>
            </Card>
          </motion.div>
        )}

        {/* Instructions Modal */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowInstructions(false)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
                <div className="flex justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">{mode === "rapid" ? "⚡ Rapid Fire" : "🧾 Full-Length Test"}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}><X /></Button>
                </div>
                <div className="w-40 h-40 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <Sparkles className="w-20 h-20 text-blue-600" />
                </div>
                <p className="text-xl font-semibold text-center mb-2 text-gray-900">{selectedSubject} - Class {selectedGrade}</p>
                <p className="text-sm text-center mb-6 text-gray-600">Get ready to test your knowledge!</p>
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3 p-4 bg-blue-50 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div><p className="font-semibold">Duration: {mode === "rapid" ? "90 seconds" : "30 minutes"}</p></div>
                  </div>
                  <div className="flex gap-3 p-4 bg-orange-50 rounded-xl">
                    <Flame className="w-6 h-6 text-orange-600" />
                    <div><p className="font-semibold">Streak Bonus: 2×, 3×, 4×, 5×</p></div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setShowInstructions(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleStartTest} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">Start Now</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Screen */}
        {isLoadingQuestions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-12 max-w-md w-full shadow-2xl text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 border-4 border-blue-600 border-t-transparent rounded-full"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Preparing Your Test...
              </h2>
              <p className="text-gray-600 mb-4">
                Generating {selectedSubject} questions for Class {selectedGrade}
              </p>
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-blue-600 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-600 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-pink-600 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Test Arena */}
        {running && !showResult && (
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white backdrop-blur-lg rounded-2xl p-4 mb-6 border-2 border-gray-200 shadow-lg">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex gap-6">
                  <div><p className="text-gray-600 text-sm">Score</p><p className="text-gray-900 text-2xl font-bold">{score}</p></div>
                  <div><p className="text-gray-600 text-sm">Answered</p><p className="text-gray-900 text-2xl font-bold">{answeredCount}</p></div>
                  <div><p className="text-gray-600 text-sm">Accuracy</p><p className="text-gray-900 text-2xl font-bold">{accuracy}%</p></div>
                </div>
                <div className="flex items-center gap-4">
                  {streak >= 3 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-lg">
                      <Flame className="w-5 h-5 text-white" />
                      <span className="text-white font-bold">x{streak} FIRE!</span>
                    </motion.div>
                  )}
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-full shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                    <span className="text-white font-bold">{formatTime(timeLeft)}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setRunning(false); setShowResult(true); }} className="border-gray-300 hover:bg-gray-100">Exit</Button>
                </div>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div key={currentQuestion.id}
                  initial={{ x: 300, opacity: 0, rotateY: 15 }}
                  animate={{ x: 0, opacity: 1, rotateY: 0 }}
                  exit={{ x: answerFeedback === "correct" ? 300 : -300, opacity: 0, rotateY: answerFeedback === "correct" ? 15 : -15 }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}>
                  <Card className={`p-8 bg-white/90 backdrop-blur-sm shadow-2xl border-4 transition-all ${streak >= 3 ? "border-orange-500" : answerFeedback === "correct" ? "border-green-500" : answerFeedback === "wrong" ? "border-red-500" : "border-gray-200"}`}
                    style={{ borderRadius: "2rem", ...(streak >= 3 && { animation: "fire-flicker 2s ease-in-out infinite, fire-border 3s linear infinite" }), ...(answerFeedback === "wrong" && { animation: "shake 0.5s" }) }}>
                    <div className="flex justify-between items-start mb-6 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-semibold text-gray-500">Question {answeredCount + 1}</span>
                          {/* Difficulty Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            currentQuestion.difficulty === "easy" ? "bg-green-100 text-green-700" :
                            currentQuestion.difficulty === "hard" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {currentQuestion.difficulty?.toUpperCase() || "MEDIUM"}
                          </span>
                          {/* Streak Badge */}
                          {streak >= 3 && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                              <Flame className="w-4 h-4 text-white" />
                              <span className="text-white font-bold text-sm">x{streak}</span>
                            </motion.div>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{currentQuestion.question}</h3>
                      </div>
                      
                      {/* Illustration on the right */}
                      {currentQuestion.illustration && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0, x: 20 }}
                          animate={{ scale: 1, opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="flex-shrink-0">
                          <img 
                            src={currentQuestion.illustration} 
                            alt="Question illustration"
                            className="w-32 h-32 object-contain rounded-2xl"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Show correct answer if user got it wrong */}
                    {answerFeedback === "wrong" && selectedAnswer !== null && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <p className="text-sm font-semibold text-red-700 mb-2">❌ Incorrect!</p>
                        <p className="text-sm text-red-600">
                          Correct answer: <span className="font-bold">{currentQuestion.options[currentQuestion.answerIndex]}</span>
                        </p>
                      </motion.div>
                    )}
                    
                    {/* Show success message if correct */}
                    {answerFeedback === "correct" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <p className="text-sm font-semibold text-green-700">✅ Correct!</p>
                      </motion.div>
                    )}
                    
                    <div className="space-y-3 mb-8">
                      {currentQuestion.options.map((option, index) => {
                        const isCorrect = index === currentQuestion.answerIndex;
                        const isSelected = selectedAnswer === index;
                        const showCorrect = answerFeedback === "wrong" && isCorrect;
                        
                        return (
                          <motion.button key={index} onClick={() => !isAnimating && !answerFeedback && setSelectedAnswer(index)}
                            whileHover={{ scale: isAnimating || answerFeedback ? 1 : 1.02 }} 
                            whileTap={{ scale: isAnimating || answerFeedback ? 1 : 0.98 }}
                            disabled={isAnimating || answerFeedback !== null}
                            className={`w-full p-4 rounded-xl text-left transition-all font-medium ${
                              showCorrect ? "bg-green-100 border-2 border-green-500 text-green-900" :
                              isSelected && answerFeedback === "wrong" ? "bg-red-100 border-2 border-red-500 text-red-900" :
                              isSelected ? "bg-blue-600 text-white shadow-lg border-2 border-blue-600" : 
                              "bg-gray-50 hover:bg-gray-100 border-2 border-gray-200"
                            }`}>
                            {option}
                            {showCorrect && <span className="ml-2">✓</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                    <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null || isAnimating}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-6 text-lg font-semibold disabled:opacity-50">
                      {isAnimating ? "Processing..." : "Submit Answer"}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Result Screen */}
        {showResult && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
            <Card className="p-8 bg-white backdrop-blur-sm shadow-2xl text-center relative overflow-hidden border-2 border-gray-200">
              <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-48 h-48 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-32 h-32 text-yellow-600" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">🔥 You scored {score} points!</h2>
                <div className="space-y-3 mb-8">
                  <p className="text-xl text-gray-700">Best streak: x{bestStreak}</p>
                  <p className="text-xl text-gray-700">Accuracy: {accuracy}%</p>
                  <p className="text-xl text-gray-700">Questions answered: {answeredCount}</p>
                </div>
              </div>
              <div className="flex gap-4 relative z-10">
                <Button onClick={() => { setShowResult(false); setMode(null); setSelectedGrade(null); setSelectedSubject(null); }} variant="outline" className="flex-1 border-gray-300 hover:bg-gray-100">
                  <RotateCcw className="w-4 h-4 mr-2" />Try Again
                </Button>
                <Button onClick={() => navigate("/dashboard2")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Home className="w-4 h-4 mr-2" />Dashboard
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
