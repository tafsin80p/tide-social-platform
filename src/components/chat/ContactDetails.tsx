"use client";

import { Video, Phone, Search, MoreHorizontal, Bell, Image as ImageIcon, Download, Shield, X, ChevronRight, Loader2 } from "lucide-react";
import { cn, formatOnlineStatus } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getConversationById } from "@/actions/chat";
import { getUserSession } from "@/actions/auth";

export function ContactDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatId = searchParams.get("chat");
  const showInfo = searchParams.get("info") === "true";
  const [activeUser, setActiveUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const session = await getUserSession();
      setCurrentUser(session);
    }
    init();
  }, []);

  useEffect(() => {
    async function loadDetails() {
      if (!chatId) {
        setActiveUser(null);
        return;
      }
      setLoading(true);
      const res = await getConversationById(chatId);
      if (res.success && currentUser) {
        const other = res.conversation.participants.find((p: any) => p._id !== currentUser.id);
        setActiveUser(other);
      }
      setLoading(false);
    }
    loadDetails();

    const intervalId = setInterval(async () => {
      if (!chatId) return;
      const res = await getConversationById(chatId);
      if (res.success && currentUser) {
        const other = res.conversation.participants.find((p: any) => p._id !== currentUser.id);
        setActiveUser(other);
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [chatId, currentUser]);

  if (!chatId) return null;

  return (
    <div className={cn(
      "h-full bg-transparent flex-col hidden lg:flex flex-shrink-0 min-h-0 overflow-hidden transition-all duration-300 ease-in-out",
      showInfo ? "w-[340px] opacity-100 border-l border-border-subtle" : "w-0 opacity-0 border-none"
    )}>
      <div className="w-[340px] h-full flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="h-16 border-b border-border-subtle flex items-center justify-end px-4 shrink-0">
        <button onClick={() => router.push(`/?chat=${chatId}`)} className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-active/50 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {/* Profile Info */}
        <div className="p-6 flex flex-col items-center border-b border-border-subtle">
          {loading ? (
             <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          ) : (
            <>
              <div className="relative mb-4">
                <img src={activeUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"} alt={activeUser?.name} className="w-24 h-24 rounded-full object-cover ring-4 ring-background" />
                <div className={cn(
                  "absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-surface",
                  formatOnlineStatus(activeUser?.lastActive) === "Online" ? "bg-success" : "bg-text-muted"
                )}></div>
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1">{activeUser?.name || "Loading..."}</h2>
              <p className={cn("text-sm mb-3", formatOnlineStatus(activeUser?.lastActive) === "Online" ? "text-success" : "text-text-muted")}>
                {formatOnlineStatus(activeUser?.lastActive) === "Online" ? "Online" : activeUser?.lastActive ? `Active ${formatOnlineStatus(activeUser.lastActive)} ago` : "Offline"}
              </p>
              <p className="text-sm text-text-secondary text-center px-4">{activeUser?.email}</p>
            </>
          )}
          
          <div className="flex items-center gap-6 mt-6">
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-surface-elevated/40 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors border border-border-subtle group-hover:border-primary">
                <Phone className="w-5 h-5 text-primary group-hover:text-text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">Audio</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-surface-elevated/40 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors border border-border-subtle group-hover:border-primary">
                <Video className="w-5 h-5 text-primary group-hover:text-text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">Video</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-surface-elevated/40 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors border border-border-subtle group-hover:border-primary">
                <Search className="w-5 h-5 text-primary group-hover:text-text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">Search</span>
            </button>
            <button className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-surface-elevated/40 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors border border-border-subtle group-hover:border-primary">
                <MoreHorizontal className="w-5 h-5 text-primary group-hover:text-text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">More</span>
            </button>
          </div>
        </div>

        {/* Media section */}
        <div className="p-4 border-b border-border-subtle">
          <button className="w-full flex items-center justify-between mb-3 group">
            <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">Media, Links, Docs</span>
            <div className="flex items-center text-text-muted group-hover:text-primary transition-colors">
              <span className="text-xs mr-1">24</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
          <div className="flex gap-2">
            <div className="w-24 h-24 bg-surface-elevated/40 rounded-xl overflow-hidden border border-border-subtle flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=200&q=80" alt="Media 1" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-24 bg-surface-elevated/40 rounded-xl overflow-hidden border border-border-subtle flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=200&q=80" alt="Media 2" className="w-full h-full object-cover" />
            </div>
            <div className="w-24 h-24 bg-surface-elevated/40 rounded-xl overflow-hidden border border-border-subtle flex-shrink-0 relative flex items-center justify-center cursor-pointer group">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=200&q=80" alt="Media 3" className="w-full h-full object-cover brightness-50 group-hover:brightness-75 transition-all" />
              <span className="absolute text-text-primary font-medium text-sm">+21</span>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="p-2 space-y-1">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active/50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
              <span className="text-sm font-medium text-text-primary">Mute notifications</span>
            </div>
            <div className="w-10 h-6 bg-primary rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active/50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
              <span className="text-sm font-medium text-text-primary">Wallpaper</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>
          
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active/50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
              <span className="text-sm font-medium text-text-primary">Save to gallery</span>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active/50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-primary">Disappearing messages</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Off</span>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </button>

          <button className="w-full flex items-start justify-between p-3 rounded-xl hover:bg-surface-active/50 transition-colors text-left group mt-2">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-primary">Encryption</span>
                <span className="text-xs text-text-muted">Messages and calls are end-to-end encrypted.</span>
              </div>
            </div>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
