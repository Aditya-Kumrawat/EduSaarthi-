import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import Vapi from "@vapi-ai/web";
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  MoreVertical,
  Brain,
  User,
  Sparkles,
  Clock,
  CheckCheck,
  Bot,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Video,
  Code,
  Database,
  Zap,
  MessageSquare,
  Settings,
  Upload,
  Home,
  BarChart3,
  Users,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Search,
  Bell,
  TrendingUp,
  Activity,
  Target,
  PieChart,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
  type?: "text" | "image" | "file" | "code";
  suggestions?: string[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

// Initialize Vapi Web SDK for browser-based voice calls
const initializeVapiExternal = () => {
  // Try to get public key first, then fall back to regular key
  const publicKey =
    import.meta.env.VITE_VAPI_PUBLIC_KEY || import.meta.env.VITE_VAPI_KEY;

  if (!publicKey) {
    console.error(
      "❌ Vapi API key not found. Please set VITE_VAPI_PUBLIC_KEY in environment variables.",
    );
    console.error(
      "📝 Required: Web SDK needs a PUBLIC key that starts with 'pk_'",
    );
    console.error("🔗 Get your keys from: https://dashboard.vapi.ai/account");
    return null;
  }

  // Log key format for debugging (first few characters only)
  console.log(
    `🔑 Key format: ${publicKey.substring(0, 8)}... (length: ${publicKey.length})`,
  );

  // Check if this looks like a valid key
  if (publicKey.length < 20) {
    console.error(
      "❌ Vapi API key appears to be too short. Please check your key configuration.",
      `Length: ${publicKey.length}`,
    );
    console.error(
      "📝 Required: Web SDK needs a PUBLIC key that starts with 'pk_'",
    );
    return null;
  }

  // Check key format
  if (!publicKey.startsWith("pk_")) {
    console.warn(
      "⚠️ Warning: Web SDK typically requires a PUBLIC key that starts with 'pk_'",
    );
    console.warn(`🔑 Current key format: ${publicKey.substring(0, 8)}...`);
    console.warn(
      "🔗 Get your public key from: https://dashboard.vapi.ai/account",
    );
  }

  try {
    console.log("🚀 Initializing Vapi Web SDK");
    const vapi = new Vapi(publicKey);
    console.log("✅ Vapi Web SDK initialized successfully");
    return vapi;
  } catch (error) {
    console.error("❌ Failed to initialize Vapi Web SDK:", error);
    // Ensure error is properly logged
    let errorMsg = "Unknown initialization error";
    if (error instanceof Error) {
      errorMsg = `${error.name}: ${error.message}`;
    } else if (typeof error === "object") {
      try {
        errorMsg = JSON.stringify(error);
      } catch (e) {
        errorMsg = `Error object (type: ${typeof error})`;
      }
    } else {
      errorMsg = String(error);
    }
    console.error("Parsed initialization error:", errorMsg);
    return null;
  }
};

// Force enable real API calls - remove all environment restrictions
const isRestrictedEnvironment = () => {
  // DISABLED: Always return false to force real API usage
  console.log(
    "🚀 Environment restrictions DISABLED - forcing real Vapi API calls",
  );
  return false;
};

export default function Chatbot() {
  // Vapi instance state - moved inside component to fix hoisting
  const [vapiInstance, setVapiInstance] = useState<any>(null);
  const [vapiInitialized, setVapiInitialized] = useState(false);

  const { isCollapsed, setIsCollapsed } = useSidebar();
  const location = useLocation();

  // Detect user type based on current route
  const userType = location.pathname.startsWith("/dashboard2")
    ? "student"
    : "teacher";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-welcome",
      content:
        "👋 Hello! I'm your AI assistant. I can help you with various tasks, answer questions, and have conversations. You can type your message below or use the voice assistant panel on the right to talk with me. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
      status: "delivered",
      type: "text",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [vapiStatus, setVapiStatus] = useState("disconnected"); // Force real API mode
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [hasAudioOutput, setHasAudioOutput] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [testMode, setTestMode] = useState(false); // Force real API usage always
  const [networkStatus, setNetworkStatus] = useState<
    "unknown" | "online" | "offline" | "restricted"
  >("unknown");
  const [transcript, setTranscript] = useState([
    "AI: Hello! I'm your AI assistant. How can I help you today?",
    "User: Can you help me with my questions?",
    "AI: Absolutely! I'm here to assist you with various tasks and questions.",
    "User: What can you help me with?",
    "AI: I can help with research, analysis, writing, coding, and much more!",
  ]);
  const [audioVolume, setAudioVolume] = useState(2.5); // Volume control state - start at 250%

  // Timer effect for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording && callStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor(
          (now.getTime() - callStartTime.getTime()) / 1000,
        );
        setCallDuration(duration);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, callStartTime]);

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioProcessed, setAudioProcessed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const assistantVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize Vapi Web SDK for browser-based voice calls - moved before useEffect to fix hoisting
  const initializeVapi = useCallback(() => {
    // Check for public key specifically
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
    const fallbackKey = import.meta.env.VITE_VAPI_KEY;

    if (!publicKey && !fallbackKey) {
      console.error(
        "❌ No Vapi API key found. Please set VITE_VAPI_PUBLIC_KEY in environment variables.",
      );
      console.error(
        "📝 Required: Web SDK needs a PUBLIC key that starts with 'pk_'",
      );
      console.error("🔗 Get your keys from: https://dashboard.vapi.ai/account");
      return null;
    }

    if (!publicKey && fallbackKey) {
      console.warn(
        "⚠️ No public key found. Using fallback key, but this may cause authentication issues.",
      );
      console.warn(
        "📝 For best results, set VITE_VAPI_PUBLIC_KEY with a public key (pk_...)",
      );
    }

    const keyToUse = publicKey || fallbackKey;

    if (!keyToUse) {
      console.error("❌ No valid API key available");
      return null;
    }

    // Log key format for debugging (first few characters only)
    console.log(
      `🔑 Key format: ${keyToUse.substring(0, 8)}... (length: ${keyToUse.length})`,
    );

    // Check if this looks like a valid key
    if (keyToUse.length < 20) {
      console.error(
        "❌ Vapi API key appears to be too short. Please check your key configuration.",
        `Length: ${keyToUse.length}`,
      );
      console.error(
        "📝 Required: Web SDK needs a PUBLIC key that starts with 'pk_'",
      );
      return null;
    }

    // Check key format - accept both pk_ format and UUID format
    if (
      !keyToUse.startsWith("pk_") &&
      !keyToUse.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      )
    ) {
      console.warn(
        "⚠️ Warning: Unrecognized key format. Expected either 'pk_...' or UUID format",
      );
      console.warn(`🔑 Current key format: ${keyToUse.substring(0, 8)}...`);
    } else {
      console.log("✅ Valid key format detected");
    }

    try {
      console.log("🚀 Initializing Vapi Web SDK");
      const vapi = new Vapi(keyToUse);
      console.log("✅ Vapi Web SDK initialized successfully");
      return vapi;
    } catch (error) {
      console.error("❌ Failed to initialize Vapi Web SDK:", error);
      // Ensure error is properly logged
      let errorMsg = "Unknown initialization error";
      if (error instanceof Error) {
        errorMsg = `${error.name}: ${error.message}`;
      } else if (typeof error === "object") {
        try {
          errorMsg = JSON.stringify(error);
        } catch (e) {
          errorMsg = `Error object (type: ${typeof error})`;
        }
      } else {
        errorMsg = String(error);
      }
      console.error("Parsed initialization error:", errorMsg);
      return null;
    }
  }, []);

  // Debug logging function with comprehensive object handling
  const addDebugLog = useCallback((message: string | any) => {
    const timestamp = new Date().toLocaleTimeString();

    // Ensure message is properly serialized and never shows [object Object]
    let logMessage = "";
    try {
      if (typeof message === "string") {
        logMessage = message;
      } else if (message instanceof Error) {
        logMessage = `Error: ${message.message} (${message.name})`;
      } else if (typeof message === "object" && message !== null) {
        // Force object serialization with detailed approach
        try {
          logMessage = JSON.stringify(message, null, 2);
        } catch (jsonError) {
          // If JSON.stringify fails, manually extract properties
          const props: string[] = [];
          for (const key in message) {
            try {
              const value = message[key];
              props.push(
                `${key}: ${typeof value === "object" ? "[Object]" : String(value)}`,
              );
            } catch (e) {
              props.push(`${key}: [Unable to access]`);
            }
          }
          logMessage = `Object {${props.join(", ")}}`;
        }
      } else {
        logMessage = String(message);
      }

      // Final check to prevent [object Object]
      if (
        logMessage.includes("[object Object]") ||
        logMessage === "[object Object]"
      ) {
        logMessage = `[Unserializable object of type: ${typeof message}]`;
      }
    } catch (e) {
      logMessage = `[Error serializing log message: ${e}]`;
    }

    const finalLogMessage = `[${timestamp}] ${logMessage}`;
    console.log(`🔊 VAPI DEBUG: ${finalLogMessage}`);
    setDebugLogs((prev) => [...prev.slice(-9), finalLogMessage]); // Keep last 10 logs
  }, []);

  // Initial environment check log
  useEffect(() => {
    if (isRestrictedEnvironment()) {
      addDebugLog("🛡️ RESTRICTED ENVIRONMENT DETECTED");
      addDebugLog("🧪 Test Mode auto-enabled to prevent network errors");
      addDebugLog(`📍 Hostname: ${window.location.hostname}`);
    } else {
      addDebugLog("🌍 Unrestricted environment - Vapi API available");
    }
  }, []);

  // Test mode - simulate Vapi functionality for testing
  const toggleTestMode = () => {
    setTestMode(false); // Force real speech mode only
    if (!testMode) {
      addDebugLog("🧪 Test mode enabled - simulating Vapi responses");
      setVapiStatus("test-mode");
    } else {
      addDebugLog("🔧 Test mode disabled - using real Vapi");
      setVapiStatus("disconnected");
    }
  };

  // Vapi initialization and event listeners (only if not in test mode)
  useEffect(() => {
    if (testMode) {
      addDebugLog("🧪 Skipping Vapi setup - Test Mode active");
      return;
    }

    // Initialize Vapi only once
    if (!vapiInitialized && !vapiInstance) {
      addDebugLog("Initializing Vapi instance...");
      const newVapi = initializeVapi();
      setVapiInstance(newVapi);
      setVapiInitialized(true);

      if (!newVapi) {
        addDebugLog("❌ Vapi initialization failed - no instance created");
        setVapiStatus("error");
        setVapiError(
          "Failed to initialize Vapi SDK. Check API key configuration.",
        );
        return;
      }
    }

    if (!vapiInstance) {
      addDebugLog("❌ No Vapi instance available");
      return;
    }

    addDebugLog("Setting up Vapi event listeners...");

    // Clear any existing listeners to prevent conflicts
    vapiInstance.removeAllListeners();

    // Audio volume boosting - Persistent approach with both methods
    vapiInstance.on("audio", (audioEl: HTMLAudioElement) => {
      if (!audioEl) return;

      // Method 1: Direct element volume control (persistent)
      audioEl.volume = Math.min(audioVolume, 1.0); // Keep element volume at max 100%
      audioEl.muted = false;
      setHasAudioOutput(true); // Set audio output flag

      // Start video when audio is received
      if (assistantVideoRef.current) {
        assistantVideoRef.current.play();
      }

      addDebugLog(
        `🔊 Direct audio volume: ${Math.round(audioEl.volume * 100)}%`,
      );

      // Method 2: Web Audio API for additional boost (only once per stream)
      if (audioEl.srcObject && !audioProcessed) {
        try {
          const context = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
          const gain = context.createGain();
          gain.gain.value = audioVolume; // Apply full boost through gain

          const source = context.createMediaStreamSource(
            audioEl.srcObject as MediaStream,
          );
          source.connect(gain);
          gain.connect(context.destination);

          setAudioContext(context);
          setGainNode(gain);
          setAudioProcessed(true);

          addDebugLog(
            `🎚️ Web Audio boost: ${Math.round(audioVolume * 100)}% applied`,
          );

          // Ensure audio context starts
          const startAudio = () => {
            if (context.state === "suspended") {
              context.resume();
              addDebugLog("🔊 Audio context resumed");
            }
          };

          // Try to start immediately
          startAudio();

          // Also set up for user interaction
          document.addEventListener("click", startAudio, { once: true });
          document.addEventListener("touchstart", startAudio, { once: true });
        } catch (audioError) {
          addDebugLog(
            `❌ Web Audio failed, using direct volume only: ${audioError}`,
          );
        }
      }

      // Continuous volume monitoring and correction
      const volumeMonitor = setInterval(() => {
        if (audioEl && !audioEl.paused) {
          if (audioEl.volume !== Math.min(audioVolume, 1.0)) {
            audioEl.volume = Math.min(audioVolume, 1.0);
            addDebugLog(
              `🔧 Volume corrected back to ${Math.round(audioEl.volume * 100)}%`,
            );
          }
        } else {
          clearInterval(volumeMonitor);
        }
      }, 500); // Check every 500ms
    });

    vapiInstance.on("speech-start", () => {
      addDebugLog("🎤 Speech started");
    });

    vapiInstance.on("speech-end", () => {
      addDebugLog("🔇 Speech ended");
    });

    vapiInstance.on("message", (message: any) => {
      try {
        if (
          message &&
          typeof message === "object" &&
          message.type === "transcript"
        ) {
          const transcript = message.transcript || "";
          const transcriptType = message.transcriptType || "unknown";
          const role = message.role || "unknown";

          if (role === "user") {
            addDebugLog(
              `📝 User transcript: ${transcriptType} - ${transcript}`,
            );
            if (transcriptType === "partial") {
              setInputValue(transcript);
            } else if (transcriptType === "final") {
              addDebugLog(`✅ Final user transcript: ${transcript}`);
              setInputValue(""); // Clear input after final transcript
              handleSendMessage(transcript);
              setTranscript((prev) => [...prev, `User: ${transcript}`]);
            }
          } else if (role === "assistant") {
            addDebugLog(`🤖 AI response: ${transcript}`);

            // Trigger voice activity when assistant speaks
            setHasAudioOutput(true);
            // Keep the audio output flag active for a short time to show visual feedback
            setTimeout(() => {
              setHasAudioOutput(false);
            }, 3000);

            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                content: transcript,
                sender: "ai" as const,
                timestamp: new Date(),
                status: "read" as const,
              },
            ]);
            setTranscript((prev) => [...prev, `AI: ${transcript}`]);
          }
        } else {
          // Handle non-transcript messages
          addDebugLog(`📨 Vapi message: ${JSON.stringify(message, null, 2)}`);
        }
      } catch (error) {
        addDebugLog(`❌ Error handling Vapi message: ${error}`);
        console.error("Error processing Vapi message:", error, message);
      }
    });

    vapiInstance.on("call-start", () => {
      addDebugLog("📞 Call started");
      setVapiStatus("call-active");
      setCallStartTime(new Date());
      addDebugLog("🎧 Audio processing will be handled on audio stream");
    });

    vapiInstance.on("call-end", () => {
      addDebugLog("📞 Call ended");
      setVapiStatus("call-ended");
      setIsRecording(false);
      setCallDuration(0);
      setHasAudioOutput(false);
      setCallStartTime(null);
      // Pause video when call ends
      if (assistantVideoRef.current) {
        assistantVideoRef.current.pause();
      }

      // Cleanup Web Audio API resources
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
        setAudioContext(null);
        setGainNode(null);
        setAudioProcessed(false); // Reset for next call
        addDebugLog("🧹 Audio context cleaned up and reset");
      }
    });

    vapiInstance.on("error", (error: any) => {
      // Comprehensive error serialization to fix [object Object] issue
      let errorMessage = "Unknown error";
      let debugInfo = "";

      try {
        // Log the raw error for debugging
        console.error("RAW VAPI ERROR:", error);
        console.error("ERROR TYPE:", typeof error);
        console.error("ERROR CONSTRUCTOR:", error?.constructor?.name);

        if (typeof error === "string") {
          errorMessage = error;
        } else if (error instanceof Error) {
          errorMessage = error.message || error.toString();
          debugInfo = `Name: ${error.name}, Stack: ${error.stack?.substring(0, 100)}`;
        } else if (error?.message) {
          errorMessage = String(error.message);
        } else if (error?.error) {
          errorMessage = String(error.error);
        } else if (error?.data) {
          errorMessage = JSON.stringify(error.data);
        } else if (error?.response) {
          // Handle fetch response errors
          errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
        } else if (typeof error === "object" && error !== null) {
          // Extract all enumerable properties
          const errorObj: any = {};
          for (const key in error) {
            try {
              errorObj[key] = error[key];
            } catch (e) {
              errorObj[key] = "[Unable to serialize]";
            }
          }
          errorMessage = JSON.stringify(errorObj, null, 2);
        } else {
          errorMessage = String(error);
        }

        // If we still have [object Object], force a different approach
        if (
          errorMessage.includes("[object Object]") ||
          errorMessage === "[object Object]"
        ) {
          errorMessage = `Vapi Error - Type: ${typeof error}, Constructor: ${error?.constructor?.name || "unknown"}`;
          if (error?.status) errorMessage += `, Status: ${error.status}`;
          if (error?.code) errorMessage += `, Code: ${error.code}`;
        }
      } catch (e) {
        errorMessage = `Error serialization failed: ${e}`;
      }

      addDebugLog(`❌ Vapi error: ${errorMessage}`);
      if (debugInfo) {
        addDebugLog(`🔍 Debug info: ${debugInfo}`);
      }

      // Check for specific error types and provide helpful messages
      let userFriendlyMessage = errorMessage;
      if (
        errorMessage.includes("Invalid Key") ||
        errorMessage.includes("Invalid API key")
      ) {
        userFriendlyMessage =
          "Authentication failed: Invalid API key. Please check your Vapi configuration.";
        addDebugLog(
          "🔑 Tip: Make sure you're using the correct key type (public key for Web SDK)",
        );
      }

      setVapiError(userFriendlyMessage);
      setVapiStatus("error");
    });

    // Cleanup event listeners
    return () => {
      if (vapiInstance) {
        try {
          vapiInstance.removeAllListeners();
          addDebugLog("🧝 Cleaned up Vapi event listeners");
        } catch (error) {
          console.error("Error cleaning up Vapi listeners:", error);
        }
      }
    };
  }, [testMode, vapiInstance, vapiInitialized]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(
      () => {
        const aiResponses = [
          "I understand your request. Let me process this information and provide you with helpful insights.",
          "Based on your question, I can help you find the information you need. Would you like me to provide a detailed explanation or a quick overview?",
          "Great question! Let me break this down for you and provide clear, actionable insights.",
          "I can definitely assist with that. Let me analyze your request and provide you with relevant information.",
          "Perfect! I'm here to help. Would you like me to provide examples, explanations, or specific guidance?",
        ];

        const randomResponse =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: randomResponse,
          sender: "ai",
          timestamp: new Date(),
          status: "read",
          suggestions: [
            "Tell me more about this",
            "Show me examples",
            "Export results",
            "Explain methodology",
          ],
        };

        setMessages((prev) =>
          prev
            .map((msg) =>
              msg.id === userMessage.id
                ? { ...msg, status: "read" as const }
                : msg,
            )
            .concat(aiMessage),
        );
        setIsTyping(false);
      },
      1500 + Math.random() * 1000,
    );
  };

  const quickActions: QuickAction[] = [
    {
      id: "help",
      label: "Get Help",
      icon: <Brain size={16} />,
      prompt: "How can you help me today?",
    },
    {
      id: "explain",
      label: "Explain",
      icon: <MessageSquare size={16} />,
      prompt: "Can you explain this concept to me?",
    },
    {
      id: "research",
      label: "Research",
      icon: <Search size={16} />,
      prompt: "Help me research this topic",
    },

    {
      id: "ideas",
      label: "Ideas",
      icon: <Sparkles size={16} />,
      prompt: "Give me some creative ideas",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const toggleRecording = async () => {
    // REAL SPEECH MODE - User wants real speech, not test mode
    addDebugLog("🎤 Starting REAL Vapi voice recording - NO test mode!");

    // Force real speech mode
    setTestMode(false);
    setVapiStatus("starting");

    try {
      if (isRecording) {
        addDebugLog("Stopping Vapi recording...");
        if (vapiInstance) {
          await vapiInstance.stop();
        }
        setIsRecording(false);
        setVapiStatus("stopped");
        if (videoRef.current) {
          videoRef.current.pause();
        }
        addDebugLog("✅ Vapi stopped successfully");
      } else {
        addDebugLog("Starting Vapi recording...");
        setVapiError(null);
        setVapiStatus("starting");

        // Check environment credentials
        const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
        const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

        if (!publicKey) {
          throw new Error(
            "Missing VITE_VAPI_PUBLIC_KEY. Please configure your Vapi credentials.",
          );
        }

        if (!assistantId) {
          throw new Error(
            "Missing VITE_VAPI_ASSISTANT_ID. Please configure your Vapi assistant.",
          );
        }

        addDebugLog(`🔑 Using public key: ${publicKey.substring(0, 8)}...`);
        addDebugLog(`🤖 Using assistant: ${assistantId}`);

        // Check microphone permissions
        try {
          addDebugLog("Checking microphone permissions...");
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          stream.getTracks().forEach((track) => track.stop()); // Clean up
          addDebugLog("✅ Microphone permissions granted");
        } catch (permError: any) {
          const errorMsg = permError.message || "Permission denied";
          addDebugLog(`❌ Microphone access failed: ${errorMsg}`);
          throw new Error(`Microphone error: ${errorMsg}`);
        }

        // Check if Vapi SDK is available and properly initialized
        if (!vapiInstance) {
          // Try to initialize if not already done
          if (!vapiInitialized) {
            addDebugLog(
              "Attempting to initialize Vapi during recording start...",
            );
            const newVapi = initializeVapi();
            setVapiInstance(newVapi);
            setVapiInitialized(true);

            if (!newVapi) {
              throw new Error(
                "Vapi SDK initialization failed. You need a valid PUBLIC key (pk_...) for the Web SDK. Get your keys from https://dashboard.vapi.ai/account",
              );
            }
          } else {
            throw new Error(
              "Vapi SDK not available. Please configure VITE_VAPI_PUBLIC_KEY with a valid public key (pk_...).",
            );
          }
        }

        // Configure the assistant for the call
        const voiceId = import.meta.env.VITE_VAPI_VOICE_ID || "rachel";

        let callConfig;

        if (assistantId) {
          // Use pre-created assistant
          addDebugLog(`Using pre-created assistant: ${assistantId}`);
          callConfig = assistantId; // For Web SDK, just pass the assistant ID
        } else {
          // Create assistant configuration dynamically
          addDebugLog("Creating dynamic assistant configuration");
          callConfig = {
            model: {
              provider: "openai",
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful AI assistant. Keep your responses concise and informative. You can help with various tasks including research, writing, coding, analysis, and answering questions on a wide range of topics.",
                },
              ],
            },
            voice: {
              provider: "11labs",
              voiceId: voiceId,
              stability: 0.5,
              similarityBoost: 0.75,
              style: 0.0,
              useSpeakerBoost: true,
              optimizeStreamingLatency: 0,
              enableSsmlParsing: true,
              model: "eleven_turbo_v2_5",
            },
            firstMessage: null,
          };
        }

        // Start Vapi call
        await vapiInstance.start(callConfig);
        addDebugLog("✅ Vapi call started successfully");

        setIsRecording(true);
        setVapiStatus("recording");
        setCallStartTime(new Date());
        videoRef.current?.play();
        addDebugLog("🎉 Vapi Web SDK call started successfully!");
        addDebugLog("🎤 Listening for real speech via Vapi...");
      }
    } catch (error: any) {
      // Handle errors
      let errorMessage = "Unknown error";

      try {
        if (typeof error === "string") {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.toString && typeof error.toString === "function") {
          errorMessage = error.toString();
        } else if (typeof error === "object") {
          errorMessage = JSON.stringify(error, null, 2);
        }
      } catch (e) {
        errorMessage = "Error parsing error object";
      }

      addDebugLog(`❌ Recording failed: ${errorMessage}`);
      setVapiError(errorMessage);
      setVapiStatus("error");
      setIsRecording(false);
    }
  };

  return (
    <div className="dashboard-page min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType={userType}
      />

      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          isCollapsed ? "ml-20" : "ml-72"
        } pr-4`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {/* Main Chat Container */}
        <div className="flex-1 flex overflow-hidden p-4">
          {/* Floating Glass Chat Container */}
          <motion.div
            className={`${isCollapsed ? "mr-80" : "mr-84"} bg-gradient-to-br from-white/90 via-gray-50/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden transition-all duration-300`}
            style={{ height: "calc(100vh - 2rem)" }}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              marginRight: isCollapsed ? 280 : 288,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Chat Messages Area */}
            <div className="flex flex-col h-full">
              {/* Messages Container with Gradient Background */}
              <div
                className="flex-1 overflow-y-auto p-8 space-y-6 min-h-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 50%, rgba(248, 250, 252, 0.9) 100%)",
                }}
              >
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex items-start gap-3 ${
                        message.sender === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback
                          className={`${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                              : "bg-gradient-to-r from-purple-500 to-pink-500"
                          } text-white text-sm`}
                        >
                          {message.sender === "user" ? (
                            <User size={16} />
                          ) : (
                            <Brain size={16} />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`flex-1 max-w-3xl ${
                          message.sender === "user" ? "text-right" : ""
                        }`}
                      >
                        <div
                          className={`relative p-5 rounded-2xl shadow-lg ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white ml-12 shadow-blue-200/50"
                              : "bg-white/90 backdrop-blur-md text-gray-800 mr-12 border border-white/40 shadow-gray-200/30"
                          }`}
                        >
                          <p className="text-sm leading-relaxed dashboard-text">
                            {message.content}
                          </p>

                          <div
                            className={`mt-2 flex items-center gap-2 text-xs ${
                              message.sender === "user"
                                ? "text-blue-100 justify-end"
                                : "text-gray-500"
                            }`}
                          >
                            <Clock size={12} />
                            <span>
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {message.status === "read" && (
                              <CheckCheck size={12} />
                            )}
                          </div>
                        </div>

                        {/* AI Suggestions */}
                        {message.sender === "ai" && message.suggestions && (
                          <motion.div
                            className="mt-3 flex flex-wrap gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            {message.suggestions.map(
                              (suggestion, suggestionIndex) => (
                                <motion.button
                                  key={suggestionIndex}
                                  onClick={() =>
                                    handleSuggestionClick(suggestion)
                                  }
                                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full hover:from-purple-200 hover:to-pink-200 transition-all duration-200 border border-purple-200/50 dashboard-text"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    delay: 0.6 + suggestionIndex * 0.1,
                                  }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {suggestion}
                                </motion.button>
                              ),
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-start gap-3"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Brain size={16} />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/40 shadow-gray-200/30">
                        <div className="flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-purple-400 rounded-full"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area with Enhanced Glass Effect */}
              <div className="border-t border-white/30 bg-gradient-to-r from-white/70 via-gray-50/60 to-white/80 backdrop-blur-lg p-6 shadow-inner">
                {/* Quick Actions */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 border border-gray-200/50 dashboard-text"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {action.icon}
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Input Controls */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(inputValue);
                        }
                      }}
                      placeholder="Type your message or use voice..."
                      className="pr-12 bg-white/90 border-white/30 backdrop-blur-sm focus:bg-white focus:border-purple-300 transition-all dashboard-text"
                    />

                    {/* Character count or file indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      {inputValue.length > 0 && (
                        <span>{inputValue.length}</span>
                      )}
                    </div>
                  </div>

                  {/* Voice Recording */}
                  <motion.button
                    onClick={toggleRecording}
                    className={`p-2 rounded-full transition-all ${
                      isRecording
                        ? "bg-red-500 text-white"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                    transition={
                      isRecording ? { duration: 1, repeat: Infinity } : {}
                    }
                    title="Voice Recording"
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  </motion.button>

                  {/* Volume Control */}
                  <div
                    className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg"
                    title="Audio Volume"
                  >
                    <div className="text-gray-500">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11 5L6 9H2V15H6L11 19V5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19.07 4.93A10 10 0 0 1 19.07 19.07M15.54 8.46A5 5 0 0 1 15.54 15.54"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="4.0"
                      step="0.1"
                      value={audioVolume}
                      onChange={(e) => {
                        const newVolume = parseFloat(e.target.value);
                        setAudioVolume(newVolume);
                        if (gainNode) {
                          gainNode.gain.value = newVolume;
                        }
                        addDebugLog(
                          `🔊 Volume adjusted to ${Math.round(newVolume * 100)}%`,
                        );
                      }}
                      className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(audioVolume / 4) * 100}%, #e5e7eb ${(audioVolume / 4) * 100}%, #e5e7eb 100%)`,
                      }}
                    />
                    <span className="text-xs text-gray-500 min-w-[30px] dashboard-text">
                      {Math.round(audioVolume * 100)}%
                    </span>
                  </div>

                  {/* Send Button */}
                  <motion.button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send size={20} />
                  </motion.button>
                </div>

                {/* Error Display */}
                {vapiError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-700 dashboard-text">
                      {vapiError}
                    </p>
                  </motion.div>
                )}

                {/* Debug Logs */}
                {/* {debugLogs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto"
                  >
                    <div className="text-xs text-gray-600 space-y-1 dashboard-text">
                      {debugLogs.slice(-5).map((log, index) => (
                        <div key={index} className="font-mono">
                          {log}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )} */}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hidden video element for Vapi */}
        <video ref={videoRef} className="hidden" autoPlay muted playsInline />
      </motion.div>

      {/* Right Panel - Voice Assistant */}
      <motion.div
        className="fixed right-4 top-4 bottom-4 w-72 z-40"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="h-full bg-white/95 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                animate={{
                  scale: vapiStatus === "call-active" ? [1, 1.1, 1] : 1,
                  boxShadow:
                    vapiStatus === "call-active"
                      ? [
                          "0 0 0 0 rgba(59, 130, 246, 0.7)",
                          "0 0 0 10px rgba(59, 130, 246, 0)",
                          "0 0 0 0 rgba(59, 130, 246, 0)",
                        ]
                      : "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                }}
                transition={{
                  duration: 1.5,
                  repeat: vapiStatus === "call-active" ? Infinity : 0,
                }}
              >
                <Bot size={18} className="text-white" />
              </motion.div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Voice Assistant
                </h3>
                <p className="text-xs text-gray-600">
                  {vapiStatus === "call-active"
                    ? "Listening..."
                    : "Ready to talk"}
                </p>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="p-4">
            <motion.div
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-gray-200 shadow-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-48 object-cover rounded-xl"
              >
                <source
                  src="https://cdn.builder.io/o/assets%2Fa35bd991f0e541aa931714571cb88c16%2Ff399aac4c02c41bdac297eb7996352fe?alt=media&token=c1bbf4ed-04bb-45b1-957e-f7ca03620265&apiKey=a35bd991f0e541aa931714571cb88c16"
                  type="video/mp4"
                />
              </video>

              {/* Overlay for interaction */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />

              {/* Voice status indicator */}
              <motion.div
                className="absolute top-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md border border-gray-200"
                animate={{
                  opacity: vapiStatus === "call-active" ? [0.9, 1, 0.9] : 0.9,
                }}
                transition={{
                  duration: 1.5,
                  repeat: vapiStatus === "call-active" ? Infinity : 0,
                }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    vapiStatus === "call-active"
                      ? "bg-green-500"
                      : vapiStatus === "error"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
                <span className="text-xs text-gray-800 font-semibold">
                  {vapiStatus === "call-active"
                    ? "Live"
                    : vapiStatus === "error"
                      ? "Error"
                      : "Ready"}
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Interactive Controls */}
          <div className="p-4 space-y-4">
            {/* Voice Visualizer - Fixed Size */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-gray-200 shadow-md h-36">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-800">
                  Voice Activity
                </span>
                <div className="flex items-center gap-1 h-8">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                      animate={{
                        height: hasAudioOutput
                          ? [6, Math.random() * 20 + 12, 6]
                          : 6,
                      }}
                      transition={{
                        duration: 0.5 + Math.random() * 0.5,
                        repeat: hasAudioOutput ? Infinity : 0,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Stats - Fixed Layout */}
              <div className="grid grid-cols-2 gap-4 text-xs h-16">
                <div className="text-center bg-white rounded-lg p-2 border border-gray-200 flex flex-col justify-center">
                  <div className="text-gray-600 font-medium">Duration</div>
                  <div className="text-gray-900 font-bold text-sm">
                    {formatDuration(callDuration)}
                  </div>
                </div>
                <div className="text-center bg-white rounded-lg p-2 border border-gray-200 flex flex-col justify-center">
                  <div className="text-gray-600 font-medium">Quality</div>
                  <div className="text-green-600 font-bold text-sm">HD</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <motion.button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 px-4 font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg border-2 border-transparent hover:border-blue-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff size={18} />
                    Stop Voice Chat
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    Start Voice Chat
                  </>
                )}
              </motion.button>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  className="bg-white text-gray-700 rounded-xl py-3 px-3 text-sm hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-blue-300 shadow-md flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings size={16} />
                </motion.button>
                <motion.button
                  className="bg-white text-gray-700 rounded-xl py-3 px-3 text-sm hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-purple-300 shadow-md flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Activity size={16} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Debug Info (if in test mode) */}
          {testMode && (
            <div className="p-4 border-t border-gray-200">
              <div className="bg-gray-100 rounded-xl p-3 border-2 border-gray-200">
                <div className="text-xs text-gray-600 font-semibold mb-2">
                  Debug Mode
                </div>
                <div className="text-xs text-gray-800 font-mono bg-white rounded-lg p-2 border border-gray-200">
                  Status: {vapiStatus}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
