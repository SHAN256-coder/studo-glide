import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  registerNumber: string;
  role: UserRole;
  department?: string;
  section?: string;
  semester?: number;
  year?: number;
  mobile?: string;
  cgpa?: number;
  college?: string;
  profilePicture?: string;
  githubId?: string;
  linkedinId?: string;
  resumeLink?: string;
  portfolioLink?: string;
}

interface AuthContextType {
  user: User | null;
  login: (registerNumber: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User & { password: string }> = {
  "12345678_student": {
    id: "1",
    name: "",
    registerNumber: "12345678",
    password: "1234",
    role: "student",
    department: "",
    section: "",
    semester: undefined as any,
    year: undefined as any,
    mobile: "",
    cgpa: undefined as any,
    college: "Dhaanish Ahmed College of Engineering",
  },
  "12345678_admin": {
    id: "2",
    name: "Admin",
    registerNumber: "12345678",
    password: "5678",
    role: "admin",
    department: "",
    college: "Dhaanish Ahmed College of Engineering",
  },
};

export const DEPARTMENTS = [
  "ECE",
  "AIDS",
  "EEE",
  "CSBS",
  "PETRO",
  "ROBO",
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
export const YEARS = [1, 2, 3, 4];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, _password: string, role: UserRole): boolean => {
    setUser({
      id: crypto.randomUUID(),
      name: "",
      registerNumber: "",
      role,
      department: "",
      section: "",
      semester: undefined as any,
      year: undefined as any,
      mobile: "",
      cgpa: undefined as any,
      college: "Dhaanish Ahmed College of Engineering",
    });
    return true;
  };

  const logout = () => setUser(null);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
