import { AnalyticsData, ActivityData, AssignmentStats, EngagementData, TrendData } from './analyticsService';

// Generate realistic mock data
const generateMockData = (): AnalyticsData => {
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Mock assignments with realistic data
  const assignmentStats: AssignmentStats[] = [
    {
      id: 'assignment1',
      title: 'Calculus Integration Quiz',
      submissions: 28,
      totalStudents: 30,
      completionRate: 93.3,
      averageGrade: 84.2,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assignment2',
      title: 'Physics Lab Report',
      submissions: 24,
      totalStudents: 30,
      completionRate: 80.0,
      averageGrade: 87.5,
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assignment3',
      title: 'Literature Analysis Essay',
      submissions: 26,
      totalStudents: 30,
      completionRate: 86.7,
      averageGrade: 82.1,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assignment4',
      title: 'Chemistry Problem Set',
      submissions: 22,
      totalStudents: 30,
      completionRate: 73.3,
      averageGrade: 78.9,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assignment5',
      title: 'Programming Project',
      submissions: 25,
      totalStudents: 30,
      completionRate: 83.3,
      averageGrade: 89.2,
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'assignment6',
      title: 'History Research Paper',
      submissions: 27,
      totalStudents: 30,
      completionRate: 90.0,
      averageGrade: 85.7,
      dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000)
    }
  ];

  // Generate 24-hour engagement data
  const studentEngagement: EngagementData[] = Array.from({ length: 24 }, (_, hour) => {
    // Simulate realistic activity patterns (higher during day hours)
    let baseActivity = 0;
    if (hour >= 8 && hour <= 22) {
      baseActivity = Math.floor(Math.random() * 15) + 5; // 5-20 during active hours
    } else {
      baseActivity = Math.floor(Math.random() * 3); // 0-3 during night
    }

    return {
      hour: hour.toString().padStart(2, '0'),
      students: Math.floor(baseActivity * 0.7),
      submissions: Math.floor(baseActivity * 0.4),
      activity: baseActivity
    };
  });

  // Generate 7-day trend data
  const submissionTrends: TrendData[] = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().split('T')[0],
      submissions: Math.floor(Math.random() * 20) + 10, // 10-30 submissions per day
      assignments: Math.floor(Math.random() * 3) + 1, // 1-4 assignments per day
      students: Math.floor(Math.random() * 8) + 25 // 25-33 active students
    };
  });

  // Generate recent activity
  const recentActivity: ActivityData[] = [
    {
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      type: 'submission',
      description: 'New submission for Calculus Integration Quiz',
      value: 1
    },
    {
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      type: 'submission',
      description: 'New submission for Physics Lab Report',
      value: 1
    },
    {
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      type: 'assignment_created',
      description: 'Assignment "Statistics Assignment" created',
      value: 1
    },
    {
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      type: 'submission',
      description: 'New submission for Literature Analysis Essay',
      value: 1
    },
    {
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      type: 'student_joined',
      description: 'New student enrolled in Computer Science',
      value: 1
    },
    {
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      type: 'submission',
      description: 'New submission for Chemistry Problem Set',
      value: 1
    }
  ];

  // Calculate overall metrics
  const totalSubmissions = assignmentStats.reduce((sum, assignment) => sum + assignment.submissions, 0);
  const totalPossibleSubmissions = assignmentStats.reduce((sum, assignment) => sum + assignment.totalStudents, 0);
  const overallCompletionRate = (totalSubmissions / totalPossibleSubmissions) * 100;
  
  const weightedGradeSum = assignmentStats.reduce((sum, assignment) => 
    sum + (assignment.averageGrade * assignment.submissions), 0
  );
  const overallAverageGrade = weightedGradeSum / totalSubmissions;

  return {
    totalStudents: 30,
    activeAssignments: 8,
    totalSubmissions,
    completionRate: Math.round(overallCompletionRate * 100) / 100,
    averageGrade: Math.round(overallAverageGrade * 100) / 100,
    recentActivity,
    assignmentStats,
    studentEngagement,
    submissionTrends
  };
};

export const mockAnalyticsData = generateMockData();
