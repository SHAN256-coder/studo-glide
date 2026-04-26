import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Github, Linkedin, FileText, Globe, GraduationCap, Building2, Award, BookOpen, ArrowLeft } from "lucide-react";

interface PublicPortfolio {
  id: string;
  name: string | null;
  department: string | null;
  year: number | null;
  semester: number | null;
  section: string | null;
  cgpa: number | null;
  college: string | null;
  profile_picture: string | null;
  bio: string | null;
  github_id: string | null;
  linkedin_id: string | null;
  resume_link: string | null;
  portfolio_link: string | null;
}

const ensureUrl = (v: string | null | undefined, prefix = "https://") => {
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `${prefix}${v}`;
};

const PortfolioPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await supabase.rpc("get_public_portfolio" as never, {
        _user_id: userId,
      } as never);
      if (error) {
        setError(error.message);
      } else {
        const row = Array.isArray(data) ? (data[0] as PublicPortfolio | undefined) : (data as PublicPortfolio | null);
        if (!row) setError("Portfolio not found.");
        else setData(row);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
        <p className="animate-pulse">Loading portfolio…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-yellow-400 p-6">
        <p className="text-lg font-semibold mb-2">Portfolio unavailable</p>
        <p className="text-sm text-yellow-200/70">{error || "This student's portfolio could not be found."}</p>
        <Link to="/" className="mt-4 text-xs underline text-yellow-300">Go home</Link>
      </div>
    );
  }

  const links = [
    { icon: Github, label: "GitHub", href: ensureUrl(data.github_id), value: data.github_id },
    { icon: Linkedin, label: "LinkedIn", href: ensureUrl(data.linkedin_id), value: data.linkedin_id },
    { icon: FileText, label: "Resume", href: ensureUrl(data.resume_link), value: data.resume_link },
    { icon: Globe, label: "Portfolio", href: ensureUrl(data.portfolio_link), value: data.portfolio_link },
  ].filter((l) => !!l.value);

  return (
    <div className="min-h-screen bg-black text-yellow-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-yellow-400/5 blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 border-b border-yellow-400/20">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="text-xs text-yellow-300/80 hover:text-yellow-300 flex items-center gap-1">
            <ArrowLeft size={14} /> Smart Campus
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-yellow-300/60">Student Portfolio</span>
        </div>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-5 py-8 space-y-6">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 via-black to-black p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {data.profile_picture ? (
              <img
                src={data.profile_picture}
                alt={data.name ?? "Student"}
                className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.35)]"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-yellow-400 flex items-center justify-center text-black text-4xl font-extrabold shadow-[0_0_30px_rgba(255,215,0,0.35)]">
                {data.name?.charAt(0) ?? "?"}
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-300 leading-tight">
                {data.name ?? "Student"}
              </h1>
              <p className="text-sm text-yellow-100/80 mt-1">
                {[data.department, data.year ? `Year ${data.year}` : null].filter(Boolean).join(" • ")}
              </p>
              {data.college && (
                <p className="text-xs text-yellow-200/60 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <Building2 size={12} /> {data.college}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* About */}
        {data.bio && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-yellow-400/20 bg-black/40 p-6"
          >
            <h2 className="text-xs uppercase tracking-widest text-yellow-400 mb-2">About</h2>
            <p className="text-sm leading-relaxed text-yellow-50/90 whitespace-pre-wrap">{data.bio}</p>
          </motion.section>
        )}

        {/* Academics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-yellow-400/20 bg-black/40 p-6"
        >
          <h2 className="text-xs uppercase tracking-widest text-yellow-400 mb-4">Academics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat icon={GraduationCap} label="Year" value={data.year?.toString()} />
            <Stat icon={BookOpen} label="Semester" value={data.semester?.toString()} />
            <Stat icon={Building2} label="Section" value={data.section} />
            <Stat icon={Award} label="CGPA" value={data.cgpa != null ? Number(data.cgpa).toFixed(2) : null} />
          </div>
        </motion.section>

        {/* Links */}
        {links.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-yellow-400/20 bg-black/40 p-6"
          >
            <h2 className="text-xs uppercase tracking-widest text-yellow-400 mb-4">Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-yellow-400/30 bg-yellow-400/5 hover:bg-yellow-400 hover:text-black transition-all"
                >
                  <l.icon size={18} className="text-yellow-300 group-hover:text-black" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wider text-yellow-300/80 group-hover:text-black/70">{l.label}</p>
                    <p className="text-sm font-medium truncate">{l.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.section>
        )}

        <p className="text-center text-[11px] text-yellow-300/40 pt-4">
          Powered by <span className="text-yellow-300">Nano Spark</span>
        </p>
      </main>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) => (
  <div className="rounded-xl border border-yellow-400/20 bg-black/30 p-3 text-center">
    <Icon size={16} className="text-yellow-400 mx-auto mb-1" />
    <p className="text-[10px] uppercase tracking-widest text-yellow-300/60">{label}</p>
    <p className="text-base font-semibold text-yellow-100 mt-0.5">{value || "—"}</p>
  </div>
);

export default PortfolioPage;
