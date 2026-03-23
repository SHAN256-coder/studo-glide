import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { useTapSound } from "@/hooks/useTapSound";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, User, LogOut, ClipboardList
} from "lucide-react";
import { useLocation } from "react-router-dom";
import collegeLogo from "@/assets/college-logo.png";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const StudentLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const playTap = useTapSound();

  const handleLogout = () => {
    playTap();
    logout();
    navigate("/");
  };

  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dashboard/apply", icon: FileText, label: "Apply" },
    { to: "/dashboard/status", icon: ClipboardList, label: "Status" },
    { to: "/dashboard/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header - Bigger */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={collegeLogo} alt="College" className="h-9 sm:h-11 rounded flex-shrink-0" />
          <div>
            <h1 className="text-sm sm:text-base font-bold gold-gradient-text leading-tight">Dhaanish Ahmed College of Engineering</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Padappai, Chennai – 601301</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors p-2" title="Logout">
          <LogOut size={18} />
        </button>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex flex-col w-56 min-h-[calc(100vh-65px)] glass-card border-r border-border/50 p-4 gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              onClick={playTap}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-card-foreground hover:bg-secondary"
                }`
              }
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 max-w-5xl w-full min-w-0">
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

      {/* Bottom Nav (mobile) - 4 tabs only */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 flex justify-around py-2.5 z-50">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard"}
            onClick={playTap}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 text-xs transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <motion.div className="relative" whileTap={{ scale: 0.85 }} transition={{ duration: 0.1 }}>
              <link.icon size={20} />
            </motion.div>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default StudentLayout;
