import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import LoginPage from "@/pages/LoginPage";
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

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
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
