import { mockAnalyticsData } from './mockAnalyticsData';

export interface AnalyticsData {
  totalStudents: number;
  activeAssignments: number;
  totalSubmissions: number;
  completionRate: number;
  averageGrade: number;
  recentActivity: ActivityData[];
  assignmentStats: AssignmentStats[];
  studentEngagement: EngagementData[];
  submissionTrends: TrendData[];
}

export interface ActivityData {
  timestamp: Date;
  type: 'submission' | 'assignment_created' | 'student_joined';
  description: string;
  value: number;
}

export interface AssignmentStats {
  id: string;
  title: string;
  submissions: number;
  totalStudents: number;
  completionRate: number;
  averageGrade: number;
  dueDate: Date;
}

export interface EngagementData {
  hour: string;
  students: number;
  submissions: number;
  activity: number;
}

export interface TrendData {
  date: string;
  submissions: number;
  assignments: number;
  students: number;
}

class AnalyticsService {
  // Mock data subscription - immediately returns mock data
  subscribeToAnalytics(callback: (data: AnalyticsData) => void): () => void {
    // Immediately call with mock data
    setTimeout(() => callback(mockAnalyticsData), 100);
    
    // Return a no-op cleanup function
    return () => {};
  }

  // Return mock analytics data
  async fetchAnalyticsData(): Promise<AnalyticsData> {
    return Promise.resolve(mockAnalyticsData);
  }
}

export const analyticsService = new AnalyticsService();
