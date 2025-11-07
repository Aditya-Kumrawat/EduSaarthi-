# Frontend Documentation

This document covers the React frontend architecture, components, and development guidelines for the ScholarAI platform.

## Architecture Overview

The frontend is built as a Single Page Application (SPA) using React 18 with TypeScript, featuring:

- **React Router 6** for client-side routing
- **TailwindCSS 3** for styling
- **Radix UI** for accessible components
- **Tanstack Query** for server state management
- **Vite** for fast development and building

## Project Structure

```
client/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Radix + custom)
│   ├── AnomalyDetection.tsx
│   ├── AssignmentAnalysisModal.tsx
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   └── SidebarContext.tsx
├── hooks/               # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/                 # Utility libraries
│   ├── analysisStorage.ts
│   ├── analyticsService.ts
│   ├── classroomOperations.ts
│   └── utils.ts
├── pages/               # Route components
│   ├── Index.tsx        # Landing page
│   ├── Login.tsx
│   ├── Dashboard.tsx    # Teacher dashboard
│   ├── Dashboard2.tsx   # Student dashboard
│   └── ...
├── App.tsx              # Main app component with routing
├── main.tsx             # Application entry point
└── global.css           # Global styles and Tailwind imports
```

## Routing System

The application uses React Router 6 with role-based route protection:

### Route Types

1. **Public Routes**: Accessible without authentication
   - `/` - Landing page
   - `/login` - Login page
   - `/signup` - Registration page

2. **Teacher Routes**: Require teacher role
   - `/dashboard` - Teacher dashboard
   - `/dashboard/classrooms` - Classroom management
   - `/dashboard/analytics` - Performance analytics
   - `/dashboard/tests` - Test management

3. **Student Routes**: Require student role
   - `/dashboard2` - Student dashboard
   - `/dashboard2/classrooms` - Available classrooms
   - `/dashboard2/tests` - Available tests
   - `/dashboard2/test/:testId` - Test taking interface

### Route Protection

```typescript
// Protected route wrapper
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute requiredRole="teacher">
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Public route wrapper
<Route 
  path="/login" 
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  } 
/>
```

## Component Architecture

### UI Components

Base UI components are built on Radix UI primitives with custom styling:

```typescript
// Example: Button component
import { Button as RadixButton } from "@radix-ui/react-button";
import { cn } from "@/lib/utils";

interface ButtonProps {
  variant?: "default" | "destructive" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  children: React.ReactNode;
}

export const Button = ({ variant = "default", size = "default", className, ...props }: ButtonProps) => {
  return (
    <RadixButton
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "border border-input hover:bg-accent": variant === "outline",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 px-3": size === "sm",
          "h-11 px-8": size === "lg",
        },
        className
      )}
      {...props}
    />
  );
};
```

### Feature Components

```typescript
// Example: Classroom management component
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { classroomService } from "@/lib/classroomOperations";

export const ClassroomManagement = () => {
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ["classrooms"],
    queryFn: classroomService.getClassrooms,
  });

  const createClassroomMutation = useMutation({
    mutationFn: classroomService.createClassroom,
    onSuccess: () => {
      // Invalidate and refetch classrooms
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });

  // Component implementation
};
```

## State Management

### React Context

Used for global application state:

```typescript
// AuthContext example
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

### Tanstack Query

Used for server state management:

```typescript
// Custom hook for fetching tests
export const useTests = (classroomId: string) => {
  return useQuery({
    queryKey: ["tests", classroomId],
    queryFn: () => testService.getTests(classroomId),
    enabled: !!classroomId,
  });
};

// Mutation for creating tests
export const useCreateTest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: testService.createTest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      toast.success("Test created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create test");
    },
  });
};
```

## Styling System

### TailwindCSS Configuration

```typescript
// tailwind.config.ts
export default {
  content: ["./client/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more colors
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### CSS Variables

```css
/* global.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark mode variables */
}
```

### Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage in components
<div className={cn("base-classes", { "conditional": condition }, props.className)} />
```

## Custom Hooks

### useAuth Hook

```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

### useMobile Hook

```typescript
export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};
```

## Form Handling

Using React Hook Form with Zod validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register("password")} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
};
```

## Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from "react";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));

// In routing
<Route 
  path="/dashboard" 
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  } 
/>
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from "react";

const ExpensiveComponent = memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, processed: true }));
  }, [data]);

  const handleUpdate = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleUpdate(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
});
```

## Testing

### Component Testing

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Development Guidelines

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)

### Import Organization

```typescript
// 1. React imports
import React, { useState, useEffect } from "react";

// 2. Third-party imports
import { useQuery } from "@tanstack/react-query";
import { Button } from "@radix-ui/react-button";

// 3. Internal imports (absolute paths)
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

// 4. Relative imports
import "./Component.css";
```

### TypeScript Best Practices

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  role: "teacher" | "student";
}

// Use type for unions and primitives
type Status = "loading" | "success" | "error";

// Use generics for reusable components
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

## Deployment

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Type checking
npm run typecheck

# Linting and formatting
npm run format.fix
```

### Environment Variables

```typescript
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_FIREBASE_API_KEY: string;
}
```

---

For more information, see:
- [Component Library](./components.md)
- [State Management Guide](./state-management.md)
- [Performance Guide](./performance.md)
