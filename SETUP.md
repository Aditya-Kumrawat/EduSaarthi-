# Hackwave Setup Guide

This guide will help you set up the Hackwave project locally with all required environment variables and API keys.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Supabase account (optional)
- VAPI account (for voice AI features)

## Quick Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd Hackwave-main
npm install
```

### 2. Environment Variables Setup

Copy the example environment file:

```bash
cp client/.env.example client/.env
```

### 3. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing project
3. Enable Authentication and Firestore
4. Get your Firebase configuration from Project Settings > General > Your apps
5. Update the following variables in `client/.env`:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Configure VAPI (Optional - for voice AI features)

1. Go to [VAPI Dashboard](https://dashboard.vapi.ai/account)
2. Get your API keys
3. Update in `client/.env`:

```env
VAPI_PRIVATE_KEY=sk_your_private_key_here
VITE_VAPI_PUBLIC_KEY=pk_your_public_key_here
```

### 5. Configure Supabase (Optional)

If using Supabase features:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Configure Make.com Webhooks (Optional)

For AI analysis features, set up Make.com webhooks:

```env
VITE_MAKE_SUBMISSION_WEBHOOK_URL=your_submission_webhook_url
VITE_MAKE_ANALYSIS_WEBHOOK_URL=your_analysis_webhook_url
VITE_MAKE_BATCH_ANALYSIS_WEBHOOK_URL=your_batch_analysis_webhook_url
```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts both the client and server on port 8080.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
client/                   # React frontend
├── pages/               # Route components
├── components/ui/       # UI component library
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utilities (Firebase, etc.)
└── .env               # Environment variables (not in git)

server/                  # Express backend
├── routes/             # API endpoints
└── index.ts           # Server setup

shared/                 # Shared types
└── api.ts             # API interfaces
```

## Security Notes

- **Never commit `.env` files** - they contain sensitive API keys
- The `.env.example` file shows the required format but uses placeholder values
- All sensitive configuration is loaded from environment variables
- Firebase config is now secure and uses environment variables

## Authentication

The app supports role-based authentication with:
- **Teachers**: Access to `/dashboard` routes
- **Students**: Access to `/dashboard2` routes

Default organization code for teacher signup: `1234`

## Troubleshooting

### Firebase Issues
- Ensure all Firebase environment variables are set correctly
- Check Firebase console for proper Authentication and Firestore setup
- Verify your domain is added to Firebase Auth authorized domains

### VAPI Issues
- Ensure you're using the correct private key (starts with `sk_`)
- Check VAPI dashboard for API key validity
- Server-side calls require `VAPI_PRIVATE_KEY`

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run typecheck`

## Support

For issues or questions, please check the documentation in the `docs/` folder or create an issue in the repository.
