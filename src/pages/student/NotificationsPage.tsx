import { motion } from "framer-motion";
import { useAppContext } from "@/contexts/AppContext";
import { Bell, CheckCircle, XCircle, Info, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useAppContext();

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold gold-gradient-text">Notifications</h2>
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead} className="text-primary flex items-center gap-1">
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </motion.div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const Icon = iconMap[n.type];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !n.read && markNotificationRead(n.id)}
              className={`glass-card p-4 flex items-start gap-3 cursor-pointer transition-all ${
                !n.read ? "border-primary/30 bg-primary/5" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                <Icon size={20} className={`mt-0.5 ${colorMap[n.type]}`} />
                {!n.read && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? "text-card-foreground font-medium" : "text-muted-foreground"}`}>
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.timestamp).toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">You'll be notified when your applications are updated</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
