import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function seedAnalyticsData() {
  try {
    console.log('Seeding analytics data...');

    // Generate dates for realistic timeline
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Comprehensive assignments with varied subjects and difficulty
    const assignments = [
      {
        title: 'Calculus Integration Quiz',
        description: 'Advanced integration techniques and applications',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        createdAt: lastWeek,
        status: 'active',
        totalPoints: 100,
        classroomId: 'math-advanced',
        difficulty: 'hard'
      },
      {
        title: 'Physics Lab Report',
        description: 'Electromagnetic induction experiment analysis',
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        totalPoints: 150,
        classroomId: 'physics-101',
        difficulty: 'medium'
      },
      {
        title: 'Literature Analysis Essay',
        description: 'Character development in modern fiction',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'active',
        totalPoints: 120,
        classroomId: 'english-lit',
        difficulty: 'medium'
      },
      {
        title: 'Chemistry Problem Set',
        description: 'Organic chemistry reactions and mechanisms',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        status: 'active',
        totalPoints: 80,
        classroomId: 'chemistry-201',
        difficulty: 'hard'
      },
      {
        title: 'Programming Project',
        description: 'Build a web application using React and TypeScript',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        status: 'active',
        totalPoints: 200,
        classroomId: 'computer-science',
        difficulty: 'hard'
      },
      {
        title: 'History Research Paper',
        description: 'Impact of Industrial Revolution on society',
        dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        createdAt: twoWeeksAgo,
        status: 'active',
        totalPoints: 140,
        classroomId: 'history-modern',
        difficulty: 'medium'
      },
      {
        title: 'Biology Lab Practical',
        description: 'Cell division and mitosis observation',
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'active',
        totalPoints: 90,
        classroomId: 'biology-101',
        difficulty: 'easy'
      },
      {
        title: 'Statistics Assignment',
        description: 'Hypothesis testing and confidence intervals',
        dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        totalPoints: 110,
        classroomId: 'math-stats',
        difficulty: 'medium'
      }
    ];

    // Diverse student enrollments across multiple classrooms
    const enrollments = [
      // Math Advanced Class
      { studentId: 'student1', classroomId: 'math-advanced', enrolledAt: lastMonth, status: 'active', studentName: 'Alice Johnson' },
      { studentId: 'student2', classroomId: 'math-advanced', enrolledAt: lastMonth, status: 'active', studentName: 'Bob Smith' },
      { studentId: 'student3', classroomId: 'math-advanced', enrolledAt: lastMonth, status: 'active', studentName: 'Carol Davis' },
      { studentId: 'student4', classroomId: 'math-advanced', enrolledAt: lastMonth, status: 'active', studentName: 'David Wilson' },
      
      // Physics Class
      { studentId: 'student5', classroomId: 'physics-101', enrolledAt: lastMonth, status: 'active', studentName: 'Eva Brown' },
      { studentId: 'student6', classroomId: 'physics-101', enrolledAt: lastMonth, status: 'active', studentName: 'Frank Miller' },
      { studentId: 'student7', classroomId: 'physics-101', enrolledAt: lastMonth, status: 'active', studentName: 'Grace Lee' },
      { studentId: 'student8', classroomId: 'physics-101', enrolledAt: lastMonth, status: 'active', studentName: 'Henry Zhang' },
      { studentId: 'student9', classroomId: 'physics-101', enrolledAt: lastMonth, status: 'active', studentName: 'Iris Chen' },
      
      // English Literature
      { studentId: 'student10', classroomId: 'english-lit', enrolledAt: lastMonth, status: 'active', studentName: 'Jack Thompson' },
      { studentId: 'student11', classroomId: 'english-lit', enrolledAt: lastMonth, status: 'active', studentName: 'Kate Rodriguez' },
      { studentId: 'student12', classroomId: 'english-lit', enrolledAt: lastMonth, status: 'active', studentName: 'Liam O\'Connor' },
      { studentId: 'student13', classroomId: 'english-lit', enrolledAt: lastMonth, status: 'active', studentName: 'Maya Patel' },
      
      // Chemistry
      { studentId: 'student14', classroomId: 'chemistry-201', enrolledAt: lastMonth, status: 'active', studentName: 'Noah Kim' },
      { studentId: 'student15', classroomId: 'chemistry-201', enrolledAt: lastMonth, status: 'active', studentName: 'Olivia Garcia' },
      { studentId: 'student16', classroomId: 'chemistry-201', enrolledAt: lastMonth, status: 'active', studentName: 'Paul Anderson' },
      
      // Computer Science
      { studentId: 'student17', classroomId: 'computer-science', enrolledAt: lastMonth, status: 'active', studentName: 'Quinn Taylor' },
      { studentId: 'student18', classroomId: 'computer-science', enrolledAt: lastMonth, status: 'active', studentName: 'Rachel White' },
      { studentId: 'student19', classroomId: 'computer-science', enrolledAt: lastMonth, status: 'active', studentName: 'Sam Johnson' },
      { studentId: 'student20', classroomId: 'computer-science', enrolledAt: lastMonth, status: 'active', studentName: 'Tina Liu' },
      
      // History
      { studentId: 'student21', classroomId: 'history-modern', enrolledAt: lastMonth, status: 'active', studentName: 'Uma Singh' },
      { studentId: 'student22', classroomId: 'history-modern', enrolledAt: lastMonth, status: 'active', studentName: 'Victor Martinez' },
      { studentId: 'student23', classroomId: 'history-modern', enrolledAt: lastMonth, status: 'active', studentName: 'Wendy Clark' },
      
      // Biology
      { studentId: 'student24', classroomId: 'biology-101', enrolledAt: lastMonth, status: 'active', studentName: 'Xavier Brown' },
      { studentId: 'student25', classroomId: 'biology-101', enrolledAt: lastMonth, status: 'active', studentName: 'Yuki Tanaka' },
      { studentId: 'student26', classroomId: 'biology-101', enrolledAt: lastMonth, status: 'active', studentName: 'Zoe Williams' },
      
      // Statistics
      { studentId: 'student27', classroomId: 'math-stats', enrolledAt: lastMonth, status: 'active', studentName: 'Alex Cooper' },
      { studentId: 'student28', classroomId: 'math-stats', enrolledAt: lastMonth, status: 'active', studentName: 'Blake Foster' },
      { studentId: 'student29', classroomId: 'math-stats', enrolledAt: lastMonth, status: 'active', studentName: 'Chloe Evans' },
      { studentId: 'student30', classroomId: 'math-stats', enrolledAt: lastMonth, status: 'active', studentName: 'Dylan Reed' }
    ];

    // Generate realistic submissions with varied timing and grades
    const submissions = [];
    const assignmentIds = ['assignment1', 'assignment2', 'assignment3', 'assignment4', 'assignment5', 'assignment6', 'assignment7', 'assignment8'];
    
    // Create submissions for each assignment with realistic patterns
    assignmentIds.forEach((assignmentId, assignmentIndex) => {
      const assignment = assignments[assignmentIndex];
      const relevantStudents = enrollments.filter(e => e.classroomId === assignment.classroomId);
      
      // 70-90% completion rate per assignment
      const completionRate = 0.7 + Math.random() * 0.2;
      const numSubmissions = Math.floor(relevantStudents.length * completionRate);
      
      for (let i = 0; i < numSubmissions; i++) {
        const student = relevantStudents[i];
        const submissionDate = new Date(
          assignment.createdAt.getTime() + 
          Math.random() * (now.getTime() - assignment.createdAt.getTime())
        );
        
        // Generate realistic grades based on difficulty
        let baseGrade;
        switch (assignment.difficulty) {
          case 'easy': baseGrade = 85 + Math.random() * 15; break;
          case 'medium': baseGrade = 75 + Math.random() * 20; break;
          case 'hard': baseGrade = 65 + Math.random() * 25; break;
          default: baseGrade = 80 + Math.random() * 15;
        }
        
        submissions.push({
          assignmentId,
          studentId: student.studentId,
          submittedAt: submissionDate,
          grade: Math.round(Math.min(100, Math.max(60, baseGrade))),
          status: 'graded',
          content: `${assignment.title} submission by ${student.studentName}`,
          timeSpent: Math.floor(30 + Math.random() * 120) // 30-150 minutes
        });
      }
    });

    // Add some recent activity (submissions in last 24 hours)
    const recentSubmissions = [
      {
        assignmentId: 'assignment1',
        studentId: 'student1',
        submittedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        grade: 88,
        status: 'graded',
        content: 'Recent calculus quiz submission'
      },
      {
        assignmentId: 'assignment2',
        studentId: 'student5',
        submittedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        grade: 92,
        status: 'graded',
        content: 'Recent physics lab submission'
      },
      {
        assignmentId: 'assignment3',
        studentId: 'student10',
        submittedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        grade: 85,
        status: 'graded',
        content: 'Recent literature essay submission'
      }
    ];

    submissions.push(...recentSubmissions);

    // Add assignments
    for (const assignment of assignments) {
      await addDoc(collection(db, 'assignments'), assignment);
    }

    // Add enrollments
    for (const enrollment of enrollments) {
      await addDoc(collection(db, 'enrollments'), enrollment);
    }

    // Add submissions
    for (const submission of submissions) {
      await addDoc(collection(db, 'submissions'), submission);
    }

    console.log('Sample data seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
}

export async function clearAnalyticsData() {
  // This would require admin SDK or batch operations
  // For now, just log the intent
  console.log('Clear data function - would need admin SDK implementation');
}
