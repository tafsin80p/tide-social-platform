"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getPendingRequests, respondToRequest } from "@/actions/friend";
import { toast } from "react-hot-toast";
import { AppLoader } from "@/components/ui/AppLoader";

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      setLoading(true);
      const res = await getPendingRequests();
      if (res.success) {
        setRequests(res.requests);
      }
      setLoading(false);
    }
    loadRequests();
  }, []);

  const handleRespond = async (id: string, action: "accepted" | "rejected") => {
    setProcessingId(id);
    const res = await respondToRequest(id, action);
    if (res.success) {
      toast.success(`Request ${action}!`);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } else {
      toast.error(res.error || "Failed to process request.");
    }
    setProcessingId(null);
  };

  if (loading) {
    return <AppLoader />;
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-transparent relative z-10 p-6 md:p-10 overflow-y-auto hide-scrollbar">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Friend Requests</h1>
          </div>
          <p className="text-text-secondary text-sm">Manage your incoming network connections.</p>
        </motion.div>

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-surface-elevated/20 rounded-3xl border border-border-subtle backdrop-blur-sm"
          >
            <div className="w-16 h-16 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-text-muted font-medium">No pending requests right now.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {requests.map((req, index) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface-elevated/40 backdrop-blur-md border border-border-subtle rounded-2xl p-5 flex items-center justify-between hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={req.sender.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"}
                      alt={req.sender.name}
                      className="w-12 h-12 rounded-full ring-2 ring-primary/20 object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-text-primary">{req.sender.name}</h3>
                      <p className="text-xs text-text-secondary">{req.sender.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {processingId === req._id ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <>
                        <button
                          onClick={() => handleRespond(req._id, "rejected")}
                          className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-full transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleRespond(req._id, "accepted")}
                          className="p-2 text-primary hover:text-success hover:bg-success/10 rounded-full transition-colors"
                          title="Accept"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
