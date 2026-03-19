import { useState } from "react";
import { motion } from "framer-motion";
import { useAppContext, ApplicationType, ApplicationStatus } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Check, X, Filter } from "lucide-react";

const typeLabels: Record<ApplicationType, string> = {
  od: "On Duty", leave: "Leave", internship: "Internship",
  "industrial-visit": "Industrial Visit", "hostel-od": "Hostel OD",
  "day-scholar-od": "Day Scholar OD",
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending", "approved-l1": "L1 Approved", "approved-l2": "L2 Approved",
  approved: "Fully Approved", rejected: "Rejected",
};

const AdminApplications = () => {
  const { applications, updateStatus } = useAppContext();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  const filtered = applications.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    return true;
  });

  const handleApprove = (id: string, currentStatus: ApplicationStatus) => {
    const next: ApplicationStatus =
      currentStatus === "pending" ? "approved-l1" :
      currentStatus === "approved-l1" ? "approved-l2" :
      "approved";
    updateStatus(id, next, commentMap[id]);
    toast.success(`Application ${next === "approved" ? "fully approved" : "forwarded to next level"}`);
  };

  const handleReject = (id: string) => {
    updateStatus(id, "rejected", commentMap[id] || "Rejected by admin");
    toast.error("Application rejected");
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Applications</h2>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-muted-foreground" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40 bg-input border-border text-card-foreground">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 bg-input border-border text-card-foreground">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Application List */}
      <div className="space-y-4">
        {filtered.map((app, i) => (
          <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-card-foreground">{app.studentName}</p>
                <p className="text-xs text-muted-foreground">{app.registerNumber} • {app.department}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                app.status === "approved" ? "status-approved" : app.status === "rejected" ? "status-rejected" : "status-pending"
              }`}>
                {statusLabels[app.status]}
              </span>
            </div>

            <div className="text-sm text-card-foreground">
              <span className="text-primary font-medium">{typeLabels[app.type]}</span> • {app.fromDate} → {app.toDate}
            </div>
            <p className="text-sm text-muted-foreground">{app.reason}</p>

            {!["approved", "rejected"].includes(app.status) && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Textarea
                  placeholder="Add comments (optional)"
                  value={commentMap[app.id] || ""}
                  onChange={(e) => setCommentMap((prev) => ({ ...prev, [app.id]: e.target.value }))}
                  rows={2}
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(app.id, app.status)}
                    className="bg-success text-success-foreground hover:bg-success/90 flex items-center gap-1">
                    <Check size={14} /> {app.status === "approved-l2" ? "Final Approve" : "Approve / Forward"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}
                    className="flex items-center gap-1">
                    <X size={14} /> Reject
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No applications match your filters</p>}
      </div>
    </div>
  );
};

export default AdminApplications;
