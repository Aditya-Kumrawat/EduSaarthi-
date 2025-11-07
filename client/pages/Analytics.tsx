import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FloatingSidebar } from "@/components/FloatingSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { FloatingTopBar } from "@/components/FloatingTopBar";
import { analyticsService, AnalyticsData } from "@/lib/analyticsService";
import { seedAnalyticsData } from "@/lib/seedData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

export default function Analytics() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  // Real-time data subscription
  useEffect(() => {
    const unsubscribe = analyticsService.subscribeToAnalytics((data) => {
      setAnalyticsData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Transform real data for charts
  const monthlyRevenueData = analyticsData?.submissionTrends.map(trend => ({
    month: new Date(trend.date).toLocaleDateString('en-US', { month: 'short' }),
    revenue: trend.submissions * 100, // Mock revenue calculation
    orders: trend.submissions,
    customers: trend.students
  })) || [];

  // Assignment performance data
  const categoryData = analyticsData?.assignmentStats.slice(0, 6).map((assignment, index) => ({
    category: assignment.title.length > 15 ? assignment.title.substring(0, 15) + '...' : assignment.title,
    sales: assignment.submissions,
    growth: assignment.completionRate - 50, // Mock growth calculation
    color: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 6]
  })) || [];

  // Assignment status distribution
  const trafficData = analyticsData ? [
    { name: "Completed", value: Math.round(analyticsData.completionRate), color: "#10b981" },
    { name: "In Progress", value: Math.round((100 - analyticsData.completionRate) * 0.7), color: "#f59e0b" },
    { name: "Not Started", value: Math.round((100 - analyticsData.completionRate) * 0.3), color: "#ef4444" },
  ] : [];

  // Performance metrics data
  const performanceData = analyticsData ? [
    { metric: "Completion Rate", value: Math.round(analyticsData.completionRate), target: 90, color: "#8b5cf6" },
    { metric: "Average Grade", value: Math.round(analyticsData.averageGrade), target: 85, color: "#10b981" },
    { metric: "Student Engagement", value: Math.min(100, analyticsData.totalStudents * 10), target: 95, color: "#06b6d4" },
    { metric: "Assignment Quality", value: Math.min(100, analyticsData.activeAssignments * 15), target: 98, color: "#f59e0b" },
  ] : [];

  // Hourly engagement data
  const hourlyData = analyticsData?.studentEngagement || [];

  const gradientOffsets = [
    { id: "purpleGradient", colors: ["#8b5cf6", "#6366f1"] },
    { id: "blueGradient", colors: ["#06b6d4", "#0891b2"] },
    { id: "greenGradient", colors: ["#10b981", "#059669"] },
    { id: "orangeGradient", colors: ["#f59e0b", "#d97706"] },
    { id: "redGradient", colors: ["#ef4444", "#dc2626"] },
  ];

  return (
    <div
      className="dashboard-page min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0f0f0 0%, #f5f5f5 50%, #ebebeb 100%)",
      }}
    >
      <FloatingSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <FloatingTopBar isCollapsed={isCollapsed} />

      {/* Main Content */}
      <motion.div
        className={`transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-72"} pt-28 p-6`}
        animate={{ marginLeft: isCollapsed ? 80 : 272 }}
      >
        {/* Header */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dashboard-title">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1 dashboard-text">
                Comprehensive insights and performance metrics for your business
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-white/60 backdrop-blur-sm rounded-2xl p-1 border border-white/30">
                {["7d", "30d", "90d", "1y"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedPeriod === period
                        ? "bg-purple-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Key Metrics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {(analyticsData ? [
            {
              title: "Total Students",
              value: analyticsData.totalStudents.toString(),
              change: "+12.5%",
              trending: "up",
              color: "purple",
            },
            {
              title: "Active Assignments",
              value: analyticsData.activeAssignments.toString(),
              change: "+8.2%",
              trending: "up",
              color: "blue",
            },
            {
              title: "Completion Rate",
              value: `${analyticsData.completionRate.toFixed(1)}%`,
              change: analyticsData.completionRate > 75 ? "+5.3%" : "-2.1%",
              trending: analyticsData.completionRate > 75 ? "up" : "down",
              color: "green",
            },
            {
              title: "Average Grade",
              value: analyticsData.averageGrade.toFixed(1),
              change: "+5.1%",
              trending: "up",
              color: "orange",
            },
          ] : []).map((metric, index) => (
            <motion.div
              key={metric.title}
              className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 border border-white/30"
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100`}
                >
                  {metric.trending === "up" ? (
                    <TrendingUp
                      className={`w-6 h-6 text-${metric.color}-600`}
                    />
                  ) : (
                    <TrendingDown
                      className={`w-6 h-6 text-${metric.color}-600`}
                    />
                  )}
                </div>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    metric.trending === "up"
                      ? "text-green-600 bg-green-50"
                      : "text-red-600 bg-red-50"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {metric.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue Bar Chart */}
          <motion.div
            className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/30"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Submission Trends
              </h3>
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.9} />
                      <stop
                        offset="95%"
                        stopColor="#c4b5fd"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={true}
                    tickLine={true}
                    type="category"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={true}
                    tickLine={true}
                    type="number"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="url(#revenueBar)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Performance */}
          <motion.div
            className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/30"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Assignment Performance
              </h3>
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <motion.div
                  key={category.category}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {category.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {category.sales} pts
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          category.growth > 0
                            ? "text-green-600 bg-green-50"
                            : "text-red-600 bg-red-50"
                        }`}
                      >
                        {category.growth > 0 ? "+" : ""}
                        {category.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${category.color}99, ${category.color})`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.sales / 67000) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Traffic Sources & Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Sources Pie Chart */}
          <motion.div
            className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/30"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Assignment Status
              </h3>
              <PieChartIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {trafficData.map((source, index) => (
                <div key={source.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-xs text-gray-600">{source.name}</span>
                  <span className="text-xs font-medium text-gray-900">
                    {source.value}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Metrics Radial Chart */}
          <motion.div
            className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/30"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Performance Metrics
              </h3>
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={performanceData}
                  innerRadius="10%"
                  outerRadius="80%"
                >
                  <RadialBar dataKey="value" cornerRadius={10} fill="#8b5cf6" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {performanceData.map((metric, index) => (
                <div
                  key={metric.metric}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {metric.value}%
                    </span>
                    <span className="text-xs text-gray-500">
                      / {metric.target}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Hourly Activity Line Chart */}
        <motion.div
          className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/30"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Student Activity (24h)
            </h3>
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient
                    id="usersGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={true}
                  tickLine={true}
                  type="category"
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={true}
                  tickLine={true}
                  type="number"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#8b5cf6"
                  fill="url(#usersGradient)"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", strokeWidth: 0, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
