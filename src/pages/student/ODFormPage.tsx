import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth, DEPARTMENTS, SEMESTERS, YEARS } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileImage } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import collegeLogo from "@/assets/college-logo.png";
import A4PreviewWrapper from "@/components/A4PreviewWrapper";

const ODFormPage = () => {
  const { user } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);
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
    reason: "",
    eventName: "",
    venue: "",
    organizerName: "",
    facultyInCharge: "",
  });

  const set = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const handleSavePDF = async () => {
    if (!formRef.current) return;
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`OD_Form_${formData.registerNumber}.pdf`);
      toast.success("PDF downloaded!");
    } catch { toast.error("Failed to generate PDF"); }
  };

  const handleSaveJPG = async () => {
    if (!formRef.current) return;
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `OD_Form_${formData.registerNumber}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      toast.success("JPG downloaded!");
    } catch { toast.error("Failed to generate JPG"); }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">On Duty Form</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Fill details and download as PDF/JPG</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-3 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-card-foreground">Fill Form Details</h3>
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
          <Input placeholder="From Date" type="date" value={formData.fromDate} onChange={(e) => set("fromDate", e.target.value)} />
          <Input placeholder="To Date" type="date" value={formData.toDate} onChange={(e) => set("toDate", e.target.value)} />
          <Input placeholder="Event / Program Name" value={formData.eventName} onChange={(e) => set("eventName", e.target.value)} />
          <Input placeholder="Venue" value={formData.venue} onChange={(e) => set("venue", e.target.value)} />
          <Input placeholder="Organizer Name" value={formData.organizerName} onChange={(e) => set("organizerName", e.target.value)} />
          <Input placeholder="Faculty In-Charge" value={formData.facultyInCharge} onChange={(e) => set("facultyInCharge", e.target.value)} />
        </div>
        <Textarea placeholder="Reason for OD" value={formData.reason} onChange={(e) => set("reason", e.target.value)} />
      </motion.div>

      {/* Download Buttons */}
      <div className="flex gap-2 sm:gap-3">
        <Button onClick={handleSavePDF} className="gap-1.5 sm:gap-2 flex-1 text-xs sm:text-sm"><Download size={14} /> Save as PDF</Button>
        <Button onClick={handleSaveJPG} variant="outline" className="gap-1.5 sm:gap-2 flex-1 text-xs sm:text-sm"><FileImage size={14} /> Save as JPG</Button>
      </div>

      {/* Printable Form Preview */}
      <A4PreviewWrapper>
        <div ref={formRef} style={{ width: 794, fontFamily: "serif", fontSize: 13, background: "#fff", color: "#000", padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <img src={collegeLogo} alt="College Logo" style={{ height: 60, margin: "0 auto" }} />
            <h2 style={{ fontSize: 16, fontWeight: "bold", marginTop: 8 }}>SMART CAMPUS OD &amp; LEAVE MANAGEMENT SYSTEM</h2>
            
            <h3 style={{ fontSize: 14, fontWeight: "bold", marginTop: 8, textDecoration: "underline" }}>ON DUTY PERMISSION FORM</h3>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <tbody>
              {[
                ["Date", formData.date],
                ["Name of the Student", formData.name],
                ["Register Number", formData.registerNumber],
                ["Department", formData.department],
                ["Year / Semester / Section", `${formData.year} / ${formData.semester} / ${formData.section}`],
                ["From Date", formData.fromDate],
                ["To Date", formData.toDate],
                ["Event / Program Name", formData.eventName],
                ["Venue", formData.venue],
                ["Organizer", formData.organizerName],
                ["Faculty In-Charge", formData.facultyInCharge],
                ["Reason for OD", formData.reason],
              ].map(([label, value]) => (
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
              <p>Faculty In-Charge</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #000", width: 150, marginBottom: 4 }} />
              <p>HOD</p>
            </div>
          </div>

          <div style={{ marginTop: 30, fontSize: 11, textAlign: "center", color: "#666" }}>
            <p>This form must be submitted before attending the event. Approval is subject to HOD discretion.</p>
          </div>
        </div>
      </A4PreviewWrapper>
    </div>
  );
};

export default ODFormPage;
