# Setup Guide

This guide will help you set up the ScholarAI platform for development or production use.

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **Node.js**: Version 18.0 or higher
- **Python**: Version 3.8 or higher
- **Git**: Latest version
- **Memory**: Minimum 8GB RAM (16GB recommended)
- **Storage**: At least 5GB free space

### Required Accounts

1. **Supabase Account**: For database and authentication
2. **Firebase Account**: For additional services
3. **VAPI Account**: For AI voice interactions
4. **GitHub Account**: For version control

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ScholarAI.git
cd ScholarAI
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

For Windows users, you might need to install Visual Studio Build Tools:
```bash
npm install --global windows-build-tools
```

### 4. Download AI Models

```bash
cd ai_proctoring_module
python download_models.py
```

This will download:
- Dlib face landmark predictor model
- YOLO object detection weights
- Additional AI model files

## Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Get your project URL and anon key from Settings > API
4. Add to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication and Firestore
4. Get your config from Project Settings > General
5. Add to your `.env` file:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Configure VAPI

1. Sign up at [VAPI](https://vapi.ai)
2. Get your public key from the dashboard
3. Add to your `.env` file:

```env
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
```

### 5. Complete Environment File

Your final `.env` file should look like:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# VAPI Configuration
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key

# Development Configuration
NODE_ENV=development
PORT=8080
```

## Database Setup

### Supabase Database Schema

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR CHECK (role IN ('teacher', 'student')) NOT NULL,
  profile JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classrooms table
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classroom students junction table
CREATE TABLE classroom_students (
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  PRIMARY KEY (classroom_id, student_id)
);

-- Tests table
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  questions JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test submissions table
CREATE TABLE test_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB DEFAULT '{}',
  score DECIMAL(5,2),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  graded_at TIMESTAMP WITH TIME ZONE,
  proctoring_data JSONB DEFAULT '{}',
  UNIQUE(test_id, student_id)
);

-- Proctoring violations table
CREATE TABLE proctoring_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES test_submissions(id) ON DELETE CASCADE,
  violation_type VARCHAR NOT NULL,
  severity DECIMAL(3,2) NOT NULL CHECK (severity >= 0 AND severity <= 1),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX idx_tests_classroom_id ON tests(classroom_id);
CREATE INDEX idx_test_submissions_test_id ON test_submissions(test_id);
CREATE INDEX idx_test_submissions_student_id ON test_submissions(student_id);
CREATE INDEX idx_proctoring_violations_submission_id ON proctoring_violations(submission_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_violations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Teachers can manage their classrooms
CREATE POLICY "Teachers can view their classrooms" ON classrooms
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create classrooms" ON classrooms
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their classrooms" ON classrooms
  FOR UPDATE USING (teacher_id = auth.uid());

-- Students can view classrooms they're enrolled in
CREATE POLICY "Students can view enrolled classrooms" ON classrooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classroom_students 
      WHERE classroom_id = id AND student_id = auth.uid()
    )
  );

-- Classroom students policies
CREATE POLICY "Teachers can manage classroom students" ON classroom_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classrooms 
      WHERE id = classroom_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their enrollments" ON classroom_students
  FOR SELECT USING (student_id = auth.uid());
```

### Firebase Setup

1. Enable Authentication methods:
   - Email/Password
   - Google (optional)

2. Create Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Real-time chat and notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Development Server

### Start the Development Server

```bash
npm run dev
```

This will start:
- Frontend development server on `http://localhost:5173`
- Backend API server on `http://localhost:8080`

### Verify Installation

1. Open `http://localhost:5173` in your browser
2. You should see the ScholarAI landing page
3. Try creating an account and logging in
4. Check the browser console for any errors

## Testing the Setup

### Run Tests

```bash
# Frontend tests
npm test

# Type checking
npm run typecheck

# Python tests
cd ai_proctoring_module
python -m pytest
```

### Test AI Proctoring

```bash
cd ai_proctoring_module
python example_usage.py
```

This should open your camera and display face detection overlay.

## Common Issues and Solutions

### Node.js Issues

**Issue**: `node-gyp` build errors
```bash
# Windows
npm install --global windows-build-tools

# macOS
xcode-select --install

# Linux
sudo apt-get install build-essential
```

**Issue**: Permission errors on npm install
```bash
# Fix npm permissions
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Python Issues

**Issue**: OpenCV installation fails
```bash
# Ubuntu/Debian
sudo apt-get install python3-opencv

# macOS
brew install opencv

# Windows
pip install opencv-python-headless
```

**Issue**: Dlib compilation errors
```bash
# Install cmake first
pip install cmake
pip install dlib
```

### Camera/Microphone Issues

**Issue**: Camera access denied
- Check browser permissions
- Ensure camera is not being used by another application
- Try different browsers (Chrome recommended)

**Issue**: Microphone not working
- Check system audio permissions
- Verify microphone is set as default device

### Database Connection Issues

**Issue**: Supabase connection failed
- Verify URL and API key are correct
- Check if project is paused (free tier limitation)
- Ensure RLS policies are set up correctly

**Issue**: Firebase authentication not working
- Verify Firebase config is correct
- Check if authentication methods are enabled
- Ensure domain is added to authorized domains

## Production Setup

### Environment Variables for Production

```env
NODE_ENV=production
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-key
# ... other production variables
```

### Build for Production

```bash
npm run build
```

### Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use environment-specific keys
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure CORS for your domain only
5. **Rate Limiting**: Implement rate limiting for APIs

## Performance Optimization

### Frontend Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Backend Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Optimize database queries

## Monitoring and Logging

### Application Monitoring

```javascript
// Add to your app
import { analytics } from './lib/analytics';

// Track user actions
analytics.track('user_login', { userId, timestamp });
analytics.track('test_completed', { testId, score, duration });
```

### Error Tracking

```javascript
// Error boundary for React
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }
}
```

## Getting Help

If you encounter issues during setup:

1. Check the [troubleshooting guide](../troubleshooting/README.md)
2. Search existing [GitHub issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed error information
4. Join our [Discord community](https://discord.gg/ScholarAI) for real-time help

## Next Steps

After successful setup:

1. Read the [API documentation](../api/README.md)
2. Explore the [frontend guide](../frontend/README.md)
3. Check out the [contributing guidelines](../contributing/README.md)
4. Start building your first classroom!

---

Congratulations! You now have ScholarAI running locally. Happy coding! 🎉
