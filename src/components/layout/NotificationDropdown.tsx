"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/actions/notification";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastUnreadCount = 0;

    async function loadNotifications() {
      const res = await getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
        const currentUnread = res.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(currentUnread);
        
        // Show toast for new notifications if the unread count increased
        if (currentUnread > lastUnreadCount && lastUnreadCount !== 0) {
          const newNotifs = res.notifications.filter((n: any) => !n.read);
          const latest = newNotifs[0];
          if (latest) {
            let msg = "";
            if (latest.type === "new_message") msg = `New message from ${latest.sender.name}`;
            else if (latest.type === "friend_request") msg = `New friend request from ${latest.sender.name}`;
            else if (latest.type === "request_accepted") msg = `${latest.sender.name} accepted your request`;
            
            toast(msg, { icon: "🔔" });
          }
        }
        lastUnreadCount = currentUnread;
      }
    }
    
    // Initial load
    loadNotifications().then(() => {
      lastUnreadCount = notifications.filter(n => !n.read).length;
    });

    const interval = setInterval(loadNotifications, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative flex-1 flex justify-center" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-background text-text-muted hover:text-text-primary transition-colors relative flex-1 flex justify-center w-full"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-error"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 left-0 w-80 bg-surface/95 backdrop-blur-xl border border-border-subtle shadow-2xl rounded-2xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-border-subtle flex items-center justify-between bg-surface-hover/50">
              <h3 className="font-bold text-sm text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto hide-scrollbar flex flex-col">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-text-muted text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={cn(
                      "p-3 border-b border-border-subtle/50 hover:bg-surface-hover transition-colors flex gap-3 relative group cursor-pointer",
                      !notif.read ? "bg-primary/5" : ""
                    )}
                    onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                  >
                    <img 
                      src={notif.sender?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full object-cover border border-border-subtle"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary">
                        {notif.type === "new_message" && <span><span className="font-bold">{notif.sender?.name}</span> sent you a message.</span>}
                        {notif.type === "friend_request" && <span><span className="font-bold">{notif.sender?.name}</span> sent you a friend request.</span>}
                        {notif.type === "request_accepted" && <span><span className="font-bold">{notif.sender?.name}</span> accepted your request.</span>}
                      </p>
                      {notif.text && (
                        <p className="text-[11px] text-text-muted truncate mt-0.5">"{notif.text}"</p>
                      )}
                      <p className="text-[10px] text-text-muted mt-1 opacity-70">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary absolute right-3 top-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
