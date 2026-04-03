import { motion } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { FileText, Clock, CheckCircle, XCircle, Users } from "lucide-react";

const AdminDashboard = () => {
  const { applications } = useAppContext();

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  const statCards = [
    { label: "Total Applications", value: stats.total, icon: FileText, color: "text-primary" },
    { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-warning" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-success" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-destructive" },
  ];

  const recentPending = applications.filter(a => a.status === "pending").slice(0, 5);

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">Overview of all applications</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card-hover p-4 text-center">
            <stat.icon className={`mx-auto mb-2 ${stat.color}`} size={24} />
            <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <h3 className="text-lg font-semibold text-card-foreground mb-3">Pending for Review</h3>
        <div className="space-y-3">
          {recentPending.map((app) => (
            <div key={app.id} className="glass-card p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">{app.studentName} ({app.registerNumber})</p>
                <p className="text-xs text-muted-foreground">{app.type.toUpperCase()} • {app.fromDate} → {app.toDate}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium status-pending">Pending</span>
            </div>
          ))}
          {recentPending.length === 0 && <p className="text-center text-muted-foreground py-8">No pending applications</p>}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
