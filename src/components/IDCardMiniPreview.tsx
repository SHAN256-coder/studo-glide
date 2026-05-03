import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import collegeLogo from "@/assets/college-logo.png";
import Barcode from "@/components/Barcode";
import { buildGateCode } from "@/lib/gateCode";

/**
 * Compact, non-interactive front/back preview of the Student ID card,
 * used on the Profile page so students can quickly verify how their
 * logo, photo, and details render before opening the full ID card.
 */
const IDCardMiniPreview = () => {
  const { user } = useAuth();
  const [side, setSide] = useState<"front" | "back">("front");
  if (!user) return null;

  const isHosteller = user.studentType === "hosteller";
  const barcodeData = buildGateCode({ id: user.id, registerNumber: user.registerNumber });
  const batch = user.year ? `${2025 - (user.year - 1)} - ${2025 - (user.year - 1) + 4}` : "";

  // Real card width 340px → scale down on phones via CSS
  return (
    <div className="glass-card p-3 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm sm:text-base font-semibold text-card-foreground">ID Card Preview</h3>
        <div className="flex gap-1 bg-muted rounded-lg p-0.5">
          <Button
            type="button"
            size="sm"
            variant={side === "front" ? "default" : "ghost"}
            className="h-7 px-3 text-xs"
            onClick={() => setSide("front")}
          >
            Front
          </Button>
          <Button
            type="button"
            size="sm"
            variant={side === "back" ? "default" : "ghost"}
            className="h-7 px-3 text-xs"
            onClick={() => setSide("back")}
          >
            Back
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <motion.div
          key={side}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[300px] rounded-xl overflow-hidden shadow-lg bg-white text-black"
        >
          {side === "front" ? (
            <div>
              <div className="bg-white text-black p-2 flex items-center gap-2 border-b-2 border-[#003399]">
                <img src={collegeLogo} alt="Dhaanish Chennai" className="h-12 w-auto object-contain" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold leading-tight">SMART CAMPUS OD &amp; LEAVE</p>
                  <p className="text-[9px] font-bold leading-tight">MANAGEMENT SYSTEM</p>
                  <p className="text-[7px] text-gray-700 leading-tight mt-0.5">Student Identification Card</p>
                </div>
              </div>

              <div className="relative px-4 pt-3 pb-1.5 flex items-center justify-center">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-black text-[#003399]">
                  {isHosteller ? "H" : "D"}
                </span>
                <div className="w-16 h-20 rounded-md overflow-hidden border-2 border-[#003399] bg-gray-100">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Student" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                      {user.name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl font-black text-[#003399]">
                  {isHosteller ? "H" : "D"}
                </span>
              </div>

              <div className="px-3 pb-2 space-y-0.5 text-center">
                <p className="text-xs font-bold uppercase truncate">{user.name || "—"}</p>
                <div className="text-left space-y-0.5 text-[10px]">
                  <p><span className="font-bold">REG :</span> {user.registerNumber || "—"}</p>
                  <p className="truncate"><span className="font-bold">BRANCH :</span> {user.department || "—"}</p>
                  <p><span className="font-bold">BATCH :</span> {batch || "—"}</p>
                </div>
              </div>

              <div className="px-4 pb-1.5 flex justify-center scale-75 origin-top">
                <Barcode value={barcodeData} />
              </div>

              <div className="text-right px-3 pb-2">
                <p className="text-[9px] font-semibold">Chairman</p>
              </div>
            </div>
          ) : (
            <div className="p-3 space-y-1.5 text-[10px]">
              <p><span className="font-bold">Father :</span> {user.fatherName || "—"}</p>
              <p><span className="font-bold">Mother :</span> {user.motherName || "—"}</p>
              <p><span className="font-bold">D.O.B :</span> {user.dob || "—"}</p>
              <p><span className="font-bold">Blood Group :</span> {user.bloodGroup || "—"}</p>
              <p className="truncate"><span className="font-bold">Address :</span> {user.address || "—"}</p>
              <p><span className="font-bold">Mobile :</span> {user.mobile || "—"}</p>
              <p><span className="font-bold">Parent :</span> {user.parentMobile || "—"}</p>

              {!isHosteller ? (
                <>
                  <p><span className="font-bold">Boarding :</span> {user.boardingPoint || "—"}</p>
                  <p><span className="font-bold">Bus No :</span> {user.busNumber || "—"}</p>
                </>
              ) : (
                <p><span className="font-bold">Room No :</span> {user.roomNumber || "—"}</p>
              )}

              <div className="border-t-2 border-dashed border-[#003399] my-1.5" />

              <div className="flex items-center gap-2">
                <img src={collegeLogo} alt="Dhaanish Chennai" className="h-8 w-auto object-contain" />
                <div className="text-[8px] flex-1 leading-tight">
                  <p className="font-bold">SMART CAMPUS OD &amp; LEAVE</p>
                  <p className="font-bold">MANAGEMENT SYSTEM</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Quick check — open Online ID Card from the Dashboard to download.
      </p>
    </div>
  );
};

export default IDCardMiniPreview;
