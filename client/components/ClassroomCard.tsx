import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Calendar, Copy, Check, GraduationCap, Star } from 'lucide-react';
import { Classroom, ClassroomStats } from '../types/classroom';
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';

interface ClassroomCardProps {
  classroom: Classroom;
  stats?: ClassroomStats;
  isTeacher?: boolean;
  onClick?: () => void;
}

export const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  stats,
  isTeacher = false,
  onClick,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyClassCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(classroom.classCode);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = classroom.classCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Classroom code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy classroom code. Please copy manually: ' + classroom.classCode,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.seconds) return 'Recently';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-gradient-to-br from-white via-white to-gray-50/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl group overflow-hidden h-80 flex flex-col"
      style={{
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
      }}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-16 translate-x-16" />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            <GraduationCap className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          </motion.div>
          <div>
            <h3 className="font-bold text-gray-800 text-xl mb-1 group-hover:text-blue-700 transition-colors">{classroom.name}</h3>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <p className="text-gray-600 text-sm font-medium">{classroom.teacherName}</p>
            </div>
          </div>
        </div>
        
        {isTeacher && (
          <motion.button
            onClick={copyClassCode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-xs font-mono text-white shadow-lg transition-all duration-200 border border-white/20"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-300" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {classroom.classCode}
          </motion.button>
        )}
      </div>

      <div className="relative mb-4 flex-1">
        {classroom.description ? (
          <>
            <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500 rounded-full" />
            <p className="text-gray-700 text-sm pl-4 line-clamp-3 leading-relaxed">
              {classroom.description}
            </p>
          </>
        ) : (
          <div className="pl-4">
            <p className="text-gray-500 text-sm italic">No description available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.div 
          className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-2 bg-blue-500 rounded-lg">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-blue-700">{stats?.totalStudents || 0}</p>
            <p className="text-xs text-blue-600">student{(stats?.totalStudents || 0) !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>
        <motion.div 
          className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-2 bg-green-500 rounded-lg">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-green-700">{stats?.totalAssignments || 0}</p>
            <p className="text-xs text-green-600">assignment{(stats?.totalAssignments || 0) !== 1 ? 's' : ''}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600 font-medium">Created {formatDate(classroom.createdAt)}</span>
        </div>
        {isTeacher && stats && stats.pendingSubmissions > 0 && (
          <motion.span 
            className="px-3 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-xs font-bold shadow-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {stats.pendingSubmissions} pending
          </motion.span>
        )}
      </div>
      
      {/* Bottom gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-b-2xl opacity-60" />
    </motion.div>
  );
};
