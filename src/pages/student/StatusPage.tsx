import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext, ApplicationStatus, ApplicationType } from "@/contexts/AppContext";
import { Clock, CheckCircle, XCircle } from "lucide-react";

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "status-pending" },
  "approved-l1": { label: "Pending", className: "status-pending" },
  "approved-l2": { label: "Pending", className: "status-pending" },
  approved: { label: "Approved", className: "status-approved" },
  rejected: { label: "Rejected", className: "status-rejected" },
};

const typeLabels: Record<ApplicationType, string> = {
  od: "On Duty", leave: "Leave", internship: "Internship",
  "industrial-visit": "Industrial Visit", "hostel-od": "Hostel OD",
  "day-scholar-od": "Day Scholar OD",
};

const isHosteller = (type: ApplicationType) => ["od", "hostel-od"].includes(type) || false;

const StatusPage = () => {
  const { user } = useAuth();
  const { getStudentApplications } = useAppContext();
  const apps = getStudentApplications(user?.id || "");

  const hostellerApps = apps.filter((a) => ["od", "hostel-od"].includes(a.type) || a.reason?.toLowerCase().includes("hostel"));
  const dayScholarApps = apps.filter((a) => !hostellerApps.includes(a));

  const renderApp = (app: typeof apps[0], i: number) => {
    const config = statusConfig[app.status];
    const StatusIcon = app.status === "approved" ? CheckCircle : app.status === "rejected" ? XCircle : Clock;
    return (
      <motion.div
        key={app.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="glass-card p-3 space-y-1.5"
      >
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${config.className}`}>
            {config.label}
          </span>
          <StatusIcon size={14} className={app.status === "approved" ? "text-success" : app.status === "rejected" ? "text-destructive" : "text-warning"} />
        </div>
        <h4 className="text-xs font-semibold text-card-foreground">{typeLabels[app.type] || app.type}</h4>
        <p className="text-[10px] text-muted-foreground">{app.fromDate} → {app.toDate}</p>
        <p className="text-[10px] text-muted-foreground line-clamp-1">{app.reason}</p>
        <p className="text-[9px] text-muted-foreground">
          {new Date(app.createdAt).toLocaleDateString()}
        </p>
        {app.comments && (
          <p className="text-[9px] text-muted-foreground italic">"{app.comments}"</p>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Application Status</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Track your applications</p>
      </motion.div>

      {apps.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-12">No applications found. Submit one from the Apply page.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Hosteller side */}
          <div>
            <p className="text-xs font-semibold text-primary mb-2">🏠 Hosteller</p>
            <div className="space-y-2">
              {hostellerApps.length > 0 ? hostellerApps.map(renderApp) : (
                <p className="text-[10px] text-muted-foreground text-center py-4">No hosteller applications</p>
              )}
            </div>
          </div>
          {/* Day Scholar side */}
          <div>
            <p className="text-xs font-semibold text-primary mb-2">🎓 Day Scholar</p>
            <div className="space-y-2">
              {dayScholarApps.length > 0 ? dayScholarApps.map(renderApp) : (
                <p className="text-[10px] text-muted-foreground text-center py-4">No day scholar applications</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPage;
