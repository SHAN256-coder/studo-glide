import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, DEPARTMENTS, SEMESTERS, YEARS } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileImage, Home, GraduationCap, CalendarOff, Briefcase, Building2, FileText, ClipboardList, AlertCircle, Zap, MessageSquare, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import collegeLogo from "@/assets/college-logo.png";
import A4PreviewWrapper from "@/components/A4PreviewWrapper";
import FeedbackForm from "@/components/FeedbackForm";

type FormType =
  | "od-hosteller"
  | "od-dayscholar"
  | "leave-hosteller"
  | "leave-dayscholar"
  | "absent-hosteller"
  | "absent-dayscholar"
  | "industrial-visit"
  | "internship"
  | "siph-od";

const hostellerForms: { id: FormType; label: string; icon: typeof Home; description: string }[] = [
  { id: "od-hosteller", label: "OD – Hosteller", icon: Home, description: "On Duty form for hostel students" },
  { id: "leave-hosteller", label: "Leave – Hosteller", icon: CalendarOff, description: "Leave application for hostellers" },
  { id: "absent-hosteller", label: "Absent – Hosteller", icon: AlertCircle, description: "Absent letter for hostel students" },
];

const dayScholarForms: { id: FormType; label: string; icon: typeof Home; description: string }[] = [
  { id: "od-dayscholar", label: "OD – Day Scholar", icon: GraduationCap, description: "On Duty form for day scholars" },
  { id: "leave-dayscholar", label: "Leave – Day Scholar", icon: CalendarOff, description: "Leave application for day scholars" },
  { id: "absent-dayscholar", label: "Absent – Day Scholar", icon: AlertCircle, description: "Absent letter for day scholars" },
];

const otherForms: { id: FormType; label: string; icon: typeof Home; description: string }[] = [
  { id: "siph-od", label: "SIPH OD", icon: Zap, description: "SIPH Research OD requisition" },
];

const SIPH_ROOMS = [
  "Robot Room",
  "Robotics Room",
  "TRIC Room",
  "AI Room",
  "Mastermind Room",
  "Achievements Room",
  "Gym",
  "Crystal Hall",
  "Language Room (Japanese)",
  "Language Room (German)",
];

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];
const AMPM = ["AM", "PM"];

const formTitleMap: Record<FormType, string> = {
  "od-hosteller": "ON DUTY PERMISSION FORM (HOSTELLER)",
  "od-dayscholar": "ON DUTY PERMISSION FORM (DAY SCHOLAR)",
  "leave-hosteller": "LEAVE APPLICATION FORM (HOSTELLER)",
  "leave-dayscholar": "LEAVE APPLICATION FORM (DAY SCHOLAR)",
  "absent-hosteller": "ABSENT LETTER (HOSTELLER)",
  "absent-dayscholar": "ABSENT LETTER (DAY SCHOLAR)",
  "industrial-visit": "INDUSTRIAL VISIT PERMISSION FORM",
  "internship": "INTERNSHIP APPLICATION FORM",
  "siph-od": "ON-DUTY REQUISITION – SIPH RESEARCH & DEVELOPMENT",
};

const ApplyPage = () => {
  const { user } = useAuth();
  const { addApplication, getStudentApplications } = useAppContext();
  const formRef = useRef<HTMLDivElement>(null);
  const myApps = getStudentApplications(user?.id || "");
  const siphCount = myApps.filter((a) => a.type === "siph-od").length;
  const siphApproved = myApps.filter((a) => a.type === "siph-od" && a.status === "approved").length;
  const siphPending = myApps.filter((a) => a.type === "siph-od" && a.status === "pending").length;
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    name: user?.name || "",
    registerNumber: user?.registerNumber || "",
    department: user?.department || "",
    year: String(user?.year || ""),
    semester: String(user?.semester || ""),
    section: user?.section || "",
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
    blockRoom: "",
    totalLeaveAvailed: "",
    outTime: "",
    inTime: "",
    ccName: "",
    siphEventName: "",
    siphVenue: "",
    siphRoom: "",
  });

  const set = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const fromTime12 = `${formData.fromHour}:${formData.fromMinute} ${formData.fromAmPm}`;
  const toTime12 = `${formData.toHour}:${formData.toMinute} ${formData.toAmPm}`;

  // Required-field rules per form type
  const requiredFieldsByForm: Record<FormType, string[]> = {
    "od-hosteller": ["date","name","registerNumber","department","year","semester","section","fromDate","toDate","eventName","venue","organizerName","facultyInCharge","hostelRoomNo","reason"],
    "od-dayscholar": ["date","name","registerNumber","department","year","semester","section","fromDate","toDate","eventName","venue","organizerName","facultyInCharge","parentName","parentPhone","reason"],
    "leave-hosteller": ["date","name","registerNumber","department","year","semester","section","fromDate","toDate","blockRoom","totalLeaveAvailed","ccName","reason"],
    "leave-dayscholar": ["date","name","registerNumber","department","year","semester","section","fromDate","toDate","leaveType","parentName","parentPhone","reason"],
    "absent-hosteller": ["date","name","registerNumber","department","year","semester","section","absentDate","hostelRoomNo","parentName","parentPhone","reason"],
    "absent-dayscholar": ["date","name","registerNumber","department","year","semester","section","absentDate","parentName","parentPhone","reason"],
    "industrial-visit": ["date","name","registerNumber","department","year","semester","section","fromDate","toDate","companyName","companyAddress","facultyInCharge","parentName","parentPhone","reason"],
    "internship": ["date","name","registerNumber","department","year","semester","section","fromDate","toDate","companyName","internshipDomain","internshipDuration","companyAddress","parentName","parentPhone","reason"],
    "siph-od": ["date","name","registerNumber","department","year","semester","section","fromDate","toDate","siphEventName","siphRoom","reason"],
  };

  const validateForm = (): string[] => {
    if (!selectedForm) return ["No form selected"];
    const required = requiredFieldsByForm[selectedForm] || [];
    const missing: string[] = [];
    required.forEach((k) => {
      const v = (formData as any)[k];
      if (!v || String(v).trim() === "") missing.push(k);
    });
    return missing;
  };

  const guardOrToast = (): boolean => {
    const missing = validateForm();
    if (missing.length) {
      toast.error(`Please fill all required fields (${missing.length} missing)`);
      return false;
    }
    return true;
  };

  const captureCanvas = async () => {
    if (!formRef.current) return null;
    // The on-screen preview sits inside a CSS `transform: scale(...)` wrapper
    // (A4PreviewWrapper) so it fits mobile screens. html2canvas mis-measures
    // text positions inside transformed ancestors and stacks glyphs on top
    // of each other. To get a clean A4 render we clone the node into a fresh
    // off-screen container with NO transform and capture that instead.
    const source = formRef.current;
    const clone = source.cloneNode(true) as HTMLElement;
    const holder = document.createElement("div");
    holder.style.cssText =
      "position:fixed;left:-10000px;top:0;width:794px;background:#ffffff;z-index:-1;";
    clone.style.transform = "none";
    clone.style.width = "794px";
    holder.appendChild(clone);
    document.body.appendChild(holder);
    // Allow layout + web fonts to settle before snapshot
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    if ((document as any).fonts?.ready) {
      try { await (document as any).fonts.ready; } catch { /* ignore */ }
    }
    try {
      return await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
        windowWidth: 794,
      });
    } finally {
      document.body.removeChild(holder);
    }
  };

  const handleSavePDF = async () => {
    if (!guardOrToast()) return;
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      const img = canvas.toDataURL("image/png");
      if (imgH <= pageH) {
        pdf.addImage(img, "PNG", 0, 0, pageW, imgH);
      } else {
        // Multi-page: paginate the tall canvas across A4 pages
        let heightLeft = imgH;
        let position = 0;
        pdf.addImage(img, "PNG", 0, position, pageW, imgH);
        heightLeft -= pageH;
        while (heightLeft > 0) {
          position -= pageH;
          pdf.addPage();
          pdf.addImage(img, "PNG", 0, position, pageW, imgH);
          heightLeft -= pageH;
        }
      }
      pdf.save(`${selectedForm}_${formData.registerNumber || "form"}.pdf`);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  const handleSaveJPG = async () => {
    if (!guardOrToast()) return;
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
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
    if (!guardOrToast()) return;
    const typeMap: Record<FormType, string> = {
      "od-hosteller": "hostel-od",
      "od-dayscholar": "day-scholar-od",
      "leave-hosteller": "leave",
      "leave-dayscholar": "leave",
      "absent-hosteller": "leave",
      "absent-dayscholar": "leave",
      "industrial-visit": "industrial-visit",
      "internship": "internship",
      "siph-od": "siph-od",
    };
    addApplication({
      studentId: user!.id,
      studentName: formData.name,
      registerNumber: formData.registerNumber,
      department: formData.department,
      type: typeMap[selectedForm!] as any,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason || formData.eventName || formData.siphEventName || selectedForm || "",
    });
    toast.success("Application submitted!");
  };

  // Hostel leave form data helper
  const hostelLeaveData = {
    studentName: formData.name,
    date: formData.date,
    regNo: formData.registerNumber,
    yearDept: `${formData.year} / ${formData.department}`,
    blockRoom: formData.blockRoom,
    totalLeaveAvailed: formData.totalLeaveAvailed,
    dateOfLeave: formData.fromDate,
    dateOfReturn: formData.toDate,
    outTime: formData.outTime || fromTime12,
    inTime: formData.inTime || toTime12,
    daysRequested: (() => {
      if (formData.fromDate && formData.toDate) {
        const diff = Math.ceil((new Date(formData.toDate).getTime() - new Date(formData.fromDate).getTime()) / 86400000) + 1;
        return diff > 0 ? String(diff) : "";
      }
      return "";
    })(),
    reason: formData.reason,
    ccName: formData.ccName,
  };

  const getRows = (): [string, string][] => {
    if (!selectedForm) return [];
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
      case "leave-dayscholar":
        return [
          ...common,
          ["Leave Type", formData.leaveType],
          ["From Date", formData.fromDate],
          ["To Date", formData.toDate],
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
      case "siph-od":
        return [
          ...common,
          ["From Date", formData.fromDate],
          ["To Date", formData.toDate],
          ["SIPH Event Name", formData.siphEventName],
          ["SIPH Room", formData.siphRoom],
          ["Venue", formData.siphVenue || "SIPH"],
          ["Reason", formData.reason],
        ];
      default:
        return common;
    }
  };

  const renderFormButton = (ft: { id: FormType; label: string; icon: typeof Home; description: string }, i: number) => (
    <motion.button
      key={ft.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      onClick={() => setSelectedForm(ft.id)}
      className={`glass-card p-3 text-left transition-all duration-200 flex items-start gap-2.5 ${
        selectedForm === ft.id ? "border-primary gold-glow ring-1 ring-primary" : "hover:border-primary/40"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        selectedForm === ft.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
      }`}>
        <ft.icon size={16} />
      </div>
      <div className="min-w-0">
        <p className={`text-[12px] sm:text-xs font-semibold leading-tight ${selectedForm === ft.id ? "text-primary" : "text-card-foreground"}`}>
          {ft.label}
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">{ft.description}</p>
      </div>
    </motion.button>
  );

  // Hostel leave form copy (for leave-hosteller)
  const cellStyle: React.CSSProperties = { border: "1px solid #000", padding: "6px 10px", fontSize: "12px" };
  const boldCell: React.CSSProperties = { ...cellStyle, fontWeight: "bold" };

  const renderHostelLeavePreview = () => {
    const d = hostelLeaveData;
    const renderCopy = (title: string) => (
      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 6 }}>
          <img src={collegeLogo} alt="College Logo" style={{ height: 56, width: "auto", objectFit: "contain" }} />
          <h2 style={{ fontWeight: "bold", fontSize: "16px", margin: 0 }}>
            Smart Campus OD &amp; Leave Management System
          </h2>
        </div>
        <h3 style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", margin: "0 0 12px" }}>{title}</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={boldCell} width="25%">Student Name:</td><td style={cellStyle} width="25%">{d.studentName}</td><td style={boldCell} width="25%">Date:</td><td style={cellStyle} width="25%">{d.date}</td></tr>
            <tr><td style={boldCell}>Register No:</td><td style={cellStyle}>{d.regNo}</td><td style={boldCell}>Year/ Department</td><td style={cellStyle}>{d.yearDept}</td></tr>
            <tr><td style={boldCell}>Block/ Room No:</td><td style={cellStyle}>{d.blockRoom}</td><td style={boldCell}>Total no. of leave already availed in this Semester:</td><td style={cellStyle}>{d.totalLeaveAvailed}</td></tr>
            <tr><td style={boldCell}>Date of Leave:</td><td style={cellStyle}>{d.dateOfLeave}</td><td style={boldCell}>OUT Time:</td><td style={cellStyle}>{d.outTime}</td></tr>
            <tr><td style={boldCell}>Date of return:</td><td style={cellStyle}>{d.dateOfReturn}</td><td style={boldCell}>IN Time:</td><td style={cellStyle}>{d.inTime}</td></tr>
            <tr><td colSpan={2} style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>No. of Days of leave requested now:</td><td colSpan={2} style={cellStyle}>{d.daysRequested}</td></tr>
            <tr><td colSpan={4} style={{ ...cellStyle, fontSize: "10px", fontStyle: "italic" }}>Attach Medical certificate or any other proof if it s more than 3 days</td></tr>
            <tr><td style={boldCell}>Details / Reason<br/>for Leave</td><td style={cellStyle}>{d.reason}</td><td colSpan={2} style={{ ...boldCell, textAlign: "center" }}>Signature of the Student</td></tr>
            <tr><td colSpan={4} style={boldCell}><strong>Declaration by Student:</strong><br/><span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "11px" }}>I hereby assure that, I will return to the hostel on the date and time mentioned by me</span></td></tr>
            <tr><td colSpan={2} style={boldCell}>Declaration by Class Coordinator (CC) after communicated to parents:</td><td style={boldCell}>Name of the CC</td><td style={boldCell}>Signature of CC.</td></tr>
            <tr><td colSpan={2} style={{ ...cellStyle, height: "30px" }}></td><td style={{ ...cellStyle, height: "30px" }}>{d.ccName}</td><td style={{ ...cellStyle, height: "30px" }}></td></tr>
            <tr><td colSpan={2} style={boldCell}>Signature of HoD with Date and Seal</td><td colSpan={2} style={{ ...cellStyle, height: "30px" }}></td></tr>
          </tbody>
        </table>
      </div>
    );
    return (
      <div ref={formRef} style={{ width: 794, padding: "35px 45px", backgroundColor: "#fff", color: "#000", fontFamily: "'Times New Roman', serif", lineHeight: "1.5" }}>
        {renderCopy("Hostel Students- Leave Form -1 (Department Copy)")}
        <div style={{ borderTop: "2px dashed #999", margin: "10px 0" }} />
        <p style={{ textAlign: "center", fontSize: "10px", fontStyle: "italic", color: "#666", margin: "4px 0 10px" }}>(Photo of this letter copy should be sent to AC and Student affairs)</p>
        {renderCopy("Hostel Students- Leave Form -2 (Warden Copy)")}
      </div>
    );
  };

  const renderSiphODPreview = () => (
    <div ref={formRef} style={{ width: 794, padding: "40px 50px", backgroundColor: "#fff", color: "#000", fontFamily: "'Times New Roman', serif", lineHeight: "1.8" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <img src={collegeLogo} alt="College Logo" style={{ height: 70 }} />
        <div style={{ textAlign: "right" }}>
          <h2 style={{ fontSize: 22, fontWeight: "bold", margin: 0, color: "#1a365d" }}>ON-DUTY REQUISITION</h2>
          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>SIPH RESEARCH & DEVELOPMENT</p>
        </div>
      </div>
      <hr style={{ border: "2px solid #c8a200", margin: "10px 0 20px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <p><strong>Ref: SIPH/OD/{new Date().getFullYear()}/SEC</strong></p>
        <p><strong>Date: {formData.date ? new Date(formData.date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : ""}</strong></p>
      </div>
      <div style={{ marginTop: 20, fontSize: 14 }}>
        <p><strong>To,</strong></p>
        <p>The Head of the Department,</p>
        <p><strong>{formData.department}</strong></p>
        <p>SIPH Campus Office.</p>
      </div>
      <div style={{ margin: "25px 0", borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
        <p style={{ fontWeight: "bold", fontStyle: "italic", textDecoration: "underline", fontSize: 15 }}>
          Subject: Requesting Permission for On-Duty (OD) – {formData.siphEventName || "SIPH Preparation"}
        </p>
      </div>
      <div style={{ fontSize: 14 }}>
        <p>Respected Sir/Madam,</p>
        <p style={{ marginTop: 15 }}>
          I, <strong>{formData.name || "_______________"}</strong>, bearing Register Number <strong>{formData.registerNumber || "_______________"}</strong>,
          a student of <strong>{formData.year ? `${formData.year} Year` : "____ Year"}</strong>,
          <strong> Semester {formData.semester || "__"}</strong>, Section <strong>{formData.section || "__"}</strong>,
          Department of <strong>{formData.department || "_______________"}</strong>, hereby submit this request for your kind approval.
        </p>
        <p style={{ marginTop: 15 }}>
          I am participating in the <strong>{formData.siphEventName || "_______________"}</strong> event
          {formData.siphRoom ? <> at the <strong>{formData.siphRoom}</strong></> : null}
          {formData.siphVenue ? <>, Venue: <strong>{formData.siphVenue}</strong></> : null}.
          In this connection, I request you to kindly grant me On-Duty (OD) permission from{" "}
          <strong>{formData.fromDate ? new Date(formData.fromDate).toLocaleDateString("en-GB") : "___"}</strong> to{" "}
          <strong>{formData.toDate ? new Date(formData.toDate).toLocaleDateString("en-GB") : "___"}</strong>
          {` (${fromTime12} – ${toTime12})`}.
        </p>
        {formData.reason && (
          <p style={{ marginTop: 15 }}>
            <strong>Reason / Remarks:</strong> {formData.reason}
          </p>
        )}
        <p style={{ marginTop: 15 }}>
          I assure you that I will be diligent in completing any academic requirements or classes missed during this period.
        </p>
        <p style={{ marginTop: 25 }}>Thanking you,</p>
        <p style={{ margin: "2px 0 0" }}>Yours sincerely,</p>
        <p style={{ margin: "6px 0 0", fontWeight: "bold" }}>{formData.name || "_______________"}</p>
      </div>


      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 12 }}>
        <div><div style={{ borderTop: "1px solid #000", width: 180, marginBottom: 4 }} /><p style={{ fontWeight: "bold", letterSpacing: 2 }}>STUDENT SIGNATURE</p></div>
        <div><div style={{ borderTop: "1px solid #000", width: 180, marginBottom: 4 }} /><p style={{ fontWeight: "bold", letterSpacing: 2 }}>SIPH HEAD</p></div>
        <div><div style={{ borderTop: "1px solid #000", width: 180, marginBottom: 4 }} /><p style={{ fontWeight: "bold", letterSpacing: 2 }}>HOD APPROVAL</p></div>
      </div>
    </div>
  );

  const isODForm = selectedForm === "od-hosteller" || selectedForm === "od-dayscholar";

  const renderODLetterPreview = () => {
    const refNo = `CF/OD/${new Date().getFullYear()}/${(formData.registerNumber || "XXXX").slice(-4)}`;
    const niceDate = formData.date ? new Date(formData.date).toLocaleDateString("en-GB") : "_______________";
    const dateRange = formData.fromDate && formData.toDate
      ? `${new Date(formData.fromDate).toLocaleDateString("en-GB")} to ${new Date(formData.toDate).toLocaleDateString("en-GB")}`
      : "_______________";
    const timeRange = `${fromTime12} – ${toTime12}`;
    const row = (label: string, value: string) => (
      <tr>
        <td style={{ padding: "8px 12px", fontWeight: 600, color: "#334155", width: "38%", borderBottom: "1px solid #e5e7eb" }}>{label}</td>
        <td style={{ padding: "8px 12px", color: "#0f172a", borderBottom: "1px solid #e5e7eb" }}>: {value || "_______________________________"}</td>
      </tr>
    );
    return (
      <div ref={formRef} style={{ width: 794, padding: "40px 50px", background: "#fff", color: "#0f172a", fontFamily: "'Helvetica', 'Arial', sans-serif", fontSize: 13, lineHeight: 1.55 }}>
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <img src={collegeLogo} alt="Campus Flow Logo" style={{ height: 60, width: "auto", objectFit: "contain" }} />
          <div style={{ textAlign: "center", flex: 1 }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 2, color: "#1e3a8a" }}>CAMPUS FLOW</p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b", letterSpacing: 1 }}>Smart OD Management System</p>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#334155", minWidth: 160 }}>
            <p style={{ margin: 0 }}>Date: <strong>{niceDate}</strong></p>
            <p style={{ margin: 0 }}>Ref No: <strong>{refNo}</strong></p>
          </div>
        </div>
        <hr style={{ border: 0, borderTop: "1px solid #cbd5e1", margin: "14px 0 18px" }} />

        {/* TITLE */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: 1 }}>ON-DUTY APPLICATION FORM</h1>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
            For Academic, Technical, Workshop, Symposium &amp; SIPH Activities
          </p>
        </div>

        {/* TO SECTION */}
        <div style={{ marginBottom: 18, fontSize: 13 }}>
          <p style={{ margin: 0 }}>To,</p>
          <p style={{ margin: 0 }}>The Head of the Department,</p>
          <p style={{ margin: 0 }}>The Class Coordinators,</p>
          <p style={{ margin: 0 }}>The SIPH Head</p>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>{formData.department || "_______________________________"}</p>
          <p style={{ margin: 0, color: "#64748b" }}>_______________________________</p>
        </div>

        {/* STUDENT DETAILS CARD */}
        <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 4px", marginBottom: 18 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {row("Student Name", formData.name)}
              {row("Register Number", formData.registerNumber)}
              {row("Department", formData.department)}
              {row("Year / Semester", `${formData.year || "—"} / ${formData.semester || "—"}`)}
              {row("Section", formData.section)}
              {row("Mobile Number", (user as any)?.mobile || "")}
              {row("Event / Activity", formData.eventName)}
              {row("Organization / Venue", formData.venue || formData.organizerName)}
              {row("OD Date(s)", dateRange)}
              {row("Time Duration", timeRange)}
              {row("Faculty In-charge", formData.facultyInCharge)}
            </tbody>
          </table>
        </div>

        {/* APPLICATION CONTENT */}
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 700 }}>Subject: Request for On-Duty Permission</p>
          <p style={{ margin: "10px 0 0" }}>Respected Sir/Madam,</p>
          <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
            I kindly request permission to grant me On-Duty (OD) for participating in the above-mentioned academic/technical activity.
          </p>
          <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
            The event/activity will help enhance my technical knowledge, practical exposure, teamwork, communication skills, and learning experience.
          </p>
          <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
            I assure you that I will complete all academic responsibilities and assignments related to the missed classes during the OD period.
          </p>
          <p style={{ margin: "10px 0 0" }}>Kindly approve my request.</p>
          <p style={{ margin: "16px 0 0" }}>Thanking you,</p>
          <p style={{ margin: "2px 0 0" }}>Yours faithfully,</p>
          <p style={{ margin: "6px 0 0", fontWeight: 700 }}>{formData.name || "_______________________________"}</p>
        </div>

        {/* SIGNATURES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 40, fontSize: 11, textAlign: "center" }}>
          {["Student Signature", "Faculty In-charge", "SIPH Head Signature", "HOD Approval"].map((s) => (
            <div key={s}>
              <div style={{ borderTop: "1px solid #94a3b8", marginBottom: 6, marginTop: 30 }} />
              <p style={{ margin: 0, fontWeight: 600, color: "#334155" }}>{s}</p>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <p style={{ marginTop: 28, paddingTop: 10, borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: 10, color: "#94a3b8" }}>
          Generated via Campus Flow – Smart OD Management System
        </p>
      </div>
    );
  };

  const renderFormalLetterPreview = () => {
    const kind = selectedForm as
      | "leave-dayscholar" | "absent-hosteller" | "absent-dayscholar";
    const isAbsent = kind === "absent-hosteller" || kind === "absent-dayscholar";
    const isHosteller = kind === "absent-hosteller";
    const title = isAbsent ? "ABSENT LETTER" : "LEAVE APPLICATION";
    const refPrefix = isAbsent ? "ABS" : "LV";
    const refNo = `CF/${refPrefix}/${new Date().getFullYear()}/${(formData.registerNumber || "XXXX").slice(-4)}`;
    const niceDate = formData.date ? new Date(formData.date).toLocaleDateString("en-GB") : "_______________";
    const absentDate = formData.absentDate ? new Date(formData.absentDate).toLocaleDateString("en-GB") : "_______________";
    const dateRange = formData.fromDate && formData.toDate
      ? `${new Date(formData.fromDate).toLocaleDateString("en-GB")} to ${new Date(formData.toDate).toLocaleDateString("en-GB")}`
      : "_______________";

    const subject = isAbsent
      ? `Letter of Absence – ${absentDate}`
      : `Request for ${formData.leaveType || "Leave"} from ${dateRange}`;

    const body = isAbsent ? (
      <>
        <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
          I respectfully inform you that I was unable to attend college on <strong>{absentDate}</strong> due to
          <strong> {formData.reason || "the reason stated below"}</strong>.
        </p>
        <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
          My parent/guardian <strong>{formData.parentName || "_______________"}</strong> (Mobile: <strong>{formData.parentPhone || "_______________"}</strong>) is aware of my absence.
        </p>
        {isHosteller && (
          <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
            I reside at hostel <strong>Room No. {formData.hostelRoomNo || "_______________"}</strong>.
          </p>
        )}
        <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
          Kindly consider this letter as an intimation for my absence and grant me the necessary excuse. I assure you that I will complete all missed academic work at the earliest.
        </p>
      </>
    ) : (
      <>
        <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
          I kindly request you to grant me <strong>{formData.leaveType || "leave"}</strong> from <strong>{dateRange}</strong> for the reason mentioned below.
        </p>
        <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
          <strong>Reason:</strong> {formData.reason || "_______________"}
        </p>
        <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
          My parent/guardian <strong>{formData.parentName || "_______________"}</strong> (Mobile: <strong>{formData.parentPhone || "_______________"}</strong>) is aware of and consents to this leave.
        </p>
        <p style={{ margin: "10px 0 0", textAlign: "justify" }}>
          I assure you that I will complete all pending academic responsibilities and assignments during the missed period.
        </p>
      </>
    );

    const row = (label: string, value: string) => (
      <tr>
        <td style={{ padding: "6px 10px", fontWeight: 600, color: "#334155", width: "38%", borderBottom: "1px solid #e5e7eb" }}>{label}</td>
        <td style={{ padding: "6px 10px", color: "#0f172a", borderBottom: "1px solid #e5e7eb" }}>: {value || "_______________"}</td>
      </tr>
    );

    return (
      <div ref={formRef} style={{ width: 794, padding: "40px 50px", background: "#fff", color: "#0f172a", fontFamily: "'Helvetica', 'Arial', sans-serif", fontSize: 13, lineHeight: 1.55 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <img src={collegeLogo} alt="Logo" style={{ height: 60, width: "auto", objectFit: "contain" }} />
          <div style={{ textAlign: "center", flex: 1 }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: 2, color: "#1e3a8a" }}>CAMPUS FLOW</p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b", letterSpacing: 1 }}>Smart Campus OD &amp; Leave Management System</p>
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "#334155", minWidth: 160 }}>
            <p style={{ margin: 0 }}>Date: <strong>{niceDate}</strong></p>
            <p style={{ margin: 0 }}>Ref: <strong>{refNo}</strong></p>
          </div>
        </div>
        <hr style={{ border: 0, borderTop: "1px solid #cbd5e1", margin: "14px 0 18px" }} />
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: 1 }}>
            {title} – {isHosteller ? "HOSTELLER" : kind === "absent-dayscholar" ? "DAY SCHOLAR" : "DAY SCHOLAR"}
          </h1>
        </div>

        {/* From */}
        <div style={{ marginBottom: 14, fontSize: 13 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>From,</p>
          <p style={{ margin: 0 }}>{formData.name || "_______________"}</p>
          <p style={{ margin: 0, color: "#64748b" }}>Reg. No: {formData.registerNumber || "_______________"}</p>
          <p style={{ margin: 0, color: "#64748b" }}>{formData.department || ""} – Year {formData.year || "_"} / Sem {formData.semester || "_"} / Section {formData.section || "_"}</p>
        </div>

        {/* To */}
        <div style={{ marginBottom: 14, fontSize: 13 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>To,</p>
          <p style={{ margin: 0 }}>The Head of the Department,</p>
          <p style={{ margin: 0 }}>{formData.department || "_______________"}</p>
          <p style={{ margin: 0 }}>The Class Coordinator{isHosteller ? " & Hostel Warden" : ""},</p>
          <p style={{ margin: 0, color: "#64748b" }}>{formData.department || ""}</p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Subject: {subject}</p>
        </div>

        <p style={{ margin: "8px 0 0" }}>Respected Sir/Madam,</p>
        {body}
        <p style={{ margin: "16px 0 0" }}>Thanking you,</p>
        <p style={{ margin: "2px 0 0" }}>Yours sincerely,</p>
        <p style={{ margin: "6px 0 0", fontWeight: 700 }}>{formData.name || "_______________"}</p>

        {/* Details card */}
        <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, marginTop: 18 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {row("Student Name", formData.name)}
              {row("Register Number", formData.registerNumber)}
              {row("Department / Year / Sec", `${formData.department || ""} / ${formData.year || ""} / ${formData.section || ""}`)}
              {isAbsent
                ? row("Absent Date", absentDate)
                : row("Leave Duration", dateRange)}
              {!isAbsent && row("Leave Type", formData.leaveType)}
              {isHosteller && row("Hostel Room No", formData.hostelRoomNo)}
              {row("Parent / Guardian", formData.parentName)}
              {row("Parent Mobile", formData.parentPhone)}
              {row(isAbsent ? "Reason for Absence" : "Reason", formData.reason)}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${isHosteller ? 4 : 3}, 1fr)`, gap: 12, marginTop: 40, fontSize: 11, textAlign: "center" }}>
          {["Student Signature", "Class Coordinator", ...(isHosteller ? ["Hostel Warden"] : []), "HOD Approval"].map((s) => (
            <div key={s}>
              <div style={{ borderTop: "1px solid #94a3b8", marginBottom: 6, marginTop: 30 }} />
              <p style={{ margin: 0, fontWeight: 600, color: "#334155" }}>{s}</p>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 24, paddingTop: 10, borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: 10, color: "#94a3b8" }}>
          Generated via Campus Flow – Smart Campus OD &amp; Leave Management System
        </p>
      </div>
    );
  };

  const renderDefaultPreview = () => (
    <div ref={formRef} style={{ width: 794, fontFamily: "serif", fontSize: 13, background: "#fff", color: "#000", padding: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src={collegeLogo} alt="College Logo" style={{ height: 60, margin: "0 auto" }} />
        <h2 style={{ fontSize: 16, fontWeight: "bold", marginTop: 8 }}>SMART CAMPUS OD &amp; LEAVE MANAGEMENT SYSTEM</h2>
        
        <h3 style={{ fontSize: 14, fontWeight: "bold", marginTop: 8, textDecoration: "underline" }}>{formTitleMap[selectedForm!]}</h3>
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
        <div style={{ textAlign: "center" }}><div style={{ borderTop: "1px solid #000", width: 150, marginBottom: 4 }} /><p>Student Signature</p></div>
        <div style={{ textAlign: "center" }}><div style={{ borderTop: "1px solid #000", width: 150, marginBottom: 4 }} /><p>Faculty / Advisor</p></div>
        <div style={{ textAlign: "center" }}><div style={{ borderTop: "1px solid #000", width: 150, marginBottom: 4 }} /><p>HOD</p></div>
      </div>
      <div style={{ marginTop: 30, fontSize: 11, textAlign: "center", color: "#666" }}>
        <p>This form must be submitted before the mentioned date. Approval is subject to HOD discretion.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Apply</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select a form, fill details (<span className="text-destructive">*</span> required), and download
        </p>
      </motion.div>

      {showFeedback && <FeedbackForm onClose={() => setShowFeedback(false)} />}

      {/* Two-column layout: Hosteller | Day Scholar */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-primary mb-2">🏠 Hosteller</p>
          <div className="grid grid-cols-1 gap-2">
            {hostellerForms.map((ft, i) => renderFormButton(ft, i))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-primary mb-2">🎓 Day Scholar</p>
          <div className="grid grid-cols-1 gap-2">
            {dayScholarForms.map((ft, i) => renderFormButton(ft, i))}
          </div>
        </div>
      </div>

      {/* Other forms */}
      <div>
        <p className="text-xs font-semibold text-primary mb-2">📋 Other Forms</p>
        <div className="grid grid-cols-2 gap-2">
          {otherForms.map((ft, i) => renderFormButton(ft, i))}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -2 }}
            onClick={() => setShowFeedback(true)}
            className="glass-card p-3 text-left transition-all duration-200 flex items-start gap-2.5 hover:border-primary/40"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
              <AlertTriangle size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] sm:text-xs font-semibold leading-tight text-card-foreground">College Issue</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                Report issues / inconvenience inside the college
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Form Fill Section - all fields inline, no sub-components */}
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
              {formTitleMap[selectedForm]}
            </h3>

            {/* Common Fields - INLINE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <Input placeholder="Date *" type="date" value={formData.date} onChange={(e) => set("date", e.target.value)} />
              <Input placeholder="Student Name *" value={formData.name} onChange={(e) => set("name", e.target.value)} />
              <Input placeholder="Register Number *" value={formData.registerNumber} onChange={(e) => set("registerNumber", e.target.value)} />
              <Select value={formData.department} onValueChange={(v) => set("department", v)}>
                <SelectTrigger><SelectValue placeholder="Department *" /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={formData.year} onValueChange={(v) => set("year", v)}>
                <SelectTrigger><SelectValue placeholder="Year *" /></SelectTrigger>
                <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={formData.semester} onValueChange={(v) => set("semester", v)}>
                <SelectTrigger><SelectValue placeholder="Semester *" /></SelectTrigger>
                <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Section *" value={formData.section} onChange={(e) => set("section", e.target.value)} />
            </div>

            {/* Date/Time fields for non-absent forms */}
            {!["absent-hosteller", "absent-dayscholar"].includes(selectedForm) && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-card-foreground">From Date <span className="text-destructive">*</span></p>
                    <Input type="date" value={formData.fromDate} onChange={(e) => set("fromDate", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-card-foreground">To Date <span className="text-destructive">*</span></p>
                    <Input type="date" value={formData.toDate} onChange={(e) => set("toDate", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* From Time */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-card-foreground">From Time (12hr)</p>
                    <div className="flex gap-1.5">
                      <Select value={formData.fromHour} onValueChange={(v) => set("fromHour", v)}>
                        <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{HOURS_12.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="self-center text-muted-foreground">:</span>
                      <Select value={formData.fromMinute} onValueChange={(v) => set("fromMinute", v)}>
                        <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{MINUTES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={formData.fromAmPm} onValueChange={(v) => set("fromAmPm", v)}>
                        <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{AMPM.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* To Time */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-card-foreground">To Time (12hr)</p>
                    <div className="flex gap-1.5">
                      <Select value={formData.toHour} onValueChange={(v) => set("toHour", v)}>
                        <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{HOURS_12.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="self-center text-muted-foreground">:</span>
                      <Select value={formData.toMinute} onValueChange={(v) => set("toMinute", v)}>
                        <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{MINUTES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={formData.toAmPm} onValueChange={(v) => set("toAmPm", v)}>
                        <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{AMPM.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form-specific extra fields - INLINE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {(selectedForm === "od-hosteller" || selectedForm === "od-dayscholar") && (
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
              )}

              {selectedForm === "leave-hosteller" && (
                <>
                  <Input placeholder="Block / Room No" value={formData.blockRoom} onChange={(e) => set("blockRoom", e.target.value)} />
                  <Input placeholder="Total Leave Already Availed" value={formData.totalLeaveAvailed} onChange={(e) => set("totalLeaveAvailed", e.target.value)} />
                  <Input placeholder="OUT Time" type="time" value={formData.outTime} onChange={(e) => set("outTime", e.target.value)} />
                  <Input placeholder="IN Time" type="time" value={formData.inTime} onChange={(e) => set("inTime", e.target.value)} />
                  <Input placeholder="Class Coordinator Name" value={formData.ccName} onChange={(e) => set("ccName", e.target.value)} />
                </>
              )}

              {selectedForm === "leave-dayscholar" && (
                <>
                  <Select value={formData.leaveType} onValueChange={(v) => set("leaveType", v)}>
                    <SelectTrigger><SelectValue placeholder="Leave Type" /></SelectTrigger>
                    <SelectContent>
                      {["Sick Leave", "Personal Leave", "Family Emergency", "Medical Leave", "Other"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
                  <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
                </>
              )}

              {(selectedForm === "absent-hosteller" || selectedForm === "absent-dayscholar") && (
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
              )}

              {selectedForm === "industrial-visit" && (
                <>
                  <Input placeholder="Company / Industry Name" value={formData.companyName} onChange={(e) => set("companyName", e.target.value)} />
                  <Input placeholder="Company Address" value={formData.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} />
                  <Input placeholder="Faculty In-Charge" value={formData.facultyInCharge} onChange={(e) => set("facultyInCharge", e.target.value)} />
                  <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
                  <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
                </>
              )}

              {selectedForm === "internship" && (
                <>
                  <Input placeholder="Company Name" value={formData.companyName} onChange={(e) => set("companyName", e.target.value)} />
                  <Input placeholder="Internship Domain" value={formData.internshipDomain} onChange={(e) => set("internshipDomain", e.target.value)} />
                  <Input placeholder="Duration (e.g. 2 months)" value={formData.internshipDuration} onChange={(e) => set("internshipDuration", e.target.value)} />
                  <Input placeholder="Company Address" value={formData.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} />
                  <Input placeholder="Parent / Guardian Name" value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
                  <Input placeholder="Parent Phone" value={formData.parentPhone} onChange={(e) => set("parentPhone", e.target.value)} />
                </>
              )}

              {selectedForm === "siph-od" && (
                <>
                  <Input placeholder="SIPH Event / Program Name *" value={formData.siphEventName} onChange={(e) => set("siphEventName", e.target.value)} />
                  <Select value={formData.siphRoom} onValueChange={(v) => set("siphRoom", v)}>
                    <SelectTrigger><SelectValue placeholder="SIPH Room *" /></SelectTrigger>
                    <SelectContent>{SIPH_ROOMS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Venue (optional)" value={formData.siphVenue} onChange={(e) => set("siphVenue", e.target.value)} />
                </>
              )}
            </div>

            <Textarea placeholder="Reason / Remarks *" value={formData.reason} onChange={(e) => set("reason", e.target.value)} />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSubmitApplication} className="gap-1.5 text-xs sm:text-sm">
                <ClipboardList size={14} /> Submit
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
          <A4PreviewWrapper className="border border-border rounded-lg">
            {selectedForm === "leave-hosteller" ? renderHostelLeavePreview() :
             selectedForm === "siph-od" ? renderSiphODPreview() :
             isODForm ? renderODLetterPreview() :
             (selectedForm === "leave-dayscholar" || selectedForm === "absent-hosteller" || selectedForm === "absent-dayscholar")
               ? renderFormalLetterPreview() :
             renderDefaultPreview()}
          </A4PreviewWrapper>
        </motion.div>
      )}
    </div>
  );
};

export default ApplyPage;
