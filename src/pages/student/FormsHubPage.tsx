import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, Home, Briefcase, CalendarOff } from "lucide-react";

const forms = [
  {
    to: "/dashboard/forms/od-form",
    icon: Briefcase,
    title: "On Duty (OD) Form",
    description: "Permission form for attending events, workshops, and programs",
  },
  {
    to: "/dashboard/forms/leave-form",
    icon: CalendarOff,
    title: "Leave Application Form",
    description: "Sick leave, personal leave, family emergency — with class advisor & HOD sign-off",
  },
  {
    to: "/dashboard/forms/hostel-leave",
    icon: Home,
    title: "Hostel Leave Form",
    description: "Department Copy + Warden Copy — auto-fills both copies from one form",
  },
  {
    to: "/dashboard/forms/internship-consent",
    icon: FileText,
    title: "Internship Consent Form",
    description: "Student–Parents consent form for internship with all required fields",
  },
];

const FormsHubPage = () => (
  <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Form Templates</h2>
      <p className="text-xs sm:text-sm text-muted-foreground">Fill and download college forms as PDF or JPG</p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {forms.map((form, i) => (
        <motion.div key={form.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Link to={form.to} className="glass-card-hover p-4 sm:p-5 block space-y-1.5 sm:space-y-2">
            <form.icon size={24} className="text-primary" />
            <h3 className="text-sm sm:text-base font-semibold text-card-foreground">{form.title}</h3>
            <p className="text-[11px] sm:text-xs text-muted-foreground">{form.description}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export default FormsHubPage;
