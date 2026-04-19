import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, DEPARTMENTS, SEMESTERS, YEARS } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileImage, Home, GraduationCap, CalendarOff, Briefcase, Building2, FileText, ClipboardList, AlertCircle, Zap } from "lucide-react";
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
  { id: "industrial-visit", label: "Industrial Visit", icon: Building2, description: "IV permission form" },
  { id: "internship", label: "Internship Application", icon: Briefcase, description: "Internship consent & application" },
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
  const { addApplication } = useAppContext();
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null);

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
          ["Venue", formData.siphVenue || "SIPH"],
          ["Reason", formData.reason],
        ];
      default:
        return common;
    }
  };

  const renderFormButton = (ft: { id: FormType; label: string; icon: typeof Home }, i: number) => (
    <motion.button
      key={ft.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setSelectedForm(ft.id)}
      className={`glass-card p-2.5 sm:p-3 text-left transition-all duration-200 ${
        selectedForm === ft.id ? "border-primary gold-glow" : "hover:border-border"
      }`}
    >
      <ft.icon size={16} className={selectedForm === ft.id ? "text-primary" : "text-muted-foreground"} />
      <p className={`text-[11px] sm:text-xs font-medium mt-1 leading-tight ${selectedForm === ft.id ? "text-primary" : "text-card-foreground"}`}>
        {ft.label}
      </p>
    </motion.button>
  );

  // Hostel leave form copy (for leave-hosteller)
  const cellStyle: React.CSSProperties = { border: "1px solid #000", padding: "6px 10px", fontSize: "12px" };
  const boldCell: React.CSSProperties = { ...cellStyle, fontWeight: "bold" };

  const renderHostelLeavePreview = () => {
    const d = hostelLeaveData;
    const renderCopy = (title: string) => (
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", margin: "0 0 2px" }}>
          Smart Campus OD &amp; Leave Management System
        </h2>
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
          I, <strong>{formData.name}</strong>, bearing Register Number <strong>{formData.registerNumber}</strong>,
          a student of <strong>{formData.year ? `${formData.year} Year` : ""}</strong>,
          Department of <strong>{formData.department}</strong>, hereby submit this request for your kind approval.
        </p>
        <p style={{ marginTop: 15 }}>
          I am participating in the <strong>{formData.siphEventName || "SIPH Preparation"}</strong> event at {formData.siphVenue || "SIPH"}.
          In this connection, I request you to kindly grant me On-Duty (OD) permission from{" "}
          <strong>{formData.fromDate ? new Date(formData.fromDate).toLocaleDateString("en-GB") : "___"}</strong> to{" "}
          <strong>{formData.toDate ? new Date(formData.toDate).toLocaleDateString("en-GB") : "___"}</strong>.
        </p>
        <p style={{ marginTop: 15 }}>
          I assure you that I will be diligent in completing any academic requirements or classes missed during this period.
        </p>
        <p style={{ marginTop: 25 }}>Thanking you,</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60, fontSize: 12 }}>
        <div><div style={{ borderTop: "1px solid #000", width: 180, marginBottom: 4 }} /><p style={{ fontWeight: "bold", letterSpacing: 2 }}>STUDENT SIGNATURE</p></div>
        <div><div style={{ borderTop: "1px solid #000", width: 180, marginBottom: 4 }} /><p style={{ fontWeight: "bold", letterSpacing: 2 }}>HOD APPROVAL</p></div>
      </div>
    </div>
  );

  const renderDefaultPreview = () => (
    <div ref={formRef} style={{ width: 794, fontFamily: "serif", fontSize: 13, background: "#fff", color: "#000", padding: 40 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src={collegeLogo} alt="College Logo" style={{ height: 60, margin: "0 auto" }} />
        <h2 style={{ fontSize: 16, fontWeight: "bold", marginTop: 8 }}>SMART CAMPUS OD &amp; LEAVE MANAGEMENT SYSTEM</h2>
        <p style={{ fontSize: 12 }}>Padappai, Chennai – 601301</p>
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
        <p className="text-xs sm:text-sm text-muted-foreground">Select a form, fill details, and download</p>
      </motion.div>

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
        <div className="grid grid-cols-3 gap-2">
          {otherForms.map((ft, i) => renderFormButton(ft, i))}
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

            {/* Date/Time fields for non-absent forms */}
            {!["absent-hosteller", "absent-dayscholar"].includes(selectedForm) && (
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
                  <Input placeholder="SIPH Event / Program Name" value={formData.siphEventName} onChange={(e) => set("siphEventName", e.target.value)} />
                  <Input placeholder="Venue (e.g. SIPH)" value={formData.siphVenue} onChange={(e) => set("siphVenue", e.target.value)} />
                </>
              )}
            </div>

            <Textarea placeholder="Reason / Remarks" value={formData.reason} onChange={(e) => set("reason", e.target.value)} />

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
          <div className="overflow-auto border border-border rounded-lg">
            {selectedForm === "leave-hosteller" ? renderHostelLeavePreview() :
             selectedForm === "siph-od" ? renderSiphODPreview() :
             renderDefaultPreview()}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ApplyPage;
