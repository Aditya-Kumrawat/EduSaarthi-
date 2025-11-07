import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  getTeacherClassrooms, 
  getStudentClassrooms,
  getClassroomStats 
} from '../lib/classroomOperations';
import { Classroom, ClassroomStats } from '../types/classroom';
import { ClassroomCard } from '../components/ClassroomCard';
import { ClassroomBentoCard } from '../components/ui/classroom-bento-card';
import { ClassroomCreator } from '../components/ClassroomCreator';
import { ClassroomJoin } from '../components/ClassroomJoin';
import { ClassroomDashboard } from './ClassroomDashboard';
import { FloatingSidebar } from '../components/FloatingSidebar';
import { useSidebar } from '../contexts/SidebarContext';

export const ClassroomsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomStats, setClassroomStats] = useState<Record<string, ClassroomStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreator, setShowCreator] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  // Get user role from localStorage
  const userRole = currentUser ? localStorage.getItem(`user_${currentUser.uid}_role`) : null;
  const isTeacher = userRole === 'teacher';

  useEffect(() => {
    if (currentUser) {
      loadClassrooms();
    }
  }, [currentUser]);

  const loadClassrooms = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      console.log('Loading classrooms for user:', currentUser.uid, 'isTeacher:', isTeacher);
      
      const classroomsData = isTeacher 
        ? await getTeacherClassrooms(currentUser.uid)
        : await getStudentClassrooms(currentUser.uid);

      console.log('Loaded classrooms:', classroomsData);
      setClassrooms(classroomsData);

      // Load stats for each classroom if user is teacher
      if (isTeacher) {
        const stats: Record<string, ClassroomStats> = {};
        for (const classroom of classroomsData) {
          try {
            stats[classroom.id] = await getClassroomStats(classroom.id);
          } catch (error) {
            console.error(`Error loading stats for classroom ${classroom.id}:`, error);
            // Set default stats if loading fails
            stats[classroom.id] = {
              totalStudents: 0,
              totalAssignments: 0,
              pendingSubmissions: 0,
              gradedSubmissions: 0,
            };
          }
        }
        setClassroomStats(stats);
      }
    } catch (error) {
      console.error('Error loading classrooms:', error);
      toast({
        title: 'Error',
        description: `Failed to load classrooms: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassroomClick = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
  };

  const handleBackFromClassroom = () => {
    setSelectedClassroom(null);
    loadClassrooms(); // Refresh data when coming back
  };

  if (selectedClassroom) {
    return (
      <ClassroomDashboard
        classroom={selectedClassroom}
        onBack={handleBackFromClassroom}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <FloatingSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          userType={isTeacher ? 'teacher' : 'student'}
        />
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-800">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app relative overflow-hidden">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType={isTeacher ? 'teacher' : 'student'}
      />
      <div className={`transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isTeacher ? 'My Classrooms' : 'Enrolled Classrooms'}
            </h1>
            <p className="text-gray-600 text-sm">
              {isTeacher 
                ? 'Manage your classrooms and assignments'
                : 'View your enrolled classrooms and assignments'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {isTeacher ? (
              <motion.button
                onClick={() => setShowCreator(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Create Classroom
              </motion.button>
            ) : (
              <motion.button
                onClick={() => setShowJoin(true)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Join Classroom
              </motion.button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search classrooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
          </div>
        </div>

        {/* Classrooms Bento Grid */}
        {filteredClassrooms.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {searchTerm ? 'No classrooms found' : 'No classrooms yet'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all available classrooms'
                  : isTeacher 
                    ? 'Create your first classroom to get started with teaching'
                    : 'Join a classroom using a classroom code to begin learning'
                }
              </p>
              {!searchTerm && (
                <motion.button
                  onClick={() => isTeacher ? setShowCreator(true) : setShowJoin(true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg transition-all duration-200"
                >
                  {isTeacher ? 'Create First Classroom' : 'Join Classroom'}
                </motion.button>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            {filteredClassrooms.map((classroom, index) => (
              <ClassroomBentoCard
                key={classroom.id}
                classroom={classroom}
                stats={classroomStats[classroom.id]}
                isTeacher={isTeacher}
                onClick={() => handleClassroomClick(classroom)}
              />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {classrooms.length > 0 && (
          <motion.div 
            className="mt-8 p-6 bg-white border border-gray-200 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900 mb-1">{classrooms.length}</p>
                <p className="text-sm text-gray-600">
                  {isTeacher ? 'Classrooms Created' : 'Classrooms Joined'}
                </p>
              </div>
              {isTeacher && (
                <>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {Object.values(classroomStats).reduce((sum, stats) => sum + stats.totalStudents, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Students</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      {Object.values(classroomStats).reduce((sum, stats) => sum + stats.totalAssignments, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
        </div>
      </div>

      {/* Modals */}
      <ClassroomCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onClassroomCreated={loadClassrooms}
      />

      <ClassroomJoin
        isOpen={showJoin}
        onClose={() => setShowJoin(false)}
        onClassroomJoined={loadClassrooms}
      />
    </div>
  );
};
