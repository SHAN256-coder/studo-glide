import { motion } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#FFD700", "#22C55E", "#EF4444", "#F97316"];

const AnalyticsPage = () => {
  const { applications } = useAppContext();

  const typeData = [
    { name: "OD", count: applications.filter(a => a.type === "od").length },
    { name: "Leave", count: applications.filter(a => a.type === "leave").length },
    { name: "Internship", count: applications.filter(a => a.type === "internship").length },
    { name: "IV", count: applications.filter(a => a.type === "industrial-visit").length },
    { name: "Hostel", count: applications.filter(a => a.type === "hostel-od").length },
  ];

  const statusData = [
    { name: "Pending", value: applications.filter(a => ["pending", "approved-l1", "approved-l2"].includes(a.status)).length },
    { name: "Approved", value: applications.filter(a => a.status === "approved").length },
    { name: "Rejected", value: applications.filter(a => a.status === "rejected").length },
  ];

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Analytics</h2>
        <p className="text-sm text-muted-foreground">Application trends and statistics</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Applications by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(0 0% 60%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(0 0% 60%)", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 8, color: "hsl(0 0% 90%)" }} />
              <Bar dataKey="count" fill="hsl(48 100% 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="glass-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={5}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 18%)", borderRadius: 8, color: "hsl(0 0% 90%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
