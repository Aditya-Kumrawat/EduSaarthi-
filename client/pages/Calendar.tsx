import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  Search,
  Bell,
  BookOpen,
  Video,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Star,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  type: "class" | "assignment" | "exam" | "meeting" | "deadline";
  time: string;
  endTime?: string;
  location?: string;
  description?: string;
  color: string;
  teacher?: string;
  isImportant?: boolean;
  isCompleted?: boolean;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function Calendar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const location = useLocation();

  // Detect user type based on current route
  const userType = location.pathname.startsWith("/dashboard2")
    ? "student"
    : "teacher";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Sample events
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Advanced Mathematics",
      type: "class",
      time: "09:00",
      endTime: "10:30",
      location: "Room 201",
      teacher: "Dr. Sarah Johnson",
      color: "bg-blue-500",
      description: "Calculus integration techniques",
    },
    {
      id: "2",
      title: "Physics Lab Report Due",
      type: "assignment",
      time: "23:59",
      color: "bg-orange-500",
      isImportant: true,
      description: "Submit quantum mechanics experiment report",
    },
    {
      id: "3",
      title: "Computer Science Project",
      type: "deadline",
      time: "18:00",
      color: "bg-red-500",
      isImportant: true,
      description: "Final submission for AI chatbot project",
    },
    {
      id: "4",
      title: "Study Group - Linear Algebra",
      type: "meeting",
      time: "14:00",
      endTime: "16:00",
      location: "Library Room 3",
      color: "bg-green-500",
      description: "Group study session for upcoming exam",
    },
    {
      id: "5",
      title: "Midterm Exam - Organic Chemistry",
      type: "exam",
      time: "10:00",
      endTime: "12:00",
      location: "Hall A",
      color: "bg-purple-500",
      isImportant: true,
      description: "Comprehensive exam covering chapters 1-8",
    },
  ];

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      // Filter events for this date (simplified - in real app you'd check actual dates)
      const dayEvents =
        i === 15
          ? [events[0], events[1]]
          : i === 18
            ? [events[2]]
            : i === 20
              ? [events[3]]
              : i === 25
                ? [events[4]]
                : [];

      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const upcomingEvents = events.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userType={userType}
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600">
              Manage your schedule, assignments, and important dates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Calendar View */}
          <motion.div
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Calendar Header */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]}{" "}
                    {currentDate.getFullYear()}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                  >
                    Month
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                  >
                    Week
                  </Button>
                  <Button
                    variant={viewMode === "day" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                  >
                    Day
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={index}
                    className={`p-2 min-h-24 border border-gray-100 rounded-lg cursor-pointer transition-all duration-200 ${
                      day.isCurrentMonth
                        ? "bg-white hover:bg-blue-50"
                        : "bg-gray-50 text-gray-400"
                    } ${
                      day.isToday
                        ? "bg-blue-100 border-blue-300 ring-2 ring-blue-200"
                        : ""
                    }`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedDate(new Date())}
                  >
                    <div
                      className={`text-sm font-medium mb-1 ${
                        day.isToday ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {day.date}
                    </div>
                    <div className="space-y-1">
                      {day.events.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`text-xs px-1 py-0.5 rounded text-white truncate ${event.color}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Sidebar Info */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Today's Schedule */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Today's Schedule</h3>
              </div>

              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${event.color} mt-1 flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {event.time} {event.endTime && `- ${event.endTime}`}
                      </p>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                    {event.isImportant && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </motion.div>
                ))}
              </div>

              <Button variant="ghost" className="w-full mt-4 text-sm">
                View All Events
              </Button>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">This Week</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Classes</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">Assignments</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">5</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-600">Exams</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">2</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Meetings</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">3</span>
                </div>
              </div>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">Urgent Deadlines</h3>
              </div>

              <div className="space-y-3">
                {events
                  .filter((e) => e.isImportant)
                  .slice(0, 2)
                  .map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-red-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          Due {event.time}
                        </p>
                        {event.description && (
                          <p className="text-xs text-red-700 mt-1 truncate">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Study Session
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Set Reminder
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Join Online Class
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
