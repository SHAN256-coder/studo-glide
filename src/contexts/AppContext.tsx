import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { toast } from "sonner";

export type ApplicationType = "od" | "leave" | "internship" | "industrial-visit" | "hostel-od";
export type ApplicationStatus = "pending" | "approved-l1" | "approved-l2" | "approved" | "rejected";

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
  approvalLevel: number;
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
  addApplication: (app: Omit<Application, "id" | "createdAt" | "status" | "approvalLevel">) => void;
  updateStatus: (id: string, status: ApplicationStatus, comments?: string) => void;
  getStudentApplications: (studentId: string) => Application[];
  notifications: Notification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const typeLabels: Record<ApplicationType, string> = {
  od: "On Duty", leave: "Leave", internship: "Internship",
  "industrial-visit": "Industrial Visit", "hostel-od": "Hostel OD",
};

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "Pending",
  "approved-l1": "approved at Level 1",
  "approved-l2": "approved at Level 2",
  approved: "fully approved",
  rejected: "rejected",
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: Notification["type"], applicationId?: string) => {
    const newNotif: Notification = {
      id: `N${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      applicationId,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Push toast notification in real-time
    if (type === "approval") {
      toast.success(message, { duration: 5000 });
    } else if (type === "rejection") {
      toast.error(message, { duration: 5000 });
    } else {
      toast.info(message, { duration: 4000 });
    }
  }, []);

  const addApplication = useCallback((app: Omit<Application, "id" | "createdAt" | "status" | "approvalLevel">) => {
    const newApp: Application = {
      ...app,
      id: `APP${String(Date.now()).slice(-5)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      approvalLevel: 0,
    };
    setApplications((prev) => [newApp, ...prev]);
    addNotification(
      `Your ${typeLabels[app.type]} application has been submitted successfully`,
      "info",
      newApp.id
    );
  }, [addNotification]);

  const updateStatus = useCallback((id: string, status: ApplicationStatus, comments?: string) => {
    setApplications((prev) => {
      const updated = prev.map((app) => {
        if (app.id !== id) return app;
        const newApp = {
          ...app,
          status,
          comments,
          approvalLevel: status === "approved" ? 3 : status === "approved-l2" ? 2 : status === "approved-l1" ? 1 : app.approvalLevel,
        };

        // Generate notification for the student
        const statusText = statusLabels[status];
        const commentText = comments ? ` — "${comments}"` : "";
        const notifType: Notification["type"] = status === "rejected" ? "rejection" : status === "approved" ? "approval" : "info";
        const message = `Your ${typeLabels[app.type]} application (#${app.id}) has been ${statusText}${commentText}`;

        // Use setTimeout to avoid setState during render
        setTimeout(() => addNotification(message, notifType, app.id), 0);

        return newApp;
      });
      return updated;
    });
  }, [addNotification]);

  const getStudentApplications = useCallback(
    (studentId: string) => applications.filter((a) => a.studentId === studentId),
    [applications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <AppContext.Provider value={{
      applications, addApplication, updateStatus, getStudentApplications,
      notifications, unreadCount, markNotificationRead, markAllRead,
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
