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

const INITIAL_APPS: Application[] = [
  {
    id: "APP001",
    studentId: "1",
    studentName: "Arjun Kumar",
    registerNumber: "STU001",
    department: "Computer Science",
    type: "od",
    status: "pending",
    fromDate: "2026-03-20",
    toDate: "2026-03-20",
    reason: "Attending technical symposium at IIT Madras",
    createdAt: "2026-03-18T10:00:00",
    approvalLevel: 0,
  },
  {
    id: "APP002",
    studentId: "1",
    studentName: "Arjun Kumar",
    registerNumber: "STU001",
    department: "Computer Science",
    type: "leave",
    status: "approved",
    fromDate: "2026-03-15",
    toDate: "2026-03-16",
    reason: "Family function",
    createdAt: "2026-03-14T08:00:00",
    approvalLevel: 3,
  },
  {
    id: "APP003",
    studentId: "1",
    studentName: "Arjun Kumar",
    registerNumber: "STU001",
    department: "Computer Science",
    type: "internship",
    status: "approved-l1",
    fromDate: "2026-04-01",
    toDate: "2026-04-30",
    reason: "Summer internship at TCS, Chennai",
    createdAt: "2026-03-10T09:00:00",
    approvalLevel: 1,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPS);
  const [notifications] = useState<Notification[]>([
    { id: "N1", message: "Your leave application has been approved", timestamp: "2026-03-16T10:00:00", read: false, type: "approval" },
    { id: "N2", message: "Internship application forwarded to Level 2", timestamp: "2026-03-12T14:00:00", read: true, type: "info" },
  ]);

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
