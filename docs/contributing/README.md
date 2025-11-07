# Contributing Guidelines

Thank you for your interest in contributing to ScholarAI! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for AI proctoring)
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/ScholarAI.git
   cd ScholarAI
   ```

2. **Install Dependencies**
   ```bash
   npm install
   pip install -r requirements.txt
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Project Structure

```
ScholarAI/
├── client/              # React frontend
├── server/              # Express backend
├── ai_proctoring_module/ # Python AI components
├── shared/              # Shared TypeScript types
├── docs/                # Documentation
├── tests/               # Test files
└── scripts/             # Build and utility scripts
```

## Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add role-based access control
fix(proctoring): resolve camera permission issue
docs(api): update endpoint documentation
test(components): add unit tests for Button component
```

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### TypeScript/JavaScript

#### Code Style

```typescript
// Use PascalCase for components and interfaces
interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // Use camelCase for variables and functions
  const handleUserClick = useCallback(() => {
    // Implementation
  }, []);

  return (
    <div className="user-card">
      {/* JSX content */}
    </div>
  );
};

// Use descriptive names
const fetchUsersByClassroom = async (classroomId: string): Promise<User[]> => {
  // Implementation
};
```

#### ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Python (AI Proctoring)

#### Code Style

```python
# Follow PEP 8 guidelines
class FaceDetector:
    """Detects faces in video frames using Dlib."""
    
    def __init__(self, model_path: str) -> None:
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(model_path)
    
    def detect_faces(self, frame: np.ndarray) -> List[Face]:
        """
        Detect faces in the given frame.
        
        Args:
            frame: Input image frame
            
        Returns:
            List of detected faces with landmarks
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.detector(gray)
        
        return [self._extract_face_data(face, gray) for face in faces]
```

#### Type Hints

```python
from typing import List, Optional, Dict, Any, Union

def process_violations(
    violations: List[Dict[str, Any]], 
    threshold: float = 0.7
) -> Optional[ViolationReport]:
    """Process detected violations and generate report."""
    pass
```

### CSS/Styling

#### TailwindCSS Guidelines

```typescript
// Use semantic class names with Tailwind utilities
const Button = ({ variant = "primary", size = "md", children, ...props }) => {
  return (
    <button
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        // Variant styles
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "border border-input hover:bg-accent hover:text-accent-foreground": variant === "outline",
        },
        // Size styles
        {
          "h-9 px-3 text-sm": size === "sm",
          "h-10 px-4 py-2": size === "md",
          "h-11 px-8": size === "lg",
        }
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

## Testing Guidelines

### Frontend Testing

#### Unit Tests (Vitest + Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });
});
```

#### Integration Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClassroomList } from '@/components/ClassroomList';

describe('ClassroomList Integration', () => {
  it('fetches and displays classrooms', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ClassroomList />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Math 101')).toBeInTheDocument();
    });
  });
});
```

### Backend Testing

#### API Tests

```typescript
import request from 'supertest';
import { app } from '../server';

describe('Classroom API', () => {
  describe('GET /api/classrooms', () => {
    it('returns classrooms for authenticated teacher', async () => {
      const response = await request(app)
        .get('/api/classrooms')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('returns 401 for unauthenticated requests', async () => {
      await request(app)
        .get('/api/classrooms')
        .expect(401);
    });
  });
});
```

### Python Testing

#### Unit Tests (pytest)

```python
import pytest
import numpy as np
from ai_proctoring_module import FaceDetector

class TestFaceDetector:
    @pytest.fixture
    def face_detector(self):
        return FaceDetector('path/to/model.dat')
    
    @pytest.fixture
    def sample_frame(self):
        return np.zeros((480, 640, 3), dtype=np.uint8)
    
    def test_detect_faces_returns_list(self, face_detector, sample_frame):
        faces = face_detector.detect_faces(sample_frame)
        assert isinstance(faces, list)
    
    def test_detect_faces_with_no_faces(self, face_detector, sample_frame):
        faces = face_detector.detect_faces(sample_frame)
        assert len(faces) == 0
    
    @pytest.mark.parametrize("confidence", [0.5, 0.7, 0.9])
    def test_detection_with_different_confidence(self, face_detector, confidence):
        face_detector.set_confidence_threshold(confidence)
        assert face_detector.confidence_threshold == confidence
```

### Test Coverage

Maintain minimum test coverage:
- **Frontend**: 80% line coverage
- **Backend**: 85% line coverage
- **Critical paths**: 95% coverage

```bash
# Check coverage
npm run test:coverage
python -m pytest --cov=ai_proctoring_module --cov-report=html
```

## Pull Request Process

### Before Submitting

1. **Run all tests**
   ```bash
   npm test
   npm run typecheck
   npm run lint
   python -m pytest
   ```

2. **Update documentation** if needed

3. **Add changeset** for version tracking
   ```bash
   npx changeset add
   ```

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests that you ran to verify your changes.

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable):
Add screenshots to help explain your changes.
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer approval required
3. **Testing**: Manual testing for UI changes
4. **Documentation**: Ensure docs are updated

### Merge Requirements

- ✅ All CI checks passing
- ✅ At least 1 approving review
- ✅ No merge conflicts
- ✅ Branch is up to date with main

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10, macOS 12.0]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node.js version: [e.g. 18.12.0]
- Python version: [e.g. 3.9.7]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

### Security Issues

For security vulnerabilities, please email security@ScholarAI.com instead of creating a public issue.

## Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date with code changes
- Use proper markdown formatting

### Documentation Types

1. **API Documentation**: OpenAPI/Swagger specs
2. **Component Documentation**: Storybook stories
3. **User Guides**: Step-by-step instructions
4. **Developer Guides**: Technical implementation details

### Writing Guidelines

```markdown
# Use clear headings

## Provide context
Explain why something exists before explaining how it works.

## Include examples
```typescript
// Good: Show actual usage
const user = await userService.findById('123');

// Bad: Abstract example
const result = await service.method(param);
```

## Use consistent formatting
- **Bold** for UI elements
- `code` for technical terms
- > Blockquotes for important notes
```

## Community

### Communication Channels

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time chat and support
- **Email**: security@ScholarAI.com for security issues

### Getting Help

1. Check existing documentation
2. Search GitHub issues
3. Ask in GitHub Discussions
4. Join our Discord community

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Annual contributor highlights

## License

By contributing to ScholarAI, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to ScholarAI! Your efforts help make education more accessible and secure for everyone.
