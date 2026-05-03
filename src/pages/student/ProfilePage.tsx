import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, DEPARTMENTS, SEMESTERS, YEARS } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import {
  User, Phone, BookOpen, GraduationCap, Building2, Award, Calendar,
  Edit3, Save, X, Github, Linkedin, FileText, Globe, Camera, Volume2, VolumeX,
  Heart, MapPin, Bus, Home, UserCheck, FileSpreadsheet, Copy
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { buildGateCode } from "@/lib/gateCode";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import IDCardMiniPreview from "@/components/IDCardMiniPreview";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { getStudentApplications, soundEnabled, toggleSound } = useAppContext();
  const apps = getStudentApplications(user?.id || "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...user });

  const startEdit = () => {
    setDraft({ ...user });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    updateProfile(draft as any);
    setEditing(false);
    toast.success("Profile updated!");
  };

  const handleExportYearlyExcel = () => {
    const year = new Date().getFullYear();
    const wb = XLSX.utils.book_new();
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    monthNames.forEach((monthName, monthIdx) => {
      const monthApps = apps.filter((a) => {
        const d = new Date((a as any).createdAt || (a as any).created_at || Date.now());
        return d.getFullYear() === year && d.getMonth() === monthIdx;
      });
      const header = [
        ["Student Name", user?.name || ""],
        ["Register Number", user?.registerNumber || ""],
        ["Department", user?.department || ""],
        ["Year/Semester", `${user?.year || ""} / ${user?.semester || ""}`],
        ["Month", `${monthName} ${year}`],
        [],
        ["S.No","Date","Type","From Date","To Date","Reason","Status"],
      ];
      const rows = monthApps.map((a, i) => [
        i + 1,
        new Date((a as any).createdAt || (a as any).created_at || Date.now()).toLocaleDateString(),
        a.type,
        a.fromDate || "",
        a.toDate || "",
        a.reason || "",
        a.status,
      ]);
      const summary = [
        [],
        ["Summary"],
        ["Total Applications", monthApps.length],
        ["Approved", monthApps.filter((a) => a.status === "approved").length],
        ["Pending", monthApps.filter((a) => a.status === "pending").length],
        ["Rejected", monthApps.filter((a) => a.status === "rejected").length],
        ["OD (Hosteller)", monthApps.filter((a) => a.type === "hostel-od").length],
        ["OD (Day Scholar)", monthApps.filter((a) => a.type === "day-scholar-od").length],
        ["SIPH OD", monthApps.filter((a) => a.type === "siph-od").length],
        ["Leave", monthApps.filter((a) => a.type === "leave").length],
      ];
      const ws = XLSX.utils.aoa_to_sheet([...header, ...rows, ...summary]);
      ws["!cols"] = [{ wch: 6 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, monthName);
    });

    XLSX.writeFile(wb, `${user?.registerNumber || "student"}_${year}_Monthly_Report.xlsx`);
    toast.success("Yearly Excel report downloaded!");
  };

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        setDraft((prev) => ({ ...prev, profilePicture: url }));
        if (!editing) updateProfile({ profilePicture: url });
      };
      reader.readAsDataURL(file);
    }
  };

  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const fields = [
    { label: "Name", key: "name", icon: User, editable: true, type: "text" },
    { label: "Register Number", key: "registerNumber", icon: GraduationCap, editable: true, type: "text" },
    { label: "Mobile", key: "mobile", icon: Phone, editable: true, type: "tel" },
    { label: "Department", key: "department", icon: BookOpen, editable: true, type: "select", options: DEPARTMENTS },
    { label: "Section", key: "section", icon: Building2, editable: true, type: "text" },
    { label: "Year", key: "year", icon: Calendar, editable: true, type: "select", options: YEARS },
    { label: "Semester", key: "semester", icon: Calendar, editable: true, type: "select", options: SEMESTERS },
    { label: "CGPA", key: "cgpa", icon: Award, editable: true, type: "number" },
    { label: "College", key: "college", icon: Building2, editable: true, type: "text" },
    { label: "Father's Name", key: "fatherName", icon: UserCheck, editable: true, type: "text" },
    { label: "Mother's Name", key: "motherName", icon: UserCheck, editable: true, type: "text" },
    { label: "Date of Birth", key: "dob", icon: Calendar, editable: true, type: "date" },
    { label: "Blood Group", key: "bloodGroup", icon: Heart, editable: true, type: "select", options: BLOOD_GROUPS },
    { label: "Parent/Guardian Mobile", key: "parentMobile", icon: Phone, editable: true, type: "tel" },
    { label: "Student Type", key: "studentType", icon: Home, editable: true, type: "select", options: ["hosteller", "day_scholar"] },
    { label: "Address", key: "address", icon: MapPin, editable: true, type: "text" },
    { label: "Room Number", key: "roomNumber", icon: Home, editable: true, type: "text" },
    { label: "Bus Number", key: "busNumber", icon: Bus, editable: true, type: "text" },
    { label: "Boarding Point", key: "boardingPoint", icon: MapPin, editable: true, type: "text" },
  ];

  const socialFields = [
    { label: "GitHub", key: "githubId", icon: Github, placeholder: "github.com/username" },
    { label: "LinkedIn", key: "linkedinId", icon: Linkedin, placeholder: "linkedin.com/in/username" },
    { label: "Resume", key: "resumeLink", icon: FileText, placeholder: "https://resume-link.com" },
    { label: "Portfolio", key: "portfolioLink", icon: Globe, placeholder: "https://portfolio.com" },
  ];

  const displayVal = (key: string) => {
    const val = editing ? (draft as any)?.[key] : (user as any)?.[key];
    return val !== undefined && val !== null ? String(val) : "";
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      {/* Header with Edit / Sound Toggle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text flex-shrink-0">Profile</h2>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <Switch checked={soundEnabled} onCheckedChange={toggleSound} className="scale-[0.65] sm:scale-75" />
          </div>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={startEdit} className="gap-1 text-xs h-7 sm:h-8 px-2 sm:px-3">
              <Edit3 size={12} /> Edit
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button size="sm" variant="default" onClick={saveEdit} className="gap-1 text-xs h-7 sm:h-8 px-2 sm:px-3"><Save size={12} /> Save</Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 sm:h-8 px-1.5"><X size={12} /></Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Avatar & Name */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 sm:p-6 text-center relative">
        <div className="relative w-20 h-20 mx-auto mb-3">
          {(editing ? draft?.profilePicture : user?.profilePicture) ? (
            <img src={(editing ? draft?.profilePicture : user?.profilePicture)!} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              {user?.name?.charAt(0)}
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
            <Camera size={14} className="text-primary-foreground" />
            <input type="file" accept="image/*" className="hidden" onChange={handlePicture} />
          </label>
        </div>
        <h3 className="text-lg font-bold text-card-foreground">{user?.name}</h3>
        <p className="text-sm text-muted-foreground">{user?.registerNumber} • {user?.department}</p>
      </motion.div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence mode="wait">
          {fields.map((field, i) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <field.icon size={18} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                {editing && field.editable ? (
                  field.type === "select" ? (
                    <Select value={displayVal(field.key)} onValueChange={(v) => setDraft((prev) => ({ ...prev, [field.key]: field.options?.[0] && typeof field.options[0] === "number" ? Number(v) : v }))}>
                      <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={String(opt)} value={String(opt)}>{String(opt)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      value={displayVal(field.key)}
                      onChange={(e) => setDraft((prev) => ({ ...prev, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                      className="h-8 text-sm mt-0.5"
                    />
                  )
                ) : (
                  <p className="text-sm font-medium text-card-foreground truncate">{displayVal(field.key) || "—"}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Social / Links — auto-save on blur, copy button always available */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-3 sm:p-5 space-y-3">
        <h3 className="text-base font-semibold text-card-foreground">Links & Socials</h3>
        <p className="text-[11px] text-muted-foreground -mt-1">Paste a link — it auto-saves. Tap the copy icon to copy anytime.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {socialFields.map((sf) => {
            const currentVal = (user as any)?.[sf.key] || "";
            return (
              <div key={sf.key} className="flex items-center gap-2">
                <sf.icon size={16} className="text-primary flex-shrink-0" />
                <Input
                  placeholder={sf.placeholder}
                  defaultValue={currentVal}
                  key={`${sf.key}-${currentVal}`}
                  onBlur={async (e) => {
                    const v = e.target.value.trim();
                    if (v !== (currentVal || "")) {
                      await updateProfile({ [sf.key]: v } as any);
                      if (v) toast.success(`${sf.label} saved`, { duration: 1000, position: "top-center" });
                    }
                  }}
                  className="h-8 text-sm flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0"
                  disabled={!currentVal}
                  onClick={async () => {
                    if (!currentVal) return;
                    try {
                      await navigator.clipboard.writeText(currentVal);
                      toast.success(`${sf.label} link copied`, { duration: 1000, position: "top-center" });
                    } catch {
                      toast.error("Copy failed");
                    }
                  }}
                  aria-label={`Copy ${sf.label} link`}
                >
                  <Copy size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Identity QR */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-4 sm:p-5 text-center">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Identity QR</h3>
        <div className="inline-block bg-white p-3 rounded-lg">
          <QRCodeSVG value={buildGateCode({ id: user?.id, registerNumber: user?.registerNumber })} size={120} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Scan at gate to verify approved request</p>
      </motion.div>

      {/* Compact ID Card preview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.31 }}>
        <IDCardMiniPreview />
      </motion.div>

      {/* Monthly Excel Report */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }} className="glass-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-3">
          <FileSpreadsheet size={20} className="text-primary" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-card-foreground">Monthly Submission Report</h3>
            <p className="text-xs text-muted-foreground">One Excel file with 12 monthly sheets for {new Date().getFullYear()}</p>
          </div>
        </div>
        <Button onClick={handleExportYearlyExcel} className="w-full gap-2">
          <FileSpreadsheet size={16} /> Download Yearly Excel ({new Date().getFullYear()})
        </Button>
      </motion.div>

      {/* History Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card p-3 sm:p-5">
        <h3 className="text-base font-semibold text-card-foreground mb-3">Application History</h3>
        <div className="flex gap-4 text-center">
          <div className="flex-1">
            <p className="text-xl font-bold text-primary">{apps.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-success">{apps.filter((a) => a.status === "approved").length}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-destructive">{apps.filter((a) => a.status === "rejected").length}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
