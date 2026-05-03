import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { parseGateCode } from "@/lib/gateCode";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, LogIn, LogOut, Camera, RotateCw, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ScanResult {
  ok: boolean;
  studentName?: string;
  registerNumber?: string;
  department?: string;
  applicationType?: string;
  reason?: string;
  fromDate?: string;
  toDate?: string;
  message: string;
  result: "verified" | "no_active_request" | "invalid";
}

const SecurityScannerPage = () => {
  const { user, logout } = useAuth();
  const [direction, setDirection] = useState<"entry" | "exit">("entry");
  const [scanning, setScanning] = useState(false);
  const [last, setLast] = useState<ScanResult | null>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "security-qr-reader";
  const lockRef = useRef(false);

  const loadRecent = async () => {
    const { data } = await supabase
      .from("scan_logs" as any)
      .select("id, direction, result, notes, created_at, student_id")
      .order("created_at", { ascending: false })
      .limit(10);
    setRecent((data as any) || []);
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
      }
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const handleDecoded = async (raw: string) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setTimeout(() => (lockRef.current = false), 2500);

    const parsed = parseGateCode(raw);
    if (!parsed?.id) {
      const r: ScanResult = { ok: false, message: "Not a valid campus QR/barcode", result: "invalid" };
      setLast(r);
      toast.error(r.message, { position: "top-center" });
      return;
    }

    // Look up student profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, name, register_number, department")
      .eq("id", parsed.id)
      .maybeSingle();

    if (!prof) {
      const r: ScanResult = { ok: false, message: "Student not found", result: "invalid" };
      setLast(r);
      await logScan(parsed.id, null, "invalid", raw, "Unknown student");
      toast.error(r.message, { position: "top-center" });
      return;
    }

    // Look for an active approved application covering today
    const today = new Date().toISOString().slice(0, 10);
    const { data: apps } = await supabase
      .from("applications")
      .select("id, type, reason, from_date, to_date, status")
      .eq("student_id", parsed.id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    const active = (apps || []).find((a) => {
      const from = a.from_date || "";
      const to = a.to_date || a.from_date || "";
      return (!from || from <= today) && (!to || to >= today);
    });

    let result: ScanResult["result"] = active ? "verified" : "no_active_request";
    const message = active
      ? `${direction === "exit" ? "Exit" : "Entry"} verified for ${prof.name}`
      : `No active approved request for ${prof.name}`;

    const scanResult: ScanResult = {
      ok: !!active,
      studentName: prof.name || undefined,
      registerNumber: prof.register_number || undefined,
      department: prof.department || undefined,
      applicationType: active?.type,
      reason: active?.reason || undefined,
      fromDate: active?.from_date || undefined,
      toDate: active?.to_date || undefined,
      message,
      result,
    };
    setLast(scanResult);

    await logScan(parsed.id, active?.id || null, result, raw, active ? `${active.type} (${active.from_date} → ${active.to_date})` : "No active approved request");

    if (active) toast.success(message, { position: "top-center" });
    else toast.warning(message, { position: "top-center" });
  };

  const logScan = async (
    studentId: string,
    applicationId: string | null,
    result: ScanResult["result"],
    raw: string,
    notes: string
  ) => {
    if (!user?.id) return;
    await supabase.from("scan_logs" as any).insert({
      student_id: studentId,
      application_id: applicationId,
      scanned_by: user.id,
      direction,
      result,
      scanned_code: raw,
      notes,
    });
    loadRecent();
  };

  const startScanner = async () => {
    setLast(null);
    setScanning(true);
    try {
      const html5 = new Html5Qrcode(containerId, { verbose: false });
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => handleDecoded(decoded),
        () => {}
      );
    } catch (e: any) {
      toast.error("Could not start camera: " + (e?.message || "permission denied"));
      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            <h1 className="text-lg font-display font-bold gold-gradient-text">Gate Scanner</h1>
          </div>
          <Button size="sm" variant="ghost" onClick={logout}>Logout</Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Signed in as <span className="font-medium">{user?.name || "security"}</span>
        </p>

        <div className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Direction</span>
            <Select value={direction} onValueChange={(v: any) => setDirection(v)}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry"><div className="flex items-center gap-2"><LogIn size={14} /> Entry</div></SelectItem>
                <SelectItem value="exit"><div className="flex items-center gap-2"><LogOut size={14} /> Exit</div></SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div id={containerId} className="w-full rounded-lg overflow-hidden bg-black/80 min-h-[260px] flex items-center justify-center">
            {!scanning && <p className="text-xs text-white/70">Camera idle</p>}
          </div>

          {!scanning ? (
            <Button onClick={startScanner} className="w-full gap-2"><Camera size={16} /> Start Camera</Button>
          ) : (
            <Button onClick={stopScanner} variant="outline" className="w-full gap-2"><X size={16} /> Stop Camera</Button>
          )}
        </div>

        <AnimatePresence>
          {last && (
            <motion.div
              key={Date.now()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`glass-card p-4 border-l-4 ${
                last.result === "verified" ? "border-success" : last.result === "no_active_request" ? "border-warning" : "border-destructive"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {last.result === "verified" ? (
                  <CheckCircle className="text-success" size={20} />
                ) : (
                  <AlertTriangle className={last.result === "invalid" ? "text-destructive" : "text-warning"} size={20} />
                )}
                <p className="font-semibold text-sm">{last.message}</p>
              </div>
              {last.studentName && (
                <div className="text-xs space-y-0.5 text-card-foreground">
                  <p><span className="text-muted-foreground">Student:</span> {last.studentName}</p>
                  <p><span className="text-muted-foreground">Reg:</span> {last.registerNumber}</p>
                  <p><span className="text-muted-foreground">Dept:</span> {last.department}</p>
                  {last.applicationType && (
                    <>
                      <p><span className="text-muted-foreground">Request:</span> {last.applicationType}</p>
                      <p><span className="text-muted-foreground">Period:</span> {last.fromDate} → {last.toDate}</p>
                      {last.reason && <p className="truncate"><span className="text-muted-foreground">Reason:</span> {last.reason}</p>}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Recent scans</h3>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={loadRecent}>
              <RotateCw size={14} />
            </Button>
          </div>
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground">No scans yet.</p>
          ) : (
            <div className="space-y-1.5">
              {recent.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-[11px] border-b border-border/40 pb-1 last:border-b-0">
                  <span className="capitalize">{s.direction} • {s.result.replace(/_/g, " ")}</span>
                  <span className="text-muted-foreground">{new Date(s.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityScannerPage;
