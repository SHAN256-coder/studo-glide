import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, GraduationCap, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import collegeLogo from "@/assets/college-logo.png";

const LoginPage = () => {
  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(registerNumber, password, role)) {
      toast.success("Login successful!");
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } else {
      toast.error("Invalid credentials. Please check your register number and password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(0 0% 3%), hsl(0 0% 8%), hsl(0 0% 5%))" }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(48 100% 50%), transparent)", top: "-10%", right: "-10%" }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, hsl(48 100% 50%), transparent)", bottom: "10%", left: "-5%" }}
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={collegeLogo} alt="Dhaanish Ahmed College of Engineering" className="h-16 mx-auto mb-4 rounded" />
          <h1 className="text-2xl font-display font-bold gold-gradient-text">Campus OD & Leave</h1>
          <p className="text-muted-foreground text-sm mt-1">Management System</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2 mb-6">
          {(["student", "admin"] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                role === r
                  ? "bg-primary text-primary-foreground border-primary gold-glow"
                  : "glass-card text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {r === "student" ? <GraduationCap size={18} /> : <Shield size={18} />}
              {r === "student" ? "Student" : "Admin"}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="glass-card p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-card-foreground">Register Number</Label>
            <Input
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              placeholder="Enter your register number"
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground pr-10 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold text-base py-5">
            Sign In
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Demo: STU001 / password123 (Student) • ADM001 / admin123 (Admin)
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by <span className="text-primary">Nano Spark</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
