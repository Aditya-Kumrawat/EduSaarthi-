# Deployment Guide

This guide covers various deployment options for the ScholarAI platform, from development to production environments.

## Deployment Options

### 1. Netlify (Recommended)

Netlify provides seamless deployment with serverless functions and automatic builds.

#### Prerequisites
- GitHub/GitLab repository
- Netlify account
- Environment variables configured

#### Setup Steps

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Deploy to Netlify"
   git push origin main
   ```

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Environment Variables**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_VAPI_PUBLIC_KEY=your_vapi_public_key
   ```

4. **Deploy**
   ```bash
   # Automatic deployment on git push
   # Or manual deployment via Netlify CLI
   npm install -g netlify-cli
   netlify deploy --prod
   ```

#### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 2. Vercel

Vercel offers excellent performance with edge deployment and API routes.

#### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Project**
   ```json
   // vercel.json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "handle": "filesystem"
       },
       {
         "src": "/api/(.*)",
         "dest": "/api/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### 3. Traditional VPS/Cloud Server

For more control over the deployment environment.

#### Prerequisites
- Ubuntu 20.04+ server
- Node.js 18+
- Nginx
- PM2 process manager

#### Setup Steps

1. **Server Preparation**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone <your-repo-url> /var/www/ScholarAI
   cd /var/www/ScholarAI
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **PM2 Configuration**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'ScholarAI',
       script: 'dist/server/node-build.mjs',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

4. **Nginx Configuration**
   ```nginx
   # /etc/nginx/sites-available/ScholarAI
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL Certificate**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

### 4. Docker Deployment

Containerized deployment for consistency across environments.

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Install Python for AI proctoring
RUN apk add --no-cache python3 py3-pip opencv-dev

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

EXPOSE 8080

CMD ["node", "dist/server/node-build.mjs"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

#### Deployment Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Update deployment
docker-compose pull
docker-compose up -d --force-recreate
```

## Environment Configuration

### Development Environment

```env
# .env.development
NODE_ENV=development
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=your_dev_supabase_url
VITE_SUPABASE_ANON_KEY=your_dev_supabase_key
```

### Staging Environment

```env
# .env.staging
NODE_ENV=staging
VITE_API_URL=https://staging.your-domain.com
VITE_SUPABASE_URL=your_staging_supabase_url
VITE_SUPABASE_ANON_KEY=your_staging_supabase_key
```

### Production Environment

```env
# .env.production
NODE_ENV=production
VITE_API_URL=https://your-domain.com
VITE_SUPABASE_URL=your_prod_supabase_url
VITE_SUPABASE_ANON_KEY=your_prod_supabase_key
```

## Database Setup

### Supabase Configuration

1. **Create Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project
   - Note the URL and anon key

2. **Database Schema**
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email VARCHAR UNIQUE NOT NULL,
     role VARCHAR CHECK (role IN ('teacher', 'student')),
     profile JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Classrooms table
   CREATE TABLE classrooms (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name VARCHAR NOT NULL,
     description TEXT,
     teacher_id UUID REFERENCES users(id),
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Tests table
   CREATE TABLE tests (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     title VARCHAR NOT NULL,
     description TEXT,
     classroom_id UUID REFERENCES classrooms(id),
     questions JSONB,
     settings JSONB,
     created_at TIMESTAMP DEFAULT NOW(),
     scheduled_at TIMESTAMP
   );
   ```

3. **Row Level Security**
   ```sql
   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "Users can view own profile" ON users
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Teachers can manage their classrooms" ON classrooms
     FOR ALL USING (teacher_id = auth.uid());
   ```

### Firebase Configuration

1. **Create Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project
   - Enable Authentication and Firestore

2. **Authentication Setup**
   ```javascript
   // firebase.config.js
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: process.env.VITE_FIREBASE_API_KEY,
     authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.VITE_FIREBASE_PROJECT_ID,
   };

   const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   ```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run typecheck

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
        env:
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test
    - npm run typecheck

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy:
  stage: deploy
  image: node:18
  script:
    - npm install -g netlify-cli
    - netlify deploy --prod --dir=dist
  only:
    - main
```

## Monitoring and Logging

### Application Monitoring

```javascript
// monitoring.js
import { createClient } from '@supabase/supabase-js';

class MonitoringService {
  constructor() {
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
  }

  async logError(error, context) {
    await this.supabase
      .from('error_logs')
      .insert({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      });
  }

  async logPerformance(metric, value) {
    await this.supabase
      .from('performance_metrics')
      .insert({
        metric,
        value,
        timestamp: new Date().toISOString()
      });
  }
}
```

### Health Checks

```javascript
// health.js
export const healthCheck = async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_apis: await checkExternalAPIs()
  };

  const isHealthy = Object.values(checks).every(check => check.status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
};
```

## Performance Optimization

### Caching Strategy

```javascript
// cache.js
const CACHE_DURATION = {
  static: 31536000,    // 1 year
  api: 300,            // 5 minutes
  dynamic: 60          // 1 minute
};

export const cacheHeaders = (type) => ({
  'Cache-Control': `public, max-age=${CACHE_DURATION[type]}`,
  'ETag': generateETag(),
  'Last-Modified': new Date().toUTCString()
});
```

### CDN Configuration

```javascript
// CDN setup for static assets
const CDN_CONFIG = {
  images: 'https://cdn.your-domain.com/images/',
  scripts: 'https://cdn.your-domain.com/js/',
  styles: 'https://cdn.your-domain.com/css/'
};
```

## Security Considerations

### HTTPS Configuration

```nginx
# SSL configuration
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
```

### Security Headers

```javascript
// security.js
export const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'"
};
```

## Backup and Recovery

### Database Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Supabase backup
pg_dump $DATABASE_URL > $BACKUP_DIR/supabase_$DATE.sql

# Upload to cloud storage
aws s3 cp $BACKUP_DIR/supabase_$DATE.sql s3://your-backup-bucket/
```

### Automated Backups

```yaml
# backup-cron.yml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:13
            command: ["/bin/bash", "-c", "pg_dump $DATABASE_URL > /backup/db_$(date +%Y%m%d).sql"]
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Environment Variables**
   ```bash
   # Check environment variables
   printenv | grep VITE_
   ```

3. **Database Connection**
   ```javascript
   // Test database connection
   const { data, error } = await supabase.from('users').select('count');
   console.log('DB Status:', error ? 'Error' : 'Connected');
   ```

### Logs and Debugging

```bash
# View application logs
pm2 logs ScholarAI

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# View system logs
journalctl -u nginx -f
```

---

For additional deployment support, see:
- [Environment Setup](./environment-setup.md)
- [Database Migration Guide](./database-migrations.md)
- [Performance Tuning](./performance-tuning.md)
