import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  BarChart3,
  Brain,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Edit,
  Star,
  Cpu,
  Users,
  GraduationCap,
  Code,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../lib/firebase";

interface FloatingSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  userType?: "teacher" | "student";
}

export const FloatingSidebar = ({
  isCollapsed,
  setIsCollapsed,
  userType = "teacher",
}: FloatingSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const { logout } = useAuth();

  const teacherMenuItems = [
    { id: "home", label: "Dashboard", icon: Home, href: "/dashboard" },
    {
      id: "classrooms",
      label: "Classrooms",
      icon: GraduationCap,
      href: "/dashboard/classrooms",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
    {
      id: "tests",
      label: "Tests",
      icon: Cpu,
      href: "/dashboard/tests",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      href: "/dashboard/calendar",
    },
    {
      id: "chatbot",
      label: "AI Chat",
      icon: Brain,
      href: "/dashboard/chatbot",
    },
    {
      id: "ai-lesson-studio",
      label: "AI Lesson Studio",
      icon: Sparkles,
      href: "/dashboard/ai-lesson-studio",
    },
    {
      id: "community",
      label: "Community",
      icon: Users,
      href: "/dashboard/community",
    },
  ];

  const studentMenuItems = [
    { id: "home", label: "My Classes", icon: Home, href: "/dashboard2" },
    {
      id: "classrooms",
      label: "Classrooms",
      icon: GraduationCap,
      href: "/dashboard2/classrooms",
    },
    {
      id: "codetest",
      label: "Code Test",
      icon: Code,
      href: "/dashboard2/codetest",
    },
    {
      id: "tests",
      label: "My Tests",
      icon: Cpu,
      href: "/dashboard2/tests",
    },
    {
      id: "test-arena",
      label: "Test Arena",
      icon: Zap,
      href: "/dashboard2/test-arena",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: Calendar,
      href: "/dashboard2/calendar",
    },
    {
      id: "chatbot",
      label: "AI Tutor",
      icon: Brain,
      href: "/dashboard2/chatbot",
    },
    {
      id: "ai-lesson-studio",
      label: "AI Lesson Studio",
      icon: Sparkles,
      href: "/dashboard2/ai-lesson-studio",
    },
  ];

  const menuItems =
    userType === "student" ? studentMenuItems : teacherMenuItems;

  const isActive = (href: string) => {
    // Exact match for root dashboard paths
    if (href === "/dashboard" || href === "/dashboard2") {
      return location.pathname === href;
    }
    // For other paths, use exact match only to prevent multiple selections
    return location.pathname === href;
  };

  // Update active index when location changes
  useEffect(() => {
    const currentIndex = menuItems.findIndex((item) => isActive(item.href));
    setActiveIndex(currentIndex !== -1 ? currentIndex : -1);
  }, [location.pathname]);

  return (
    <motion.div
      className={`fixed left-4 top-4 bottom-4 ${
        isCollapsed ? "w-16" : "w-64"
      } z-50 max-h-screen`}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Smooth Off-White Glass Sidebar */}
      <div
        className="h-full overflow-hidden transition-all duration-300"
        style={{
          background: "#f3ece6",
          backdropFilter: "blur(10px) saturate(150%)",
          WebkitBackdropFilter: "blur(10px) saturate(150%)",
          borderRadius: "1.25rem",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12), 0 0 40px rgba(243, 236, 230, 0.4)",
        }}
      >
        {/* Logo Section */}
        <motion.div
          className="p-4 border-b border-white/30 transition-colors duration-300"
          initial={false}
        >
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  className="text-lg font-bold dashboard-title transition-colors duration-300 text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  Dashboard
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>


        {/* Navigation Menu */}
        <div className="flex-1 p-3 space-y-1 relative overflow-y-auto">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              className={`w-full flex items-center gap-3 transition-all duration-200 group relative z-10 ${
                isCollapsed ? "p-2 justify-center" : "p-3"
              } rounded-full ${
                isActive(item.href)
                  ? "text-white bg-black shadow-lg"
                  : "bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-sm"
              }`}
              onClick={() => navigate(item.href)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon
                size={isCollapsed ? 20 : 18}
                className={`transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-white"
                    : "text-gray-600 group-hover:text-gray-800"
                }`}
              />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    className={`text-sm font-medium flex-1 text-left dashboard-text transition-colors duration-200 ${
                      isActive(item.href) ? "text-white" : "text-gray-800"
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Active indicator dot for collapsed state */}
              {isActive(item.href) && isCollapsed && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm"></div>
              )}
            </motion.button>
          ))}
        </div>


        {/* Bottom Section with Logout and Toggle */}
        <div className="p-3 border-t border-gray-200/50 space-y-2">
          {/* Logout Button */}
          <motion.button
            className={`w-full flex items-center gap-3 transition-all duration-200 group ${
              isCollapsed ? "p-2 justify-center" : "p-3"
            } rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700`}
            onClick={async () => {
              try {
                await logout();
                // Clear user role from localStorage
                const currentUser = auth.currentUser;
                if (currentUser) {
                  localStorage.removeItem(`user_${currentUser.uid}_role`);
                }
                navigate("/login");
              } catch (error) {
                console.error("Logout error:", error);
                // Force navigation to login even if logout fails
                navigate("/login");
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut
              size={isCollapsed ? 20 : 18}
              className="transition-all duration-200"
            />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  className="text-sm font-medium flex-1 text-left dashboard-text transition-colors duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Toggle Button - Centered at Bottom */}
          <div className="flex justify-center">
            <motion.button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 text-gray-600 hover:text-gray-800 hover:bg-white/90 cursor-pointer"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsCollapsed(!isCollapsed);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
