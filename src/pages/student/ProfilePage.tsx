import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { User, Phone, BookOpen, GraduationCap, Building2, Award, Calendar } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { getStudentApplications } = useAppContext();
  const apps = getStudentApplications(user?.id || "");

  const fields = [
    { label: "Name", value: user?.name, icon: User },
    { label: "Register Number", value: user?.registerNumber, icon: GraduationCap },
    { label: "Mobile", value: user?.mobile, icon: Phone },
    { label: "Department", value: user?.department, icon: BookOpen },
    { label: "Section", value: user?.section, icon: Building2 },
    { label: "Semester", value: user?.semester, icon: Calendar },
    { label: "CGPA", value: user?.cgpa, icon: Award },
    { label: "College", value: user?.college, icon: Building2 },
  ];

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Profile</h2>
      </motion.div>

      {/* Avatar & Name */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary mx-auto flex items-center justify-center text-primary-foreground text-2xl font-bold mb-3">
          {user?.name?.charAt(0)}
        </div>
        <h3 className="text-lg font-bold text-card-foreground">{user?.name}</h3>
        <p className="text-sm text-muted-foreground">{user?.registerNumber} • {user?.department}</p>
      </motion.div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map((field, i) => (
          <motion.div key={field.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex items-center gap-3">
            <field.icon size={18} className="text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{field.label}</p>
              <p className="text-sm font-medium text-card-foreground">{field.value || "—"}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* History Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass-card p-5">
        <h3 className="text-base font-semibold text-card-foreground mb-3">Application History</h3>
        <div className="flex gap-4 text-center">
          <div className="flex-1">
            <p className="text-xl font-bold text-primary">{apps.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-success">{apps.filter(a => a.status === "approved").length}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-destructive">{apps.filter(a => a.status === "rejected").length}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
