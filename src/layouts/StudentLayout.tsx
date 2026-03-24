import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTapSound } from "@/hooks/useTapSound";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, User, LogOut, ClipboardList, Calendar as CalendarIcon
} from "lucide-react";
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
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Generate 12-month calendar
  const renderYearCalendar = () => {
    const year = currentTime.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 z-50 glass-card border border-border/50 p-3 mt-1 max-h-[70vh] overflow-auto"
      >
        <h3 className="text-sm font-bold text-primary text-center mb-2">{year} Calendar</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {months.map((m) => {
            const monthDate = new Date(year, m, 1);
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            const firstDay = monthDate.getDay();
            const today = currentTime.getDate();
            const isCurrentMonth = m === currentTime.getMonth();

            return (
              <div key={m} className="bg-secondary/50 rounded p-1.5">
                <p className="text-[10px] font-bold text-primary text-center mb-1">
                  {monthDate.toLocaleString("default", { month: "short" })}
                </p>
                <div className="grid grid-cols-7 gap-0">
                  {dayNames.map((d) => (
                    <span key={d} className="text-[7px] text-muted-foreground text-center">{d}</span>
                  ))}
                  {Array.from({ length: firstDay }, (_, i) => (
                    <span key={`e${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <span
                      key={i + 1}
                      className={`text-[8px] text-center rounded ${
                        isCurrentMonth && i + 1 === today
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-card-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50 px-3 py-2.5 sm:py-3 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <img src={collegeLogo} alt="College" className="h-9 sm:h-11 rounded flex-shrink-0" />
            <div>
              <h1 className="text-xs sm:text-sm font-bold gold-gradient-text leading-tight">Smart Campus OD & Leave</h1>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground">Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Calendar icon */}
            <button
              onClick={() => { playTap(); setShowCalendar(!showCalendar); }}
              className="text-primary hover:text-accent transition-colors p-1.5"
              title="Calendar"
            >
              <CalendarIcon size={18} />
            </button>
            {/* Date/Time */}
            <div className="text-right hidden sm:block">
              <p className="text-[9px] text-muted-foreground">{currentTime.toLocaleDateString()}</p>
              <p className="text-[9px] text-muted-foreground">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <button onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors p-1.5" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        {/* Calendar dropdown */}
        <AnimatePresence>
          {showCalendar && renderYearCalendar()}
        </AnimatePresence>
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

      {/* Bottom Nav (mobile) */}
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
