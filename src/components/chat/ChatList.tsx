"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { getConversations, getAllUsers, startConversation } from "@/actions/chat";
import { updateUserActivity, getUserSession } from "@/actions/auth";
import { cn, formatOnlineStatus } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

const filters = ["All", "Unread", "Groups", "Personal"];

export function ChatList() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [conversations, setConversations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chat");

  useEffect(() => {
    let sessionUser: any = null;
    
    async function fetchChats() {
      if (!sessionUser) {
        const session = await getUserSession();
        if (session) {
          sessionUser = session;
          setCurrentUser(session);
        }
      }
      const res = await getConversations();
      if (res.success) {
        setConversations(res.conversations);
      }
    }
    fetchChats();
    updateUserActivity();

    const intervalId = setInterval(fetchChats, 4000); // Poll chats every 4 seconds
    const pingId = setInterval(updateUserActivity, 60000); // Ping online status every 60 seconds
    
    return () => {
      clearInterval(intervalId);
      clearInterval(pingId);
    };
  }, []);

  const toggleNewChat = async () => {
    if (!isNewChatMode) {
      setLoading(true);
      setIsNewChatMode(true);
      const res = await getAllUsers();
      if (res.success) setUsers(res.users);
      setLoading(false);
    } else {
      setIsNewChatMode(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    setLoading(true);
    const res = await startConversation(userId);
    if (res.success) {
      setIsNewChatMode(false);
      router.push(`/?chat=${res.conversationId}`, { scroll: false });
      // Refresh chats
      const chatsRes = await getConversations();
      if (chatsRes.success) setConversations(chatsRes.conversations);
    }
    setLoading(false);
  };

  return (
    <div className="w-full md:w-[340px] h-full bg-transparent border-r border-border-subtle flex flex-col flex-shrink-0 relative z-10 min-h-0">
      <div className="p-4 pt-6 md:pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isNewChatMode ? "New Chat" : "Chats"}</h1>
          <button 
            onClick={toggleNewChat}
            className="p-2 bg-surface-elevated/40 rounded-full hover:bg-surface-active/50 transition-colors text-text-secondary hover:text-text-primary"
          >
            {isNewChatMode ? <span className="text-sm font-medium px-2">Cancel</span> : <Plus className="w-5 h-5" />}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-surface-elevated/40 border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text-primary"
            placeholder="Search or start a new chat..."
          />
        </div>

        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                activeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-surface-elevated/40 text-text-secondary hover:bg-surface-active/50 hover:text-text-primary"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-20 md:pb-4 space-y-1">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : isNewChatMode ? (
          users.length === 0 ? (
             <div className="text-center p-4 text-text-muted text-sm">No other users found.</div>
          ) : (
            users.map((user) => (
              <button
                key={user._id}
                onClick={() => handleStartChat(user._id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-active/50 transition-colors text-left"
              >
                <img
                  src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-text-primary">{user.name}</h3>
                  <p className="text-xs truncate text-text-secondary">{user.email}</p>
                </div>
              </button>
            ))
          )
        ) : conversations.length === 0 ? (
          <div className="text-center p-4 text-text-muted text-sm">No chats yet.</div>
        ) : (
          conversations.map((chat) => {
            const otherParticipant = chat.participants.find((p: any) => p._id !== currentUser?.id) || chat.participants[0];
            const name = otherParticipant?.name || "Unknown";
            const avatar = otherParticipant?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO";
            
            return (
              <button
                key={chat._id}
                onClick={() => router.push(`/?chat=${chat._id}`, { scroll: false })}
                className={cn("w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left", currentChatId === chat._id ? "bg-primary/20 hover:bg-primary/30" : "hover:bg-surface-active/50")}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface",
                    formatOnlineStatus(otherParticipant?.lastActive) === "Online" ? "bg-success" : "bg-text-muted"
                  )}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={cn("font-semibold text-sm truncate text-text-primary", chat.unreadCounts?.[currentUser?.id] > 0 ? "font-bold" : "")}>{name}</h3>
                    <span className="text-[11px] text-text-muted">
                      {formatOnlineStatus(otherParticipant?.lastActive) === "Online" ? (
                        <span className="text-success font-medium">Online</span>
                      ) : (
                        otherParticipant?.lastActive ? formatOnlineStatus(otherParticipant.lastActive) : new Date(chat.updatedAt).toLocaleDateString()
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={cn("text-xs truncate", chat.unreadCounts?.[currentUser?.id] > 0 ? "text-text-primary font-medium" : "text-text-secondary")}>
                      {chat.lastMessage || "No messages yet"}
                    </p>
                    {chat.unreadCounts?.[currentUser?.id] > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 ml-2">
                        {chat.unreadCounts[currentUser.id]}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
