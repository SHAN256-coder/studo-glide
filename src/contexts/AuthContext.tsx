import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  registerNumber: string;
  role: UserRole;
  department?: string;
  section?: string;
  semester?: number;
  mobile?: string;
  cgpa?: number;
  college?: string;
}

interface AuthContextType {
  user: User | null;
  login: (registerNumber: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<string, User & { password: string }> = {
  "STU001": {
    id: "1",
    name: "Arjun Kumar",
    registerNumber: "STU001",
    password: "password123",
    role: "student",
    department: "Computer Science",
    section: "A",
    semester: 5,
    mobile: "9876543210",
    cgpa: 8.5,
    college: "Dhaanish Ahmed College of Engineering",
  },
  "ADM001": {
    id: "2",
    name: "Dr. Priya Sharma",
    registerNumber: "ADM001",
    password: "admin123",
    role: "admin",
    department: "Computer Science",
    mobile: "9876543211",
    college: "Dhaanish Ahmed College of Engineering",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (registerNumber: string, password: string, role: UserRole): boolean => {
    const found = MOCK_USERS[registerNumber];
    if (found && found.password === password && found.role === role) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
