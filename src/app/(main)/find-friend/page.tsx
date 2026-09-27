"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Loader2, Sparkles, CheckCircle2, UserMinus, Clock } from "lucide-react";
import { getSuggestedUsers, sendFriendRequest, unfriendUser } from "@/actions/friend";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AppLoader } from "@/components/ui/AppLoader";

export default function FindFriendPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await getSuggestedUsers(searchQuery);
      if (res.success) {
        setUsers(res.users);
      }
      setLoading(false);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredUsers = users; // Filtering is now done on the backend

  const handleSendRequest = async (userId: string) => {
    setSendingId(userId);
    const res = await sendFriendRequest(userId);
    if (res.success) {
      toast.success("Friend request sent!");
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, relationship: "sent" } : u));
    } else {
      toast.error(res.error || "Failed to send request.");
    }
    setSendingId(null);
  };

  const handleUnfriend = async (userId: string) => {
    setSendingId(userId);
    const res = await unfriendUser(userId);
    if (res.success) {
      toast.success("Unfriended successfully.");
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, relationship: "none" } : u));
    } else {
      toast.error(res.error || "Failed to unfriend.");
    }
    setSendingId(null);
  };

  if (loading) {
    return <AppLoader />;
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-transparent relative z-10 p-6 md:p-10 overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="w-full h-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-1">Find Friends</h1>
          <p className="text-text-secondary text-sm">Discover new people and expand your network.</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12 relative w-full"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-muted" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-surface-elevated/40 backdrop-blur-md border border-border-subtle rounded-2xl text-base placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-text-primary shadow-lg shadow-black/5"
            placeholder="Search by name or email..."
          />
        </motion.div>

        {/* Suggested Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-warning" />
            <h2 className="text-xl font-bold text-text-primary">Suggested for you</h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-20 bg-surface-elevated/20 rounded-3xl border border-border-subtle backdrop-blur-sm">
              <p className="text-text-muted">No users found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * (index % 10) }}
                  className="bg-surface-elevated/40 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 flex flex-col items-center text-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 group"
                >
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-background shadow-md">
                      <img
                        src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"}
                        alt={user.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-text-primary mb-1">{user.name}</h3>
                  <p className="text-sm text-text-secondary mb-6 truncate w-full">{user.email}</p>

                  {user.relationship === "friend" ? (
                    <button
                      onClick={() => handleUnfriend(user._id)}
                      disabled={sendingId === user._id}
                      className="w-full py-3 bg-error/10 text-error hover:bg-error hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_4px_15px_rgba(255,0,0,0.3)] disabled:opacity-50"
                    >
                      {sendingId === user._id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <UserMinus className="w-4 h-4" />
                          Unfriend
                        </>
                      )}
                    </button>
                  ) : user.relationship === "sent" ? (
                    <button
                      disabled
                      className="w-full py-3 bg-surface-active text-text-secondary rounded-xl font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" />
                      Pending
                    </button>
                  ) : user.relationship === "received" ? (
                    <button
                      onClick={() => router.push("/requests")}
                      className="w-full py-3 bg-success/10 text-success hover:bg-success hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Review Request
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user._id)}
                      disabled={sendingId === user._id}
                      className="w-full py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_4px_15px_rgba(38,100,236,0.3)] disabled:opacity-50"
                    >
                      {sendingId === user._id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
