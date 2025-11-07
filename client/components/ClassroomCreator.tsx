import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, BookOpen, Users, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createClassroom } from '../lib/classroomOperations';
import { useToast } from '../hooks/use-toast';

interface ClassroomCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomCreated: () => void;
}

export const ClassroomCreator: React.FC<ClassroomCreatorProps> = ({
  isOpen,
  onClose,
  onClassroomCreated,
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !formData.name.trim()) return;

    setLoading(true);
    try {
      await createClassroom(
        currentUser.uid,
        currentUser.displayName || currentUser.email || 'Teacher',
        formData.name.trim(),
        formData.description.trim()
      );

      toast({
        title: 'Classroom Created',
        description: 'Your new classroom has been created successfully!',
      });

      setFormData({ name: '', description: '' });
      onClassroomCreated();
      onClose();
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: 'Error',
        description: 'Failed to create classroom. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Create Classroom</h2>
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
              Classroom Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mathematics Grade 10"
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your classroom..."
              rows={3}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">How it works</span>
            </div>
            <p className="text-xs text-gray-400">
              Once created, you'll get a unique classroom code that students can use to join your classroom.
              All assignments you create will be visible to enrolled students.
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
              disabled={loading || !formData.name.trim()}
              className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Classroom
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
