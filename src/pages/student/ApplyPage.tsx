import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, DEPARTMENTS, SEMESTERS, YEARS } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileImage, Home, GraduationCap, CalendarOff, Briefcase, Building2, FileText, ClipboardList, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import collegeLogo from "@/assets/college-logo.png";

type FormType =
  | "od-hosteller"
  | "od-dayscholar"
  | "leave-hosteller"
  | "leave-dayscholar"
  | "absent-hosteller"
  | "absent-dayscholar"
  | "industrial-visit"
  | "internship";

const formTypes: { id: FormType; label: string; icon: typeof Home; description: string }[] = [
  { id: "od-hosteller", label: "OD – Hosteller", icon: Home, description: "On Duty form for hostel students" },
  { id: "od-dayscholar", label: "OD – Day Scholar", icon: GraduationCap, description: "On Duty form for day scholars" },
  { id: "leave-hosteller", label: "Leave – Hosteller", icon: CalendarOff, description: "Leave application for hostellers" },
  { id: "leave-dayscholar", label: "Leave – Day Scholar", icon: CalendarOff, description: "Leave application for day scholars" },
  { id: "absent-hosteller", label: "Absent – Hosteller", icon: AlertCircle, description: "Absent letter for hostel students" },
  { id: "absent-dayscholar", label: "Absent – Day Scholar", icon: AlertCircle, description: "Absent letter for day scholars" },
  { id: "industrial-visit", label: "Industrial Visit", icon: Building2, description: "IV permission form" },
  { id: "internship", label: "Internship Application", icon: Briefcase, description: "Internship consent & application" },
];

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];
const AMPM = ["AM", "PM"];

const ApplyPage = () => {
  const { user } = useAuth();
  const { addApplication } = useAppContext();
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    name: "",
    registerNumber: "",
    department: "",
    year: "",
    semester: "",
    section: "",
    fromDate: "",
    toDate: "",
    fromHour: "9",
    fromMinute: "00",
    fromAmPm: "AM",
    toHour: "4",
    toMinute: "00",
    toAmPm: "PM",
    reason: "",
    eventName: "",
    venue: "",
    organizerName: "",
    facultyInCharge: "",
    parentName: "",
    parentPhone: "",
    companyName: "",
    companyAddress: "",
    internshipDomain: "",
    internshipDuration: "",
    leaveType: "Sick Leave",
    absentDate: "",
    hostelRoomNo: "",
    wardenName: "",
  });

  const set = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const fromTime12 = `${formData.fromHour}:${formData.fromMinute} ${formData.fromAmPm}`;
  const toTime12 = `${formData.toHour}:${formData.toMinute} ${formData.toAmPm}`;

  const handleSavePDF = async () => {
    if (!formRef.current) return;
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`${selectedForm}_${formData.registerNumber || "form"}.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleSaveJPG = async () => {
    if (!formRef.current) return;
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${selectedForm}_${formData.registerNumber || "form"}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      toast.success("JPG downloaded!");
    } catch {
      toast.error("Failed to generate JPG");
    }
  };

  const handleSubmitApplication = () => {
    if (!formData.name || !formData.registerNumber) {
      toast.error("Please fill name and register number");
      return;
    }
    const typeMap: Record<FormType, string> = {
      "od-hosteller": "od",
      "od-dayscholar": "day-scholar-od",
      "leave-hosteller": "leave",
      "leave-dayscholar": "leave",
      "absent-hosteller": "leave",
      "absent-dayscholar": "leave",
      "industrial-visit": "industrial-visit",
      "internship": "internship",
    };
    addApplication({
      studentId: user!.id,
      studentName: formData.name,
      registerNumber: formData.registerNumber,
      department: formData.department,
      type: typeMap[selectedForm!] as any,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason || formData.eventName || selectedForm || "",
    });
    toast.success("Application submitted for approval!");
  };

  // Time picker component
  const TimePicker = ({ prefix, label }: { prefix: "from" | "to"; label: string }) => (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-card-foreground">{label}</p>
      <div className="flex gap-1.5">
        <Select value={formData[`${prefix}Hour`]} onValueChange={(v) => set(`${prefix}Hour`, v)}>
          <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{HOURS_12.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
        </Select>
        <span className="self-center text-muted-foreground">:</span>
        <Select value={formData[`${prefix}Minute`]} onValueChange={(v) => set(`${prefix}Minute`, v)}>
          <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{MINUTES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={formData[`${prefix}AmPm`]} onValueChange={(v) => set(`${prefix}AmPm`, v)}>
          <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{AMPM.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );

  // Common fields
  const CommonFields = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <Input placeholder="Date" type="date" value={formData.date} onChange={(e) => set("date", e.target.value)} />
        <Input placeholder="Student Name" value={formData.name} onChange={(e) => set("name", e.target.value)} />
        <Input placeholder="Register Number" value={formData.registerNumber} onChange={(e) => set("registerNumber", e.target.value)} />
        <Select value={formData.department} onValueChange={(v) => set("department", v)}>
          <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={formData.year} onValueChange={(v) => set("year", v)}>
          <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
          <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={formData.semester} onValueChange={(v) => set("semester", v)}>
          <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Section" value={formData.section} onChange={(e) => set("section", e.target.value)} />
      </div>
    </>
  );

  // Date + Time fields
  const DateTimeFields = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-card-foreground">From Date</p>
          <Input type="date" value={formData.fromDate} onChange={(e) => set("fromDate", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-card-foreground">To Date</p>
          <Input type="date" value={formData.toDate} onChange={(e) => set("toDate", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TimePicker prefix="from" label="From Time (12hr)" />
        <TimePicker prefix="to" label="To Time (12hr)" />
      </div>
    </div>
  );

  // Form-specific extra fields
  const ExtraFields = () => {
    if (!selectedForm) return null;
    switch (selectedForm) {
      case "od-hosteller":
      case "od-dayscholar":
        return (
          <>
            <Input placeholder="Event / Program Name" value={formData.eventName} onChange={(e) => set("eventName", e.target.value)} />
            <Input placeholder="Venue" value={formData.venue} onChange={(e) => set("venue", e.target.value)} />
            <Input placeholder="Organizer Name" value={formData.organizerName} onChange={(e) => set("organizerName", e.target.value)} />
            <Input placeholder="Faculty In-Charge" value={formData.facultyInCharge} onChange={(e) => set("facultyInCharge", e.target.value)} />
            {selectedForm === "od-dayscholar" && (
              <>
                <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
                <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
              </>
            )}
            {selectedForm === "od-hosteller" && (
              <Input placeholder="Hostel Room No" value={formData.hostelRoomNo} onChange={(e) => set("hostelRoomNo", e.target.value)} />
            )}
          </>
        );
      case "leave-hosteller":
      case "leave-dayscholar":
        return (
          <>
            <Select value={formData.leaveType} onValueChange={(v) => set("leaveType", v)}>
              <SelectTrigger><SelectValue placeholder="Leave Type" /></SelectTrigger>
              <SelectContent>
                {["Sick Leave", "Personal Leave", "Family Emergency", "Medical Leave", "Other"].map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedForm === "leave-hosteller" && (
              <Input placeholder="Hostel Room No" value={formData.hostelRoomNo} onChange={(e) => set("hostelRoomNo", e.target.value)} />
            )}
            <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
            <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
          </>
        );
      case "absent-hosteller":
      case "absent-dayscholar":
        return (
          <>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-card-foreground">Absent Date</p>
              <Input type="date" value={formData.absentDate} onChange={(e) => set("absentDate", e.target.value)} />
            </div>
            <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
            <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
            {selectedForm === "absent-hosteller" && (
              <Input placeholder="Hostel Room No" value={formData.hostelRoomNo} onChange={(e) => set("hostelRoomNo", e.target.value)} />
            )}
          </>
        );
      case "industrial-visit":
        return (
          <>
            <Input placeholder="Company / Industry Name" value={formData.companyName} onChange={(e) => set("companyName", e.target.value)} />
            <Input placeholder="Company Address" value={formData.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} />
            <Input placeholder="Faculty In-Charge" value={formData.facultyInCharge} onChange={(e) => set("facultyInCharge", e.target.value)} />
            <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
            <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
          </>
        );
      case "internship":
        return (
          <>
            <Input placeholder="Company Name" value={formData.companyName} onChange={(e) => set("companyName", e.target.value)} />
            <Input placeholder="Internship Domain" value={formData.internshipDomain} onChange={(e) => set("internshipDomain", e.target.value)} />
            <Input placeholder="Duration (e.g. 2 months)" value={formData.internshipDuration} onChange={(e) => set("internshipDuration", e.target.value)} />
            <Input placeholder="Company Address" value={formData.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} />
            <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
            <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
          </>
        );
      default:
        return null;
    }
  };

  // A4 Preview for each form type
  const FormPreview = () => {
    if (!selectedForm) return null;
    const formTitle: Record<FormType, string> = {
      "od-hosteller": "ON DUTY PERMISSION FORM (HOSTELLER)",
      "od-dayscholar": "ON DUTY PERMISSION FORM (DAY SCHOLAR)",
      "leave-hosteller": "LEAVE APPLICATION FORM (HOSTELLER)",
      "leave-dayscholar": "LEAVE APPLICATION FORM (DAY SCHOLAR)",
      "absent-hosteller": "ABSENT LETTER (HOSTELLER)",
      "absent-dayscholar": "ABSENT LETTER (DAY SCHOLAR)",
      "industrial-visit": "INDUSTRIAL VISIT PERMISSION FORM",
      "internship": "INTERNSHIP APPLICATION FORM",
    };

    const getRows = (): [string, string][] => {
      const common: [string, string][] = [
        ["Date", formData.date],
        ["Name of the Student", formData.name],
        ["Register Number", formData.registerNumber],
        ["Department", formData.department],
        ["Year / Semester / Section", `${formData.year} / ${formData.semester} / ${formData.section}`],
      ];

      switch (selectedForm) {
        case "od-hosteller":
        case "od-dayscholar":
          return [
            ...common,
            ["From Date", formData.fromDate],
            ["To Date", formData.toDate],
            ["From Time", fromTime12],
            ["To Time", toTime12],
            ["Event / Program Name", formData.eventName],
            ["Venue", formData.venue],
            ["Organizer", formData.organizerName],
            ["Faculty In-Charge", formData.facultyInCharge],
            ...(selectedForm === "od-dayscholar" ? [["Parent / Guardian", formData.parentName], ["Parent Phone", formData.parentPhone]] as [string, string][] : []),
            ...(selectedForm === "od-hosteller" ? [["Hostel Room No", formData.hostelRoomNo]] as [string, string][] : []),
            ["Reason for OD", formData.reason],
          ];
        case "leave-hosteller":
        case "leave-dayscholar":
          return [
            ...common,
            ["Leave Type", formData.leaveType],
            ["From Date", formData.fromDate],
            ["To Date", formData.toDate],
            ...(selectedForm === "leave-hosteller" ? [["Hostel Room No", formData.hostelRoomNo]] as [string, string][] : []),
            ["Parent / Guardian", formData.parentName],
            ["Parent Phone", formData.parentPhone],
            ["Reason", formData.reason],
          ];
        case "absent-hosteller":
        case "absent-dayscholar":
          return [
            ...common,
            ["Absent Date", formData.absentDate],
            ...(selectedForm === "absent-hosteller" ? [["Hostel Room No", formData.hostelRoomNo]] as [string, string][] : []),
            ["Parent / Guardian", formData.parentName],
            ["Parent Phone", formData.parentPhone],
            ["Reason for Absence", formData.reason],
          ];
        case "industrial-visit":
          return [
            ...common,
            ["Company / Industry", formData.companyName],
            ["Address", formData.companyAddress],
            ["From Date", formData.fromDate],
            ["To Date", formData.toDate],
            ["Faculty In-Charge", formData.facultyInCharge],
            ["Parent / Guardian", formData.parentName],
            ["Parent Phone", formData.parentPhone],
            ["Purpose", formData.reason],
          ];
        case "internship":
          return [
            ...common,
            ["Company Name", formData.companyName],
            ["Domain", formData.internshipDomain],
            ["Duration", formData.internshipDuration],
            ["Company Address", formData.companyAddress],
            ["From Date", formData.fromDate],
            ["To Date", formData.toDate],
            ["Parent / Guardian", formData.parentName],
            ["Parent Phone", formData.parentPhone],
            ["Remarks", formData.reason],
          ];
        default:
          return common;
      }
    };

    return (
      <div ref={formRef} style={{ width: 794, fontFamily: "serif", fontSize: 13, background: "#fff", color: "#000", padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img src={collegeLogo} alt="College Logo" style={{ height: 60, margin: "0 auto" }} />
          <h2 style={{ fontSize: 16, fontWeight: "bold", marginTop: 8 }}>DHAANISH AHMED COLLEGE OF ENGINEERING</h2>
          <p style={{ fontSize: 12 }}>Padappai, Chennai – 601301</p>
          <h3 style={{ fontSize: 14, fontWeight: "bold", marginTop: 8, textDecoration: "underline" }}>{formTitle[selectedForm]}</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <tbody>
            {getRows().map(([label, value]) => (
              <tr key={label}>
                <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", width: "40%" }}>{label}</td>
                <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", width: 150, marginBottom: 4 }} />
            <p>Student Signature</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", width: 150, marginBottom: 4 }} />
            <p>Faculty / Advisor</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", width: 150, marginBottom: 4 }} />
            <p>HOD</p>
          </div>
        </div>
        <div style={{ marginTop: 30, fontSize: 11, textAlign: "center", color: "#666" }}>
          <p>This form must be submitted before the mentioned date. Approval is subject to HOD discretion.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Apply</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Select a form, fill details, and download</p>
      </motion.div>

      {/* Form Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {formTypes.map((ft, i) => (
          <motion.button
            key={ft.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedForm(ft.id)}
            className={`glass-card p-3 sm:p-4 text-left transition-all duration-200 ${
              selectedForm === ft.id ? "border-primary gold-glow" : "hover:border-border"
            }`}
          >
            <ft.icon size={18} className={selectedForm === ft.id ? "text-primary" : "text-muted-foreground"} />
            <p className={`text-xs sm:text-sm font-medium mt-1.5 leading-tight ${selectedForm === ft.id ? "text-primary" : "text-card-foreground"}`}>
              {ft.label}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{ft.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Form Fill Section */}
      <AnimatePresence mode="wait">
        {selectedForm && (
          <motion.div
            key={selectedForm}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-3 sm:p-5 space-y-3 sm:space-y-4"
          >
            <h3 className="text-sm sm:text-base font-semibold text-card-foreground">
              {formTypes.find((f) => f.id === selectedForm)?.label}
            </h3>

            <CommonFields />

            {!["absent-hosteller", "absent-dayscholar"].includes(selectedForm) && <DateTimeFields />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <ExtraFields />
            </div>

            <Textarea placeholder="Reason / Remarks" value={formData.reason} onChange={(e) => set("reason", e.target.value)} />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSubmitApplication} className="gap-1.5 text-xs sm:text-sm">
                <ClipboardList size={14} /> Submit for Approval
              </Button>
              <Button onClick={handleSavePDF} variant="outline" className="gap-1.5 text-xs sm:text-sm">
                <Download size={14} /> Save PDF
              </Button>
              <Button onClick={handleSaveJPG} variant="outline" className="gap-1.5 text-xs sm:text-sm">
                <FileImage size={14} /> Save JPG
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A4 Preview */}
      {selectedForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-semibold text-card-foreground mb-2">A4 Preview</h3>
          <div className="overflow-auto border border-border rounded-lg">
            <FormPreview />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ApplyPage;
