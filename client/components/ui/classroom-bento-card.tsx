import * as React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Calendar, Copy, Check, Star, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Classroom, ClassroomStats } from "../../types/classroom";

/**
 * Props for the ClassroomBentoCard component.
 */
interface ClassroomBentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Classroom data */
  classroom: Classroom;
  /** Classroom statistics */
  stats?: ClassroomStats;
  /** Whether the user is a teacher */
  isTeacher?: boolean;
  /** Click handler for the card */
  onClick?: () => void;
  /** Optional additional class names */
  className?: string;
}

// Animation variants for Framer Motion
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.3 },
  },
};

const contentVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

/**
 * A reusable, animated classroom card component with bento grid styling.
 */
export const ClassroomBentoCard = React.forwardRef<
  HTMLDivElement,
  ClassroomBentoCardProps
>(
  (
    {
      className,
      classroom,
      stats,
      isTeacher = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);

    const copyClassCode = async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(classroom.classCode);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = classroom.classCode;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Copy failed:', error);
      }
    };

    const formatDate = (timestamp: any) => {
      if (!timestamp?.seconds) return 'Recently';
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const teacherInitials = classroom.teacherName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 cursor-pointer",
          className
        )}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        onClick={onClick}
        {...props}
      >
        {/* Header with gradient accent */}
        <div className="h-24 w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10" />
          <div className="absolute top-2 right-2 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-purple-300/20 rounded-full blur-xl" />
        </div>

        {/* Copy Code Button */}
        {isTeacher && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-3 top-3 h-8 px-3 rounded-lg bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white text-xs font-mono shadow-sm"
            onClick={copyClassCode}
            aria-label="Copy classroom code"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                {classroom.classCode}
              </>
            )}
          </Button>
        )}

        {/* Classroom Icon (overlaps header) */}
        <div className="absolute left-6 top-16">
          <motion.div 
            className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border-4 border-white"
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <GraduationCap className="h-8 w-8 text-white" />
          </motion.div>
        </div>

        {/* Content Area */}
        <motion.div
          className="px-6 pb-6 pt-10"
          variants={contentVariants}
        >
          {/* Classroom Name and Teacher */}
          <motion.div
            className="mb-4"
            variants={itemVariants}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
              {classroom.name}
            </h2>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border-2 border-gray-200">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${classroom.teacherName}`} />
                <AvatarFallback className="text-xs">{teacherInitials}</AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-600 font-medium">{classroom.teacherName}</p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            className="mb-4 min-h-[3rem]"
            variants={itemVariants}
          >
            {classroom.description ? (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {classroom.description}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">No description</p>
            )}
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 gap-3 mb-4"
            variants={itemVariants}
          >
            <StatCard
              icon={Users}
              value={stats?.totalStudents || 0}
              label="Students"
              color="blue"
            />
            <StatCard
              icon={Calendar}
              value={stats?.totalAssignments || 0}
              label="Assignments"
              color="purple"
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            className="flex items-center justify-between pt-4 border-t border-gray-100"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-gray-500">{formatDate(classroom.createdAt)}</span>
            </div>
            {isTeacher && stats && stats.pendingSubmissions > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                {stats.pendingSubmissions} pending
              </span>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }
);
ClassroomBentoCard.displayName = "ClassroomBentoCard";

// Internal StatCard component
const StatCard = ({
  icon: Icon,
  value,
  label,
  color = "blue"
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color?: "blue" | "purple" | "green";
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    green: "bg-green-50 border-green-100 text-green-700",
  };

  const iconColorClasses = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-2.5 rounded-lg border",
      colorClasses[color]
    )}>
      <div className={cn("p-1.5 rounded-md", iconColorClasses[color])}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <div>
        <p className="text-base font-bold leading-none mb-0.5">{value}</p>
        <p className="text-xs leading-none opacity-80">{label}</p>
      </div>
    </div>
  );
};
