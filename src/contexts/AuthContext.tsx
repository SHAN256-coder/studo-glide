import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User as SupaUser } from "@supabase/supabase-js";

export type UserRole = "student" | "admin";

export interface Profile {
  id: string;
  name: string | null;
  registerNumber: string | null;
  mobile: string | null;
  department: string | null;
  section: string | null;
  year: number | null;
  semester: number | null;
  cgpa: number | null;
  college: string | null;
  profilePicture: string | null;
  classCoordinatorName: string | null;
  githubId: string | null;
  linkedinId: string | null;
  resumeLink: string | null;
  portfolioLink: string | null;
  profileCompleted: boolean;
  fatherName: string | null;
  motherName: string | null;
  dob: string | null;
  bloodGroup: string | null;
  address: string | null;
  parentMobile: string | null;
  studentType: string | null;
  roomNumber: string | null;
  busNumber: string | null;
  boardingPoint: string | null;
}

// Keep backward compat alias
export type User = Profile & { role: UserRole };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithPhone: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const DEPARTMENTS = ["ECE", "AIDS", "EEE", "CSBS", "PETRO", "ROBO"];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
export const YEARS = [1, 2, 3, 4];

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    name: row.name,
    registerNumber: row.register_number,
    mobile: row.mobile,
    department: row.department,
    section: row.section,
    year: row.year,
    semester: row.semester,
    cgpa: row.cgpa ? Number(row.cgpa) : null,
    college: row.college,
    profilePicture: row.profile_picture,
    classCoordinatorName: row.class_coordinator_name,
    githubId: row.github_id,
    linkedinId: row.linkedin_id,
    resumeLink: row.resume_link,
    portfolioLink: row.portfolio_link,
    profileCompleted: row.profile_completed ?? false,
    fatherName: row.father_name,
    motherName: row.mother_name,
    dob: row.dob,
    bloodGroup: row.blood_group,
    address: row.address,
    parentMobile: row.parent_mobile,
    studentType: row.student_type,
    roomNumber: row.room_number,
    busNumber: row.bus_number,
    boardingPoint: row.boarding_point,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(mapProfile(data));
  }, []);

  const fetchRole = useCallback(async (userId: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    if (data && data.some((r: any) => r.role === "admin")) {
      setRole("admin");
    } else {
      setRole("student");
    }
  }, []);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => {
          fetchProfile(sess.user.id);
          fetchRole(sess.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRole("student");
      }
    });

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      if (sess?.user) {
        fetchProfile(sess.user.id);
        fetchRole(sess.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchRole]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message || null };
  };

  const loginWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    return { error: error?.message || null };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
    return { error: error?.message || null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRole("student");
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!session?.user) return;
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.registerNumber !== undefined) dbUpdates.register_number = updates.registerNumber;
    if (updates.mobile !== undefined) dbUpdates.mobile = updates.mobile;
    if (updates.department !== undefined) dbUpdates.department = updates.department;
    if (updates.section !== undefined) dbUpdates.section = updates.section;
    if (updates.year !== undefined) dbUpdates.year = updates.year;
    if (updates.semester !== undefined) dbUpdates.semester = updates.semester;
    if (updates.cgpa !== undefined) dbUpdates.cgpa = updates.cgpa;
    if (updates.college !== undefined) dbUpdates.college = updates.college;
    if (updates.profilePicture !== undefined) dbUpdates.profile_picture = updates.profilePicture;
    if (updates.classCoordinatorName !== undefined) dbUpdates.class_coordinator_name = updates.classCoordinatorName;
    if (updates.githubId !== undefined) dbUpdates.github_id = updates.githubId;
    if (updates.linkedinId !== undefined) dbUpdates.linkedin_id = updates.linkedinId;
    if (updates.resumeLink !== undefined) dbUpdates.resume_link = updates.resumeLink;
    if (updates.portfolioLink !== undefined) dbUpdates.portfolio_link = updates.portfolioLink;
    if (updates.profileCompleted !== undefined) dbUpdates.profile_completed = updates.profileCompleted;
    if (updates.fatherName !== undefined) dbUpdates.father_name = updates.fatherName;
    if (updates.motherName !== undefined) dbUpdates.mother_name = updates.motherName;
    if (updates.dob !== undefined) dbUpdates.dob = updates.dob;
    if (updates.bloodGroup !== undefined) dbUpdates.blood_group = updates.bloodGroup;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.parentMobile !== undefined) dbUpdates.parent_mobile = updates.parentMobile;
    if (updates.studentType !== undefined) dbUpdates.student_type = updates.studentType;
    if (updates.roomNumber !== undefined) dbUpdates.room_number = updates.roomNumber;
    if (updates.busNumber !== undefined) dbUpdates.bus_number = updates.busNumber;
    if (updates.boardingPoint !== undefined) dbUpdates.boarding_point = updates.boardingPoint;

    await supabase.from("profiles").update(dbUpdates).eq("id", session.user.id);
    await fetchProfile(session.user.id);
  };

  const refreshProfile = async () => {
    if (session?.user) await fetchProfile(session.user.id);
  };

  const user: User | null = useMemo(
    () => (profile ? { ...profile, role } : null),
    [profile, role]
  );

  const value = useMemo(
    () => ({
      user, session, profile, role,
      login, signup, loginWithPhone, verifyOtp, logout,
      updateProfile, isAuthenticated: !!session, loading, refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, session, profile, role, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
