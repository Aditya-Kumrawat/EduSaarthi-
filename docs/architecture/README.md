# Architecture Documentation

This document provides a comprehensive overview of the ScholarAI platform's system architecture, design patterns, and technical decisions.

## System Overview

ScholarAI is a full-stack educational platform built with a modern, scalable architecture that supports real-time AI proctoring, classroom management, and interactive learning experiences.

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  React SPA (TypeScript)                                     │
│  ├── Teacher Dashboard     ├── Student Dashboard            │
│  ├── Test Management       ├── Test Taking Interface        │
│  ├── Analytics            ├── AI Proctoring UI             │
│  └── Classroom Management  └── Community Features           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Express.js Server                                         │
│  ├── Authentication Middleware                             │
│  ├── Rate Limiting                                         │
│  ├── Request Validation                                    │
│  └── Error Handling                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   User      │  │ Classroom   │  │    Test     │        │
│  │  Service    │  │  Service    │  │  Service    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Analytics   │  │ Proctoring  │  │   VAPI      │        │
│  │  Service    │  │  Service    │  │  Service    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Supabase   │  │  Firebase   │  │    Redis    │        │
│  │ (Primary DB)│  │(Auth & RT)  │  │   (Cache)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                External Services                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   AI/ML     │  │    CDN      │  │  Analytics  │        │
│  │ Processing  │  │  (Assets)   │  │   (Metrics) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy

```
App (Root)
├── AuthProvider
│   ├── SidebarProvider
│   │   ├── QueryClientProvider
│   │   │   ├── Router
│   │   │   │   ├── PublicRoutes
│   │   │   │   │   ├── Index (Landing)
│   │   │   │   │   ├── Login
│   │   │   │   │   └── Signup
│   │   │   │   ├── ProtectedRoutes (Teacher)
│   │   │   │   │   ├── Dashboard
│   │   │   │   │   ├── ClassroomsPage
│   │   │   │   │   ├── TestManagement
│   │   │   │   │   ├── Analytics
│   │   │   │   │   └── Calendar
│   │   │   │   └── ProtectedRoutes (Student)
│   │   │   │       ├── Dashboard2
│   │   │   │       ├── ClassView
│   │   │   │       ├── TestTaking
│   │   │   │       ├── MyTests
│   │   │   │       └── CodeTest
│   │   │   ├── ToastProvider
│   │   │   └── TooltipProvider
```

### State Management Strategy

```typescript
// Global State (React Context)
interface AppState {
  auth: AuthState;
  sidebar: SidebarState;
  theme: ThemeState;
}

// Server State (Tanstack Query)
interface ServerState {
  users: User[];
  classrooms: Classroom[];
  tests: Test[];
  analytics: AnalyticsData;
}

// Local State (useState/useReducer)
interface ComponentState {
  formData: FormState;
  uiState: UIState;
  localPreferences: PreferencesState;
}
```

### Data Flow Pattern

```
User Action → Component → Custom Hook → API Service → Server → Database
     ↑                                                              │
     └─────── UI Update ← State Update ← Response ← Query ←────────┘
```

## Backend Architecture

### Service-Oriented Design

```typescript
// Service Layer Structure
interface ServiceLayer {
  userService: {
    create(userData: CreateUserData): Promise<User>;
    findById(id: string): Promise<User | null>;
    update(id: string, data: UpdateUserData): Promise<User>;
    delete(id: string): Promise<void>;
  };
  
  classroomService: {
    create(classroomData: CreateClassroomData): Promise<Classroom>;
    findByTeacher(teacherId: string): Promise<Classroom[]>;
    addStudent(classroomId: string, studentId: string): Promise<void>;
    removeStudent(classroomId: string, studentId: string): Promise<void>;
  };
  
  testService: {
    create(testData: CreateTestData): Promise<Test>;
    findByClassroom(classroomId: string): Promise<Test[]>;
    submit(submission: TestSubmission): Promise<TestResult>;
    grade(testId: string, submissions: Submission[]): Promise<GradingResult>;
  };
}
```

### API Design Patterns

#### RESTful Endpoints

```typescript
// Resource-based routing
GET    /api/classrooms           // List classrooms
POST   /api/classrooms           // Create classroom
GET    /api/classrooms/:id       // Get classroom
PUT    /api/classrooms/:id       // Update classroom
DELETE /api/classrooms/:id       // Delete classroom

// Nested resources
GET    /api/classrooms/:id/students    // Get classroom students
POST   /api/classrooms/:id/students    // Add student to classroom
DELETE /api/classrooms/:id/students/:studentId  // Remove student

// Actions on resources
POST   /api/tests/:id/submit     // Submit test
POST   /api/tests/:id/grade      // Grade test
POST   /api/tests/:id/publish    // Publish test results
```

#### Middleware Stack

```typescript
// Express middleware pipeline
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);
app.use(authMiddleware);
app.use(validationMiddleware);
app.use(loggingMiddleware);
app.use('/api', apiRoutes);
app.use(errorHandler);
```

## Database Design

### Entity Relationship Diagram

```
Users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── role (ENUM: teacher, student)
├── profile (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

Classrooms
├── id (UUID, PK)
├── name (VARCHAR)
├── description (TEXT)
├── teacher_id (UUID, FK → Users.id)
├── settings (JSONB)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

ClassroomStudents (Junction Table)
├── classroom_id (UUID, FK → Classrooms.id)
├── student_id (UUID, FK → Users.id)
├── enrolled_at (TIMESTAMP)
└── status (ENUM: active, inactive)

Tests
├── id (UUID, PK)
├── title (VARCHAR)
├── description (TEXT)
├── classroom_id (UUID, FK → Classrooms.id)
├── questions (JSONB)
├── settings (JSONB)
├── created_at (TIMESTAMP)
├── scheduled_at (TIMESTAMP)
└── status (ENUM: draft, published, active, completed)

TestSubmissions
├── id (UUID, PK)
├── test_id (UUID, FK → Tests.id)
├── student_id (UUID, FK → Users.id)
├── answers (JSONB)
├── score (DECIMAL)
├── submitted_at (TIMESTAMP)
├── graded_at (TIMESTAMP)
└── proctoring_data (JSONB)

ProctoringViolations
├── id (UUID, PK)
├── submission_id (UUID, FK → TestSubmissions.id)
├── violation_type (VARCHAR)
├── severity (DECIMAL)
├── timestamp (TIMESTAMP)
├── metadata (JSONB)
└── resolved (BOOLEAN)
```

### Data Access Patterns

```typescript
// Repository Pattern
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(criteria: FindCriteria): Promise<T[]>;
  create(data: CreateData<T>): Promise<T>;
  update(id: string, data: UpdateData<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Query Builder Pattern
const query = supabase
  .from('tests')
  .select(`
    *,
    classroom:classrooms(name, teacher_id),
    submissions:test_submissions(count)
  `)
  .eq('classroom.teacher_id', teacherId)
  .order('created_at', { ascending: false });
```

## AI Proctoring Architecture

### Processing Pipeline

```
Camera Feed → Frame Capture → Preprocessing → Detection Models → Analysis → Violation Detection
     │                                                                            │
     ▼                                                                            ▼
Audio Input → Audio Processing → Feature Extraction → Classification → Alert System
```

### Model Architecture

```python
class ProctoringPipeline:
    def __init__(self):
        self.face_detector = DlibFaceDetector()
        self.landmark_predictor = FaceLandmarkPredictor()
        self.gaze_estimator = GazeEstimator()
        self.object_detector = YOLOObjectDetector()
        self.audio_processor = AudioViolationDetector()
        self.violation_analyzer = ViolationAnalyzer()
    
    def process_frame(self, frame, audio_data):
        # Computer vision processing
        faces = self.face_detector.detect(frame)
        landmarks = self.landmark_predictor.predict(frame, faces)
        gaze_direction = self.gaze_estimator.estimate(landmarks)
        objects = self.object_detector.detect(frame)
        
        # Audio processing
        audio_violations = self.audio_processor.analyze(audio_data)
        
        # Violation analysis
        violations = self.violation_analyzer.analyze({
            'faces': faces,
            'gaze': gaze_direction,
            'objects': objects,
            'audio': audio_violations
        })
        
        return violations
```

### Real-time Communication

```typescript
// WebSocket event handling
interface ProctoringEvents {
  'proctoring:start': (data: { testId: string; userId: string }) => void;
  'proctoring:frame': (data: { frame: string; timestamp: number }) => void;
  'proctoring:violation': (data: ViolationData) => void;
  'proctoring:end': (data: { testId: string; summary: ProctoringSummary }) => void;
}

// Client-side WebSocket manager
class ProctoringWebSocket {
  private socket: Socket;
  
  startSession(testId: string) {
    this.socket.emit('proctoring:start', { testId, userId: this.userId });
  }
  
  sendFrame(frameData: string) {
    this.socket.emit('proctoring:frame', {
      frame: frameData,
      timestamp: Date.now()
    });
  }
  
  onViolation(callback: (violation: ViolationData) => void) {
    this.socket.on('proctoring:violation', callback);
  }
}
```

## Security Architecture

### Authentication Flow

```
Client → Login Request → Server → Supabase Auth → JWT Token → Client Storage
   │                                    │                        │
   └── Subsequent Requests ──────────────┼────────────────────────┘
                                        │
                                        ▼
                                   Token Validation → Role Check → Resource Access
```

### Authorization Model

```typescript
// Role-based access control
interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, any>;
}

const rolePermissions: Record<UserRole, Permission[]> = {
  teacher: [
    { resource: 'classroom', action: 'create' },
    { resource: 'classroom', action: 'read', conditions: { teacher_id: 'self' } },
    { resource: 'test', action: 'create' },
    { resource: 'test', action: 'read', conditions: { classroom: { teacher_id: 'self' } } },
    { resource: 'analytics', action: 'read', conditions: { classroom: { teacher_id: 'self' } } }
  ],
  student: [
    { resource: 'classroom', action: 'read', conditions: { students: { includes: 'self' } } },
    { resource: 'test', action: 'read', conditions: { classroom: { students: { includes: 'self' } } } },
    { resource: 'test', action: 'update', conditions: { type: 'submission' } }
  ]
};
```

### Data Protection

```typescript
// Data encryption and sanitization
interface DataProtection {
  encryption: {
    atRest: 'AES-256';
    inTransit: 'TLS 1.3';
    keys: 'AWS KMS' | 'Supabase Vault';
  };
  
  sanitization: {
    input: 'DOMPurify + Zod validation';
    output: 'Content Security Policy';
    sql: 'Parameterized queries';
  };
  
  privacy: {
    pii: 'Encrypted storage';
    logs: 'Anonymized identifiers';
    retention: '7 years (configurable)';
  };
}
```

## Performance Architecture

### Caching Strategy

```typescript
// Multi-layer caching
interface CachingLayers {
  browser: {
    type: 'Service Worker + IndexedDB';
    duration: '24 hours';
    content: 'Static assets, API responses';
  };
  
  cdn: {
    type: 'CloudFlare';
    duration: '1 year (static), 5 minutes (dynamic)';
    content: 'Images, scripts, styles';
  };
  
  application: {
    type: 'Redis';
    duration: '1 hour';
    content: 'Database queries, session data';
  };
  
  database: {
    type: 'PostgreSQL query cache';
    duration: 'Automatic';
    content: 'Query results';
  };
}
```

### Load Balancing

```yaml
# Load balancer configuration
upstream app_servers {
    least_conn;
    server app1:3000 weight=3;
    server app2:3000 weight=3;
    server app3:3000 weight=2;
    keepalive 32;
}

server {
    location / {
        proxy_pass http://app_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Database Optimization

```sql
-- Indexing strategy
CREATE INDEX CONCURRENTLY idx_tests_classroom_id ON tests(classroom_id);
CREATE INDEX CONCURRENTLY idx_submissions_test_student ON test_submissions(test_id, student_id);
CREATE INDEX CONCURRENTLY idx_violations_submission_type ON proctoring_violations(submission_id, violation_type);

-- Partitioning for large tables
CREATE TABLE proctoring_violations_2024 PARTITION OF proctoring_violations
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Query optimization
EXPLAIN (ANALYZE, BUFFERS) 
SELECT t.*, c.name as classroom_name
FROM tests t
JOIN classrooms c ON t.classroom_id = c.id
WHERE c.teacher_id = $1
ORDER BY t.created_at DESC
LIMIT 20;
```

## Scalability Considerations

### Horizontal Scaling

```typescript
// Microservices architecture (future consideration)
interface MicroservicesArchitecture {
  services: {
    userService: { port: 3001; database: 'users_db' };
    classroomService: { port: 3002; database: 'classrooms_db' };
    testService: { port: 3003; database: 'tests_db' };
    proctoringService: { port: 3004; database: 'proctoring_db' };
    analyticsService: { port: 3005; database: 'analytics_db' };
  };
  
  communication: {
    synchronous: 'HTTP/gRPC';
    asynchronous: 'Message Queue (Redis/RabbitMQ)';
    discovery: 'Service Registry (Consul/etcd)';
  };
  
  dataConsistency: {
    pattern: 'Eventual Consistency';
    transactions: 'Saga Pattern';
    events: 'Event Sourcing';
  };
}
```

### Auto-scaling Configuration

```yaml
# Kubernetes HPA configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ScholarAI-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ScholarAI-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Monitoring and Observability

### Metrics Collection

```typescript
// Application metrics
interface MetricsCollection {
  performance: {
    responseTime: 'Histogram';
    throughput: 'Counter';
    errorRate: 'Gauge';
    availability: 'Gauge';
  };
  
  business: {
    activeUsers: 'Gauge';
    testsCompleted: 'Counter';
    violationsDetected: 'Counter';
    classroomsCreated: 'Counter';
  };
  
  infrastructure: {
    cpuUsage: 'Gauge';
    memoryUsage: 'Gauge';
    diskUsage: 'Gauge';
    networkLatency: 'Histogram';
  };
}
```

### Logging Strategy

```typescript
// Structured logging
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;
  traceId: string;
  userId?: string;
  action: string;
  metadata: Record<string, any>;
  duration?: number;
  error?: {
    message: string;
    stack: string;
    code: string;
  };
}

// Log aggregation and analysis
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});
```

## Design Patterns and Principles

### Frontend Patterns

- **Component Composition**: Building complex UIs from simple, reusable components
- **Custom Hooks**: Encapsulating stateful logic and side effects
- **Provider Pattern**: Managing global state and context
- **Render Props**: Sharing code between components
- **Higher-Order Components**: Cross-cutting concerns

### Backend Patterns

- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic encapsulation
- **Middleware Pattern**: Request/response processing pipeline
- **Factory Pattern**: Object creation abstraction
- **Observer Pattern**: Event-driven architecture

### SOLID Principles Implementation

```typescript
// Single Responsibility Principle
class UserValidator {
  validate(userData: UserData): ValidationResult {
    // Only responsible for user validation
  }
}

// Open/Closed Principle
interface NotificationService {
  send(message: string, recipient: string): Promise<void>;
}

class EmailNotificationService implements NotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Email implementation
  }
}

// Dependency Inversion Principle
class UserService {
  constructor(
    private userRepository: UserRepository,
    private notificationService: NotificationService
  ) {}
}
```

---

This architecture documentation provides a comprehensive overview of the system design. For implementation details, refer to the specific component documentation in their respective folders.
