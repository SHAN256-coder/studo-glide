import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTapSound } from "@/hooks/useTapSound";
import {
  LayoutDashboard, FileCheck, BarChart3, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import collegeLogo from "@/assets/college-logo.png";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const playTap = useTapSound();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    playTap();
    logout();
    navigate("/");
  };

  const handleNavClick = () => {
    playTap();
    setMobileMenuOpen(false);
  };

  const links = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/applications", icon: FileCheck, label: "Applications" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img src={collegeLogo} alt="College" className="h-7 sm:h-8 rounded flex-shrink-0" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold gold-gradient-text leading-tight">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { playTap(); setMobileMenuOpen(!mobileMenuOpen); }} className="sm:hidden text-card-foreground p-2">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors p-2">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sm:hidden glass-card border-b border-border/50 px-4 py-2 flex flex-wrap gap-2">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/admin"} onClick={handleNavClick}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-card-foreground"}`}>
              <link.icon size={16} />{link.label}
            </NavLink>
          ))}
        </motion.nav>
      )}

      <div className="flex">
        <aside className="hidden sm:flex flex-col w-56 min-h-[calc(100vh-57px)] glass-card border-r border-border/50 p-4 gap-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/admin"} onClick={playTap}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"}`}>
              <link.icon size={18} />{link.label}
            </NavLink>
          ))}
        </aside>
        <main className="flex-1 p-3 sm:p-6 max-w-6xl w-full min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 flex justify-around py-2 z-50">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === "/admin"} onClick={playTap}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 text-xs transition-all ${isActive ? "text-primary" : "text-muted-foreground"}`}>
            <motion.div whileTap={{ scale: 0.85 }} transition={{ duration: 0.1 }}>
              <link.icon size={20} />
            </motion.div>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;
