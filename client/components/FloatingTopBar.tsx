import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Search,
  Settings,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface FloatingTopBarProps {
  isCollapsed?: boolean;
}

export const FloatingTopBar = ({
  isCollapsed = false,
}: FloatingTopBarProps) => {
  const { currentUser } = useAuth();
  
  // Get user's display name or email as fallback
  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';
  
  // Get user's initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user role from localStorage
  const userRole = currentUser ? localStorage.getItem(`user_${currentUser.uid}_role`) || 'User' : 'User';
  const displayRole = userRole === 'teacher' ? 'Teacher' : userRole === 'student' ? 'Student' : 'User';

  return (
    <motion.div
      className={`fixed top-4 right-4 z-40 transition-all duration-300 ${
        isCollapsed ? "left-20" : "left-72"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/30 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Search */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-100/50 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-sm w-48 sm:w-64"
              />
            </div>
          </div>

          {/* Center section - Page indicator (optional) */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              Dashboard
            </div>
          </div>

          {/* Right section - Actions and Profile */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-gray-100/50 rounded-2xl"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100/50 rounded-2xl"
            >
              <Settings size={18} />
            </Button>

            {/* Profile */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100/50 rounded-2xl px-2 py-1 transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.photoURL || "https://github.com/shadcn.png"} />
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-sm">
                <div className="font-medium text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500">{displayRole}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
