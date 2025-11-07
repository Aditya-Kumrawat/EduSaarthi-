# Troubleshooting Guide

This guide helps you resolve common issues when working with the ScholarAI platform.

## Quick Diagnostics

### System Health Check

Run this command to check your system setup:

```bash
# Check Node.js version
node --version  # Should be 18.0+

# Check npm version
npm --version

# Check Python version
python --version  # Should be 3.8+

# Check Git version
git --version
```

### Application Health Check

```bash
# Check if all dependencies are installed
npm ls --depth=0

# Check Python dependencies
pip list | grep -E "(opencv|dlib|numpy)"

# Test database connection
npm run test:db

# Test API endpoints
curl http://localhost:8080/api/ping
```

## Common Issues

### Installation Issues

#### Node.js and npm Issues

**Issue**: `npm install` fails with permission errors

**Solution**:
```bash
# Option 1: Use npx
npx npm install

# Option 2: Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Option 3: Use node version manager
# Install nvm and use it to manage Node.js versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Issue**: `gyp ERR! build error` during installation

**Solution**:
```bash
# Windows
npm install --global windows-build-tools
npm install --global node-gyp

# macOS
xcode-select --install

# Linux (Ubuntu/Debian)
sudo apt-get install build-essential python3-dev
```

**Issue**: `ENOSPC: System limit for number of file watchers reached`

**Solution**:
```bash
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Python Dependencies Issues

**Issue**: OpenCV installation fails

**Solution**:
```bash
# Try different OpenCV packages
pip uninstall opencv-python opencv-python-headless
pip install opencv-python-headless

# For ARM-based systems (M1 Mac, Raspberry Pi)
pip install opencv-python --no-binary opencv-python

# System-specific installations
# Ubuntu/Debian
sudo apt-get install python3-opencv libopencv-dev

# macOS
brew install opencv
pip install opencv-python

# Windows
pip install opencv-python
```

**Issue**: Dlib compilation errors

**Solution**:
```bash
# Install cmake first
pip install cmake

# For Windows
pip install dlib --no-cache-dir

# For macOS with M1
brew install dlib
pip install dlib

# For Linux
sudo apt-get install libdlib-dev
pip install dlib
```

**Issue**: Face landmark model not found

**Solution**:
```bash
cd ai_proctoring_module
python download_models.py --force

# Manual download if script fails
wget http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2
bunzip2 shape_predictor_68_face_landmarks.dat.bz2
mv shape_predictor_68_face_landmarks.dat shape_predictor_model/
```

### Development Server Issues

#### Frontend Server Issues

**Issue**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**Issue**: Hot reload not working

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart development server
npm run dev
```

**Issue**: Module resolution errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
npm run typecheck
```

#### Backend Server Issues

**Issue**: Express server won't start

**Solution**:
```bash
# Check for syntax errors
npm run typecheck

# Check environment variables
cat .env | grep -v "^#"

# Start with debug logging
DEBUG=* npm run dev
```

**Issue**: API endpoints returning 404

**Solution**:
```bash
# Verify route registration
grep -r "app.use\|app.get\|app.post" server/

# Check middleware order
# Ensure API routes are registered before catch-all route
```

### Database Issues

#### Supabase Connection Issues

**Issue**: "Invalid API key" error

**Solution**:
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Check if keys are correct in Supabase dashboard
# Settings > API > Project URL and anon public key
```

**Issue**: Row Level Security blocking queries

**Solution**:
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing policies
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

**Issue**: Database connection timeout

**Solution**:
```javascript
// Increase timeout in Supabase client
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

#### Firebase Issues

**Issue**: Firebase authentication not working

**Solution**:
```javascript
// Check Firebase configuration
console.log('Firebase config:', {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

// Verify authentication methods are enabled in Firebase console
// Authentication > Sign-in method > Enable Email/Password
```

**Issue**: Firestore permission denied

**Solution**:
```javascript
// Check Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### AI Proctoring Issues

#### Camera Access Issues

**Issue**: Camera permission denied

**Solution**:
```javascript
// Check browser permissions
navigator.permissions.query({ name: 'camera' }).then(result => {
  console.log('Camera permission:', result.state);
});

// Request permissions explicitly
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Camera access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.error('Camera access denied:', error);
  });
```

**Troubleshooting steps**:
1. Check if camera is being used by another application
2. Try different browsers (Chrome recommended)
3. Check system camera permissions
4. Restart browser and clear cache

**Issue**: Poor face detection performance

**Solution**:
```python
# Optimize detection parameters
detector = dlib.get_frontal_face_detector()

# Reduce image size for faster processing
def resize_frame(frame, max_width=640):
    height, width = frame.shape[:2]
    if width > max_width:
        ratio = max_width / width
        new_width = max_width
        new_height = int(height * ratio)
        return cv2.resize(frame, (new_width, new_height))
    return frame

# Use every nth frame for detection
frame_skip = 3  # Process every 3rd frame
if frame_count % frame_skip == 0:
    faces = detector(gray_frame)
```

#### Audio Processing Issues

**Issue**: Microphone not detected

**Solution**:
```python
import pyaudio

# List available audio devices
p = pyaudio.PyAudio()
for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f"Device {i}: {info['name']} - Inputs: {info['maxInputChannels']}")
p.terminate()

# Use specific device
device_index = 1  # Replace with correct device index
stream = p.open(
    format=pyaudio.paInt16,
    channels=1,
    rate=44100,
    input=True,
    input_device_index=device_index
)
```

### Performance Issues

#### Frontend Performance

**Issue**: Slow page loads

**Solution**:
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Enable code splitting
# In vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-button']
        }
      }
    }
  }
});
```

**Issue**: Memory leaks in React components

**Solution**:
```typescript
// Clean up subscriptions and timers
useEffect(() => {
  const subscription = someObservable.subscribe();
  const timer = setInterval(() => {}, 1000);
  
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, []);

// Use AbortController for fetch requests
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(response => response.json())
    .then(data => setData(data))
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    });
  
  return () => controller.abort();
}, []);
```

#### Backend Performance

**Issue**: Slow API responses

**Solution**:
```typescript
// Add request timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});

// Optimize database queries
// Use indexes
CREATE INDEX idx_tests_classroom_id ON tests(classroom_id);

// Use query optimization
const tests = await supabase
  .from('tests')
  .select('id, title, created_at')  // Only select needed fields
  .eq('classroom_id', classroomId)
  .order('created_at', { ascending: false })
  .limit(20);  // Limit results
```

### Build and Deployment Issues

#### Build Failures

**Issue**: TypeScript compilation errors

**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix common issues
# 1. Missing type definitions
npm install @types/node @types/react @types/react-dom

# 2. Strict mode issues
# In tsconfig.json, temporarily set "strict": false

# 3. Import/export issues
# Use explicit file extensions for imports
import { Component } from './Component.js';
```

**Issue**: Build size too large

**Solution**:
```typescript
// Optimize imports
// Bad: imports entire library
import * as _ from 'lodash';

// Good: import only what you need
import { debounce } from 'lodash';

// Use dynamic imports for large components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Configure build optimization
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

#### Deployment Issues

**Issue**: Environment variables not working in production

**Solution**:
```bash
# Verify environment variables are set
printenv | grep VITE_

# For Netlify
# Add variables in Site settings > Environment variables

# For Vercel
# Add variables in Project settings > Environment Variables

# Ensure variables start with VITE_ for client-side access
```

**Issue**: 404 errors on page refresh (SPA routing)

**Solution**:
```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# For Apache (.htaccess)
RewriteEngine On
RewriteRule ^(?!.*\.).*$ /index.html [L]

# For Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Debugging Tools

### Browser Developer Tools

```javascript
// Enable React Developer Tools
// Install React DevTools browser extension

// Debug React Query
// Install React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* Your app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

### Network Debugging

```bash
# Monitor network requests
# Use browser Network tab or tools like:

# curl for API testing
curl -X GET http://localhost:8080/api/ping \
  -H "Authorization: Bearer your-token"

# HTTPie for better formatting
http GET localhost:8080/api/ping Authorization:"Bearer your-token"
```

### Database Debugging

```sql
-- Monitor slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Getting Help

### Before Asking for Help

1. **Search existing issues**: Check GitHub issues for similar problems
2. **Check logs**: Look at browser console, server logs, and error messages
3. **Minimal reproduction**: Create a minimal example that reproduces the issue
4. **Environment details**: Include OS, Node.js version, browser version

### Information to Include

When reporting issues, include:

```bash
# System information
node --version
npm --version
python --version
git --version

# Package versions
npm ls react react-dom @vitejs/plugin-react
pip show opencv-python dlib numpy

# Error messages (full stack trace)
# Steps to reproduce
# Expected vs actual behavior
```

### Community Support

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues/new)
- **Discord**: Join our [community server](https://discord.gg/ScholarAI)
- **Stack Overflow**: Tag questions with `ScholarAI`
- **Email**: support@ScholarAI.com for urgent issues

### Professional Support

For enterprise customers:
- Priority support channel
- Dedicated support engineer
- Custom troubleshooting sessions
- Performance optimization consulting

---

If this guide doesn't solve your issue, please [create a detailed issue report](https://github.com/your-repo/issues/new/choose) and we'll help you resolve it!
