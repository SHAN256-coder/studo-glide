import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext, ApplicationStatus, ApplicationType } from "@/contexts/AppContext";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const statusConfig: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "status-pending" },
  "approved-l1": { label: "L1 Approved", className: "status-pending" },
  "approved-l2": { label: "L2 Approved", className: "status-pending" },
  approved: { label: "Approved", className: "status-approved" },
  rejected: { label: "Rejected", className: "status-rejected" },
};

const typeLabels: Record<ApplicationType, string> = {
  od: "On Duty", leave: "Leave", internship: "Internship",
  "industrial-visit": "Industrial Visit", "hostel-od": "Hostel OD",
  "day-scholar-od": "Day Scholar OD",
};

const StatusPage = () => {
  const { user } = useAuth();
  const { getStudentApplications } = useAppContext();
  const apps = getStudentApplications(user?.id || "");

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Application Status</h2>
        <p className="text-sm text-muted-foreground">Track your applications</p>
      </motion.div>

      <div className="space-y-4">
        {apps.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${statusConfig[app.status].className}`}>
                    {statusConfig[app.status].label}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">#{app.id}</span>
                  <span className="text-[10px] sm:text-xs font-mono text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[120px] sm:max-w-none">{app.trackingId}</span>
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-card-foreground">{typeLabels[app.type]}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{app.fromDate} → {app.toDate}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{app.reason}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                  Submitted: {new Date(app.createdAt).toLocaleString()}
                </p>

                {/* Approval Progress */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
                  {[1, 2, 3].map((level) => (
                    <div key={level} className="flex items-center gap-0.5 sm:gap-1">
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs ${
                        app.approvalLevel >= level
                          ? "bg-success text-success-foreground"
                          : app.status === "rejected"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {app.approvalLevel >= level ? <CheckCircle size={12} /> : app.status === "rejected" ? <XCircle size={12} /> : level}
                      </div>
                      {level < 3 && <div className={`w-4 sm:w-6 h-0.5 ${app.approvalLevel >= level + 1 ? "bg-success" : "bg-border"}`} />}
                    </div>
                  ))}
                  <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 sm:ml-2">
                    {app.status === "approved" ? "Fully Approved" : app.status === "rejected" ? "Rejected" : `Level ${app.approvalLevel} of 3`}
                  </span>
                </div>

                {app.comments && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 italic">Comment: {app.comments}</p>
                )}
              </div>

              {/* QR Code */}
              <div className="flex-shrink-0 bg-white p-1.5 rounded self-center sm:self-start">
                <QRCodeSVG value={`${app.trackingId}|${app.type}|${app.status}|${app.studentName}`} size={48} />
              </div>
            </div>
          </motion.div>
        ))}
        {apps.length === 0 && <p className="text-center text-muted-foreground py-12">No applications found. Submit one from the Apply page.</p>}
      </div>
    </div>
  );
};

export default StatusPage;
