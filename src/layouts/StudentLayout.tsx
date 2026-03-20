import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FileText, User, Bell, LogOut, Menu, X, ClipboardList, FileDown
} from "lucide-react";
import { useState } from "react";
import collegeLogo from "@/assets/college-logo.png";

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useAppContext();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", badge: 0 },
    { to: "/dashboard/apply", icon: FileText, label: "Apply", badge: 0 },
    { to: "/dashboard/status", icon: ClipboardList, label: "Status", badge: 0 },
    { to: "/dashboard/forms", icon: FileDown, label: "Forms", badge: 0 },
    { to: "/dashboard/profile", icon: User, label: "Profile", badge: 0 },
    { to: "/dashboard/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
  ];

  const NavBadge = ({ count }: { count: number }) =>
    count > 0 ? (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
        {count > 9 ? "9+" : count}
      </span>
    ) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img src={collegeLogo} alt="College" className="h-8 rounded" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold gold-gradient-text leading-tight">Campus OD & Leave</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink to="/dashboard/notifications" className="relative p-2 text-muted-foreground hover:text-card-foreground sm:hidden">
            <Bell size={20} />
            <NavBadge count={unreadCount} />
          </NavLink>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="sm:hidden text-card-foreground p-2">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors p-2" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:hidden glass-card border-b border-border/50 px-4 py-2 flex flex-wrap gap-2"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-card-foreground"
                }`
              }
            >
              <link.icon size={16} />
              {link.label}
              {link.badge > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </motion.nav>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex flex-col w-56 min-h-[calc(100vh-57px)] glass-card border-r border-border/50 p-4 gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
                }`
              }
            >
              <div className="relative">
                <link.icon size={18} />
                <NavBadge count={link.badge} />
              </div>
              {link.label}
            </NavLink>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 max-w-5xl w-full min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav (mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 flex justify-around py-2 z-50">
        {links.slice(0, 4).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 text-xs transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <div className="relative">
              <link.icon size={20} />
              <NavBadge count={link.badge} />
            </div>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default StudentLayout;
