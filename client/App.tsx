import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "./contexts/SidebarContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import ClassView from "./pages/ClassView";
import Calendar from "./pages/Calendar";
import MyTests from "./pages/MyTests";
import TestTaking from "./pages/TestTaking";
import Analytics from "./pages/Analytics";
import Chatbot from "./pages/Chatbot";
import Community from "./pages/Community";
import CodeTest from "./pages/CodeTest";
import TestManagement from "./pages/TestManagement";
import NotFound from "./pages/NotFound";
import { ClassroomsPage } from "./pages/ClassroomsPage";
import AILessonStudio from "./pages/AILessonStudioNew";
import FontTest from "./pages/FontTest";
import AITestArena from "./pages/AITestArena";
import TestArena from "./pages/TestArena";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/font-test" element={<FontTest />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              
              {/* Teacher Routes */}
              <Route path="/dashboard" element={<ProtectedRoute requiredRole="teacher"><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/classrooms" element={<ProtectedRoute requiredRole="teacher"><ClassroomsPage /></ProtectedRoute>} />
              <Route path="/dashboard/analytics" element={<ProtectedRoute requiredRole="teacher"><Analytics /></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute requiredRole="teacher"><Calendar /></ProtectedRoute>} />
              <Route path="/dashboard/tests" element={<ProtectedRoute requiredRole="teacher"><TestManagement /></ProtectedRoute>} />
              <Route path="/dashboard/test/:testId" element={<ProtectedRoute requiredRole="teacher"><TestTaking /></ProtectedRoute>} />
              <Route path="/dashboard/chatbot" element={<ProtectedRoute requiredRole="teacher"><Chatbot /></ProtectedRoute>} />
              <Route path="/dashboard/community" element={<ProtectedRoute requiredRole="teacher"><Community /></ProtectedRoute>} />
              <Route path="/dashboard/ai-lesson-studio" element={<ProtectedRoute requiredRole="teacher"><AILessonStudio /></ProtectedRoute>} />
              
              {/* Student Routes */}
              <Route path="/dashboard2" element={<ProtectedRoute requiredRole="student"><Dashboard2 /></ProtectedRoute>} />
              <Route path="/dashboard2/classrooms" element={<ProtectedRoute requiredRole="student"><ClassroomsPage /></ProtectedRoute>} />
              <Route path="/dashboard2/class/:classId" element={<ProtectedRoute requiredRole="student"><ClassView /></ProtectedRoute>} />
              <Route path="/dashboard2/codetest" element={<ProtectedRoute requiredRole="student"><CodeTest /></ProtectedRoute>} />
              <Route path="/dashboard2/students" element={<ProtectedRoute requiredRole="student"><Dashboard2 /></ProtectedRoute>} />
              <Route path="/dashboard2/calendar" element={<ProtectedRoute requiredRole="student"><Calendar /></ProtectedRoute>} />
              <Route path="/dashboard2/tests" element={<ProtectedRoute requiredRole="student"><MyTests /></ProtectedRoute>} />
              <Route path="/dashboard2/test/:testId" element={<ProtectedRoute requiredRole="student"><TestTaking /></ProtectedRoute>} />
              <Route path="/dashboard2/chatbot" element={<ProtectedRoute requiredRole="student"><Chatbot /></ProtectedRoute>} />
              <Route path="/dashboard2/ai-lesson-studio" element={<ProtectedRoute requiredRole="student"><AILessonStudio /></ProtectedRoute>} />
              <Route path="/dashboard2/ai-test-arena" element={<ProtectedRoute requiredRole="student"><AITestArena /></ProtectedRoute>} />
              <Route path="/dashboard2/test-arena" element={<ProtectedRoute requiredRole="student"><TestArena /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
