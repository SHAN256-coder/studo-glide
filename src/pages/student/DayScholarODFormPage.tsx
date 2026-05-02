import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth, DEPARTMENTS, SEMESTERS, YEARS } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileImage } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import A4PreviewWrapper from "@/components/A4PreviewWrapper";

const cellStyle: React.CSSProperties = { border: "1px solid #000", padding: "6px 10px", fontSize: "12px" };
const boldCell: React.CSSProperties = { ...cellStyle, fontWeight: "bold" };

const DayScholarODFormPage = () => {
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
    outTime: "",
    inTime: "",
    reason: "",
    eventName: "",
    venue: "",
    facultyInCharge: "",
    parentMobile: "",
    parentName: "",
  });

  const set = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }));

  const handleDateChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
  };

  const daysDiff = () => {
    if (formData.fromDate && formData.toDate) {
      const d = Math.ceil((new Date(formData.toDate).getTime() - new Date(formData.fromDate).getTime()) / 86400000) + 1;
      return d > 0 ? d : 0;
    }
    return 0;
  };

  const handleSavePDF = async () => {
    if (!formRef.current) return;
    toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`Day_Scholar_OD_${formData.registerNumber}.pdf`);
      toast.dismiss();
      toast.success("PDF downloaded!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handleSaveJPG = async () => {
    if (!formRef.current) return;
    toast.loading("Generating JPG...");
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `Day_Scholar_OD_${formData.registerNumber}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      toast.dismiss();
      toast.success("JPG downloaded!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate JPG");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-lg sm:text-xl font-display font-bold gold-gradient-text">Day Scholar OD Form</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">On Duty permission form for day scholars — fill and download</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-3 sm:p-5 space-y-3 sm:space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-card-foreground">Fill Form Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Date</Label>
            <Input type="date" value={formData.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Student Name</Label>
            <Input value={formData.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Register Number</Label>
            <Input value={formData.registerNumber} onChange={(e) => set("registerNumber", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Department</Label>
            <Select value={formData.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Year</Label>
            <Select value={formData.year} onValueChange={(v) => set("year", v)}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>{YEARS.map((y) => <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Semester</Label>
            <Select value={formData.semester} onValueChange={(v) => set("semester", v)}>
              <SelectTrigger><SelectValue placeholder="Semester" /></SelectTrigger>
              <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Section</Label>
            <Input value={formData.section} onChange={(e) => set("section", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">From Date</Label>
            <Input type="date" value={formData.fromDate} onChange={(e) => handleDateChange("fromDate", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">To Date</Label>
            <Input type="date" value={formData.toDate} onChange={(e) => handleDateChange("toDate", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">OUT Time</Label>
            <Input type="time" value={formData.outTime} onChange={(e) => set("outTime", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">IN Time</Label>
            <Input type="time" value={formData.inTime} onChange={(e) => set("inTime", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Event / Program Name</Label>
            <Input value={formData.eventName} onChange={(e) => set("eventName", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Venue</Label>
            <Input value={formData.venue} onChange={(e) => set("venue", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Faculty In-Charge</Label>
            <Input value={formData.facultyInCharge} onChange={(e) => set("facultyInCharge", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Parent/Guardian Name</Label>
            <Input value={formData.parentName} onChange={(e) => set("parentName", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Parent/Guardian Mobile</Label>
            <Input value={formData.parentMobile} onChange={(e) => set("parentMobile", e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-card-foreground text-xs">Reason for OD</Label>
            <Textarea value={formData.reason} onChange={(e) => set("reason", e.target.value)} rows={2} />
          </div>
        </div>
      </motion.div>

      {/* Download Buttons */}
      <div className="flex gap-2 sm:gap-3">
        <Button onClick={handleSavePDF} className="gap-1.5 sm:gap-2 flex-1 text-xs sm:text-sm"><Download size={14} /> Save as PDF</Button>
        <Button onClick={handleSaveJPG} variant="outline" className="gap-1.5 sm:gap-2 flex-1 text-xs sm:text-sm"><FileImage size={14} /> Save as JPG</Button>
      </div>

      {/* Document Preview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="text-sm sm:text-base font-semibold text-card-foreground mb-3">Document Preview</h3>
        <div className="overflow-auto rounded-lg border border-border">
          <div ref={formRef} style={{ width: "794px", padding: "35px 45px", backgroundColor: "#ffffff", color: "#000000", fontFamily: "'Times New Roman', serif", lineHeight: "1.5" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: "bold", marginTop: 0 }}>SMART CAMPUS OD &amp; LEAVE MANAGEMENT SYSTEM</h2>
              
              <h3 style={{ fontSize: 14, fontWeight: "bold", marginTop: 8, textDecoration: "underline" }}>DAY SCHOLAR — ON DUTY PERMISSION FORM</h3>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
              <tbody>
                <tr>
                  <td style={boldCell} width="25%">Date:</td>
                  <td style={cellStyle} width="25%">{formData.date}</td>
                  <td style={boldCell} width="25%">Register No:</td>
                  <td style={cellStyle} width="25%">{formData.registerNumber}</td>
                </tr>
                <tr>
                  <td style={boldCell}>Name of the Student:</td>
                  <td style={cellStyle}>{formData.name}</td>
                  <td style={boldCell}>Department:</td>
                  <td style={cellStyle}>{formData.department}</td>
                </tr>
                <tr>
                  <td style={boldCell}>Year / Sem / Section:</td>
                  <td style={cellStyle}>{formData.year} / {formData.semester} / {formData.section}</td>
                  <td style={boldCell}>Parent/Guardian Name:</td>
                  <td style={cellStyle}>{formData.parentName}</td>
                </tr>
                <tr>
                  <td style={boldCell}>From Date:</td>
                  <td style={cellStyle}>{formData.fromDate}</td>
                  <td style={boldCell}>To Date:</td>
                  <td style={cellStyle}>{formData.toDate}</td>
                </tr>
                <tr>
                  <td style={boldCell}>OUT Time:</td>
                  <td style={cellStyle}>{formData.outTime}</td>
                  <td style={boldCell}>IN Time:</td>
                  <td style={cellStyle}>{formData.inTime}</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>No. of Days:</td>
                  <td colSpan={2} style={cellStyle}>{daysDiff() || ""}</td>
                </tr>
                <tr>
                  <td style={boldCell}>Event / Program:</td>
                  <td colSpan={3} style={cellStyle}>{formData.eventName}</td>
                </tr>
                <tr>
                  <td style={boldCell}>Venue:</td>
                  <td style={cellStyle}>{formData.venue}</td>
                  <td style={boldCell}>Faculty In-Charge:</td>
                  <td style={cellStyle}>{formData.facultyInCharge}</td>
                </tr>
                <tr>
                  <td style={boldCell}>Reason for OD:</td>
                  <td colSpan={3} style={cellStyle}>{formData.reason}</td>
                </tr>
                <tr>
                  <td style={boldCell}>Parent/Guardian Mobile:</td>
                  <td colSpan={3} style={cellStyle}>{formData.parentMobile}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 16, fontSize: 12, lineHeight: 1.6 }}>
              <p><strong>Declaration by Student:</strong></p>
              <p style={{ fontStyle: "italic", fontSize: 11 }}>
                I hereby declare that the above information is true and correct. I take full responsibility during the OD period
                and will abide by all college rules and regulations. I will return to the college at the specified time.
              </p>
            </div>

            <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.6 }}>
              <p><strong>Parent/Guardian Consent:</strong></p>
              <p style={{ fontStyle: "italic", fontSize: 11 }}>
                I, {formData.parentName || "_________"}, parent/guardian of {formData.name || "_________"},
                give my consent for the above-mentioned On Duty request. Contact: {formData.parentMobile || "_________"}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #000", width: 140, marginBottom: 4 }} />
                <p>Student Signature</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #000", width: 140, marginBottom: 4 }} />
                <p>Parent/Guardian</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #000", width: 140, marginBottom: 4 }} />
                <p>Faculty In-Charge</p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30, fontSize: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #000", width: 140, marginBottom: 4 }} />
                <p>Class Advisor</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #000", width: 140, marginBottom: 4 }} />
                <p>HOD (with Seal)</p>
              </div>
            </div>

            <div style={{ marginTop: 30, fontSize: 10, textAlign: "center", color: "#666" }}>
              <p>This form must be submitted before attending the event. Approval is subject to HOD discretion.</p>
              <p>Day scholars must carry this approved form during the OD period.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DayScholarODFormPage;
