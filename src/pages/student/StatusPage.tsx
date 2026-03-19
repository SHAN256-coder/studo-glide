import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext, ApplicationStatus, ApplicationType } from "@/contexts/AppContext";
import { QRCodeSVG } from "qrcode.react";
import { Clock, CheckCircle, XCircle } from "lucide-react";

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
};

const StatusPage = () => {
  const { user } = useAuth();
  const { getStudentApplications } = useAppContext();
  const apps = getStudentApplications(user?.id || "");

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Application Status</h2>
        <p className="text-sm text-muted-foreground">Track your applications & QR codes</p>
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[app.status].className}`}>
                    {statusConfig[app.status].label}
                  </span>
                  <span className="text-xs text-muted-foreground">#{app.id}</span>
                </div>
                <h4 className="text-base font-semibold text-card-foreground">{typeLabels[app.type]}</h4>
                <p className="text-sm text-muted-foreground mt-1">{app.fromDate} → {app.toDate}</p>
                <p className="text-sm text-muted-foreground mt-1">{app.reason}</p>

                {/* Approval Progress */}
                <div className="flex items-center gap-2 mt-3">
                  {[1, 2, 3].map((level) => (
                    <div key={level} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        app.approvalLevel >= level
                          ? "bg-success text-success-foreground"
                          : app.status === "rejected"
                          ? "bg-destructive/20 text-destructive"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {app.approvalLevel >= level ? <CheckCircle size={14} /> : app.status === "rejected" ? <XCircle size={14} /> : level}
                      </div>
                      {level < 3 && <div className={`w-6 h-0.5 ${app.approvalLevel >= level + 1 ? "bg-success" : "bg-border"}`} />}
                    </div>
                  ))}
                  <span className="text-xs text-muted-foreground ml-2">
                    {app.status === "approved" ? "Fully Approved" : app.status === "rejected" ? "Rejected" : `Level ${app.approvalLevel} of 3`}
                  </span>
                </div>
              </div>

              {/* QR Code for approved */}
              {app.status === "approved" && (
                <div className="bg-card-foreground p-2 rounded-lg">
                  <QRCodeSVG
                    value={JSON.stringify({ id: app.id, student: app.registerNumber, type: app.type, validUntil: app.toDate })}
                    size={80}
                    level="M"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {apps.length === 0 && <p className="text-center text-muted-foreground py-12">No applications found</p>}
      </div>
    </div>
  );
};

export default StatusPage;
