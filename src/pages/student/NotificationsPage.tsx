import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppContext } from "@/contexts/AppContext";
import { Bell, CheckCircle, XCircle, Info } from "lucide-react";

const iconMap = {
  approval: CheckCircle,
  rejection: XCircle,
  info: Info,
};

const colorMap = {
  approval: "text-success",
  rejection: "text-destructive",
  info: "text-primary",
};

const NotificationsPage = () => {
  const { notifications } = useAppContext();

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-display font-bold gold-gradient-text">Notifications</h2>
      </motion.div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type];
          return (
            <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className={`glass-card p-4 flex items-start gap-3 ${!n.read ? "border-primary/30" : ""}`}>
              <Icon size={20} className={`flex-shrink-0 mt-0.5 ${colorMap[n.type]}`} />
              <div>
                <p className="text-sm text-card-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleDateString()}</p>
              </div>
            </motion.div>
          );
        })}
        {notifications.length === 0 && <p className="text-center text-muted-foreground py-12">No notifications</p>}
      </div>
    </div>
  );
};

export default NotificationsPage;
