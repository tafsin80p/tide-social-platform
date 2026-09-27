"use client";

import { UserCircle, Shield, MessageSquare, Bell, HardDrive, HelpCircle, Info, ChevronRight, Edit3, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function SettingsList({ user }: { user: any }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full h-full bg-surface border-r border-border-subtle flex flex-col flex-shrink-0 lg:w-[340px]">
      <div className="p-4 pt-6 md:pt-4 border-b border-border-subtle">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Link href="/profile" className="flex flex-col items-center justify-center mb-4 relative hover:opacity-90 transition-opacity">
          <div className="relative group cursor-pointer mb-3">
            <img 
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=TIDO"} 
              alt={user?.name || "User"} 
              className="w-24 h-24 rounded-full object-cover ring-4 ring-background"
            />
            <div className="absolute inset-0 bg-surface/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Edit3 className="w-6 h-6 text-text-primary" />
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-success rounded-full border-4 border-surface"></div>
          </div>
          <div className="text-center flex items-center gap-2">
            <h2 className="text-xl font-bold text-text-primary">{user?.name || "User"}</h2>
            <Edit3 className="w-4 h-4 text-text-muted cursor-pointer hover:text-text-primary transition-colors" />
          </div>
          <p className="text-sm text-primary">Online</p>
          <p className="text-sm text-text-secondary mt-1 px-4 text-center">{user?.email}</p>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-2 pb-20 md:pb-4 space-y-1">
        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-primary transition-colors text-text-secondary group-hover:text-text-primary">
              <UserCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Account</span>
              <span className="text-xs text-text-muted">Privacy, security, change number</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-primary transition-colors text-text-secondary group-hover:text-text-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Chats</span>
              <span className="text-xs text-text-muted">Chat history, notifications</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>

        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-primary transition-colors text-text-secondary group-hover:text-text-primary">
              {mounted && theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Appearance</span>
              <span className="text-xs text-text-muted">Dark & light mode</span>
            </div>
          </div>
          <div className="text-xs text-text-muted mr-1 font-medium bg-surface-elevated px-2 py-1 rounded-md">
            {mounted ? (theme === 'dark' ? 'Dark' : 'Light') : ''}
          </div>
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-primary transition-colors text-text-secondary group-hover:text-text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Notifications</span>
              <span className="text-xs text-text-muted">Message, group & call tones</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-primary transition-colors text-text-secondary group-hover:text-text-primary">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Storage and data</span>
              <span className="text-xs text-text-muted">Network usage, auto-download</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-primary transition-colors text-text-secondary group-hover:text-text-primary">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">Help</span>
              <span className="text-xs text-text-muted">FAQ, contact us</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>

        <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-active transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-surface-elevated rounded-lg group-hover:bg-primary transition-colors text-text-secondary group-hover:text-text-primary">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">About TIDO</span>
              <span className="text-xs text-text-muted">Version 1.0.0</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-text-muted" />
        </button>
      </div>
    </div>
  );
}
