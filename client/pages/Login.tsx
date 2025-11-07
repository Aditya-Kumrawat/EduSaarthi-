import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "teacher" | "student" | null
  >(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) {
      setError("Please select your role (Teacher or Student) before signing in.");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      
      // Store user role in localStorage for navigation
      const currentUser = auth.currentUser;
      if (currentUser) {
        localStorage.setItem(`user_${currentUser.uid}_role`, selectedRole);
      }
      
      // Navigate to appropriate dashboard based on role
      if (selectedRole === "student") {
        navigate("/dashboard2");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      setError(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-lavender-50 to-purple-50">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-10"
        >
          <source
            type="video/mp4"
            src="https://cdn.builder.io/api/v1/image/assets%2F627a9941e0f84ba9a1e4d483e654346d%2F5bee1870f7d54ea68116a7d3f91cb28e"
          />
        </video>
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/80" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-200/30 to-lavender-200/30 backdrop-blur-sm"
            style={{
              width: `${100 + Math.random() * 200}px`,
              height: `${100 + Math.random() * 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [-20, 20, -20],
              y: [-30, 30, -30],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,69,193,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,69,193,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center justify-items-center">
            {/* Left Side - Login Form */}
            <motion.div
              className="w-full max-w-md mx-auto lg:mx-0 space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Logo/Brand */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link to="/" className="inline-flex items-center gap-3 group">
                  <motion.div
                    className="w-12 h-12 bg-purple-100 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-purple-200"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-purple-700 font-bold text-xl">S</span>
                  </motion.div>
                  <span className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                    ScholarAI
                  </span>
                </Link>
              </motion.div>

              {/* Welcome Text */}
              <motion.div
                className="text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-lg">
                  Unlock the future of learning with AI-powered education
                </p>
              </motion.div>

              {/* Role Selection */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <p className="text-center lg:text-left text-gray-700 font-medium">
                  Choose your role
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setSelectedRole("teacher")}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedRole === "teacher"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 bg-white/60 text-gray-700 hover:border-purple-300 hover:bg-purple-25"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👨‍🏫</div>
                      <div className="font-semibold">Teacher</div>
                      <div className="text-sm opacity-75">
                        Manage classes & students
                      </div>
                    </div>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedRole === "student"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 bg-white/60 text-gray-700 hover:border-purple-300 hover:bg-purple-25"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">👨‍🎓</div>
                      <div className="font-semibold">Student</div>
                      <div className="text-sm opacity-75">
                        Access courses & learning
                      </div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Login Form Glass Container */}
              <motion.div
                className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-purple-200/50 shadow-2xl"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                whileHover={{ boxShadow: "0 25px 50px rgba(139,69,193,0.15)" }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <Label
                      htmlFor="email"
                      className="text-gray-700 text-sm font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="bg-white/70 backdrop-blur-sm border-purple-200 text-gray-800 placeholder:text-gray-500 rounded-xl h-12 focus:border-purple-400 focus:ring-purple-400/20"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <Label
                      htmlFor="password"
                      className="text-gray-700 text-sm font-medium"
                    >
                      Password
                    </Label>
                    <div className="mt-2 relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="bg-white/70 backdrop-blur-sm border-purple-200 text-gray-800 placeholder:text-gray-500 rounded-xl h-12 pr-12 focus:border-purple-400 focus:ring-purple-400/20"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember Me & Forgot Password */}
                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75 }}
                  >
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/20"
                      />
                      <span className="text-gray-700 text-sm">Remember me</span>
                    </label>
                    <a
                      href="#"
                      className="text-purple-600 hover:text-purple-500 text-sm transition-colors"
                    >
                      Forgot password?
                    </a>
                  </motion.div>

                  {/* Sign In Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <motion.div
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                          <span>Signing In...</span>
                        </motion.div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Sign Up Link */}
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.15 }}
                >
                  <p className="text-gray-600 text-sm">
                    Don't have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-purple-600 hover:text-purple-500 font-semibold transition-colors"
                    >
                      Sign up for free
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Side - Video and Text */}
            <motion.div
              className="hidden lg:block w-full space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Video Container */}
              <motion.div
                className="rounded-2xl overflow-hidden bg-gray-900 w-full aspect-video self-start"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover object-center"
                  style={{
                    backgroundImage:
                      "url(https://cdn.builder.io/o/assets%2F3a97c5b7af5445f5b8b1bbe094d2a65a%2F7282a234d8494c2d8649bf262f707fdf?alt=media&token=890d4dc3-2a9b-4786-a260-21ccf9a5acf6&apiKey=3a97c5b7af5445f5b8b1bbe094d2a65a)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  <source
                    type="video/mp4"
                    src="https://cdn.builder.io/o/assets%2F3a97c5b7af5445f5b8b1bbe094d2a65a%2Ffe2cba453308494795049cc60a30a25c?alt=media&token=1a484597-1283-4054-b241-0645c9c09783&apiKey=3a97c5b7af5445f5b8b1bbe094d2a65a"
                  />
                </video>
              </motion.div>

              {/* Bottom Text Content */}
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mt-px">
                  Revolutionizing Education with AI
                </h3>
                <p className="text-gray-600 leading-relaxed -mt-px">
                  Join thousands of educators and students who are transforming
                  learning experiences with our intelligent education platform.
                  From personalized learning paths to smart assessments,
                  discover how AI can enhance every aspect of education.
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Smart Learning",
                    "AI Tutoring",
                    "Adaptive Tests",
                    "Progress Analytics",
                  ].map((feature, index) => (
                    <motion.span
                      key={feature}
                      className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-purple-700 text-sm border border-purple-200/50 shadow-sm mt-px"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.1 }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                    >
                      {feature}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
