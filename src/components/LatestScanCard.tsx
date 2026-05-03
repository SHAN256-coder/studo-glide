import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShieldCheck, LogIn, LogOut, AlertTriangle } from "lucide-react";

interface ScanLog {
  id: string;
  direction: string;
  result: string;
  notes: string | null;
  application_id: string | null;
  created_at: string;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const LatestScanCard = () => {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;

    const load = async () => {
      const { data } = await supabase
        .from("scan_logs" as any)
        .select("id, direction, result, notes, application_id, created_at")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (active) {
        setScans((data as any) || []);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel(`scan-logs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scan_logs", filter: `student_id=eq.${user.id}` },
        (payload) => {
          setScans((prev) => [payload.new as any, ...prev].slice(0, 5));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (loading) return null;

  const latest = scans[0];

  return (
    <div className="glass-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={18} className="text-primary" />
        <h3 className="text-base font-semibold text-card-foreground">Latest Gate Scan</h3>
      </div>

      {!latest ? (
        <p className="text-xs text-muted-foreground">
          No gate scans yet. When security scans your QR at entry/exit, it will appear here.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
            <div className="flex items-center gap-2 min-w-0">
              {latest.direction === "exit" ? (
                <LogOut size={18} className="text-warning" />
              ) : (
                <LogIn size={18} className="text-success" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold capitalize">
                  {latest.direction} • {latest.result.replace(/_/g, " ")}
                </p>
                <p className="text-[11px] text-muted-foreground">{formatTime(latest.created_at)}</p>
                {latest.notes && (
                  <p className="text-[11px] text-muted-foreground truncate">{latest.notes}</p>
                )}
              </div>
            </div>
            {latest.result !== "verified" && (
              <AlertTriangle size={18} className="text-destructive flex-shrink-0" />
            )}
          </div>

          {scans.length > 1 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[11px] text-muted-foreground">Recent activity</p>
              {scans.slice(1).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/40 pb-1 last:border-b-0">
                  <span className="capitalize">{s.direction} • {s.result.replace(/_/g, " ")}</span>
                  <span>{formatTime(s.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LatestScanCard;
