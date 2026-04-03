import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ApplicationType = "od" | "leave" | "internship" | "industrial-visit" | "hostel-od" | "day-scholar-od" | "siph-od";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  department: string;
  type: ApplicationType;
  status: ApplicationStatus;
  fromDate: string;
  toDate: string;
  reason: string;
  createdAt: string;
  comments?: string;
  isDraft?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "approval" | "rejection" | "info";
  applicationId?: string;
}

interface AppContextType {
  applications: Application[];
  addApplication: (app: Omit<Application, "id" | "createdAt" | "status">) => Promise<void>;
  updateStatus: (id: string, status: ApplicationStatus, comments?: string) => Promise<void>;
  getStudentApplications: (studentId: string) => Application[];
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  refreshApplications: () => Promise<void>;
}

export const typeLabels: Record<ApplicationType, string> = {
  od: "On Duty", leave: "Leave", internship: "Internship",
  "industrial-visit": "Industrial Visit", "hostel-od": "Hostel OD",
  "day-scholar-od": "Day Scholar OD", "siph-od": "SIPH OD",
};

const AppContext = createContext<AppContextType | null>(null);

function mapApp(row: any): Application {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name || "",
    registerNumber: row.register_number || "",
    department: row.department || "",
    type: row.type as ApplicationType,
    status: row.status as ApplicationStatus,
    fromDate: row.from_date || "",
    toDate: row.to_date || "",
    reason: row.reason || "",
    createdAt: row.created_at,
    comments: row.comments,
    isDraft: row.is_draft,
  };
}

function mapNotif(row: any): Notification {
  return {
    id: row.id,
    message: row.message,
    timestamp: row.created_at,
    read: row.read ?? false,
    type: row.type as Notification["type"],
    applicationId: row.application_id,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { session, role } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = useCallback(() => setSoundEnabled((prev) => !prev), []);

  const fetchApplications = useCallback(async () => {
    if (!session?.user) return;
    // Admins see all, students see own (via RLS)
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (data) setApplications(data.map(mapApp));
  }, [session?.user?.id, role]);

  const fetchNotifications = useCallback(async () => {
    if (!session?.user) return;
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (data) setNotifications(data.map(mapNotif));
  }, [session?.user?.id]);

  useEffect(() => {
    fetchApplications();
    fetchNotifications();
  }, [fetchApplications, fetchNotifications]);

  const addApplication = useCallback(async (app: Omit<Application, "id" | "createdAt" | "status">) => {
    if (!session?.user) return;
    const { error } = await supabase.from("applications").insert({
      student_id: session.user.id,
      student_name: app.studentName,
      register_number: app.registerNumber,
      department: app.department,
      type: app.type,
      from_date: app.fromDate,
      to_date: app.toDate,
      reason: app.reason,
      is_draft: app.isDraft,
    });
    if (error) {
      toast.error("Failed to submit: " + error.message);
      return;
    }

    // Add notification
    await supabase.from("notifications").insert({
      user_id: session.user.id,
      message: `Your ${typeLabels[app.type]} application has been submitted.`,
      type: "info",
    });

    toast.success("Application submitted!", { duration: 1000, position: "top-center" });
    await fetchApplications();
    await fetchNotifications();
  }, [session, fetchApplications, fetchNotifications]);

  const updateStatus = useCallback(async (id: string, status: ApplicationStatus, comments?: string) => {
    const { error } = await supabase.from("applications").update({ status, comments }).eq("id", id);
    if (error) {
      toast.error("Failed to update: " + error.message);
      return;
    }

    // Find the app to send notification
    const app = applications.find((a) => a.id === id);
    if (app) {
      const statusText = status === "approved" ? "approved" : status === "rejected" ? "rejected" : status;
      const commentText = comments ? ` — "${comments}"` : "";
      const notifType = status === "rejected" ? "rejection" : status === "approved" ? "approval" : "info";

      await supabase.from("notifications").insert({
        user_id: app.studentId,
        message: `Your ${typeLabels[app.type]} application has been ${statusText}${commentText}`,
        type: notifType,
        application_id: id,
      });

      if (status === "approved") {
        toast.success(`Application approved`, { duration: 1000, position: "top-center" });
      } else if (status === "rejected") {
        toast.error(`Application rejected`, { duration: 1000, position: "top-center" });
      }
    }

    await fetchApplications();
    await fetchNotifications();
  }, [applications, fetchApplications, fetchNotifications]);

  const getStudentApplications = useCallback(
    (studentId: string) => applications.filter((a) => a.studentId === studentId),
    [applications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback(async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!session?.user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", session.user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [session]);

  const refreshApplications = fetchApplications;

  return (
    <AppContext.Provider value={{
      applications, addApplication, updateStatus, getStudentApplications,
      notifications, unreadCount, markNotificationRead, markAllRead,
      soundEnabled, toggleSound, refreshApplications,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
