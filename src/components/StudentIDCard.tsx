import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { RotateCw, X, Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import collegeLogo from "@/assets/college-logo.png";
import Barcode from "@/components/Barcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const StudentIDCard = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  if (!open || !user) return null;

  const isHosteller = user.studentType === "hosteller";
  const barcodeData = `${user.name || ""}|${user.registerNumber || ""}|${user.mobile || ""}`;
  const batch = user.year ? `${2025 - (user.year - 1)} - ${2025 - (user.year - 1) + 4}` : "";

  const captureCard = async (side: "front" | "back") => {
    const ref = side === "front" ? frontRef.current : backRef.current;
    if (!ref) return null;
    // Temporarily make back side visible for capture
    const origTransform = ref.style.transform;
    const origPosition = ref.style.position;
    ref.style.transform = "none";
    ref.style.position = "relative";
    const canvas = await html2canvas(ref, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
    ref.style.transform = origTransform;
    ref.style.position = origPosition;
    return canvas;
  };

  const handleDownloadPDF = async () => {
    toast.loading("Generating PDF...");
    try {
      const frontCanvas = await captureCard("front");
      const backCanvas = await captureCard("back");
      if (!frontCanvas || !backCanvas) throw new Error("Capture failed");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [86, 54] });
      // Credit card size ~86x54mm
      const w = 86, h = 54;

      // Front
      const frontImg = frontCanvas.toDataURL("image/png");
      pdf.addImage(frontImg, "PNG", 0, 0, w, h);

      // Back
      pdf.addPage([86, 54]);
      const backImg = backCanvas.toDataURL("image/png");
      pdf.addImage(backImg, "PNG", 0, 0, w, h);

      pdf.save(`ID_Card_${user.registerNumber || "student"}.pdf`);
      toast.dismiss();
      toast.success("PDF downloaded!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadImage = async () => {
    toast.loading("Generating images...");
    try {
      const frontCanvas = await captureCard("front");
      const backCanvas = await captureCard("back");
      if (!frontCanvas || !backCanvas) throw new Error("Capture failed");

      // Download front
      const linkF = document.createElement("a");
      linkF.download = `ID_Card_Front_${user.registerNumber || "student"}.png`;
      linkF.href = frontCanvas.toDataURL("image/png");
      linkF.click();

      // Download back
      setTimeout(() => {
        const linkB = document.createElement("a");
        linkB.download = `ID_Card_Back_${user.registerNumber || "student"}.png`;
        linkB.href = backCanvas.toDataURL("image/png");
        linkB.click();
      }, 500);

      toast.dismiss();
      toast.success("Images downloaded!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate images");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px]"
      >
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:bg-white/20 z-10"
        >
          <X size={20} />
        </Button>

        <div className="relative" style={{ perspective: "1000px" }}>
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Front Side */}
            <div
              ref={frontRef}
              className="w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="bg-white text-black">
                <div className="bg-white text-black p-3 flex items-center gap-3 border-b-2 border-[#003399]">
                  <img src={collegeLogo} alt="Dhaanish Chennai" className="h-20 w-auto object-contain" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold leading-tight">SMART CAMPUS OD &amp; LEAVE</p>
                    <p className="text-[11px] font-bold leading-tight">MANAGEMENT SYSTEM</p>
                    <p className="text-[9px] text-gray-700 leading-tight mt-0.5">Student Identification Card</p>
                  </div>
                </div>

                <div className="relative px-6 pt-4 pb-2 flex items-center justify-center">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-black text-[#003399]">
                    {isHosteller ? "H" : "D"}
                  </span>
                  <div className="w-24 h-28 rounded-lg overflow-hidden border-2 border-[#003399] bg-gray-100">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                        {user.name?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl font-black text-[#003399]">
                    {isHosteller ? "H" : "D"}
                  </span>
                </div>

                <div className="px-4 pb-3 space-y-1 text-center">
                  <p className="text-base font-bold uppercase">{user.name || "—"}</p>
                  <div className="text-left space-y-0.5 text-sm">
                    <p><span className="font-bold">REG NO :</span> {user.registerNumber || "—"}</p>
                    <p><span className="font-bold">BRANCH :</span> {user.department || "—"}</p>
                    <p><span className="font-bold">BATCH :</span> {batch || "—"}</p>
                  </div>
                </div>

                <div className="px-6 pb-2 flex justify-center">
                  <Barcode value={barcodeData} />
                </div>

                <div className="text-right px-4 pb-3">
                  <p className="text-xs font-semibold">Chairman</p>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div
              ref={backRef}
              className="w-full rounded-2xl overflow-hidden shadow-2xl absolute top-0 left-0"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="bg-white text-black p-4 space-y-2.5 min-h-[400px]">
                <p className="text-sm"><span className="font-bold">Father Name :</span> {user.fatherName || "—"}</p>
                <p className="text-sm"><span className="font-bold">Mother Name :</span> {user.motherName || "—"}</p>
                <p className="text-sm"><span className="font-bold">D.O.B :</span> {user.dob || "—"}</p>
                <p className="text-sm"><span className="font-bold">Blood Group :</span> {user.bloodGroup || "—"}</p>
                <p className="text-sm"><span className="font-bold">Address :</span> {user.address || "—"}</p>
                <p className="text-sm"><span className="font-bold">Mobile :</span> {user.mobile || "—"}</p>
                <p className="text-sm"><span className="font-bold">Parents / Guardian :</span> {user.parentMobile || "—"}</p>

                {!isHosteller && (
                  <>
                    <p className="text-sm font-bold">Boarding Point : <span className="font-normal">{user.boardingPoint || "—"}</span></p>
                    <p className="text-sm font-bold">Bus No : <span className="font-normal">{user.busNumber || "—"}</span></p>
                  </>
                )}
                {isHosteller && (
                  <p className="text-sm font-bold">Room Number : <span className="font-normal">{user.roomNumber || "—"}</span></p>
                )}

                <div className="border-t-4 border-dashed border-[#003399] my-3" />

                <div className="flex items-center gap-3 pt-1">
                  <img src={collegeLogo} alt="Dhaanish Chennai" className="h-14 w-auto object-contain" />
                  <div className="text-[10px] flex-1 leading-tight">
                    <p className="font-bold">SMART CAMPUS OD &amp; LEAVE</p>
                    <p className="font-bold">MANAGEMENT SYSTEM</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div className="flex justify-center gap-2 mt-4 flex-wrap">
          <Button
            onClick={() => setFlipped(!flipped)}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <RotateCw size={16} />
            {flipped ? "Show Front" : "Show Back"}
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Download size={16} />
            PDF
          </Button>
          <Button
            onClick={handleDownloadImage}
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <FileImage size={16} />
            Image
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StudentIDCard;
