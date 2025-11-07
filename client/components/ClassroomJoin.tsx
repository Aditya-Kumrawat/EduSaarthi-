import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Key, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { joinClassroom } from '../lib/classroomOperations';
import { useToast } from '../hooks/use-toast';

interface ClassroomJoinProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomJoined: () => void;
}

export const ClassroomJoin: React.FC<ClassroomJoinProps> = ({
  isOpen,
  onClose,
  onClassroomJoined,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !classCode.trim()) return;

    setLoading(true);
    try {
      await joinClassroom(
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Student',
        currentUser.email || '',
        classCode.trim().toUpperCase()
      );

      toast({
        title: 'Joined Classroom',
        description: 'You have successfully joined the classroom!',
      });

      setClassCode('');
      onClassroomJoined();
      onClose();
    } catch (error: any) {
      console.error('Error joining classroom:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join classroom. Please check the code and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setClassCode(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Join Classroom</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Classroom Code *
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={classCode}
                onChange={handleCodeChange}
                placeholder="Enter 6-character code"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 text-center text-lg font-mono tracking-wider"
                required
                maxLength={6}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Ask your teacher for the classroom code
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">What happens next?</span>
            </div>
            <p className="text-xs text-gray-400">
              Once you join, you'll see all assignments from your teacher and can submit your work directly through the platform.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || classCode.length !== 6}
              className="flex-1 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Join Classroom
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
