# Hackwave - AI-Powered Educational Platform

A comprehensive educational platform featuring AI-powered test creation, proctoring, lesson generation, and interactive learning tools.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Hackwave-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp client/.env.example client/.env
   ```
   Then edit `client/.env` with your actual API keys. See [SETUP.md](./SETUP.md) for detailed instructions.

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Features

- **AI Test Arena**: Create tests using AI with multiple question types
- **Smart Proctoring**: AI-powered test monitoring and violation detection
- **Lesson Studio**: Generate interactive lessons with AI
- **Voice AI Integration**: VAPI-powered voice interactions
- **Role-based Access**: Separate dashboards for teachers and students
- **Real-time Analytics**: Comprehensive test and student performance analytics
- **Community Features**: Discussion forums and collaboration tools

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + Node.js
- **Database**: Firebase Firestore + Supabase (optional)
- **Authentication**: Firebase Auth with role-based access
- **AI Integration**: Make.com webhooks + VAPI voice AI
- **UI Components**: Radix UI + shadcn/ui

## 📁 Project Structure

```
client/                   # React frontend application
├── pages/               # Route components (Index.tsx = home)
├── components/ui/       # Reusable UI component library
├── contexts/           # React contexts (Auth, Sidebar, etc.)
└── lib/               # Utilities (Firebase, Supabase, etc.)

server/                  # Express.js backend
├── routes/             # API endpoint handlers
└── index.ts           # Main server configuration

shared/                 # Shared TypeScript types
└── api.ts             # API interface definitions

docs/                   # Comprehensive documentation
├── setup/             # Setup and configuration guides
├── api/               # API documentation
├── security/          # Security guidelines
└── deployment/        # Deployment instructions
```

## 🔧 Configuration

### Required Environment Variables

See [SETUP.md](./SETUP.md) for complete setup instructions. Key variables include:

- **Firebase**: Authentication and database
- **VAPI**: Voice AI features (optional)
- **Make.com**: AI analysis webhooks (optional)
- **Supabase**: Additional database features (optional)

### Authentication Roles

- **Teachers**: Access to `/dashboard` routes, can create tests and manage classrooms
- **Students**: Access to `/dashboard2` routes, can take tests and view progress

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [API Documentation](./docs/api/README.md) - Backend API reference
- [Security Guide](./docs/security/README.md) - Security best practices
- [Deployment Guide](./docs/deployment/README.md) - Production deployment
- [Troubleshooting](./docs/troubleshooting/README.md) - Common issues and solutions

## 🚀 Deployment

### Development
```bash
npm run dev        # Start dev server (port 8080)
```

### Production
```bash
npm run build      # Build for production
npm start          # Start production server
```

### Cloud Deployment
- **Netlify**: Automatic deployment from git
- **Vercel**: Zero-config deployment
- **Docker**: Containerized deployment available

## 🔒 Security

- All API keys are stored in environment variables
- Firebase configuration uses environment variables
- Comprehensive `.gitignore` protects sensitive files
- Role-based access control throughout the application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Check the [troubleshooting guide](./docs/troubleshooting/README.md)
- Review the [documentation](./docs/)
- Create an issue for bugs or feature requests

---

**Note**: This repository has been secured for public sharing. All API keys and sensitive configuration have been moved to environment variables. Follow the [setup guide](./SETUP.md) to configure your local environment.
