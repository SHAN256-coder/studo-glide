import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { RotateCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import collegeLogo from "@/assets/college-logo.png";
import Barcode from "@/components/Barcode";

interface Props {
  open: boolean;
  onClose: () => void;
}

const StudentIDCard = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [flipped, setFlipped] = useState(false);

  if (!open || !user) return null;

  const isHosteller = user.studentType === "hosteller";
  const barcodeData = `${user.name || ""}|${user.registerNumber || ""}|${user.mobile || ""}`;
  const batch = user.year ? `${2025 - (user.year - 1)} - ${2025 - (user.year - 1) + 4}` : "";

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
        {/* Close button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:bg-white/20 z-10"
        >
          <X size={20} />
        </Button>

        {/* Card container with perspective */}
        <div className="relative" style={{ perspective: "1000px" }}>
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative"
          >
            {/* Front Side */}
            <div
              className="w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="bg-white text-black">
                {/* College Header */}
                <div className="bg-[#003399] text-white p-3 flex items-start gap-2">
                  <img src={collegeLogo} alt="College" className="h-12 w-12 object-contain rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold leading-tight">DHAANISH AHMED COLLEGE OF ENGINEERING</p>
                    <p className="text-[8px] opacity-90 leading-tight">An Autonomous Institution, NAAC A+ | 4 Star India Rating</p>
                    <p className="text-[8px] opacity-90 leading-tight">5th Rank in Tamil Nadu | An ISO 9001:2015 Certified</p>
                  </div>
                </div>

                {/* Photo + H/D indicator */}
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

                {/* Student Info */}
                <div className="px-4 pb-3 space-y-1 text-center">
                  <p className="text-base font-bold uppercase">{user.name || "—"}</p>
                  <div className="text-left space-y-0.5 text-sm">
                    <p><span className="font-bold">REG NO :</span> {user.registerNumber || "—"}</p>
                    <p><span className="font-bold">BRANCH :</span> {user.department || "—"}</p>
                    <p><span className="font-bold">BATCH :</span> {batch || "—"}</p>
                  </div>
                </div>

                {/* Barcode */}
                <div className="px-6 pb-2 flex justify-center">
                  <Barcode value={barcodeData} />
                </div>

                {/* Chairman */}
                <div className="text-right px-4 pb-3">
                  <p className="text-xs font-semibold">Chairman</p>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div
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

                {/* Dashed separator */}
                <div className="border-t-4 border-dashed border-[#003399] my-3" />

                {/* Footer */}
                <div className="flex items-start gap-2 pt-1">
                  <img src={collegeLogo} alt="College" className="h-8 w-8 object-contain rounded" />
                  <div className="text-[8px] text-center flex-1 leading-tight">
                    <p className="font-bold">DHAANISH NAGAR, PADAPPAI,</p>
                    <p>CHENNAI, TAMILNADU INDIA,</p>
                    <p>PIN-601301</p>
                    <p>PH: 99620 22222</p>
                    <p>www.dhaanishchennai.in</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rotate Button */}
        <motion.div className="flex justify-center mt-4">
          <Button
            onClick={() => setFlipped(!flipped)}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <RotateCw size={16} />
            {flipped ? "Show Front" : "Show Back"}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StudentIDCard;
