import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, FileImage, FileText } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import collegeLogo from "@/assets/college-logo.png";

const ConsentFormPage = () => {
  const { user } = useAuth();
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    academicYear: "",
    department: user?.department || "",
    yearSemester: user?.semester ? `${Math.ceil(user.semester / 2)} Year / Sem ${user.semester}` : "",
    internshipCompany: "",
    internshipDomain: "",
    durationOfInternship: "",
    departureTime: "",
    arrivalTime: "",
    mf: "",
    hd: "",
    parentName: "",
    parentAddress: "",
    parentContact: "",
    studentName: user?.name || "",
    studyingYear: "",
    regNo: user?.registerNumber || "",
    parentRelation: "",
    parentFoMo: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      pdf.save(`Consent_Form_${formData.regNo || "student"}.pdf`);
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
      link.download = `Consent_Form_${formData.regNo || "student"}.jpg`;
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
        <h2 className="text-xl font-display font-bold gold-gradient-text">Internship Consent Form</h2>
        <p className="text-sm text-muted-foreground">Fill in details and download as PDF or JPG</p>
      </motion.div>

      {/* Fillable Fields */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4">
        <h3 className="text-base font-semibold text-card-foreground">Fill Form Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Date</Label>
            <Input type="date" value={formData.date} onChange={(e) => handleChange("date", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Academic Year</Label>
            <Input value={formData.academicYear} onChange={(e) => handleChange("academicYear", e.target.value)}
              placeholder="e.g. 2025-2026" className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Department</Label>
            <Input value={formData.department} onChange={(e) => handleChange("department", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Year / Semester</Label>
            <Input value={formData.yearSemester} onChange={(e) => handleChange("yearSemester", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-card-foreground text-xs">Internship Company</Label>
            <Input value={formData.internshipCompany} onChange={(e) => handleChange("internshipCompany", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Internship Domain</Label>
            <Input value={formData.internshipDomain} onChange={(e) => handleChange("internshipDomain", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Duration of Internship</Label>
            <Input value={formData.durationOfInternship} onChange={(e) => handleChange("durationOfInternship", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Departure Time</Label>
            <Input value={formData.departureTime} onChange={(e) => handleChange("departureTime", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Arrival Time</Label>
            <Input value={formData.arrivalTime} onChange={(e) => handleChange("arrivalTime", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">M/F</Label>
            <Input value={formData.mf} onChange={(e) => handleChange("mf", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">H/D</Label>
            <Input value={formData.hd} onChange={(e) => handleChange("hd", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-card-foreground text-xs">Parent/Guardian Name & Address with Contact No.</Label>
            <Input value={formData.parentName} onChange={(e) => handleChange("parentName", e.target.value)}
              placeholder="Name" className="bg-input border-border text-card-foreground text-sm h-9 mb-1" />
            <Input value={formData.parentAddress} onChange={(e) => handleChange("parentAddress", e.target.value)}
              placeholder="Address" className="bg-input border-border text-card-foreground text-sm h-9 mb-1" />
            <Input value={formData.parentContact} onChange={(e) => handleChange("parentContact", e.target.value)}
              placeholder="Contact No." className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Student Name</Label>
            <Input value={formData.studentName} onChange={(e) => handleChange("studentName", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Studying Year (I/II/III/IV)</Label>
            <Input value={formData.studyingYear} onChange={(e) => handleChange("studyingYear", e.target.value)}
              placeholder="e.g. III" className="bg-input border-border text-card-foreground text-sm h-9" />
          </div>
          <div className="space-y-1">
            <Label className="text-card-foreground text-xs">Register Number</Label>
            <Input value={formData.regNo} onChange={(e) => handleChange("regNo", e.target.value)}
              className="bg-input border-border text-card-foreground text-sm h-9" />
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

      {/* Preview of the form document */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="text-base font-semibold text-card-foreground mb-3">Document Preview</h3>
        <div className="overflow-auto rounded-lg border border-border">
          <div ref={formRef} style={{ width: "794px", padding: "40px 50px", backgroundColor: "#ffffff", color: "#000000", fontFamily: "'Times New Roman', serif", fontSize: "13px", lineHeight: "1.6" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src={collegeLogo} alt="DACE" style={{ height: "55px" }} />
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px", color: "#0066cc" }}>DHAANISH</div>
                  <div style={{ fontWeight: "bold", fontSize: "12px", color: "#0066cc" }}>CHENNAI</div>
                  <div style={{ fontSize: "8px", color: "#0066cc" }}>AUTONOMOUS | NAAC A+</div>
                  <div style={{ fontSize: "7px", fontStyle: "italic", color: "#0066cc" }}>AFFILIATED TO ANNA UNIVERSITY</div>
                </div>
              </div>
              <div style={{ border: "1px solid #000", padding: "5px 15px", fontSize: "12px" }}>
                <strong>DATE :</strong> {formData.date}
              </div>
              <div style={{ textAlign: "right", fontSize: "10px" }}>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>DHAANISH</div>
                <div style={{ fontWeight: "bold", fontSize: "10px" }}>INTELLECTUAL</div>
                <div style={{ fontWeight: "bold", fontSize: "14px", color: "#cc0000" }}>MAESTRO</div>
              </div>
            </div>

            {/* Title */}
            <h2 style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px", textDecoration: "underline", margin: "15px 0" }}>
              STUDENT –PARENTS CONSENT FORM FOR INTERNSHIP
            </h2>

            {/* Main Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", width: "25%" }}>Academic Year</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", width: "25%" }}>{formData.academicYear}</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", width: "20%" }}>Department</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", width: "10%" }}>{formData.department}</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold", width: "15%" }}>Year/Semester</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.yearSemester}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold" }}>Internship company</td>
                  <td colSpan={5} style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.internshipCompany}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold" }}>Internship Domain</td>
                  <td colSpan={5} style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.internshipDomain}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold" }}>Duration of Internship</td>
                  <td colSpan={5} style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.durationOfInternship}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold" }}>Departure time</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.departureTime}</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold" }}>Arrival time</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.arrivalTime}</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold" }}>M/F</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.mf}</td>
                </tr>
                <tr>
                  <td colSpan={4} style={{ border: "1px solid #000", padding: "6px 10px" }}>
                    <strong>Name and Address of the Parents with Contact No.</strong><br/>
                    {formData.parentName}<br/>{formData.parentAddress}<br/>Ph: {formData.parentContact}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px", fontWeight: "bold" }}>H/D</td>
                  <td style={{ border: "1px solid #000", padding: "6px 10px" }}>{formData.hd}</td>
                </tr>
              </tbody>
            </table>

            {/* Student's Declaration */}
            <h3 style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "14px", margin: "20px 0 10px" }}>
              Student's Declaration
            </h3>
            <p style={{ textAlign: "justify", fontSize: "12px" }}>
              I, <u>&nbsp;{formData.studentName}&nbsp;</u> studying in {formData.studyingYear || "____"} Year B.E/B.Tech
              <u>&nbsp;{formData.department}&nbsp;</u> in this college fully know that I am willing to undertake the Internship (as
              detailed above) along with other students and staff on my own accord and if any incident (s) happens to me
              either of my own action or by others, the Staff, the Principal and Management will not be held responsible
              for the same.
            </p>
            <p style={{ textAlign: "right", fontWeight: "bold", margin: "15px 0", fontSize: "12px" }}>Signature of the student</p>

            {/* Parent / Guardian Declaration */}
            <h3 style={{ textAlign: "center", fontWeight: "bold", textDecoration: "underline", fontSize: "14px", margin: "20px 0 10px" }}>
              Parent / Guardian Declaration
            </h3>
            <p style={{ textAlign: "justify", fontSize: "12px" }}>
              I <u>&nbsp;{formData.parentName}&nbsp;</u> F/O or M/O <u>&nbsp;{formData.studentName}&nbsp;</u> (Reg.No <u>&nbsp;{formData.regNo}&nbsp;</u>) of
              B.E/B.Tech <u>&nbsp;{formData.department}&nbsp;</u> hereby permit my Son/daughter to undertake the Internship. I
              understand that travel by rail/road other means and the stay outside the limits of the campus may involve
              risk of physical harm, under unexpected circumstances. I assure that my Son/daughter is responsible for
              his/her behavior during the internship and I will neither blame the institution nor demand compensation for
              any loss which may occur as a result of any untoward incidents.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", fontSize: "12px", fontWeight: "bold" }}>
              <span>Signature of the Parent / Guardian</span>
              <span>Class Incharge</span>
              <span>HoD</span>
            </div>

            <p style={{ fontWeight: "bold", fontSize: "11px", marginTop: "25px" }}>
              *NOTE: Students ought to submit the offer letter from the internship company and the
              consent letter to the Head- Industry relations.
            </p>

            <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "12px", marginTop: "15px" }}>
              *** DHAANISH INTELLECTUAL MAESTRO***
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsentFormPage;
