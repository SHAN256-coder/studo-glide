import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileImage, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import A4PreviewWrapper from "@/components/A4PreviewWrapper";

const cellStyle: React.CSSProperties = { border: "1px solid #000", padding: "6px 10px", fontSize: "12px" };
const boldCell: React.CSSProperties = { ...cellStyle, fontWeight: "bold" };

const LeaveFormCopy = ({ title, data }: { title: string; data: Record<string, string> }) => (
  <div style={{ marginBottom: "30px" }}>
    <h2 style={{ textAlign: "center", fontWeight: "bold", fontSize: "16px", margin: "0 0 2px" }}>
      Smart Campus OD &amp; Leave Management System
    </h2>
    <h3 style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", margin: "0 0 12px" }}>
      {title}
    </h3>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td style={boldCell} width="25%">Student Name:</td>
          <td style={cellStyle} width="25%">{data.studentName}</td>
          <td style={boldCell} width="25%">Date:</td>
          <td style={cellStyle} width="25%">{data.date}</td>
        </tr>
        <tr>
          <td style={boldCell}>Register No:</td>
          <td style={cellStyle}>{data.regNo}</td>
          <td style={boldCell}>Year/ Department</td>
          <td style={cellStyle}>{data.yearDept}</td>
        </tr>
        <tr>
          <td style={boldCell}>Block/ Room No:</td>
          <td style={cellStyle}>{data.blockRoom}</td>
          <td style={boldCell}>Total no. of leave already availed in this Semester:</td>
          <td style={cellStyle}>{data.totalLeaveAvailed}</td>
        </tr>
        <tr>
          <td style={boldCell}>Date of Leave:</td>
          <td style={cellStyle}>{data.dateOfLeave}</td>
          <td style={boldCell}>OUT Time:</td>
          <td style={cellStyle}>{data.outTime}</td>
        </tr>
        <tr>
          <td style={boldCell}>Date of return:</td>
          <td style={cellStyle}>{data.dateOfReturn}</td>
          <td style={boldCell}>IN Time:</td>
          <td style={cellStyle}>{data.inTime}</td>
        </tr>
        <tr>
          <td colSpan={2} style={{ ...cellStyle, textAlign: "center", fontWeight: "bold" }}>
            No. of Days of leave requested now:
          </td>
          <td colSpan={2} style={cellStyle}>{data.daysRequested}</td>
        </tr>
        <tr>
          <td colSpan={4} style={{ ...cellStyle, fontSize: "10px", fontStyle: "italic" }}>
            Attach Medical certificate or any other proof if it s more than 3 days
          </td>
        </tr>
        <tr>
          <td style={boldCell}>Details / Reason<br/>for Leave</td>
          <td style={cellStyle}>{data.reason}</td>
          <td colSpan={2} style={{ ...boldCell, textAlign: "center" }}>Signature of the Student</td>
        </tr>
        <tr>
          <td colSpan={4} style={boldCell}>
            <strong>Declaration by Student:</strong><br/>
            <span style={{ fontWeight: "normal", fontStyle: "italic", fontSize: "11px" }}>
              I hereby assure that, I will return to the hostel on the date and time mentioned by me
            </span>
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={boldCell}>
            Declaration by Class Coordinator (CC) after communicated to parents:
          </td>
          <td style={boldCell}>Name of the CC</td>
          <td style={boldCell}>Signature of CC.</td>
        </tr>
        <tr>
          <td colSpan={2} style={{ ...cellStyle, height: "30px" }}></td>
          <td style={{ ...cellStyle, height: "30px" }}>{data.ccName}</td>
          <td style={{ ...cellStyle, height: "30px" }}></td>
        </tr>
        <tr>
          <td colSpan={2} style={boldCell}>Signature of HoD with Date and Seal</td>
          <td colSpan={2} style={{ ...cellStyle, height: "30px" }}></td>
        </tr>
      </tbody>
    </table>
  </div>
);

const HostelLeaveFormPage = () => {
  const { user } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    studentName: user?.name || "",
    date: new Date().toISOString().split("T")[0],
    regNo: user?.registerNumber || "",
    yearDept: user?.semester && user?.department ? `${Math.ceil(user.semester / 2)} / ${user.department}` : "",
    blockRoom: "",
    totalLeaveAvailed: "",
    dateOfLeave: "",
    dateOfReturn: "",
    outTime: "",
    inTime: "",
    daysRequested: "",
    reason: "",
    ccName: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-calculate days
  const handleDateChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    if (updated.dateOfLeave && updated.dateOfReturn) {
      const from = new Date(updated.dateOfLeave);
      const to = new Date(updated.dateOfReturn);
      const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      updated.daysRequested = diff > 0 ? String(diff) : "";
    }
    setFormData(updated);
  };

  const handleSavePDF = async () => {
    if (!formRef.current) return;
    toast.loading("Generating PDF...");
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hostel_Leave_Form_${formData.regNo || "student"}.pdf`);
      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handleSaveJPG = async () => {
    if (!formRef.current) return;
    toast.loading("Generating JPG...");
    try {
      const canvas = await html2canvas(formRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `Hostel_Leave_Form_${formData.regNo || "student"}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.95);
      link.click();
      toast.dismiss();
      toast.success("JPG downloaded successfully!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate JPG");
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Hostel Leave Form</h2>
        <p className="text-sm text-muted-foreground">Department Copy + Warden Copy — fill once, both copies auto-fill</p>
      </motion.div>

      {/* Fillable Fields */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-card-foreground">Fill Form Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Student Name</Label>
            <Input value={formData.studentName} onChange={(e) => handleChange("studentName", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Date</Label>
            <Input type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Register No</Label>
            <Input value={formData.regNo} onChange={(e) => handleChange("regNo", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Year / Department</Label>
            <Input value={formData.yearDept} onChange={(e) => handleChange("yearDept", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Block / Room No</Label>
            <Input value={formData.blockRoom} onChange={(e) => handleChange("blockRoom", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Total Leave Already Availed This Sem</Label>
            <Input value={formData.totalLeaveAvailed} onChange={(e) => handleChange("totalLeaveAvailed", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Date of Leave</Label>
            <Input type="date" value={formData.dateOfLeave} onChange={(e) => handleDateChange("dateOfLeave", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Date of Return</Label>
            <Input type="date" value={formData.dateOfReturn} onChange={(e) => handleDateChange("dateOfReturn", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">OUT Time</Label>
            <Input type="time" value={formData.outTime} onChange={(e) => handleChange("outTime", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">IN Time</Label>
            <Input type="time" value={formData.inTime} onChange={(e) => handleChange("inTime", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">No. of Days Requested</Label>
            <Input value={formData.daysRequested} onChange={(e) => handleChange("daysRequested", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Class Coordinator Name</Label>
            <Input value={formData.ccName} onChange={(e) => handleChange("ccName", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-card-foreground text-xs">Details / Reason for Leave</Label>
            <Textarea value={formData.reason} onChange={(e) => handleChange("reason", e.target.value)}
              rows={2} className="bg-input border-border text-card-foreground text-sm" />
          </div>
        </div>
      </motion.div>

      {/* Download Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleSavePDF} className="bg-primary text-primary-foreground hover:bg-accent flex items-center gap-2">
          <FileText size={16} /> Save as PDF
        </Button>
        <Button onClick={handleSaveJPG} variant="outline" className="flex items-center gap-2">
          <FileImage size={16} /> Save as JPG
        </Button>
      </div>

      {/* Document Preview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="text-base font-semibold text-card-foreground mb-3">Document Preview</h3>
        <A4PreviewWrapper className="rounded-lg border border-border">
          <div ref={formRef} style={{ width: "794px", padding: "35px 45px", backgroundColor: "#ffffff", color: "#000000", fontFamily: "'Times New Roman', serif", lineHeight: "1.5" }}>
            <LeaveFormCopy title="Hostel Students- Leave Form -1 (Department Copy)" data={formData} />
            <div style={{ borderTop: "2px dashed #999", margin: "10px 0" }} />
            <p style={{ textAlign: "center", fontSize: "10px", fontStyle: "italic", color: "#666", margin: "4px 0 10px" }}>
              (Photo of this letter copy should be sent to AC and Student affairs)
            </p>
            <LeaveFormCopy title="Hostel Students- Leave Form -2 (Warden Copy)" data={formData} />
          </div>
        </A4PreviewWrapper>
      </motion.div>
    </div>
  );
};

export default HostelLeaveFormPage;
