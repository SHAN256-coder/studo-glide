import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import collegeLogo from "@/assets/college-logo.png";

type AuthMethod = "password" | "otp";
type EmailMode = "signin" | "signup" | "forgot";

const MAX_OTP_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;
const LS_KEY = "otp_lockout_v1";

type LockoutState = { email: string; attempts: number; lockedUntil: number | null };

function readLockout(): LockoutState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as LockoutState) : null;
  } catch {
    return null;
  }
}
function writeLockout(state: LockoutState | null) {
  if (!state) localStorage.removeItem(LS_KEY);
  else localStorage.setItem(LS_KEY, JSON.stringify(state));
}

const LoginPage = () => {
  const [method, setMethod] = useState<AuthMethod>("password");
  const [mode, setMode] = useState<EmailMode>("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, loginWithEmailOtp, verifyEmailOtp } = useAuth();

  // Restore lockout for the current OTP email
  useEffect(() => {
    const saved = readLockout();
    if (!saved) return;
    if (saved.email === otpEmail.trim().toLowerCase()) {
      setAttemptsLeft(Math.max(0, MAX_OTP_ATTEMPTS - saved.attempts));
      setLockedUntil(saved.lockedUntil);
    }
  }, [otpEmail]);

  // Tick for lockout countdown
  useEffect(() => {
    if (!lockedUntil) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [lockedUntil]);

  const isLocked = !!lockedUntil && lockedUntil > now;
  const lockoutSecondsLeft = isLocked ? Math.ceil((lockedUntil! - now) / 1000) : 0;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await signup(email.trim(), password.trim());
        if (error) toast.error(error);
        else {
          toast.success("Account created! Check your email to verify, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await login(email.trim(), password.trim());
        if (error) toast.error(error);
        else toast.success("Login successful!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Password reset link sent! Check your email.");
        setMode("signin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = otpEmail.trim().toLowerCase();
    if (!target || !target.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (isLocked) {
      toast.error(`Too many attempts. Try again in ${lockoutSecondsLeft}s.`);
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await loginWithEmailOtp(target);
      if (error) toast.error(error);
      else {
        toast.success("OTP sent to your email.");
        setOtpSent(true);
        // reset attempt counter for a fresh send
        setAttemptsLeft(MAX_OTP_ATTEMPTS);
        writeLockout({ email: target, attempts: 0, lockedUntil: null });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = otpEmail.trim().toLowerCase();
    if (isLocked) {
      toast.error(`Locked. Try again in ${lockoutSecondsLeft}s.`);
      return;
    }
    if (!otpCode.trim()) {
      toast.error("Enter the OTP code.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await verifyEmailOtp(target, otpCode.trim());
      if (error) {
        const saved = readLockout();
        const prevAttempts = saved && saved.email === target ? saved.attempts : 0;
        const newAttempts = prevAttempts + 1;
        const remaining = Math.max(0, MAX_OTP_ATTEMPTS - newAttempts);
        setAttemptsLeft(remaining);

        if (newAttempts >= MAX_OTP_ATTEMPTS) {
          const lockUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
          setLockedUntil(lockUntil);
          writeLockout({ email: target, attempts: newAttempts, lockedUntil: lockUntil });
          toast.error(`Too many wrong attempts. Locked for ${LOCKOUT_MINUTES} minutes.`);
        } else {
          writeLockout({ email: target, attempts: newAttempts, lockedUntil: null });
          toast.error(`${error}. ${remaining} attempt(s) left.`);
        }
        setOtpCode("");
      } else {
        toast.success("Login successful!");
        writeLockout(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) toast.error("Google sign-in failed");
      if (result.redirected) return;
    } catch {
      toast.error("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, hsl(0 0% 3%), hsl(0 0% 8%), hsl(0 0% 5%))" }}>
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

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={collegeLogo} alt="Smart Campus" className="h-16 mx-auto mb-3 rounded" />
          <h1 className="text-xl sm:text-2xl font-display font-bold gold-gradient-text">Smart Campus OD & Leave</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Management System</p>
        </div>

        {/* Method toggle: Password / Email OTP */}
        <div className="flex gap-2 mb-3">
          {(["password", "otp"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setMode("signin"); setOtpSent(false); setOtpCode(""); }}
              className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
                method === m ? "bg-primary text-primary-foreground border-primary gold-glow" : "glass-card text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {m === "password" ? <><Mail size={14} /> Password</> : <><KeyRound size={14} /> Email OTP</>}
            </button>
          ))}
        </div>

        {/* Sign In / Sign Up toggle (password only, hidden on forgot) */}
        {method === "password" && mode !== "forgot" && (
          <div className="flex gap-2 mb-5">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-300 ${
                  mode === m ? "bg-primary text-primary-foreground border-primary gold-glow" : "glass-card text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
        )}

        {/* Forgot password form */}
        {method === "password" && mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="glass-card p-5 space-y-4">
            <button type="button" onClick={() => setMode("signin")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-card-foreground">
              <ArrowLeft size={14} /> Back to Sign In
            </button>
            <div>
              <h2 className="text-card-foreground font-semibold">Reset Password</h2>
              <p className="text-xs text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-card-foreground text-sm">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground pl-9 focus:ring-primary"
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold py-5">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        {/* Password sign in / sign up form */}
        {method === "password" && mode !== "forgot" && (
          <form onSubmit={handleEmailAuth} className="glass-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-card-foreground text-sm">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground pl-9 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-card-foreground text-sm">Password</Label>
                {mode === "signin" && (
                  <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground pr-10 focus:ring-primary"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold text-base py-5">
              {isLoading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={isLoading} className="w-full gap-2 py-5">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
          </form>
        )}

        {/* EMAIL OTP login */}
        {method === "otp" && (
          <form onSubmit={otpSent ? handleVerifyEmailOtp : handleSendEmailOtp} className="glass-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-card-foreground text-sm">Email Address</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={otpSent}
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground pl-9 focus:ring-primary"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">We'll email you a 6-digit code.</p>
            </div>

            {otpSent && (
              <div className="space-y-1.5">
                <Label className="text-card-foreground text-sm">OTP Code</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit code"
                  disabled={isLocked}
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground focus:ring-primary tracking-widest text-center"
                />
                {isLocked ? (
                  <p className="text-[11px] text-destructive">
                    Too many wrong attempts. Try again in {Math.floor(lockoutSecondsLeft / 60)}m {lockoutSecondsLeft % 60}s.
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {attemptsLeft} of {MAX_OTP_ATTEMPTS} attempt(s) left.
                  </p>
                )}
              </div>
            )}

            <Button type="submit" disabled={isLoading || isLocked} className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold py-5">
              {isLoading ? "Please wait..." : otpSent ? "Verify & Sign In" : "Send OTP"}
            </Button>

            {otpSent && (
              <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="w-full text-xs text-muted-foreground hover:text-card-foreground">
                Change email
              </button>
            )}
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground mt-5">
          Powered by <span className="text-primary">Nano Spark</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
