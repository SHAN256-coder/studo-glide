import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import PortfolioPage from "@/pages/PortfolioPage";
import ProfileSetupPage from "@/pages/student/ProfileSetupPage";
import StudentLayout from "@/layouts/StudentLayout";
import StudentDashboard from "@/pages/student/StudentDashboard";
import ApplyPage from "@/pages/student/ApplyPage";
import StatusPage from "@/pages/student/StatusPage";
import ProfilePage from "@/pages/student/ProfilePage";
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminApplications from "@/pages/admin/AdminApplications";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { isAuthenticated, loading, user, profile } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Loading...</p></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  // Redirect to profile setup if not completed (student only)
  if (role === "student" && profile && !profile.profileCompleted) {
    return <Navigate to="/setup-profile" replace />;
  }
  return <>{children}</>;
}

function ProfileSetupGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, profile } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Loading...</p></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (profile?.profileCompleted) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, user, profile } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground animate-pulse">Loading...</p></div>;
  if (isAuthenticated) {
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (profile && !profile.profileCompleted) return <Navigate to="/setup-profile" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/portfolio/:userId" element={<PortfolioPage />} />
    <Route path="/setup-profile" element={<ProfileSetupGuard><ProfileSetupPage /></ProfileSetupGuard>} />
    <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
      <Route index element={<StudentDashboard />} />
      <Route path="apply" element={<ApplyPage />} />
      <Route path="status" element={<StatusPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="applications" element={<AdminApplications />} />
      <Route path="analytics" element={<AnalyticsPage />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
