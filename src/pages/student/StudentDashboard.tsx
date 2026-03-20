import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext, ApplicationStatus, ApplicationType } from "@/contexts/AppContext";
import { FileText, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const statusConfig: Record<ApplicationStatus, { label: string; className: string; icon: typeof Clock }> = {
  pending: { label: "Pending", className: "status-pending", icon: Clock },
  "approved-l1": { label: "Level 1 Approved", className: "status-pending", icon: Clock },
  "approved-l2": { label: "Level 2 Approved", className: "status-pending", icon: Clock },
  approved: { label: "Approved", className: "status-approved", icon: CheckCircle },
  rejected: { label: "Rejected", className: "status-rejected", icon: XCircle },
};

const typeLabels: Record<ApplicationType, string> = {
  od: "On Duty",
  leave: "Leave",
  internship: "Internship",
  "industrial-visit": "Industrial Visit",
  "hostel-od": "Hostel OD",
  "day-scholar-od": "Day Scholar OD",
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getStudentApplications } = useAppContext();
  const apps = getStudentApplications(user?.id || "");

  const stats = {
    total: apps.length,
    pending: apps.filter((a) => ["pending", "approved-l1", "approved-l2"].includes(a.status)).length,
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
        <p className="text-xs sm:text-sm text-muted-foreground">Welcome back, {user?.name}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-hover p-3 sm:p-4 text-center"
          >
            <stat.icon className={`mx-auto mb-1.5 sm:mb-2 ${stat.color}`} size={20} />
            <p className="text-xl sm:text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Apply */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-card-foreground">Quick Apply</h3>
          <Link to="/dashboard/apply" className="text-primary text-sm flex items-center gap-1 hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(["od", "leave", "hostel-od", "day-scholar-od"] as ApplicationType[]).map((type) => (
            <Link key={type} to={`/dashboard/apply?type=${type}`}
              className="glass-card-hover p-4 text-center">
              <FileText className="mx-auto mb-2 text-primary" size={20} />
              <p className="text-sm font-medium text-card-foreground">{typeLabels[type]}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Applications */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="text-lg font-semibold text-card-foreground mb-3">Recent Applications</h3>
        <div className="space-y-3">
          {apps.slice(0, 5).map((app) => {
            const config = statusConfig[app.status];
            return (
              <div key={app.id} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{typeLabels[app.type]}</p>
                  <p className="text-xs text-muted-foreground">{app.fromDate} → {app.toDate}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{app.reason}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
                  {config.label}
                </span>
              </div>
            );
          })}
          {apps.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No applications yet. Start by applying!</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
