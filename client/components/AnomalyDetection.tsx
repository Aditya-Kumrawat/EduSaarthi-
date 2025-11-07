import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Shield,
  Eye,
  Brain,
  Clock,
  TrendingUp,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Monitor,
  FileText,
  MousePointer,
  Keyboard,
  Timer,
  Camera,
  Wifi,
  RefreshCw,
  Download,
  Filter,
  Search,
  Settings,
  Bell,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

interface StudentActivity {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  assessmentId: string;
  assessmentName: string;
  startTime: string;
  currentTime: string;
  status: "active" | "suspicious" | "flagged" | "completed";
  anomalies: AnomalyDetection[];
  behaviorScore: number;
  aiConfidence: number;
  screenActivity: {
    tabSwitches: number;
    copyPaste: number;
    idleTime: number;
    keyboardPattern: "normal" | "unusual" | "ai-like";
  };
  biometrics: {
    eyeTracking: "normal" | "distracted" | "off-screen";
    facialExpression: "focused" | "confused" | "suspicious";
    posture: "normal" | "unusual";
  };
}

interface AnomalyDetection {
  id: string;
  type: "ai_usage" | "tab_switching" | "copy_paste" | "suspicious_pattern" | "external_assistance";
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  description: string;
  confidence: number;
  evidence: string[];
}

interface AnomalyDetectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentActivity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isRealTimeActive, setIsRealTimeActive] = useState(true);
  const [alertCount, setAlertCount] = useState(0);

  // Initialize mock data
  useEffect(() => {
    const mockActivities: StudentActivity[] = [
      {
        id: "1",
        studentId: "s1",
        studentName: "Alex Thompson",
        studentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        assessmentId: "a1",
        assessmentName: "Mathematics Final Exam",
        startTime: "2024-01-15T10:00:00Z",
        currentTime: "2024-01-15T10:45:00Z",
        status: "flagged",
        behaviorScore: 25,
        aiConfidence: 87,
        screenActivity: {
          tabSwitches: 15,
          copyPaste: 8,
          idleTime: 45,
          keyboardPattern: "ai-like",
        },
        biometrics: {
          eyeTracking: "off-screen",
          facialExpression: "suspicious",
          posture: "unusual",
        },
        anomalies: [
          {
            id: "a1",
            type: "ai_usage",
            severity: "critical",
            timestamp: "2024-01-15T10:30:00Z",
            description: "Detected AI-generated text patterns in responses",
            confidence: 92,
            evidence: ["Unusual response speed", "Perfect grammar consistency", "Advanced vocabulary"],
          },
          {
            id: "a2",
            type: "tab_switching",
            severity: "high",
            timestamp: "2024-01-15T10:25:00Z",
            description: "Multiple suspicious tab switches detected",
            confidence: 78,
            evidence: ["15 tab switches in 5 minutes", "Consistent pattern"],
          },
        ],
      },
      {
        id: "2",
        studentId: "s2",
        studentName: "Sarah Johnson",
        studentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        assessmentId: "a1",
        assessmentName: "Mathematics Final Exam",
        startTime: "2024-01-15T10:00:00Z",
        currentTime: "2024-01-15T10:45:00Z",
        status: "suspicious",
        behaviorScore: 68,
        aiConfidence: 45,
        screenActivity: {
          tabSwitches: 3,
          copyPaste: 2,
          idleTime: 12,
          keyboardPattern: "unusual",
        },
        biometrics: {
          eyeTracking: "distracted",
          facialExpression: "confused",
          posture: "normal",
        },
        anomalies: [
          {
            id: "a3",
            type: "copy_paste",
            severity: "medium",
            timestamp: "2024-01-15T10:35:00Z",
            description: "Copy-paste activity detected",
            confidence: 65,
            evidence: ["2 paste operations", "External source indicators"],
          },
        ],
      },
      {
        id: "3",
        studentId: "s3",
        studentName: "Mike Wilson",
        studentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        assessmentId: "a1",
        assessmentName: "Mathematics Final Exam",
        startTime: "2024-01-15T10:00:00Z",
        currentTime: "2024-01-15T10:45:00Z",
        status: "active",
        behaviorScore: 95,
        aiConfidence: 12,
        screenActivity: {
          tabSwitches: 1,
          copyPaste: 0,
          idleTime: 8,
          keyboardPattern: "normal",
        },
        biometrics: {
          eyeTracking: "normal",
          facialExpression: "focused",
          posture: "normal",
        },
        anomalies: [],
      },
      {
        id: "4",
        studentId: "s4",
        studentName: "Emma Davis",
        studentAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
        assessmentId: "a1",
        assessmentName: "Mathematics Final Exam",
        startTime: "2024-01-15T10:00:00Z",
        currentTime: "2024-01-15T10:45:00Z",
        status: "completed",
        behaviorScore: 88,
        aiConfidence: 18,
        screenActivity: {
          tabSwitches: 0,
          copyPaste: 0,
          idleTime: 5,
          keyboardPattern: "normal",
        },
        biometrics: {
          eyeTracking: "normal",
          facialExpression: "focused",
          posture: "normal",
        },
        anomalies: [],
      },
    ];

    setStudentActivities(mockActivities);
    setAlertCount(mockActivities.filter(s => s.status === "flagged" || s.status === "suspicious").length);
  }, []);

  // Real-time updates simulation
  useEffect(() => {
    if (!isRealTimeActive) return;

    const interval = setInterval(() => {
      setStudentActivities(prev => 
        prev.map(student => ({
          ...student,
          currentTime: new Date().toISOString(),
          // Randomly update some metrics
          aiConfidence: Math.max(0, Math.min(100, student.aiConfidence + (Math.random() - 0.5) * 5)),
          screenActivity: {
            ...student.screenActivity,
            tabSwitches: student.screenActivity.tabSwitches + (Math.random() > 0.8 ? 1 : 0),
            copyPaste: student.screenActivity.copyPaste + (Math.random() > 0.9 ? 1 : 0),
          },
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isRealTimeActive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "suspicious": return "bg-yellow-100 text-yellow-800";
      case "flagged": return "bg-red-100 text-red-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4" />;
      case "suspicious": return <AlertTriangle className="w-4 h-4" />;
      case "flagged": return <XCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredActivities = studentActivities.filter(student => 
    filterStatus === "all" || student.status === filterStatus
  );

  const openStudentDetails = (student: StudentActivity) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleFlag = (studentId: string) => {
    setStudentActivities(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, status: "flagged" as const }
          : student
      )
    );
    
    toast({
      title: "Student Flagged",
      description: "The student has been flagged for review",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Real-time AI Anomaly Detection
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700">
                <Bell className="w-3 h-3 mr-1" />
                {alertCount} Alerts
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRealTimeActive(!isRealTimeActive)}
              >
                {isRealTimeActive ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 text-green-500" />
                    Live
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Paused
                  </>
                )}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{studentActivities.length}</p>
                  <p className="text-sm text-gray-600">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {studentActivities.filter(s => s.status === "flagged").length}
                  </p>
                  <p className="text-sm text-gray-600">Flagged</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {studentActivities.filter(s => s.status === "suspicious").length}
                  </p>
                  <p className="text-sm text-gray-600">Suspicious</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(studentActivities.reduce((acc, s) => acc + s.aiConfidence, 0) / studentActivities.length)}%
                  </p>
                  <p className="text-sm text-gray-600">Avg AI Confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Student Activity Grid */}
        <div className="space-y-4">
          {filteredActivities.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all duration-200 hover:shadow-md ${
                student.status === "flagged" ? "border-red-200 bg-red-50" :
                student.status === "suspicious" ? "border-yellow-200 bg-yellow-50" :
                "border-gray-200"
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={student.studentAvatar} />
                        <AvatarFallback>
                          {student.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-lg">{student.studentName}</h3>
                        <p className="text-sm text-gray-600">{student.assessmentName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(student.status)}>
                            {getStatusIcon(student.status)}
                            <span className="ml-1 capitalize">{student.status}</span>
                          </Badge>
                          {student.anomalies.length > 0 && (
                            <Badge variant="outline" className="text-red-600">
                              {student.anomalies.length} Anomalies
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* AI Confidence */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {student.aiConfidence}%
                        </div>
                        <div className="text-xs text-gray-600">AI Confidence</div>
                        <Progress 
                          value={student.aiConfidence} 
                          className="w-16 h-2 mt-1"
                        />
                      </div>

                      {/* Behavior Score */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {student.behaviorScore}
                        </div>
                        <div className="text-xs text-gray-600">Behavior Score</div>
                        <Progress 
                          value={student.behaviorScore} 
                          className="w-16 h-2 mt-1"
                        />
                      </div>

                      {/* Screen Activity */}
                      <div className="text-center">
                        <div className="flex gap-2 text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            {student.screenActivity.tabSwitches}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {student.screenActivity.copyPaste}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">Tab/Copy Activity</div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openStudentDetails(student)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        {student.status !== "flagged" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFlag(student.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Flag
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Anomalies */}
                  {student.anomalies.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Anomalies:</h4>
                      <div className="space-y-2">
                        {student.anomalies.slice(0, 2).map(anomaly => (
                          <div key={anomaly.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityColor(anomaly.severity)}>
                                {anomaly.severity}
                              </Badge>
                              <span className="text-sm">{anomaly.description}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {anomaly.confidence}% confidence
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Student Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Student Activity Details: {selectedStudent?.studentName}
              </DialogTitle>
            </DialogHeader>
            
            {selectedStudent && (
              <div className="space-y-6">
                {/* Student Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">AI Detection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {selectedStudent.aiConfidence}%
                      </div>
                      <Progress value={selectedStudent.aiConfidence} className="mb-2" />
                      <p className="text-xs text-gray-600">Confidence Level</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Behavior Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {selectedStudent.behaviorScore}
                      </div>
                      <Progress value={selectedStudent.behaviorScore} className="mb-2" />
                      <p className="text-xs text-gray-600">Normal Behavior</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Session Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        45m
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Started: 10:00 AM</p>
                        <p>Current: 10:45 AM</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Anomalies */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detected Anomalies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent.anomalies.length > 0 ? (
                      <div className="space-y-4">
                        {selectedStudent.anomalies.map(anomaly => (
                          <div key={anomaly.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge className={getSeverityColor(anomaly.severity)}>
                                  {anomaly.severity.toUpperCase()}
                                </Badge>
                                <span className="font-medium">{anomaly.type.replace('_', ' ').toUpperCase()}</span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(anomaly.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{anomaly.description}</p>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-600">Evidence:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {anomaly.evidence.map((evidence, index) => (
                                  <li key={index}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <div className="text-sm text-gray-500">
                                Confidence: {anomaly.confidence}%
                              </div>
                              <Progress value={anomaly.confidence} className="w-24 h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-gray-600">No anomalies detected</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Biometrics & Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Screen Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Tab Switches:</span>
                          <Badge variant="outline">{selectedStudent.screenActivity.tabSwitches}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Copy/Paste:</span>
                          <Badge variant="outline">{selectedStudent.screenActivity.copyPaste}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Idle Time:</span>
                          <Badge variant="outline">{selectedStudent.screenActivity.idleTime}s</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Keyboard Pattern:</span>
                          <Badge className={
                            selectedStudent.screenActivity.keyboardPattern === "ai-like" ? "bg-red-100 text-red-800" :
                            selectedStudent.screenActivity.keyboardPattern === "unusual" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {selectedStudent.screenActivity.keyboardPattern}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Biometric Monitoring</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Eye Tracking:</span>
                          <Badge className={
                            selectedStudent.biometrics.eyeTracking === "off-screen" ? "bg-red-100 text-red-800" :
                            selectedStudent.biometrics.eyeTracking === "distracted" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {selectedStudent.biometrics.eyeTracking}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Expression:</span>
                          <Badge className={
                            selectedStudent.biometrics.facialExpression === "suspicious" ? "bg-red-100 text-red-800" :
                            selectedStudent.biometrics.facialExpression === "confused" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {selectedStudent.biometrics.facialExpression}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Posture:</span>
                          <Badge className={
                            selectedStudent.biometrics.posture === "unusual" ? "bg-yellow-100 text-yellow-800" :
                            "bg-green-100 text-green-800"
                          }>
                            {selectedStudent.biometrics.posture}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};
