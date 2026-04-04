import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext, ApplicationStatus } from "@/contexts/AppContext";
import { FileText, Clock, CheckCircle, XCircle, CalendarDays, AlertTriangle, Zap, Calendar as CalendarIcon2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudentIDCard from "@/components/StudentIDCard";

const statusConfig: Record<ApplicationStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "status-pending", icon: Clock },
  approved: { label: "Approved", className: "status-approved", icon: CheckCircle },
  rejected: { label: "Rejected", className: "status-rejected", icon: XCircle },
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getStudentApplications } = useAppContext();
  const [showID, setShowID] = useState(false);
  const apps = getStudentApplications(user?.id || "");

  const now = new Date();
  const thisMonth = apps.filter((a) => {
    const d = new Date(a.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const holidaysTaken = thisMonth.filter((a) => a.type === "leave" && a.status === "approved").length;
  const absentsThisMonth = thisMonth.filter((a) => a.type === "leave" && a.status !== "approved").length;
  const siphODThisMonth = thisMonth.filter((a) => a.type === "siph-od").length;
  const eventsODThisMonth = thisMonth.filter((a) => ["od", "day-scholar-od", "hostel-od"].includes(a.type) && a.status === "approved").length;

  const dashCards = [
    { label: "Holidays This Month", value: holidaysTaken, icon: CalendarDays, color: "text-primary" },
    { label: "Absents This Month", value: absentsThisMonth, icon: AlertTriangle, color: "text-destructive" },
    { label: "SIPH OD This Month", value: siphODThisMonth, icon: Zap, color: "text-warning" },
    { label: "Events OD This Month", value: eventsODThisMonth, icon: CalendarIcon2, color: "text-success" },
  ];

  const stats = {
    total: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-success" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Dashboard</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Welcome back{user?.name ? `, ${user.name}` : ""}</p>
      </motion.div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
        {dashCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card-hover p-3 sm:p-4 text-center">
            <stat.icon className={`mx-auto mb-1.5 sm:mb-2 ${stat.color}`} size={20} />
            <p className="text-xl sm:text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="glass-card p-2.5 sm:p-3 text-center">
            <stat.icon className={`mx-auto mb-1 ${stat.color}`} size={16} />
            <p className="text-lg font-bold text-card-foreground">{stat.value}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-3">Recent Applications</h3>
        <div className="space-y-2 sm:space-y-3">
          {apps.slice(0, 5).map((app) => {
            const config = statusConfig[app.status];
            return (
              <div key={app.id} className="glass-card p-3 sm:p-4 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-card-foreground truncate">{app.reason || app.type}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{app.fromDate} → {app.toDate}</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0 ${config.className}`}>{config.label}</span>
              </div>
            );
          })}
          {apps.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">No applications yet. Start by applying!</p>}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
