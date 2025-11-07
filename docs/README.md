# ScholarAI - AI-Powered Educational Platform

ScholarAI is a comprehensive educational platform that combines AI-powered proctoring, classroom management, and interactive learning tools. Built with modern web technologies, it provides separate dashboards for teachers and students with role-based access control.

## 🚀 Features

### For Teachers
- **Classroom Management**: Create and manage virtual classrooms
- **Test Management**: Create, schedule, and monitor tests with AI proctoring
- **Analytics Dashboard**: Track student performance and engagement
- **AI Chatbot**: Interactive assistant for educational support
- **Calendar Integration**: Schedule and manage academic events
- **Community Features**: Collaborate with other educators

### For Students
- **Interactive Dashboard**: Access courses, assignments, and resources
- **Test Taking**: Secure test environment with AI proctoring
- **Code Testing**: Programming assessment tools
- **Calendar View**: Track assignments and deadlines
- **AI Chatbot**: Get help and support
- **Class Participation**: Engage in virtual classroom activities

### AI Proctoring System
- **Face Detection**: Real-time face tracking and verification
- **Eye Gaze Tracking**: Monitor attention and focus
- **Object Detection**: Identify unauthorized items
- **Audio Monitoring**: Detect suspicious sounds
- **Behavior Analysis**: Track head movements and gestures
- **Violation Reporting**: Automated flagging of suspicious activities

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **React Router 6** (SPA mode)
- **TailwindCSS 3** for styling
- **Radix UI** component library
- **Vite** for build tooling
- **Tanstack Query** for state management

### Backend
- **Express.js** server
- **TypeScript** throughout
- **Supabase** for database and authentication
- **Firebase** for additional services
- **VAPI AI** for voice interactions

### AI/ML Components
- **Python** backend for AI processing
- **OpenCV** for computer vision
- **Dlib** for facial landmark detection
- **YOLO** for object detection
- **Audio processing** libraries

## 📁 Project Structure

```
ScholarAI/
├── client/                 # React frontend application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility libraries
├── server/                # Express backend
│   ├── routes/            # API route handlers
│   └── index.ts           # Server entry point
├── ai_proctoring_module/  # Python AI proctoring system
│   ├── proctoring_suite.py
│   ├── proctoring_lite.py
│   └── models/            # ML model files
├── shared/                # Shared TypeScript types
├── netlify/               # Netlify functions
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for AI proctoring)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ScholarAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api

## 📚 Documentation

- [API Documentation](./api/README.md)
- [Frontend Guide](./frontend/README.md)
- [AI Proctoring Setup](./ai-proctoring/README.md)
- [Deployment Guide](./deployment/README.md)
- [Architecture Overview](./architecture/README.md)
- [Contributing Guidelines](./contributing/README.md)

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id

# VAPI AI Configuration
VITE_VAPI_PUBLIC_KEY=your_vapi_public_key

# Server Configuration
PORT=8080
NODE_ENV=development
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run typecheck
```

## 🏗️ Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📦 Deployment

The application supports multiple deployment options:

- **Netlify**: Automated deployment with serverless functions
- **Vercel**: Edge deployment with API routes
- **Traditional hosting**: Build and serve static files
- **Docker**: Containerized deployment

See the [Deployment Guide](./deployment/README.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./contributing/README.md) for details on:

- Code style and standards
- Pull request process
- Issue reporting
- Development workflow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder for detailed guides
- **Issues**: Report bugs and feature requests on GitHub
- **Community**: Join our discussions for help and collaboration

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Enhanced AI proctoring capabilities
- **v1.2.0**: Improved UI/UX and performance optimizations

---

Built with ❤️ by the Quad Gamma team
