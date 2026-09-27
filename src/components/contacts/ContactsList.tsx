"use client";

import { Search, UserPlus } from "lucide-react";
import { cn, formatOnlineStatus } from "@/lib/utils";
import { useEffect, useState } from "react";
import { getFriends } from "@/actions/friend";
import { useRouter } from "next/navigation";
import { startConversation } from "@/actions/chat";

export function ContactsList() {
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadFriends() {
      const res = await getFriends();
      if (res.success) {
        setFriends(res.friends);
      }
    }
    loadFriends();
  }, []);

  const handleStartChat = async (userId: string) => {
    const res = await startConversation(userId);
    if (res.success) {
      router.push(`/?chat=${res.conversationId}`);
    }
  };

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-[340px] h-full bg-surface border-r border-border-subtle flex flex-col flex-shrink-0">
      <div className="p-4 pt-6 md:pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <button 
            onClick={() => router.push('/find-friend')}
            className="p-2 bg-surface-elevated rounded-full hover:bg-surface-active transition-colors text-text-secondary hover:text-text-primary"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-surface-elevated border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-text-primary"
            placeholder="Search contacts..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 pb-20 md:pb-4 space-y-1">
        <div className="px-2 mb-2 mt-2">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">All Contacts</h3>
        </div>
        
        {filteredFriends.length === 0 ? (
          <div className="text-center p-4 text-text-muted text-sm">
            {friends.length === 0 ? "You have no friends yet." : "No contacts found."}
          </div>
        ) : (
          filteredFriends.map((user) => {
            const isOnline = formatOnlineStatus(user.lastActive) === "Online";
            return (
              <button
                key={user._id}
                onClick={() => handleStartChat(user._id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-active transition-colors text-left"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={cn("absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-surface", isOnline ? "bg-success" : "bg-text-muted")}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate text-text-primary">
                    {user.name}
                  </h3>
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {isOnline ? "Online" : formatOnlineStatus(user.lastActive)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
