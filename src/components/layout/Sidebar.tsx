"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Phone,
  Activity,
  Hash,
  Users,
  BookUser,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mail,
  Bell,
  Briefcase,
  LayoutDashboard,
  Calendar,
  Layers,
  Zap,
  LogOut,
  UserPlus
} from "lucide-react";
import { getUserSession, logoutUser } from "@/actions/auth";
import { getUnreadCounts } from "@/actions/chat";
import { getPendingRequests } from "@/actions/friend";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NotificationDropdown } from "./NotificationDropdown";

const initialMenuItems = [
  { name: "Chats", href: "/", icon: MessageSquare, badge: 0 },
  { name: "Find a Friend", href: "/find-friend", icon: UserPlus },
  { name: "Requests", href: "/requests", icon: Bell },
  { name: "Calls", href: "/calls", icon: Phone },
  { name: "Status", href: "/status", icon: Activity },
  { name: "Groups", href: "/groups", icon: Users },
  { name: "Contacts", href: "/contacts", icon: BookUser },
];



export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{name: string, avatar: string, email: string} | null>(null);
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  useEffect(() => {
    async function loadData() {
      const session = await getUserSession();
      if (session) {
        setUser(session);
      }
      const [unreadRes, requestsRes] = await Promise.all([
        getUnreadCounts(),
        getPendingRequests()
      ]);
      
      setMenuItems(prev => prev.map(item => {
        if (item.name === "Chats" && unreadRes.success) {
          return { ...item, badge: unreadRes.count };
        }
        if (item.name === "Requests" && requestsRes.success) {
          return { ...item, badge: requestsRes.requests.length };
        }
        return item;
      }));
    }
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col h-full bg-surface/30 backdrop-blur-[80px] saturate-[1.5] border border-border-subtle/50 rounded-[2.5rem] py-5 px-3 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] relative z-20",
        collapsed ? "w-[90px] items-center" : "w-[280px]"
      )}
    >
      {/* Window Controls */}
      <div className={cn("flex gap-2 w-full mb-6", collapsed ? "justify-center" : "px-3")}>
        <div className="w-3 h-3 rounded-full bg-error shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-warning shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-success shadow-sm"></div>
      </div>

      {/* Brand Logo */}
      <div className={cn("flex items-center gap-3 w-full mb-8", collapsed ? "justify-center" : "px-2")}>
        <img src="/logo.jpg" alt="TIDO Logo" className="w-8 h-8 rounded-xl object-cover shadow-sm flex-shrink-0" />
        {!collapsed && <span className="font-bold text-xl tracking-tight text-text-primary">TIDO</span>}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-12 -right-3 w-6 h-10 bg-surface rounded-full border border-border-subtle shadow-md flex items-center justify-center z-30 text-text-muted hover:text-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col w-full">
        {/* Profile */}
        <div className={cn("flex items-center gap-3 mb-8 w-full", collapsed ? "justify-center" : "px-2")}>
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"}
              alt={user?.name || "User"}
              className="w-12 h-12 rounded-full object-cover border-2 border-surface bg-surface"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium text-text-muted flex items-center gap-1">
                Good Day 👋
              </span>
              <span className="font-bold text-base text-text-primary truncate">
                {user?.name || "Loading..."}
              </span>
            </div>
          )}
        </div>

        {/* Menu Section */}
        <div className="w-full mb-6">
          {!collapsed && (
            <div className="px-3 mb-3 flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <span>Menu: {menuItems.length}</span>
              <Settings className="w-3 h-3" />
            </div>
          )}
          <nav className="space-y-1 w-full">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 py-2.5 transition-all duration-200 group w-full",
                    collapsed ? "justify-center px-0 rounded-2xl" : "px-3 rounded-[1.25rem]",
                    isActive 
                      ? "bg-primary text-white shadow-[0_4px_15px_rgba(38,100,236,0.3)]" 
                      : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-text-muted group-hover:text-text-primary transition-colors")} strokeWidth={isActive ? 2.5 : 2} />
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1 truncate">{item.name}</span>
                  )}
                  {!collapsed && (item.badge ? item.badge > 0 : false) && (
                    <span className="w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (item.badge ? item.badge > 0 : false) && (
                    <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-error border-2 border-surface"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>



        {/* Settings Mini Bar */}
        <div className="w-full mt-auto mb-4">
          {!collapsed && (
            <div className="px-3 mb-3 flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider">
              <span>Settings: 6</span>
              <Settings className="w-3 h-3" />
            </div>
          )}
          <div className={cn("bg-surface/40 backdrop-blur-md border border-border-subtle/50 shadow-sm flex items-center justify-between w-full relative", collapsed ? "flex-col rounded-[1.5rem] p-3 gap-3" : "rounded-2xl p-2")}>
            <Link href="/settings" className="p-1.5 rounded-lg hover:bg-background text-primary transition-colors flex-1 flex justify-center">
              <Settings className="w-4 h-4" />
            </Link>
            <button className="p-1.5 rounded-lg hover:bg-background text-text-muted hover:text-text-primary transition-colors flex-1 flex justify-center">
              <Activity className="w-4 h-4" />
            </button>
            <NotificationDropdown />
            <button className="p-1.5 rounded-lg hover:bg-background text-text-muted hover:text-text-primary transition-colors flex-1 flex justify-center">
              <Zap className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full bg-surface/40 backdrop-blur-md border border-border-subtle/50 shadow-sm flex items-center transition-all duration-300 hover:bg-error hover:border-error hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)] cursor-pointer group",
            collapsed ? "justify-center rounded-[1.5rem] aspect-square p-0" : "px-4 py-3 rounded-[1.25rem] gap-3"
          )}
        >
          <div className={cn(
            "rounded-full text-text-secondary flex items-center justify-center transition-all flex-shrink-0 group-hover:text-white", 
            collapsed ? "w-10 h-10" : "w-8 h-8 bg-surface-elevated group-hover:bg-white/20"
          )}>
            <LogOut className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex-1 text-left">
              <span className="text-sm font-medium text-text-primary group-hover:text-white transition-colors">Sign Out</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
