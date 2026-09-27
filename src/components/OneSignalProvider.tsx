"use client";

import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function OneSignalProvider({ userId }: { userId?: string }) {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    async function initOneSignal() {
      if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        console.warn("OneSignal App ID is missing.");
        return;
      }
      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        });

        // Associate user to OneSignal
        if (userId) {
          OneSignal.login(userId);
        } else {
          OneSignal.logout();
        }

        // Check if we should show our custom prompt
        const isDismissed = localStorage.getItem("tido-push-prompt-dismissed");
        if (!isDismissed && "Notification" in window) {
          if (Notification.permission === "default") {
            // Add a small delay so it doesn't pop up instantly on first load
            setTimeout(() => {
              setShowPrompt(true);
            }, 3000);
          }
        }
      } catch (error) {
        console.error("OneSignal Init Error:", error);
      }
    }
    
    initOneSignal();
  }, [userId]);

  const handleAllow = async () => {
    setShowPrompt(false);
    localStorage.setItem("tido-push-prompt-dismissed", "true");
    try {
      // Trigger native browser prompt via OneSignal
      if (OneSignal.Slidedown) {
        await OneSignal.Slidedown.promptPush();
      } else {
        await OneSignal.Notifications?.requestPermission();
      }
    } catch (error) {
      console.error("Failed to request push permission", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("tido-push-prompt-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-surface/90 backdrop-blur-2xl border border-border-subtle shadow-2xl rounded-3xl p-5 z-[9999] flex flex-col items-center text-center"
        >
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          
          <h3 className="text-lg font-bold text-text-primary mb-1">Stay Updated!</h3>
          <p className="text-sm text-text-muted mb-5">
            Turn on push notifications to instantly know when you receive messages or friend requests.
          </p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle font-medium text-sm text-text-secondary hover:bg-surface-hover transition-colors"
            >
              Not Now
            </button>
            <button 
              onClick={handleAllow}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white font-medium text-sm shadow-[0_4px_15px_rgba(38,100,236,0.3)] hover:opacity-90 transition-opacity"
            >
              Allow
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
