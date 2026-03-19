import { createContext, useContext, useState, ReactNode } from "react";

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

interface AppContextType {
  applications: Application[];
  addApplication: (app: Omit<Application, "id" | "createdAt" | "status" | "approvalLevel">) => void;
  updateStatus: (id: string, status: ApplicationStatus, comments?: string) => void;
  getStudentApplications: (studentId: string) => Application[];
  notifications: Notification[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "approval" | "rejection" | "info";
}

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_APPS: Application[] = [];

export function AppProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPS);
  const [notifications] = useState<Notification[]>([]);

  const addApplication = (app: Omit<Application, "id" | "createdAt" | "status" | "approvalLevel">) => {
    const newApp: Application = {
      ...app,
      id: `APP${String(applications.length + 1).padStart(3, "0")}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      approvalLevel: 0,
    };
    setApplications((prev) => [newApp, ...prev]);
  };

  const updateStatus = (id: string, status: ApplicationStatus, comments?: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status, comments, approvalLevel: status === "approved" ? 3 : status === "approved-l2" ? 2 : status === "approved-l1" ? 1 : app.approvalLevel }
          : app
      )
    );
  };

  const getStudentApplications = (studentId: string) =>
    applications.filter((a) => a.studentId === studentId);

  return (
    <AppContext.Provider value={{ applications, addApplication, updateStatus, getStudentApplications, notifications }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
