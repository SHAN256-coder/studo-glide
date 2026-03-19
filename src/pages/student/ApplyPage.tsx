import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext, ApplicationType } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { Send, FileText, Briefcase, Building2, Home, BookOpen } from "lucide-react";

const typeConfig: Record<ApplicationType, { label: string; icon: typeof FileText; description: string }> = {
  od: { label: "On Duty (OD)", icon: BookOpen, description: "For attending events, workshops, or competitions" },
  leave: { label: "Leave", icon: FileText, description: "Personal or medical leave" },
  internship: { label: "Internship", icon: Briefcase, description: "For internship period approval" },
  "industrial-visit": { label: "Industrial Visit", icon: Building2, description: "Company/factory visit with department" },
  "hostel-od": { label: "Hostel OD", icon: Home, description: "Permission to leave hostel (max 2/week)" },
};

const ApplyPage = () => {
  const { user } = useAuth();
  const { addApplication } = useAppContext();
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get("type") as ApplicationType | null;

  const [type, setType] = useState<ApplicationType>(preselected || "od");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      toast.error("Please fill all required fields");
      return;
    }
    addApplication({
      studentId: user!.id,
      studentName: user!.name,
      registerNumber: user!.registerNumber,
      department: user!.department || "",
      type,
      fromDate,
      toDate,
      reason,
    });
    toast.success("Application submitted successfully!");
    setFromDate("");
    setToDate("");
    setReason("");
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Apply</h2>
        <p className="text-sm text-muted-foreground">Submit a new application</p>
      </motion.div>

      {/* Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {(Object.keys(typeConfig) as ApplicationType[]).map((t) => {
          const config = typeConfig[t];
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`glass-card p-3 text-left transition-all duration-300 ${
                type === t ? "border-primary gold-glow" : "hover:border-border"
              }`}
            >
              <config.icon size={20} className={type === t ? "text-primary" : "text-muted-foreground"} />
              <p className={`text-sm font-medium mt-2 ${type === t ? "text-primary" : "text-card-foreground"}`}>
                {config.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{config.description}</p>
            </button>
          );
        })}
      </div>

      {/* Application Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="glass-card p-5 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-card-foreground">From Date</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="bg-input border-border text-card-foreground" />
          </div>
          <div className="space-y-2">
            <Label className="text-card-foreground">To Date</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="bg-input border-border text-card-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-card-foreground">Reason / Details</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the reason for your application..."
            rows={4}
            className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-accent flex items-center gap-2">
            <Send size={16} /> Submit Application
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default ApplyPage;
