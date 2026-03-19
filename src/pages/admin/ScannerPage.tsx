import { motion } from "framer-motion";
import { QrCode, Camera } from "lucide-react";

const ScannerPage = () => {
  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">QR Scanner</h2>
        <p className="text-sm text-muted-foreground">Scan student QR codes at entry/exit points</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        className="glass-card p-8 text-center space-y-4">
        <div className="w-48 h-48 mx-auto border-2 border-dashed border-primary/50 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <Camera size={48} className="mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Camera feed will appear here</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Point the camera at a student's QR code to validate their approved request</p>

        {/* Mock scan result */}
        <div className="glass-card p-4 text-left mt-6">
          <h4 className="text-sm font-semibold text-card-foreground mb-2">Last Scan Result</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>Student: <span className="text-card-foreground">Arjun Kumar (STU001)</span></p>
            <p>Type: <span className="text-primary">Leave</span></p>
            <p>Valid Until: <span className="text-card-foreground">2026-03-16</span></p>
            <p>Status: <span className="text-success">✓ Valid</span></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScannerPage;
