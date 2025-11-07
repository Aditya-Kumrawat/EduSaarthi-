# API Documentation

This document provides comprehensive documentation for the ScholarAI platform API endpoints.

## Base URL

- **Development**: `http://localhost:8080/api`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses Supabase authentication with JWT tokens. Include the authorization header in your requests:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check

#### GET /api/ping
Simple health check endpoint to verify API availability.

**Response:**
```json
{
  "message": "pong",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Demo Endpoints

#### GET /api/demo
Demo endpoint showing basic API structure.

**Response:**
```json
{
  "message": "Hello from the API!",
  "data": {
    "version": "1.0.0",
    "environment": "development"
  }
}
```

### VAPI Proxy

#### POST /api/vapi-proxy
Proxy endpoint for VAPI AI voice interactions.

**Request Body:**
```json
{
  "message": "string",
  "sessionId": "string"
}
```

**Response:**
```json
{
  "response": "string",
  "sessionId": "string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server-side error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **AI processing endpoints**: 20 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Classroom
```typescript
interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  students: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Test
```typescript
interface Test {
  id: string;
  title: string;
  description: string;
  classroomId: string;
  questions: Question[];
  settings: {
    duration: number; // minutes
    allowedAttempts: number;
    proctoringEnabled: boolean;
  };
  createdAt: string;
  scheduledAt: string;
}
```

### Question
```typescript
interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'code';
  question: string;
  options?: string[]; // for multiple-choice
  correctAnswer?: string;
  points: number;
}
```

## WebSocket Events

The platform uses WebSocket connections for real-time features:

### Connection
```javascript
const socket = io('ws://localhost:8080');
```

### Events

#### Proctoring Events
```javascript
// Client to Server
socket.emit('proctoring:start', { testId, userId });
socket.emit('proctoring:violation', { type, severity, timestamp });
socket.emit('proctoring:end', { testId, userId });

// Server to Client
socket.on('proctoring:alert', (data) => {
  // Handle proctoring alert
});
```

#### Classroom Events
```javascript
// Join classroom
socket.emit('classroom:join', { classroomId });

// Real-time updates
socket.on('classroom:update', (data) => {
  // Handle classroom updates
});
```

## SDK Usage

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Example API call
async function fetchTests() {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('classroom_id', classroomId);
  
  if (error) throw error;
  return data;
}
```

### Python (for AI Proctoring)

```python
import requests
import json

class ScholarAIAPI:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def submit_proctoring_data(self, test_id, violations):
        endpoint = f"{self.base_url}/proctoring/violations"
        data = {
            'testId': test_id,
            'violations': violations
        }
        response = requests.post(endpoint, 
                               headers=self.headers, 
                               json=data)
        return response.json()
```

## Testing

### Unit Tests
```bash
npm test
```

### API Testing with curl
```bash
# Health check
curl -X GET http://localhost:8080/api/ping

# Demo endpoint
curl -X GET http://localhost:8080/api/demo
```

### Postman Collection
Import the Postman collection from `docs/api/ScholarAI-api.postman_collection.json` for interactive API testing.

## Versioning

The API follows semantic versioning (SemVer). Current version: `v1.0.0`

Version information is included in response headers:
```
X-API-Version: 1.0.0
```

## Support

For API support and questions:
- Check the [troubleshooting guide](../troubleshooting/README.md)
- Review [common issues](../troubleshooting/common-issues.md)
- Contact the development team

---

Last updated: 2024-01-01
